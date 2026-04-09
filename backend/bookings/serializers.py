from datetime import date

from django.contrib.auth import get_user_model
from rest_framework import serializers

from rooms.models import Room

from .models import Booking

User = get_user_model()


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
            "payment_status",
            "total_amount",
            "status",
            "created_at",
        ]
        read_only_fields = ["id", "user", "status", "created_at", "payment_status", "total_amount"]

    def create(self, validated_data):
        booking = super().create(validated_data)
        nights = (booking.check_out - booking.check_in).days
        nights = max(nights, 1)
        booking.total_amount = booking.room.price * nights
        booking.save(update_fields=["total_amount"])
        return booking

    def validate(self, data):
        check_in = data.get("check_in")
        check_out = data.get("check_out")

        if check_in and check_out:
            if check_in < date.today():
                raise serializers.ValidationError({"check_in": "Check-in date cannot be in the past."})
            if check_out <= check_in:
                raise serializers.ValidationError({"check_out": "Check-out must be after check-in."})

        room = data.get("room")
        if room and room.room_status != Room.RoomStatus.AVAILABLE:
            raise serializers.ValidationError({"room": "This room is currently not available."})

        if room and data.get("guests"):
            if data["guests"] > room.capacity:
                raise serializers.ValidationError(
                    {"guests": f"This room supports a maximum of {room.capacity} guests."}
                )

        return data


class AdminBookingUpdateSerializer(serializers.ModelSerializer):
    """Admin/manager partial updates: status, room reassignment, dates, guest counts."""

    class Meta:
        model = Booking
        fields = (
            "status",
            "room",
            "check_in",
            "check_out",
            "guests",
            "adults",
            "children",
            "guest_name",
            "guest_email",
            "guest_phone",
            "payment_method",
            "payment_status",
            "total_amount",
        )

    def validate_room(self, room):
        inst = self.instance
        if inst and room.pk == inst.room_id:
            return room
        if room.room_status == Room.RoomStatus.MAINTENANCE:
            raise serializers.ValidationError("Room is under maintenance.")
        if room.room_status != Room.RoomStatus.AVAILABLE:
            raise serializers.ValidationError(
                "Room must be available to assign this booking."
            )
        return room

    def validate_status(self, value):
        allowed = {c.value for c in Booking.Status}
        if value not in allowed:
            raise serializers.ValidationError("Invalid status.")
        return value

    def validate_payment_status(self, value):
        allowed = {c.value for c in Booking.PaymentStatus}
        if value not in allowed:
            raise serializers.ValidationError("Invalid payment status.")
        return value

    def validate_total_amount(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Amount cannot be negative.")
        return value

    def validate(self, data):
        inst = self.instance
        if not inst:
            return data
        check_in = data.get("check_in", inst.check_in)
        check_out = data.get("check_out", inst.check_out)
        if check_in and check_out and check_out <= check_in:
            raise serializers.ValidationError(
                {"check_out": "Check-out must be after check-in."}
            )
        # Do not reject past check-in here: admins confirm/check-in historical rows;
        # PATCH often only sends status, but validate() still sees instance dates.
        room = data.get("room", inst.room)
        guests = data.get("guests", inst.guests)
        if room and guests and guests > room.capacity:
            raise serializers.ValidationError(
                {"guests": f"This room supports a maximum of {room.capacity} guests."}
            )
        return data


class StaffBookingCreateSerializer(serializers.ModelSerializer):
    """Admin/manager: create a booking for a customer account (walk-in / phone booking)."""

    class Meta:
        model = Booking
        fields = (
            "user",
            "room",
            "check_in",
            "check_out",
            "guests",
            "adults",
            "children",
            "guest_name",
            "guest_email",
            "guest_phone",
            "guest_country",
            "payment_method",
            "special_requests",
        )

    def validate_user(self, user):
        if user.role != User.Role.CUSTOMER:
            raise serializers.ValidationError("Select a customer account.")
        if not user.is_active:
            raise serializers.ValidationError("This account is inactive.")
        return user

    def validate(self, data):
        check_in = data.get("check_in")
        check_out = data.get("check_out")
        if check_in and check_out and check_out <= check_in:
            raise serializers.ValidationError(
                {"check_out": "Check-out must be after check-in."}
            )
        room = data.get("room")
        guests = data.get("guests", 1)
        if room:
            if room.room_status != Room.RoomStatus.AVAILABLE:
                raise serializers.ValidationError(
                    {"room": "This room is not available for new bookings."}
                )
            if guests and guests > room.capacity:
                raise serializers.ValidationError(
                    {"guests": f"This room supports a maximum of {room.capacity} guests."}
                )
        return data

    def create(self, validated_data):
        booking = Booking.objects.create(**validated_data, status=Booking.Status.PENDING)
        nights = (booking.check_out - booking.check_in).days
        nights = max(nights, 1)
        booking.total_amount = booking.room.price * nights
        booking.save(update_fields=["total_amount"])
        return booking


class StaffCustomerCreateSerializer(serializers.ModelSerializer):
    """Admin/manager: create a new customer account while making a booking."""

    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "password",
        )

    def validate(self, data):
        # Keep it simple for FYP: username + email + password are required.
        email = (data.get("email") or "").strip()
        username = (data.get("username") or "").strip()
        if not email:
            raise serializers.ValidationError({"email": "Email is required."})
        if not username:
            raise serializers.ValidationError({"username": "Username is required."})
        return data

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=password,
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
        )
        user.role = User.Role.CUSTOMER
        user.save(update_fields=["role"])
        return user
