from rest_framework import serializers

from .models import HotelSettings, Room


class RoomSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    is_available = serializers.BooleanField(read_only=True)

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
            "room_status",
            "is_available",
        ]

    def get_image(self, obj):
        if obj.image:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class HotelSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = HotelSettings
        fields = ["id", "hotel_name", "contact_info", "email"]

    def validate_hotel_name(self, value):
        if not (value or "").strip():
            raise serializers.ValidationError("Hotel name is required.")
        return value.strip()
