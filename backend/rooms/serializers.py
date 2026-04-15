from rest_framework import serializers

from .models import HotelSettings, Room


class RoomSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField(read_only=True)
    """Optional image file on create/update (multipart field name: ``photo``)."""
    photo = serializers.ImageField(write_only=True, required=False)
    is_available = serializers.SerializerMethodField(read_only=True)

    def validate_room_number(self, value):
        s = (value or "").strip()
        if not s.isdigit() or not (1 <= len(s) <= 10):
            raise serializers.ValidationError(
                "Room number must be numeric only (e.g. 101, 205)."
            )
        return s

    class Meta:
        model = Room
        fields = [
            "id",
            "room_number",
            "room_type",
            "name",
            "description",
            "price",
            "capacity",
            "image",
            "photo",
            "room_status",
            "is_available",
        ]

    def create(self, validated_data):
        photo = validated_data.pop("photo", None)
        room = super().create(validated_data)
        if photo:
            room.image = photo
            room.save(update_fields=["image"])
        return room

    def update(self, instance, validated_data):
        photo = validated_data.pop("photo", None)
        room = super().update(instance, validated_data)
        if photo:
            room.image = photo
            room.save(update_fields=["image"])
        return room

    def get_image(self, obj):
        if obj.image:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def get_is_available(self, obj):
        # Model exposes ``is_available`` as a @property (no DB column); SerializerMethodField
        # keeps JSON in sync with ``room_status`` after admin edits.
        return bool(obj.is_available)


class HotelSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = HotelSettings
        fields = ["id", "hotel_name", "contact_info", "email"]

    def validate_hotel_name(self, value):
        if not (value or "").strip():
            raise serializers.ValidationError("Hotel name is required.")
        return value.strip()
