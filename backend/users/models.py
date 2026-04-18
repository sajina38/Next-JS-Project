from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "admin", "Admin"
        MANAGER = "manager", "Manager"
        CUSTOMER = "customer", "Customer"

    class Gender(models.TextChoices):
        MALE = "male", "Male"
        FEMALE = "female", "Female"
        OTHER = "other", "Other"

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.CUSTOMER,
    )
    phone_number = models.CharField(max_length=30, blank=True, default="")
    date_of_birth = models.DateField(blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, default="")
    gender = models.CharField(
        max_length=10,
        choices=Gender.choices,
        blank=True,
        default="",
    )
    loyalty_cards = models.PositiveIntegerField(
        default=0,
        help_text="Breakfast loyalty cards available (earned 1 per 5 completed stays, minus redemptions).",
    )
