from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from users.permissions import IsAdminOrManager

from .models import Booking
from .room_sync import (
    recompute_room_status,
    sync_room_after_booking_deleted,
    sync_room_status_after_booking_save,
)
from .serializers import (
    AdminBookingUpdateSerializer,
    BookingSerializer,
    StaffBookingCreateSerializer,
    StaffCustomerCreateSerializer,
)

User = get_user_model()


class StaffCustomerListView(APIView):
    """Minimal customer list for staff booking form (no full user management)."""

    permission_classes = [IsAuthenticated, IsAdminOrManager]

    def get(self, request):
        rows = (
            User.objects.filter(role=User.Role.CUSTOMER, is_active=True)
            .order_by("username")
            .values("id", "username", "email", "first_name", "last_name")
        )
        return Response(list(rows))


class StaffCustomerCreateView(APIView):
    """Admin/manager: create a customer account from the bookings screen."""

    permission_classes = [IsAuthenticated, IsAdminOrManager]

    def post(self, request):
        serializer = StaffCustomerCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
            },
            status=status.HTTP_201_CREATED,
        )


class StaffBookingCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrManager]

    def post(self, request):
        serializer = StaffBookingCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()
        sync_room_status_after_booking_save(booking)
        return Response(
            BookingSerializer(booking).data,
            status=status.HTTP_201_CREATED,
        )


class BookingListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role in ("admin", "manager"):
            bookings = Booking.objects.select_related("room", "user").all()
        else:
            bookings = Booking.objects.select_related("room", "user").filter(user=request.user)
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = BookingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        booking = serializer.save(user=request.user)
        sync_room_status_after_booking_save(booking)
        return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)


class MyBookingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        bookings = Booking.objects.select_related("room", "user").filter(user=request.user)
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)


class BookingDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_booking(self, pk, user):
        try:
            booking = Booking.objects.select_related("room", "user").get(pk=pk)
        except Booking.DoesNotExist:
            return None
        if user.role in ("admin", "manager") or booking.user == user:
            return booking
        return None

    def get(self, request, pk):
        booking = self._get_booking(pk, request.user)
        if not booking:
            return Response({"error": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(BookingSerializer(booking).data)

    def patch(self, request, pk):
        booking = self._get_booking(pk, request.user)
        if not booking:
            return Response({"error": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)

        if request.user.role in ("admin", "manager"):
            serializer = AdminBookingUpdateSerializer(booking, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            old_room = booking.room
            serializer.save()
            booking.refresh_from_db()
            if old_room.pk != booking.room_id:
                recompute_room_status(old_room)
            sync_room_status_after_booking_save(booking)
            return Response(BookingSerializer(booking).data)

        new_status = request.data.get("status")
        if not new_status:
            return Response({"error": "Status field is required."}, status=status.HTTP_400_BAD_REQUEST)
        if new_status != "cancelled":
            return Response(
                {"error": "You can only cancel your booking."},
                status=status.HTTP_403_FORBIDDEN,
            )
        booking.status = new_status
        booking.save(update_fields=["status"])
        sync_room_status_after_booking_save(booking)
        return Response(BookingSerializer(booking).data)

    def delete(self, request, pk):
        if request.user.role != "admin":
            return Response({"error": "Only admins can delete bookings."}, status=status.HTTP_403_FORBIDDEN)
        booking = self._get_booking(pk, request.user)
        if not booking:
            return Response({"error": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)

        room = booking.room
        booking.delete()
        sync_room_after_booking_deleted(room)
        return Response(status=status.HTTP_204_NO_CONTENT)
