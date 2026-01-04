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
        "Automatically select the best offer for bids that have passed their offers deadline.\n"
        "This command should be run periodically (e.g., hourly) via cron or systemd."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show what would be done without making changes",
        )
        parser.add_argument(
            "--verbose",
            action="store_true",
            help="Show detailed output",
        )
        parser.add_argument(
            "--quiet",
            action="store_true",
            help="Suppress all output except errors",
        )

    def handle(self, *args, **options):
        dry_run = options.get("dry_run", False)
        verbose = options.get("verbose", False)
        quiet = options.get("quiet", False)

        now = timezone.now()
        now_date = now.date()
        now_time = now.time()

        # Debug: Show current date/time
        self.stdout.write(f"DEBUG: Current datetime: {now}")
        self.stdout.write(f"DEBUG: Current date: {now_date} {now_time}")

        # Find active bids that have passed their offers deadline
        expired_bids = Bid.objects.filter(
            status__in=["active", "approved"], offers_deadline__lt=now_date
        )

        # Debug: Show query details
        self.stdout.write(
            f"DEBUG: Query - status__in=['active', 'approved'], offers_deadline__lt={now_date}"
        )
        self.stdout.write(
            f"DEBUG: Found {expired_bids.count()} potentially expired bids"
        )

        # Debug: Show all active/approved bids with their deadlines
        all_active_bids = Bid.objects.filter(status__in=["active", "approved"])
        self.stdout.write(
            f"DEBUG: Total active/approved bids: {all_active_bids.count()}"
        )
        for bid in all_active_bids:
            self.stdout.write(
                f"DEBUG: Bid '{bid.title}' - Status: {bid.status}, Offers Deadline: {bid.offers_deadline}, Expired: {bid.offers_deadline < now_date if bid.offers_deadline else 'No deadline'}"
            )

        if not quiet:
            self.stdout.write(f"Found {expired_bids.count()} expired bids to process")

        processed_count = 0

        for bid in expired_bids:
            # Skip if bid is already awarded or has no offers
            if bid.status == "awarded":
                continue

            # Get active offers for this bid
            active_offers = list(Offer.objects.filter(bid=bid))

            if not active_offers:
                if verbose and not quiet:
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

            if not quiet:
                self.stdout.write(
                    f"Auto-selecting offer {best_offer.id} by {best_offer.user.company_name or best_offer.user.full_name} "
                    f'for bid "{bid.title}" (rating: {best_offer.user.average_rating}, price: {best_offer.price})'
                )

            if dry_run:
                if not quiet:
                    self.stdout.write(
                        self.style.WARNING(
                            f'DRY RUN: Would award bid "{bid.title}" to {best_offer.user.company_name or best_offer.user.full_name}'
                        )
                    )
                processed_count += 1
                continue

            try:
                # Accept the best offer (this will award the bid and notify carriers)
                best_offer.accept_offer()
                processed_count += 1

                if not quiet:
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'Successfully awarded bid "{bid.title}" to {best_offer.user.company_name or best_offer.user.full_name}'
                        )
                    )
            except Exception as e:
                if not quiet:
                    self.stdout.write(
                        self.style.ERROR(f'Failed to award bid "{bid.title}": {str(e)}')
                    )

        # Debug: Show final summary
        self.stdout.write(f"DEBUG: Total bids processed: {processed_count}")
        self.stdout.write(f"DEBUG: Total expired bids found: {expired_bids.count()}")

        if not quiet:
            self.stdout.write(
                self.style.SUCCESS(
                    f"Processed {processed_count} bids with automatic offer selection"
                )
            )
