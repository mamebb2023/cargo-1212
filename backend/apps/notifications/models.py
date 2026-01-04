from django.db import models
from django.conf import settings


class Notification(models.Model):
    """Notification model for user notifications"""

    NOTIFICATION_TYPE_CHOICES = [
        ("bid_created", "Bid Created"),
        ("offer_received", "Offer Received"),
        ("offer_accepted", "Offer Accepted"),
        ("offer_rejected", "Offer Rejected"),
        ("offer_not_selected", "Offer Not Selected"),
        ("bid_awarded", "Bid Awarded"),
        ("bid_closed", "Bid Closed"),
        ("bid_completed", "Bid Completed"),
        ("payment_approved", "Payment Approved"),
        ("payment_rejected", "Payment Rejected"),
        ("document_approved", "Document Approved"),
        ("document_rejected", "Document Rejected"),
        ("rating_received", "Rating Received"),
        ("system", "System Notification"),
    ]

    # Relationships
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications"
    )

    # Notification details
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(
        max_length=30, choices=NOTIFICATION_TYPE_CHOICES
    )

    # Status
    is_read = models.BooleanField(default=False)

    # Related objects (optional)
    related_bid = models.ForeignKey(
        "bids.Bid",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="notifications",
    )
    related_offer = models.ForeignKey(
        "offers.Offer",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="notifications",
    )
    related_payment = models.ForeignKey(
        "payments.Payment",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="notifications",
    )
    related_document = models.ForeignKey(
        "verification.VerificationDocument",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="notifications",
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Notification for {self.user.full_name}: {self.title}"

    def mark_as_read(self):
        """Mark notification as read"""
        from django.utils import timezone

        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save()

    @classmethod
    def create_notification(
        cls,
        user,
        title,
        message,
        notification_type,
        related_bid=None,
        related_offer=None,
        related_payment=None,
        related_document=None,
    ):
        """Create a new notification"""
        notification = cls.objects.create(
            user=user,
            title=title,
            message=message,
            notification_type=notification_type,
            related_bid=related_bid,
            related_offer=related_offer,
            related_payment=related_payment,
            related_document=related_document,
        )
        return notification
