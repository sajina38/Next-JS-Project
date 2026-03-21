from django.db import models


class Room(models.Model):
    room_number = models.CharField(max_length=10, unique=True)
    room_type = models.CharField(max_length=50)
    name = models.CharField(max_length=100, default="")
    description = models.TextField(blank=True, default="")
    price = models.DecimalField(max_digits=8, decimal_places=2)
    capacity = models.IntegerField(default=2)
    image = models.ImageField(upload_to="rooms/", blank=True, null=True)
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name or self.room_number} ({self.room_type})"
