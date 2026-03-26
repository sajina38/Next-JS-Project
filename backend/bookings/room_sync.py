"""Keep Room.room_status aligned with booking lifecycle."""

from rooms.models import Room

ACTIVE_BOOKING_STATUSES = ("pending", "confirmed", "checked-in")


def sync_room_status_after_booking_save(booking):
    """Call after booking is created or updated (post-save)."""
    room = booking.room
    if room.room_status == Room.RoomStatus.MAINTENANCE:
        return

    st = booking.status

    if st == "cancelled":
        from .models import Booking

        other_active = (
            Booking.objects.filter(room=room, status__in=ACTIVE_BOOKING_STATUSES)
            .exclude(pk=booking.pk)
            .exists()
        )
        if not other_active:
            room.room_status = Room.RoomStatus.AVAILABLE
            room.save(update_fields=["room_status"])
        return

    if st == "checked-out":
        room.room_status = Room.RoomStatus.CLEANING
        room.save(update_fields=["room_status"])
        return

    if st in ACTIVE_BOOKING_STATUSES:
        room.room_status = Room.RoomStatus.OCCUPIED
        room.save(update_fields=["room_status"])


def sync_room_after_booking_deleted(room):
    """Call after a booking row is deleted."""
    from .models import Booking

    if room.room_status == Room.RoomStatus.MAINTENANCE:
        return
    has_active = Booking.objects.filter(room=room, status__in=ACTIVE_BOOKING_STATUSES).exists()
    if has_active:
        room.room_status = Room.RoomStatus.OCCUPIED
    else:
        room.room_status = Room.RoomStatus.AVAILABLE
    room.save(update_fields=["room_status"])


def recompute_room_status(room):
    """After a booking moves to another room, refresh the previous room."""
    if room.room_status == Room.RoomStatus.MAINTENANCE:
        return
    from .models import Booking

    if Booking.objects.filter(room=room, status__in=ACTIVE_BOOKING_STATUSES).exists():
        room.room_status = Room.RoomStatus.OCCUPIED
    else:
        room.room_status = Room.RoomStatus.AVAILABLE
    room.save(update_fields=["room_status"])
