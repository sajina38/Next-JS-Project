"""Keep Room.room_status aligned with booking lifecycle."""

from django.db.models import Q
from django.utils import timezone

from rooms.models import Room

# Occupies the room until checkout or cancellation.
ACTIVE_BOOKING_STATUSES = ("pending", "confirmed")


def _status_value(status) -> str:
    v = getattr(status, "value", status)
    return v if isinstance(v, str) else str(v)


def _unpaid_khalti_pending_q() -> Q:
    """Khalti flow: booking row exists before redirect, but payment is not done yet."""
    return Q(status="pending", payment_method="khalti", payment_status="unpaid")


def _soft_pay_at_confirmed_unpaid_q() -> Q:
    """
    Staff may mark pay-at bookings ``confirmed`` before cash is collected; until ``paid``,
    treat like no hard hold so the public site and new Khalti checkouts are not blocked
    (and room status can stay available).
    """
    return Q(status="confirmed", payment_method="pay-at-checkin", payment_status="unpaid")


def is_unpaid_khalti_pending_booking(booking) -> bool:
    return (
        _status_value(booking.status) == "pending"
        and _status_value(booking.payment_method) == "khalti"
        and _status_value(booking.payment_status) == "unpaid"
    )


def is_soft_pay_at_confirmed_unpaid_booking(booking) -> bool:
    return (
        _status_value(booking.status) == "confirmed"
        and _status_value(booking.payment_method) == "pay-at-checkin"
        and _status_value(booking.payment_status) == "unpaid"
    )


def _blocking_bookings_qs(room):
    """
    Pending/confirmed rows that still block the room for new stays.

    Past stays left as ``confirmed`` by mistake should not keep the room
    ``occupied`` forever; only bookings with checkout strictly after today count.

    Unpaid Khalti + pending is excluded: the guest has not completed payment yet, so the
    room should not show as booked / occupied until verify marks paid + confirmed.
    """
    from .models import Booking

    today = timezone.localdate()
    return (
        Booking.objects.filter(
            room=room,
            status__in=ACTIVE_BOOKING_STATUSES,
            check_out__gt=today,
        )
        .exclude(_unpaid_khalti_pending_q())
        .exclude(_soft_pay_at_confirmed_unpaid_q())
    )


def room_has_schedule_blocking_conflict(
    room,
    check_in,
    check_out,
    *,
    exclude_booking_id=None,
) -> bool:
    """
    True if another booking already holds these nights for listing / validation.

    Excludes: unpaid Khalti pending (abandoned checkout), and confirmed pay-at-unpaid
    (no cash collected yet — should not block new online reservations).
    """
    from .models import Booking

    qs = (
        Booking.objects.filter(
            room=room,
            check_in__lt=check_out,
            check_out__gt=check_in,
            status__in=ACTIVE_BOOKING_STATUSES,
        )
        .exclude(_unpaid_khalti_pending_q())
        .exclude(_soft_pay_at_confirmed_unpaid_q())
    )
    if exclude_booking_id is not None:
        qs = qs.exclude(pk=exclude_booking_id)
    return qs.exists()


def sync_room_status_after_booking_save(booking):
    """Call after booking is created or updated (post-save)."""
    # Always read fresh row so we don't rely on a stale cached ``booking.room`` instance.
    room = Room.objects.get(pk=booking.room_id)
    if room.room_status == Room.RoomStatus.MAINTENANCE:
        return

    st = _status_value(booking.status)

    if st == "cancelled":
        if not _blocking_bookings_qs(room).exists():
            room.room_status = Room.RoomStatus.AVAILABLE
            room.save(update_fields=["room_status"])
        else:
            room.room_status = Room.RoomStatus.OCCUPIED
            room.save(update_fields=["room_status"])
        return

    if st == "checkout":
        if _blocking_bookings_qs(room).exists():
            recompute_room_status(room)
        else:
            # No upcoming stay on this room: mark available so new bookings and the
            # public ``is_available`` flag stay in sync (use admin Rooms → Cleaning if needed).
            room.room_status = Room.RoomStatus.AVAILABLE
            room.save(update_fields=["room_status"])
        return

    if st in ACTIVE_BOOKING_STATUSES:
        if is_unpaid_khalti_pending_booking(booking) or is_soft_pay_at_confirmed_unpaid_booking(booking):
            recompute_room_status(room)
        else:
            room.room_status = Room.RoomStatus.OCCUPIED
            room.save(update_fields=["room_status"])


def sync_room_after_booking_deleted(room):
    """Call after a booking row is deleted."""
    room = Room.objects.get(pk=room.pk)
    if room.room_status == Room.RoomStatus.MAINTENANCE:
        return
    if _blocking_bookings_qs(room).exists():
        room.room_status = Room.RoomStatus.OCCUPIED
    else:
        room.room_status = Room.RoomStatus.AVAILABLE
    room.save(update_fields=["room_status"])


def recompute_room_status(room):
    """After a booking moves to another room, refresh the previous room."""
    room = Room.objects.get(pk=room.pk)
    if room.room_status == Room.RoomStatus.MAINTENANCE:
        return
    if _blocking_bookings_qs(room).exists():
        room.room_status = Room.RoomStatus.OCCUPIED
    else:
        room.room_status = Room.RoomStatus.AVAILABLE
    room.save(update_fields=["room_status"])


def refresh_bookings_past_checkout():
    """
    Keep ``available`` / ``occupied`` in sync with *hard* blocking bookings.

    - Downgrades ``occupied`` → ``available`` when nothing blocks.
    - Upgrades ``available`` → ``occupied`` when a hard block exists (fixes admin
      marking a room available while a paid/committed booking still overlaps).
    Skips ``cleaning`` and ``maintenance``.
    """
    changed = 0
    for room in Room.objects.exclude(
        room_status__in=(Room.RoomStatus.MAINTENANCE, Room.RoomStatus.CLEANING)
    ):
        has_block = _blocking_bookings_qs(room).exists()
        if room.room_status == Room.RoomStatus.OCCUPIED and not has_block:
            room.room_status = Room.RoomStatus.AVAILABLE
            room.save(update_fields=["room_status"])
            changed += 1
        elif room.room_status == Room.RoomStatus.AVAILABLE and has_block:
            room.room_status = Room.RoomStatus.OCCUPIED
            room.save(update_fields=["room_status"])
            changed += 1
    return changed
