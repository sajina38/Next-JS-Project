from django.contrib import admin
from django.utils.html import format_html

from .models import Room


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ("room_number", "name", "room_type", "price", "capacity", "is_available", "image_preview")
    list_filter = ("room_type", "is_available")
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
