from django.conf import settings
from rest_framework import serializers

from .models import HotelSettings, Room


class RoomSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField(read_only=True)
    images = serializers.SerializerMethodField(read_only=True)
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
            "images",
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

    def get_images(self, obj):
        """Primary image first, then gallery_images paths (absolute URLs for the client)."""
        request = self.context.get("request")
        urls: list[str] = []
        seen: set[str] = set()

        def add(url: str | None) -> None:
            if not url or url in seen:
                return
            seen.add(url)
            urls.append(url)

        if obj.image:
            add(self.get_image(obj))

        for raw in obj.gallery_images or []:
            rel = (raw or "").strip().lstrip("/")
            if not rel:
                continue
            if rel.startswith("http://") or rel.startswith("https://"):
                add(rel)
                continue
            media_path = f"{settings.MEDIA_URL.rstrip('/')}/{rel}"
            if request:
                add(request.build_absolute_uri(media_path))
            else:
                add(media_path)

        return urls

    def get_is_available(self, obj):
        # Model exposes ``is_available`` as a @property (no DB column); SerializerMethodField
        # keeps JSON in sync with ``room_status`` after admin edits.
        return bool(obj.is_available)


class HotelSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = HotelSettings
        fields = [
            "id",
            "hotel_name",
            "tagline",
            "contact_info",
            "phone",
            "email",
            "website_url",
            "check_in_policy",
            "check_out_policy",
        ]

    def validate_hotel_name(self, value):
        if not (value or "").strip():
            raise serializers.ValidationError("Hotel name is required.")
        return value.strip()
