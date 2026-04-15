from django.db import migrations, models


def forwards_map_statuses(apps, schema_editor):
    Booking = apps.get_model("bookings", "Booking")
    Booking.objects.filter(status="checked-in").update(status="confirmed")
    Booking.objects.filter(status="checked-out").update(status="checkout")


def backwards_map_statuses(apps, schema_editor):
    Booking = apps.get_model("bookings", "Booking")
    Booking.objects.filter(status="checkout").update(status="checked-out")


class Migration(migrations.Migration):

    dependencies = [
        ("bookings", "0005_booking_payment_tracking"),
    ]

    operations = [
        migrations.RunPython(forwards_map_statuses, backwards_map_statuses),
        migrations.AlterField(
            model_name="booking",
            name="status",
            field=models.CharField(
                choices=[
                    ("pending", "Pending"),
                    ("confirmed", "Confirmed"),
                    ("cancelled", "Cancelled"),
                    ("checkout", "Checkout"),
                ],
                default="pending",
                max_length=20,
            ),
        ),
    ]
