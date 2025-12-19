# Generated manually to rename rating fields from carrier/user to ratee/rater

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('ratings', '0001_initial'),
    ]

    operations = [
        # Rename carrier field to ratee
        migrations.RenameField(
            model_name='rating',
            old_name='carrier',
            new_name='ratee',
        ),
        # Rename user field to rater
        migrations.RenameField(
            model_name='rating',
            old_name='user',
            new_name='rater',
        ),
    ]
