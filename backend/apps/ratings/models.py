from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class Rating(models.Model):
    """Rating model for post-job feedback"""

    # Relationships
    rater = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='given_ratings',
        help_text="User who gave the rating"
    )
    ratee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='received_ratings',
        help_text="User being rated"
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
        unique_together = ['rater', 'ratee', 'bid']  # One rating per rater-ratee-bid combination

    def __str__(self):
        return f"Rating {self.score} by {self.rater.full_name} for {self.ratee.full_name}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update ratee's average rating
        self.ratee.update_rating()
