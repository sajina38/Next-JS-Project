from datetime import date

from rest_framework import serializers

from .models import Booking


class BookingSerializer(serializers.ModelSerializer):
    room_number = serializers.CharField(source="room.room_number", read_only=True)
    room_name = serializers.CharField(source="room.name", read_only=True)
    room_type = serializers.CharField(source="room.room_type", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Booking
        fields = [
            "id",
            "user",
            "username",
            "room",
            "room_number",
            "room_name",
            "room_type",
            "check_in",
            "check_out",
            "guests",
            "adults",
            "children",
            "guest_name",
            "guest_email",
            "guest_phone",
            "guest_country",
            "arrival_time",
            "special_requests",
            "id_photo",
            "payment_method",
            "status",
            "created_at",
        ]
        read_only_fields = ["id", "user", "status", "created_at"]

    def validate(self, data):
        check_in = data.get("check_in")
        check_out = data.get("check_out")

        if check_in and check_out:
            if check_in < date.today():
                raise serializers.ValidationError({"check_in": "Check-in date cannot be in the past."})
            if check_out <= check_in:
                raise serializers.ValidationError({"check_out": "Check-out must be after check-in."})

        room = data.get("room")
        if room and not room.is_available:
            raise serializers.ValidationError({"room": "This room is currently not available."})

        if room and data.get("guests"):
            if data["guests"] > room.capacity:
                raise serializers.ValidationError(
                    {"guests": f"This room supports a maximum of {room.capacity} guests."}
                )

        return data
