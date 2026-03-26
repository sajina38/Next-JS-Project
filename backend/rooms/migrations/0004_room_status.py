from django.db import migrations, models


def forwards(apps, schema_editor):
    Room = apps.get_model("rooms", "Room")
    for r in Room.objects.all():
        r.room_status = "available" if r.is_available else "occupied"
        r.save(update_fields=["room_status"])


class Migration(migrations.Migration):

    dependencies = [
        ("rooms", "0003_change_image_to_imagefield"),
    ]

    operations = [
        migrations.AddField(
            model_name="room",
            name="room_status",
            field=models.CharField(
                choices=[
                    ("available", "Available"),
                    ("occupied", "Occupied"),
                    ("cleaning", "Cleaning"),
                    ("maintenance", "Maintenance"),
                ],
                default="available",
                max_length=20,
            ),
        ),
        migrations.RunPython(forwards, migrations.RunPython.noop),
        migrations.RemoveField(
            model_name="room",
            name="is_available",
        ),
    ]
