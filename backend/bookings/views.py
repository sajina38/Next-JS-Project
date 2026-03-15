from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from rooms.models import Room
from .models import Booking


class BookingListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        bookings = Booking.objects.select_related("room").all()
        data = [
            {
                "id": b.id,
                "room": b.room.room_number,
                "room_type": b.room.room_type,
                "guest_name": b.guest_name,
                "check_in": str(b.check_in),
                "check_out": str(b.check_out),
                "created_at": b.created_at.isoformat(),
            }
            for b in bookings
        ]
        return Response(data)

    def post(self, request):
        room_id = request.data.get("room")
        guest_name = request.data.get("guest_name")
        check_in = request.data.get("check_in")
        check_out = request.data.get("check_out")

        if not all([room_id, guest_name, check_in, check_out]):
            return Response(
                {"error": "All fields are required: room, guest_name, check_in, check_out"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            room = Room.objects.get(id=room_id)
        except Room.DoesNotExist:
            return Response({"error": "Room not found"}, status=status.HTTP_404_NOT_FOUND)

        if not room.is_available:
            return Response(
                {"error": "Room is not available"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        booking = Booking.objects.create(
            room=room,
            guest_name=guest_name,
            check_in=check_in,
            check_out=check_out,
        )

        room.is_available = False
        room.save()

        return Response(
            {
                "id": booking.id,
                "room": room.room_number,
                "room_type": room.room_type,
                "guest_name": booking.guest_name,
                "check_in": str(booking.check_in),
                "check_out": str(booking.check_out),
                "created_at": booking.created_at.isoformat(),
            },
            status=status.HTTP_201_CREATED,
        )
