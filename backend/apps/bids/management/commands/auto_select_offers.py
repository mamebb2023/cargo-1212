from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.bids.models import Bid
from apps.offers.models import Offer
import re


def extract_delivery_time_days(delivery_time_str):
    """
    Extract numerical value from delivery time string for sorting.
    Examples: "3 days" -> 3, "48 hours" -> 2, "1 week" -> 7
    """
    if not delivery_time_str:
        return 999  # Default large value for sorting

    text = delivery_time_str.lower().strip()
    match = re.search(r"(\d+)", text)
    if not match:
        return 999

    number = int(match.group(1))

    if "week" in text or "weeks" in text:
        return number * 7
    elif "hour" in text or "hours" in text:
        return max(1, number // 24)
    elif "day" in text or "days" in text:
        return number
    else:
        return number


class Command(BaseCommand):
    help = (
        "Automatically select the best offer for bids that have passed their deadline"
    )

    def handle(self, *args, **options):
        now = timezone.now().date()

        # Find active bids that have passed their deadline
        expired_bids = Bid.objects.filter(
            status__in=["active", "approved"], deadline__lt=now
        )

        self.stdout.write(f"Found {expired_bids.count()} expired bids to process")

        processed_count = 0

        for bid in expired_bids:
            # Skip if bid is already awarded or has no offers
            if bid.status == "awarded":
                continue

            # Get active offers for this bid
            active_offers = list(Offer.objects.filter(bid=bid, status="active"))

            if not active_offers:
                self.stdout.write(
                    self.style.WARNING(
                        f'No active offers found for bid "{bid.title}", skipping'
                    )
                )
                continue

            # Sort by rating (highest first), then price (lowest first), then delivery time (nearest first)
            active_offers.sort(
                key=lambda offer: (
                    -offer.user.average_rating,  # Negative for descending
                    offer.price,
                    extract_delivery_time_days(offer.delivery_time),
                )
            )

            # Select the best offer (first one after sorting)
            best_offer = active_offers[0]

            self.stdout.write(
                f"Auto-selecting offer {best_offer.id} by {best_offer.user.company_name or best_offer.user.full_name} "
                f'for bid "{bid.title}" (rating: {best_offer.user.average_rating}, price: {best_offer.price})'
            )

            try:
                # Accept the best offer (this will award the bid and notify carriers)
                best_offer.accept_offer()
                processed_count += 1

                self.stdout.write(
                    self.style.SUCCESS(
                        f'Successfully awarded bid "{bid.title}" to {best_offer.user.company_name or best_offer.user.full_name}'
                    )
                )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Failed to award bid "{bid.title}": {str(e)}')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"Processed {processed_count} bids with automatic offer selection"
            )
        )
