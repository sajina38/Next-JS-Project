from django.conf import settings
from django.db import models

from rooms.models import Room


class Booking(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        CONFIRMED = "confirmed", "Confirmed"
        CANCELLED = "cancelled", "Cancelled"
        CHECKED_IN = "checked-in", "Checked in"
        CHECKED_OUT = "checked-out", "Checked out"

    class PaymentMethod(models.TextChoices):
        PREPAY = "prepay", "Pre-payment (Bank Transfer)"
        PAY_AT_CHECKIN = "pay-at-checkin", "Pay at Check-in"
        BANK_CARD = "bank-card", "Bank Card on Arrival"

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
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username} — Room {self.room.room_number} ({self.status})"
