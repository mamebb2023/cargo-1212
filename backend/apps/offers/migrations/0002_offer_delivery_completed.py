# Generated manually for adding delivery_completed field

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('offers', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='offer',
            name='delivery_completed',
            field=models.BooleanField(default=False),
        ),
    ]
