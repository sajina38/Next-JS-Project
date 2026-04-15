from django.contrib import admin
from django.utils.html import format_html

from .models import HotelSettings, Room


@admin.register(HotelSettings)
class HotelSettingsAdmin(admin.ModelAdmin):
    list_display = ("hotel_name", "phone", "email")

    def has_add_permission(self, request):
        return not HotelSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ("room_number", "name", "room_type", "price", "capacity", "room_status", "image_preview")
    list_filter = ("room_type", "room_status")
    search_fields = ("name", "room_number")

    readonly_fields = ("image_preview_large",)

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="60" height="40" style="object-fit:cover;border-radius:4px;" />', obj.image.url)
        return "—"
    image_preview.short_description = "Image"

    def image_preview_large(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="300" style="border-radius:8px;" />', obj.image.url)
        return "No image uploaded"
    image_preview_large.short_description = "Image Preview"
