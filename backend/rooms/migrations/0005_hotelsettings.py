from django.db import migrations, models


def seed_hotel_settings(apps, schema_editor):
    HotelSettings = apps.get_model("rooms", "HotelSettings")
    HotelSettings.objects.get_or_create(
        pk=1,
        defaults={
            "hotel_name": "Urban Boutique Hotel",
            "contact_info": "",
            "email": "",
        },
    )


class Migration(migrations.Migration):

    dependencies = [
        ("rooms", "0004_room_status"),
    ]

    operations = [
        migrations.CreateModel(
            name="HotelSettings",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("hotel_name", models.CharField(default="Urban Boutique Hotel", max_length=200)),
                (
                    "contact_info",
                    models.TextField(
                        blank=True,
                        default="",
                        help_text="Address, phone, hours, or other contact details.",
                    ),
                ),
                ("email", models.EmailField(blank=True, default="", max_length=254)),
            ],
            options={
                "verbose_name": "Hotel settings",
                "verbose_name_plural": "Hotel settings",
            },
        ),
        migrations.RunPython(seed_hotel_settings, migrations.RunPython.noop),
    ]
