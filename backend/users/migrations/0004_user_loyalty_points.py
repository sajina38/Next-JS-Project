from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0003_user_country_user_date_of_birth_user_gender"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="loyalty_points",
            field=models.PositiveIntegerField(default=0),
        ),
    ]
