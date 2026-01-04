from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator


class Offer(models.Model):
    """Offer model for carrier responses to bids"""

    STATUS_CHOICES = [
        ("pending", "Pending"),
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
        limit_choices_to={"role__in": ["carrier", "admin"]},
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
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
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
        """Accept this offer and reject all others for the bid - award the bid instead of closing"""
        # Award the bid to this carrier
        self.bid.award_bid(self)

        # Reject all other offers for this bid and notify the rejected carriers
        rejected_offers = self.bid.offers.exclude(id=self.id)
        rejected_offers.update(status="rejected")

        # Send notifications to rejected carriers
        from apps.notifications.models import Notification
        winning_carrier_name = self.user.company_name or self.user.full_name

        for rejected_offer in rejected_offers:
            Notification.create_notification(
                user=rejected_offer.user,
                title="Offer Not Selected",
                message=f"Your offer for '{self.bid.title}' was not selected. The bid has been awarded to {winning_carrier_name}.",
                notification_type="offer_not_selected",
                related_bid=self.bid,
                related_offer=rejected_offer,
            )

    def reject_offer(self, admin_user=None, reason=""):
        """Reject this offer (by shipper or admin)"""
        self.status = "rejected"
        self.save()

        # Create notification for the carrier
        from apps.notifications.models import Notification

        if admin_user:
            # Admin rejection
            Notification.create_notification(
                user=self.user,
                title="Offer Rejected",
                message=f"Your offer for '{self.bid.title}' has been rejected by admin. Reason: {reason if reason else 'No reason provided'}",
                notification_type="offer_rejected",
                related_bid=self.bid,
                related_offer=self,
            )
        else:
            # Shipper rejection
            Notification.create_notification(
                user=self.user,
                title="Offer Rejected",
                message=f"Your offer for '{self.bid.title}' has been rejected.",
                notification_type="offer_rejected",
                related_bid=self.bid,
                related_offer=self,
            )

    def cancel_offer(self):
        """Cancel this offer"""
        self.status = "cancelled"
        self.save()

    def approve_offer(self, admin_user):
        """Approve the offer"""
        self.status = "active"
        self.save()

        # Create notification for the carrier
        from apps.notifications.models import Notification

        Notification.create_notification(
            user=self.user,
            title="Offer Approved",
            message=f"Your offer of {self.price} ETB for '{self.bid.title}' has been approved and is now visible to the shipper.",
            notification_type="offer_approved",
            related_bid=self.bid,
            related_offer=self,
        )

        # Create notification for the shipper
        Notification.create_notification(
            user=self.bid.user,
            title="New Offer Available",
            message=f"A new offer of {self.price} ETB has been approved for your bid '{self.bid.title}' from {self.user.full_name}.",
            notification_type="offer_received",
            related_bid=self.bid,
            related_offer=self,
        )

    def mark_delivery_completed(self):
        """Mark delivery as completed - allow rating before closing bid"""
        self.delivery_completed = True
        self.save()

        # Keep bid status as "awarded" - don't close it yet
        # The bid will be closed only after both parties have rated each other

        # Create notifications for both parties to rate each other
        from apps.notifications.models import Notification

        # Notify the carrier
        Notification.create_notification(
            user=self.user,
            title="Delivery Completed - Please Rate",
            message=f"The delivery for '{self.bid.title}' has been marked as completed by the shipper. Please rate your experience with the shipper.",
            notification_type="delivery_completed",
            related_bid=self.bid,
            related_offer=self,
        )

        # Notify the shipper
        Notification.create_notification(
            user=self.bid.user,
            title="Delivery Marked as Completed - Please Rate",
            message=f"You have successfully marked the delivery for '{self.bid.title}' as completed. Please rate the carrier.",
            notification_type="delivery_completed",
            related_bid=self.bid,
            related_offer=self,
        )

    def check_and_close_bid_after_rating(self):
        """Check if both parties have rated each other, and close the bid if so"""
        from apps.ratings.models import Rating

        shipper = self.bid.user
        carrier = self.user

        # Check if shipper has rated the carrier
        shipper_rated_carrier = Rating.objects.filter(
            rater=shipper,
            ratee=carrier,
            bid=self.bid
        ).exists()

        # Check if carrier has rated the shipper
        carrier_rated_shipper = Rating.objects.filter(
            rater=carrier,
            ratee=shipper,
            bid=self.bid
        ).exists()

        # If both have rated, close the bid
        if shipper_rated_carrier and carrier_rated_shipper:
            self.bid.status = "completed"
            self.bid.save()

            # Create completion notifications
            from apps.notifications.models import Notification

            Notification.create_notification(
                user=shipper,
                title="Bid Completed",
                message=f"Your bid '{self.bid.title}' has been completed successfully. Both parties have provided ratings.",
                notification_type="bid_completed",
                related_bid=self.bid,
            )

            Notification.create_notification(
                user=carrier,
                title="Bid Completed",
                message=f"The bid '{self.bid.title}' has been completed successfully. Both parties have provided ratings.",
                notification_type="bid_completed",
                related_bid=self.bid,
            )
