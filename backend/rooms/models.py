from django.core.validators import RegexValidator
from django.db import models

ROOM_NUMBER_VALIDATOR = RegexValidator(
    regex=r"^\d{1,10}$",
    message="Room number must be numeric only (e.g. 101, 205).",
)


class HotelSettings(models.Model):
    """Singleton row (pk=1): hotel identity and contact shown in admin / future public pages."""

    hotel_name = models.CharField(max_length=200, default="Urban Boutique Hotel")
    tagline = models.CharField(
        max_length=240,
        blank=True,
        default="",
        help_text="Short line under the hotel name on marketing or confirmation copy.",
    )
    contact_info = models.TextField(
        blank=True,
        default="",
        help_text="Address, phone, hours, or other contact details.",
    )
    phone = models.CharField(
        max_length=40,
        blank=True,
        default="",
        help_text="Main front desk or reservations phone (display only).",
    )
    email = models.EmailField(blank=True, default="")
    website_url = models.CharField(
        "Website URL",
        max_length=500,
        blank=True,
        default="",
        help_text="Public website link (include https:// when possible).",
    )
    check_in_policy = models.CharField(
        max_length=120,
        blank=True,
        default="",
        help_text="e.g. From 2:00 PM — shown to guests where you surface policies.",
    )
    check_out_policy = models.CharField(
        max_length=120,
        blank=True,
        default="",
        help_text="e.g. By 11:00 AM",
    )

    class Meta:
        verbose_name = "Hotel settings"
        verbose_name_plural = "Hotel settings"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        pass

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(
            pk=1,
            defaults={
                "hotel_name": "Urban Boutique Hotel",
                "tagline": "",
                "contact_info": "",
                "phone": "",
                "email": "",
                "website_url": "",
                "check_in_policy": "",
                "check_out_policy": "",
            },
        )
        return obj

    def __str__(self):
        return self.hotel_name


class Room(models.Model):
    class RoomStatus(models.TextChoices):
        AVAILABLE = "available", "Available"
        OCCUPIED = "occupied", "Occupied"
        CLEANING = "cleaning", "Cleaning"
        MAINTENANCE = "maintenance", "Maintenance"

    room_number = models.CharField(
        max_length=10,
        unique=True,
        validators=[ROOM_NUMBER_VALIDATOR],
    )
    room_type = models.CharField(max_length=50)
    name = models.CharField(max_length=100, default="")
    description = models.TextField(blank=True, default="")
    price = models.DecimalField(max_digits=8, decimal_places=2)
    capacity = models.IntegerField(default=2)
    image = models.ImageField(upload_to="rooms/", blank=True, null=True)
    room_status = models.CharField(
        max_length=20,
        choices=RoomStatus.choices,
        default=RoomStatus.AVAILABLE,
    )

    @property
    def is_available(self) -> bool:
        """True when the room accepts new bookings (API / legacy)."""
        return self.room_status == self.RoomStatus.AVAILABLE

    def __str__(self):
        return f"{self.name or self.room_number} ({self.room_type})"
