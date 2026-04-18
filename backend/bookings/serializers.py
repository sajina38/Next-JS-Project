from datetime import date
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from rest_framework import serializers

from rooms.models import Room

from .loyalty import available_breakfast_cards, sync_user_loyalty_cards
from .models import Booking, validate_booking_status_transition
from .room_sync import room_has_schedule_blocking_conflict

User = get_user_model()

# E.164-style numbers are at most 15 digits; Nepal mobile + country needs at least ~9 digits.
_PHONE_MIN_DIGITS = 9
_PHONE_MAX_DIGITS = 15


def _validate_guest_phone_value(value: str, *, required: bool) -> str:
    s = (value or "").strip()
    if not s:
        if required:
            raise serializers.ValidationError("Phone number is required.")
        return ""
    digits = "".join(c for c in s if c.isdigit())
    if len(digits) < _PHONE_MIN_DIGITS:
        raise serializers.ValidationError(
            f"Enter a valid phone number with at least {_PHONE_MIN_DIGITS} digits "
            "(include country code, e.g. +977 98XXXXXXXX for Nepal)."
        )
    if len(digits) > _PHONE_MAX_DIGITS:
        raise serializers.ValidationError("Phone number has too many digits.")
    return s


def _booking_gross_total(room, check_in, check_out) -> Decimal:
    nights = (check_out - check_in).days
    nights = max(nights, 1)
    return (room.price * Decimal(nights)).quantize(Decimal("0.01"))


class BookingSerializer(serializers.ModelSerializer):
    room_number = serializers.CharField(source="room.room_number", read_only=True)
    room_name = serializers.CharField(source="room.name", read_only=True)
    room_type = serializers.CharField(source="room.room_type", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    redeem_loyalty = serializers.BooleanField(
        required=False,
        default=False,
        write_only=True,
        help_text="Use one breakfast loyalty card on this booking (no room discount in the app).",
    )

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
            "loyalty_points_redeemed",
            "loyalty_breakfast_card",
            "points_added",
            "status",
            "created_at",
            "redeem_loyalty",
        ]
        read_only_fields = [
            "id",
            "user",
            "status",
            "created_at",
            "payment_status",
            "total_amount",
            "loyalty_points_redeemed",
            "loyalty_breakfast_card",
            "points_added",
        ]

    def validate_guest_phone(self, value):
        return _validate_guest_phone_value(value, required=True)

    @transaction.atomic
    def create(self, validated_data):
        redeem = validated_data.pop("redeem_loyalty", False)
        request = self.context.get("request")
        merged_user = validated_data.pop("user", None)
        if request is not None:
            u = getattr(request, "user", None)
            user = u if u and u.is_authenticated else merged_user
        else:
            user = merged_user
        if not user or not user.is_authenticated:
            raise serializers.ValidationError("Authentication required.")
        room = validated_data["room"]
        check_in = validated_data["check_in"]
        check_out = validated_data["check_out"]
        gross = _booking_gross_total(room, check_in, check_out)
        if redeem and available_breakfast_cards(user.pk) < 1:
            raise serializers.ValidationError(
                {
                    "redeem_loyalty": (
                        "No breakfast loyalty card is available. Earn one free breakfast card "
                        "for every 5 completed stays (confirmed or checked out)."
                    ),
                }
            )
        booking = Booking.objects.create(
            **validated_data,
            user=user,
            status=Booking.Status.PENDING,
            total_amount=gross,
            loyalty_points_redeemed=0,
            loyalty_breakfast_card=bool(redeem),
        )
        sync_user_loyalty_cards(user.pk)
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
        if room and check_in and check_out:
            if room_has_schedule_blocking_conflict(room, check_in, check_out):
                raise serializers.ValidationError(
                    {
                        "room": (
                            "This room is already reserved for part of those dates. "
                            "Try other dates or pick another room."
                        ),
                    }
                )
        if room and room.room_status != Room.RoomStatus.AVAILABLE:
            raise serializers.ValidationError({"room": "This room is currently not available."})

        if room and data.get("guests"):
            if data["guests"] > room.capacity:
                raise serializers.ValidationError(
                    {"guests": f"This room supports a maximum of {room.capacity} guests."}
                )

        request = self.context.get("request")
        if data.get("redeem_loyalty") and request and request.user.is_authenticated and room and check_in and check_out:
            request.user.refresh_from_db()
            if available_breakfast_cards(request.user.pk) < 1:
                raise serializers.ValidationError(
                    {
                        "redeem_loyalty": (
                            "No breakfast loyalty card is available yet. Complete 5 stays to earn a card."
                        ),
                    }
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
        if self.instance:
            try:
                validate_booking_status_transition(self.instance.status, value)
            except DjangoValidationError as e:
                msg = e.messages[0] if e.messages else "Invalid status transition."
                raise serializers.ValidationError(msg) from e
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

    def validate_guest_phone(self, value):
        if value is None:
            return ""
        if isinstance(value, str) and not value.strip():
            return ""
        return _validate_guest_phone_value(value, required=False)

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

    redeem_loyalty = serializers.BooleanField(required=False, default=False, write_only=True)

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
            "redeem_loyalty",
        )

    def validate_user(self, user):
        if user.role != User.Role.CUSTOMER:
            raise serializers.ValidationError("Select a customer account.")
        if not user.is_active:
            raise serializers.ValidationError("This account is inactive.")
        return user

    def validate_guest_phone(self, value):
        return _validate_guest_phone_value(value, required=False)

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
            if check_in and check_out and room_has_schedule_blocking_conflict(room, check_in, check_out):
                raise serializers.ValidationError(
                    {
                        "room": (
                            "This room is already reserved for part of those dates. "
                            "Try other dates or pick another room."
                        ),
                    }
                )
            if room.room_status != Room.RoomStatus.AVAILABLE:
                raise serializers.ValidationError(
                    {"room": "This room is not available for new bookings."}
                )
            if guests and guests > room.capacity:
                raise serializers.ValidationError(
                    {"guests": f"This room supports a maximum of {room.capacity} guests."}
                )
        cust = data.get("user")
        if data.get("redeem_loyalty") and cust and room and check_in and check_out:
            if available_breakfast_cards(cust.pk) < 1:
                raise serializers.ValidationError(
                    {
                        "redeem_loyalty": (
                            "This customer has no breakfast loyalty card available "
                            "(one card per 5 completed stays)."
                        ),
                    }
                )
        return data

    @transaction.atomic
    def create(self, validated_data):
        redeem = validated_data.pop("redeem_loyalty", False)
        target = validated_data["user"]
        room = validated_data["room"]
        check_in = validated_data["check_in"]
        check_out = validated_data["check_out"]
        gross = _booking_gross_total(room, check_in, check_out)
        if redeem and available_breakfast_cards(target.pk) < 1:
            raise serializers.ValidationError(
                {
                    "redeem_loyalty": (
                        "This customer has no breakfast loyalty card available."
                    ),
                }
            )
        booking = Booking.objects.create(
            **validated_data,
            status=Booking.Status.PENDING,
            total_amount=gross,
            loyalty_points_redeemed=0,
            loyalty_breakfast_card=bool(redeem),
        )
        sync_user_loyalty_cards(target.pk)
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
