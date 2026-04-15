from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models

from rooms.models import Room

_ALLOWED_BOOKING_STATUS_TRANSITIONS = {
    "pending": {"confirmed", "cancelled"},
    "confirmed": {"checkout", "cancelled"},
    "checkout": set(),
    "cancelled": set(),
}


def validate_booking_status_transition(old_status: str, new_status: str) -> None:
    """
    PENDING → CONFIRMED | CANCELLED
    CONFIRMED → CHECKOUT | CANCELLED
    Terminal: CHECKOUT, CANCELLED.
    """
    if old_status == new_status:
        return
    if new_status not in _ALLOWED_BOOKING_STATUS_TRANSITIONS.get(old_status, set()):
        raise ValidationError(
            "Invalid status transition. Allowed: Pending → Confirmed or Cancelled; "
            "Confirmed → Checkout or Cancelled."
        )


class Booking(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        CONFIRMED = "confirmed", "Confirmed"
        CANCELLED = "cancelled", "Cancelled"
        CHECKOUT = "checkout", "Checkout"

    class PaymentMethod(models.TextChoices):
        PREPAY = "prepay", "Pre-payment (Bank Transfer)"
        PAY_AT_CHECKIN = "pay-at-checkin", "Pay at Check-in"
        BANK_CARD = "bank-card", "Bank Card on Arrival"
        KHALTI = "khalti", "Khalti (online — sandbox / test)"

    class PaymentStatus(models.TextChoices):
        UNPAID = "unpaid", "Unpaid"
        PAID = "paid", "Paid"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="bookings",
    )
    room = models.ForeignKey(
        Room,
        on_delete=models.CASCADE,
        related_name="bookings",
    )
    check_in = models.DateField()
    check_out = models.DateField()
    guests = models.PositiveIntegerField(default=1)
    adults = models.PositiveIntegerField(default=1)
    children = models.PositiveIntegerField(default=0)

    guest_name = models.CharField(max_length=200, blank=True, default="")
    guest_email = models.EmailField(blank=True, default="")
    guest_phone = models.CharField(max_length=30, blank=True, default="")
    guest_country = models.CharField(max_length=100, blank=True, default="Nepal")

    arrival_time = models.TimeField(blank=True, null=True)
    special_requests = models.TextField(blank=True, default="")
    id_photo = models.ImageField(upload_to="bookings/id_photos/", blank=True, null=True)

    payment_method = models.CharField(
        max_length=20,
        choices=PaymentMethod.choices,
        default=PaymentMethod.PAY_AT_CHECKIN,
    )
    payment_status = models.CharField(
        max_length=10,
        choices=PaymentStatus.choices,
        default=PaymentStatus.UNPAID,
    )
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    points_added = models.BooleanField(
        default=False,
        help_text="True after loyalty earn was applied for this booking (confirmed).",
    )
    loyalty_points_redeemed = models.PositiveIntegerField(
        default=0,
        help_text="Points deducted when this booking was created (100 pts = Rs. 100 off).",
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def clean(self):
        super().clean()
        if not self.pk:
            return
        prior = type(self).objects.filter(pk=self.pk).only("status").first()
        if prior is None or prior.status == self.status:
            return
        validate_booking_status_transition(prior.status, self.status)

    def save(self, *args, **kwargs):
        # Model.clean() is not always called (e.g. some REST update paths); enforce rules here too.
        if self.pk:
            prior = type(self).objects.filter(pk=self.pk).only("status").first()
            if prior is not None and prior.status != self.status:
                validate_booking_status_transition(prior.status, self.status)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} — Room {self.room.room_number} ({self.status})"
