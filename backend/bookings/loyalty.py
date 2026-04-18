"""Breakfast loyalty cards: earn 1 card per 5 completed stays; redeem one card per booking for free breakfast (hotel)."""

from django.contrib.auth import get_user_model
from django.db import transaction

from .models import Booking

User = get_user_model()

BOOKINGS_PER_LOYALTY_CARD = 5


def eligible_completed_stays_count(user_id: int) -> int:
    return Booking.objects.filter(
        user_id=user_id,
        status__in=[Booking.Status.CONFIRMED, Booking.Status.CHECKOUT],
    ).count()


def breakfast_cards_redeemed_count(user_id: int) -> int:
    return (
        Booking.objects.filter(user_id=user_id, loyalty_breakfast_card=True)
        .exclude(status=Booking.Status.CANCELLED)
        .count()
    )


def available_breakfast_cards(user_id: int) -> int:
    earned = eligible_completed_stays_count(user_id) // BOOKINGS_PER_LOYALTY_CARD
    used = breakfast_cards_redeemed_count(user_id)
    return max(0, earned - used)


@transaction.atomic
def sync_user_loyalty_cards(user_id: int) -> None:
    """Recompute User.loyalty_cards from completed stays and breakfast redemptions."""
    user = User.objects.select_for_update().get(pk=user_id)
    balance = available_breakfast_cards(user_id)
    if user.loyalty_cards != balance:
        user.loyalty_cards = balance
        user.save(update_fields=["loyalty_cards"])


def grant_loyalty_points_when_confirmed(booking: Booking, previous_status: str) -> None:
    """
    When a booking becomes CONFIRMED, refresh the guest's loyalty card balance.
    (Function name kept for existing imports.)
    """
    if booking.status != Booking.Status.CONFIRMED:
        return
    if previous_status == Booking.Status.CONFIRMED:
        return
    sync_user_loyalty_cards(booking.user_id)
