from django.contrib import admin
from django.utils.html import format_html

from .models import Booking
from .room_sync import (
    recompute_room_status,
    refresh_bookings_past_checkout,
    sync_room_status_after_booking_save,
)


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "guest_name",
        "user",
        "room",
        "check_in",
        "check_out",
        "adults",
        "children",
        "arrival_time",
        "payment_method",
        "payment_status",
        "total_amount",
        "status",
        "created_at",
    )
    list_filter = ("status", "payment_method", "payment_status", "check_in", "guest_country")
    search_fields = ("user__username", "guest_name", "guest_email", "guest_phone", "room__room_number")
    list_editable = ("status",)
    readonly_fields = ("id_photo_preview",)

    fieldsets = (
        ("Booking Info", {
            "fields": ("user", "room", "check_in", "check_out", "status"),
        }),
        ("Guest Details", {
            "fields": ("guest_name", "guest_email", "guest_phone", "guest_country", "adults", "children", "guests"),
        }),
        ("Arrival & Requests", {
            "fields": ("arrival_time", "special_requests"),
        }),
        ("ID & Payment", {
            "fields": (
                "id_photo",
                "id_photo_preview",
                "payment_method",
                "payment_status",
                "total_amount",
            ),
        }),
    )

    def id_photo_preview(self, obj):
        if obj.id_photo:
            return format_html(
                '<img src="{}" style="max-height:300px; border-radius:8px;" />',
                obj.id_photo.url,
            )
        return "No ID uploaded"

    id_photo_preview.short_description = "ID Photo Preview"

    def changelist_view(self, request, extra_context=None):
        refresh_bookings_past_checkout()
        return super().changelist_view(request, extra_context=extra_context)

    def save_model(self, request, obj, form, change):
        old_room_pk = None
        if change and obj.pk:
            old_room_pk = (
                Booking.objects.filter(pk=obj.pk).values_list("room_id", flat=True).first()
            )
        super().save_model(request, obj, form, change)
        if old_room_pk and old_room_pk != obj.room_id:
            from rooms.models import Room

            recompute_room_status(Room.objects.get(pk=old_room_pk))
        sync_room_status_after_booking_save(obj)
