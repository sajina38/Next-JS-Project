from django.contrib import admin
from django.utils.html import format_html

from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        "id", "guest_name", "user", "room", "check_in", "check_out",
        "adults", "children", "arrival_time", "payment_method", "status", "created_at",
    )
    list_filter = ("status", "payment_method", "check_in", "guest_country")
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
            "fields": ("id_photo", "id_photo_preview", "payment_method"),
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

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        if change and "status" in form.changed_data:
            self._update_room_availability(obj)

    def save_formset(self, request, form, formset, change):
        super().save_formset(request, form, formset, change)

    def _update_room_availability(self, booking):
        room = booking.room
        has_active = Booking.objects.filter(
            room=room, status__in=["pending", "confirmed"]
        ).exists()
        room.is_available = not has_active
        room.save(update_fields=["is_available"])
