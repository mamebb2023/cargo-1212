# Generated manually to update existing active offers to pending

from django.db import migrations


def update_active_offers_to_pending(apps, schema_editor):
    """Update existing offers with status='active' to 'pending' for admin review"""
    Offer = apps.get_model('offers', 'Offer')
    # Only update offers that are currently 'active' and not selected/accepted
    # These should go through the new approval process
    # Don't update offers that are already accepted, rejected, or cancelled
    Offer.objects.filter(status='active', is_selected=False).update(status='pending')


def reverse_update(apps, schema_editor):
    """Reverse migration - set pending offers back to active"""
    Offer = apps.get_model('offers', 'Offer')
    # Note: This is a one-way operation, but we provide reverse for completeness
    # In practice, you might not want to reverse this
    Offer.objects.filter(status='pending').update(status='active')


class Migration(migrations.Migration):

    dependencies = [
        ('offers', '0004_alter_offer_status'),
    ]

    operations = [
        migrations.RunPython(update_active_offers_to_pending, reverse_update),
    ]

