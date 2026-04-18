from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("rooms", "0007_hotelsettings_expand"),
    ]

    operations = [
        migrations.AddField(
            model_name="room",
            name="gallery_images",
            field=models.JSONField(
                blank=True,
                default=list,
                help_text='Optional extra photos: list of paths under MEDIA_ROOT, e.g. ["rooms/extra1.jpg"].',
            ),
        ),
    ]
