from django.contrib import admin
from .models import Room


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ("room_number", "name", "room_type", "price", "capacity", "is_available")
    list_filter = ("room_type", "is_available")
    search_fields = ("name", "room_number")