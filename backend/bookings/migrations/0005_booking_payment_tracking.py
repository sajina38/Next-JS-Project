from decimal import Decimal

from django.db import migrations, models


def backfill_amounts(apps, schema_editor):
    Booking = apps.get_model("bookings", "Booking")
    for b in Booking.objects.select_related("room"):
        nights = (b.check_out - b.check_in).days
        nights = max(nights, 1)
        price = getattr(b.room, "price", None) or 0
        b.total_amount = Decimal(price) * nights
        b.save(update_fields=["total_amount"])


class Migration(migrations.Migration):

    dependencies = [
        ("bookings", "0004_booking_guest_country_booking_guest_email_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="booking",
            name="payment_status",
            field=models.CharField(
                choices=[("unpaid", "Unpaid"), ("paid", "Paid")],
                default="unpaid",
                max_length=10,
            ),
        ),
        migrations.AddField(
            model_name="booking",
            name="total_amount",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=12),
        ),
        migrations.RunPython(backfill_amounts, migrations.RunPython.noop),
    ]
