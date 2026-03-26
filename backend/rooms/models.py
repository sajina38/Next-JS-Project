from django.db import models


class HotelSettings(models.Model):
    """Singleton row (pk=1): hotel identity and contact shown in admin / future public pages."""

    hotel_name = models.CharField(max_length=200, default="Urban Boutique Hotel")
    contact_info = models.TextField(
        blank=True,
        default="",
        help_text="Address, phone, hours, or other contact details.",
    )
    email = models.EmailField(blank=True, default="")

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
                "contact_info": "",
                "email": "",
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

    room_number = models.CharField(max_length=10, unique=True)
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
