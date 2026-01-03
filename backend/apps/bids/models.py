from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from django.utils import timezone


class BidDeletionRequest(models.Model):
    """Model for bid deletion requests that need admin approval"""

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]

    bid = models.OneToOneField(
        "Bid",
        on_delete=models.CASCADE,
        related_name="deletion_request"
    )
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="bid_deletion_requests"
    )
    reason = models.TextField(help_text="Reason for deletion request")
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending"
    )

    # Admin review fields
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_deletion_requests"
    )
    admin_notes = models.TextField(
        blank=True,
        help_text="Admin notes during review"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Deletion request for '{self.bid.title}' by {self.requested_by.full_name}"

    def approve_request(self, admin_user, notes=""):
        """Approve the deletion request"""
        # Store bid information before deletion
        bid_title = self.bid.title
        bid_id = self.bid.id

        self.status = "approved"
        self.reviewed_by = admin_user
        self.admin_notes = notes
        self.reviewed_at = timezone.now()
        self.save()

        # Delete the bid
        self.bid.delete()

        # Create notification for the shipper (without related_bid since it's deleted)
        from apps.notifications.models import Notification
        Notification.create_notification(
            user=self.requested_by,
            title="Bid Deletion Approved",
            message=f"Your request to delete bid '{bid_title}' has been approved and the bid has been removed.",
            notification_type="bid_deletion_approved",
            # Don't pass related_bid since it's deleted
        )

    def reject_request(self, admin_user, notes=""):
        """Reject the deletion request"""
        self.status = "rejected"
        self.reviewed_by = admin_user
        self.admin_notes = notes
        self.reviewed_at = timezone.now()
        self.save()

        # Create notification for the shipper
        from apps.notifications.models import Notification
        Notification.create_notification(
            user=self.requested_by,
            title="Bid Deletion Rejected",
            message=f"Your request to delete bid '{self.bid.title}' has been rejected. Reason: {notes}",
            notification_type="bid_deletion_rejected",
            related_bid=self.bid,
        )


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
        max_digits=12, decimal_places=2, validators=[MinValueValidator(0)], null=True, blank=True
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
