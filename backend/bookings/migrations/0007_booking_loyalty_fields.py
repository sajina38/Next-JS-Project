from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("bookings", "0006_booking_status_simplify"),
    ]

    operations = [
        migrations.AddField(
            model_name="booking",
            name="loyalty_points_redeemed",
            field=models.PositiveIntegerField(
                default=0,
                help_text="Points deducted when this booking was created (100 pts = Rs. 100 off).",
            ),
        ),
        migrations.AddField(
            model_name="booking",
            name="points_added",
            field=models.BooleanField(
                default=False,
                help_text="True after loyalty earn was applied for this booking (confirmed).",
            ),
        ),
    ]
