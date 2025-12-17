from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator


class Offer(models.Model):
    """Offer model for carrier responses to bids"""

    STATUS_CHOICES = [
        ("active", "Active"),
        ("accepted", "Accepted"),
        ("rejected", "Rejected"),
        ("cancelled", "Cancelled"),
    ]

    # Relationships
    bid = models.ForeignKey("bids.Bid", on_delete=models.CASCADE, related_name="offers")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="offers",
        limit_choices_to={"role": "carrier"},
    )

    # Offer details
    price = models.DecimalField(
        max_digits=12, decimal_places=2, validators=[MinValueValidator(0)]
    )
    delivery_time = models.CharField(max_length=100)  # e.g., "3 days", "48 hours"
    vehicle_type = models.CharField(max_length=100)
    cpo_service_number = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)

    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")
    is_selected = models.BooleanField(default=False)
    delivery_completed = models.BooleanField(default=False)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        unique_together = ["bid", "user"]  # One offer per carrier per bid

    def __str__(self):
        return f"Offer by {self.user.full_name} for {self.bid.title} - {self.price}"

    def accept_offer(self):
        """Accept this offer and reject all others for the bid"""
        self.status = "accepted"
        self.is_selected = True
        self.save()

        # Reject all other offers for this bid
        self.bid.offers.exclude(id=self.id).update(status="rejected")

        # Close the bid
        self.bid.close_bid(self)

    def reject_offer(self):
        """Reject this offer"""
        self.status = "rejected"
        self.save()

    def cancel_offer(self):
        """Cancel this offer"""
        self.status = "cancelled"
        self.save()

    def mark_delivery_completed(self):
        """Mark delivery as completed"""
        self.delivery_completed = True
        self.save()

        # Mark the entire bid as completed
        print(f"DEBUG: Before complete_bid - bid status: {self.bid.status}")
        self.bid.status = "completed"
        self.bid.save()
        print(f"DEBUG: After complete_bid - bid status: {self.bid.status}")

        # Create notification for the carrier
        from apps.notifications.models import Notification

        Notification.create_notification(
            user=self.user,
            title="Delivery Completed",
            message=f"The delivery for '{self.bid.title}' has been marked as completed by the shipper.",
            notification_type="delivery_completed",
            related_bid=self.bid,
        )
