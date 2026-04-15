"""Loyalty points: earn on confirmed stays, redeem in Rs. 100 blocks (100 points each)."""

from decimal import Decimal

from django.contrib.auth import get_user_model
from django.db import transaction

from .models import Booking

User = get_user_model()

EARN_RUPEES_PER_POINT = 50  # 1 point per Rs. 50 spent
REDEEM_POINTS_PER_BLOCK = 100
REDEEM_RUPEES_PER_BLOCK = 100


def points_earned_for_amount(total_amount) -> int:
    """Whole rupees only: floor(total / 50)."""
    return max(0, int(Decimal(total_amount)) // EARN_RUPEES_PER_POINT)


def redemption_discount_and_points(user_loyalty_points: int, gross_total) -> tuple[int, int]:
    """
    Discount in NPR and points to deduct (same number when using full blocks).
    Discount never exceeds gross_total; only full Rs. 100 / 100-point blocks apply.
    """
    gross_int = max(0, int(Decimal(gross_total)))
    if user_loyalty_points < REDEEM_POINTS_PER_BLOCK or gross_int < REDEEM_RUPEES_PER_BLOCK:
        return 0, 0
    blocks_user = user_loyalty_points // REDEEM_POINTS_PER_BLOCK
    blocks_fit = gross_int // REDEEM_RUPEES_PER_BLOCK
    blocks = min(blocks_user, blocks_fit)
    if blocks <= 0:
        return 0, 0
    discount = blocks * REDEEM_RUPEES_PER_BLOCK
    points_used = blocks * REDEEM_POINTS_PER_BLOCK
    return discount, points_used


@transaction.atomic
def grant_loyalty_points_when_confirmed(booking: Booking, previous_status: str) -> None:
    """
    When status becomes CONFIRMED, award points once based on booking.total_amount.
    No-op if already awarded, still pending/cancelled, or was already confirmed.
    """
    booking = Booking.objects.select_for_update().select_related("user").get(pk=booking.pk)
    if booking.status != Booking.Status.CONFIRMED:
        return
    if booking.points_added:
        return
    if previous_status == Booking.Status.CONFIRMED:
        return
    earned = points_earned_for_amount(booking.total_amount)
    user = User.objects.select_for_update().get(pk=booking.user_id)
    if earned > 0:
        user.loyalty_points = max(0, user.loyalty_points + earned)
        user.save(update_fields=["loyalty_points"])
    booking.points_added = True
    booking.save(update_fields=["points_added"])


@transaction.atomic
def apply_user_loyalty_redemption_if_requested(user, gross_total: Decimal, redeem: bool) -> tuple[Decimal, int]:
    """
    If redeem is True, locks user and deducts whole 100-point blocks for Rs. 100 off each,
    capped by gross_total. Returns (final_total_after_discount, loyalty_points_redeemed).
    """
    if not redeem:
        return gross_total, 0
    user = User.objects.select_for_update().get(pk=user.pk)
    discount, pts = redemption_discount_and_points(user.loyalty_points, gross_total)
    if pts <= 0:
        return gross_total, 0
    user.loyalty_points = max(0, user.loyalty_points - pts)
    user.save(update_fields=["loyalty_points"])
    final = gross_total - Decimal(discount)
    if final < 0:
        final = Decimal("0")
    return final.quantize(Decimal("0.01")), pts
