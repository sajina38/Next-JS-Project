"""Send transactional email after a booking is created."""

import logging

from django.conf import settings
from django.core.mail import send_mail

from rooms.models import HotelSettings

from .models import Booking

logger = logging.getLogger(__name__)


def _booking_recipient_email(booking) -> str:
    guest = (getattr(booking, "guest_email", None) or "").strip()
    if guest and "@" in guest:
        return guest
    user = getattr(booking, "user", None)
    if user:
        addr = (getattr(user, "email", None) or "").strip()
        if addr and "@" in addr:
            return addr
    return ""


def _smtp_from_email(hotel_name: str) -> str:
    """Use the authenticated SMTP mailbox as From (required for Gmail and most relays)."""
    host = (getattr(settings, "EMAIL_HOST_USER", None) or "").strip()
    if host:
        display = (hotel_name or "Urban Boutique Hotel").strip() or "Hotel"
        return f"{display} <{host}>"
    return (getattr(settings, "DEFAULT_FROM_EMAIL", None) or "").strip() or "noreply@localhost"


def send_booking_confirmation_email(booking) -> bool:
    """
    Notify the guest when a booking is confirmed (self-service, admin confirmation, or Khalti verify).

    Uses guest_email when set and looks like an email, otherwise the account email.

    Returns True if an SMTP send was attempted successfully, False if skipped or failed.
    Logs failures; API callers still succeed so bookings are not lost on mail errors.
    """
    backend = getattr(settings, "EMAIL_BACKEND", "")
    if "console" in backend:
        logger.warning(
            "EMAIL_BACKEND is console — confirmation for booking id=%s will only print to the "
            "server log. Set EMAIL_HOST_USER and EMAIL_HOST_PASSWORD in backend/.env for real email.",
            booking.pk,
        )

    to = _booking_recipient_email(booking)
    if not to:
        logger.warning(
            "Skipping booking confirmation email: no valid guest_email or user.email (booking id=%s)",
            booking.pk,
        )
        return False

    try:
        hotel = HotelSettings.load()
        hotel_name = (hotel.hotel_name or "Urban Boutique Hotel").strip()
    except Exception:  # noqa: BLE001
        hotel_name = "Urban Boutique Hotel"

    room = booking.room
    room_label = f"Room {room.room_number}"
    if getattr(room, "name", None) and (room.name or "").strip():
        room_label += f" — {(room.name or '').strip()}"
    elif getattr(room, "room_type", None):
        room_label += f" ({room.room_type})"

    guest_name = (booking.guest_name or "").strip()
    if not guest_name and booking.user_id:
        u = booking.user
        full = f"{u.first_name} {u.last_name}".strip()
        guest_name = full or u.username or "Guest"

    status_note = (
        "Your reservation is confirmed."
        if booking.status == Booking.Status.CONFIRMED
        else f"Your reservation status is: {booking.get_status_display()}."
    )

    subject = f"{hotel_name} — booking confirmation (#{booking.pk})"
    body = (
        f"Dear {guest_name},\n\n"
        f"Thank you for choosing {hotel_name}.\n"
        f"{status_note}\n\n"
        f"Booking reference: #{booking.pk}\n"
        f"{room_label}\n"
        f"Check-in: {booking.check_in}\n"
        f"Check-out: {booking.check_out}\n"
        f"Guests: {booking.guests} (adults {booking.adults}, children {booking.children})\n"
        f"Total: NPR {booking.total_amount}\n"
        f"Payment method: {booking.get_payment_method_display()}\n"
        f"Payment status: {booking.get_payment_status_display()}\n\n"
        "If you have questions, reply to this email or contact the hotel.\n\n"
        f"— {hotel_name}"
    )

    from_email = _smtp_from_email(hotel_name)

    try:
        send_mail(
            subject=subject,
            message=body,
            from_email=from_email,
            recipient_list=[to],
            fail_silently=False,
        )
        logger.info("Sent booking confirmation from %s to %s (booking id=%s)", from_email, to, booking.pk)
        return True
    except Exception:
        host = getattr(settings, "EMAIL_HOST", "(unset)")
        port = getattr(settings, "EMAIL_PORT", "(unset)")
        logger.exception(
            "Failed to send booking confirmation to %s (booking id=%s); check SMTP host/port "
            "(this log shows %s:%s — use smtp.gmail.com:587 or :465 with SSL if 587 is blocked).",
            to,
            booking.pk,
            host,
            port,
        )
        return False
