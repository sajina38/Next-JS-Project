from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Booking
from .serializers import BookingSerializer


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

        room = booking.room
        room.is_available = False
        room.save(update_fields=["is_available"])

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

        new_status = request.data.get("status")
        if not new_status:
            return Response({"error": "Status field is required."}, status=status.HTTP_400_BAD_REQUEST)

        if request.user.role in ("admin", "manager"):
            if new_status not in ("pending", "confirmed", "cancelled"):
                return Response({"error": "Invalid status."}, status=status.HTTP_400_BAD_REQUEST)
        else:
            if new_status != "cancelled":
                return Response(
                    {"error": "You can only cancel your booking."},
                    status=status.HTTP_403_FORBIDDEN,
                )

        booking.status = new_status
        booking.save(update_fields=["status"])

        if new_status == "cancelled":
            has_active = Booking.objects.filter(
                room=booking.room, status__in=["pending", "confirmed"]
            ).exclude(pk=booking.pk).exists()
            if not has_active:
                booking.room.is_available = True
                booking.room.save(update_fields=["is_available"])

        return Response(BookingSerializer(booking).data)

    def delete(self, request, pk):
        if request.user.role != "admin":
            return Response({"error": "Only admins can delete bookings."}, status=status.HTTP_403_FORBIDDEN)
        booking = self._get_booking(pk, request.user)
        if not booking:
            return Response({"error": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)

        room = booking.room
        booking.delete()

        has_active = Booking.objects.filter(
            room=room, status__in=["pending", "confirmed"]
        ).exists()
        if not has_active:
            room.is_available = True
            room.save(update_fields=["is_available"])

        return Response(status=status.HTTP_204_NO_CONTENT)
