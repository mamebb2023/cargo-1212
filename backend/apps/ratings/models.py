from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class Rating(models.Model):
    """Rating model for post-job feedback"""

    # Relationships
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='given_ratings',
        help_text="User who gave the rating (shipper)"
    )
    carrier = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='received_ratings',
        limit_choices_to={'role': 'carrier'},
        help_text="Carrier being rated"
    )
    bid = models.ForeignKey(
        'bids.Bid',
        on_delete=models.CASCADE,
        related_name='ratings'
    )

    # Rating details
    score = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Rating score from 1 to 5"
    )
    comment = models.TextField(blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['user', 'carrier', 'bid']  # One rating per user-carrier-bid combination

    def __str__(self):
        return f"Rating {self.score} by {self.user.full_name} for {self.carrier.full_name}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update carrier's average rating
        self.carrier.update_rating()
