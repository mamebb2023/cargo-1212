from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator


class Payment(models.Model):
    """Payment model for bid access fees and other payments"""

    PAYMENT_METHOD_CHOICES = [
        ('cbe', 'CBE'),
        ('telebirr', 'TeleBirr'),
        ('other', 'Other'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    # Relationships
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='payments'
    )

    # Payment details
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    reference_number = models.CharField(max_length=100, blank=True)

    # Payment proof
    payment_proof = models.FileField(
        upload_to='payment_proofs/',
        help_text="Screenshot or proof of payment"
    )

    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Optional bid reference (for bid access payments)
    bid = models.ForeignKey(
        'bids.Bid',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payments'
    )

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Payment {self.reference_number} - {self.amount} by {self.user.full_name}"

    def approve_payment(self):
        """Approve the payment"""
        self.status = 'approved'
        self.save()

        # If this is a bid access payment, mark user as payment confirmed
        if self.bid:
            self.user.is_payment_confirmed = True
            self.user.save()

    def reject_payment(self):
        """Reject the payment"""
        self.status = 'rejected'
        self.save()
