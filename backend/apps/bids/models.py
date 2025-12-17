from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator


class Bid(models.Model):
    """Bid model for cargo transport requests"""

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("active", "Active"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
        ("closed", "Closed"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    # Basic bid information
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="bids",
        limit_choices_to={"role": "shipper"},
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    budget = models.DecimalField(
        max_digits=12, decimal_places=2, validators=[MinValueValidator(0)]
    )

    # Location information
    origin = models.CharField(max_length=255)
    origin_address = models.TextField(blank=True)
    destination = models.CharField(max_length=255)
    destination_address = models.TextField(blank=True)

    # Cargo information
    weight = models.CharField(max_length=100)  # e.g., "50 tons", "500 kg"
    cargo_type = models.CharField(max_length=100)
    special_requirements = models.TextField(blank=True)

    # Status and dates
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    deadline = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Bid files (optional attachments)
    bid_files = models.FileField(
        upload_to="bid_files/",
        blank=True,
        null=True,
        help_text="Optional files attached to the bid",
    )

    # Selected offer (when bid is closed)
    selected_offer = models.ForeignKey(
        'offers.Offer',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='selected_for_bids'
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} - {self.user.full_name}"

    @property
    def offers_count(self):
        return self.offers.count()

    @property
    def lowest_offer(self):
        offers = self.offers.filter(status="active")
        if offers.exists():
            return offers.order_by("price").first().price
        return None

    @property
    def is_paid(self):
        """Check if user has paid for bid access"""
        return (
            hasattr(self.user, "payments")
            and self.user.payments.filter(status="approved").exists()
        )

    def close_bid(self, selected_offer=None):
        """Close the bid and optionally select an offer"""
        self.status = "closed"
        if selected_offer:
            self.selected_offer = selected_offer
            selected_offer.is_selected = True
            selected_offer.save()
        self.save()

    def complete_bid(self):
        """Mark bid as completed"""
        self.status = "completed"
        self.save()

    def approve_bid(self, admin_user):
        """Approve the bid"""
        self.status = "active"
        self.save()

        # Create notification for the shipper
        from apps.notifications.models import Notification

        Notification.create_notification(
            user=self.user,
            title="Bid Approved",
            message=f"Your bid '{self.title}' has been approved and is now active.",
            notification_type="bid_approved",
            related_bid=self,
        )

    def reject_bid(self, admin_user, reason=""):
        """Reject the bid"""
        self.status = "rejected"
        self.save()

        # Create notification for the shipper
        from apps.notifications.models import Notification

        Notification.create_notification(
            user=self.user,
            title="Bid Rejected",
            message=f"Your bid '{self.title}' has been rejected. Reason: {reason}",
            notification_type="bid_rejected",
            related_bid=self,
        )
