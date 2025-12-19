from django.core.management.base import BaseCommand
from apps.bids.models import Bid
from apps.offers.models import Offer


class Command(BaseCommand):
    help = 'Check current state of bids and offers for rating debugging'

    def handle(self, *args, **options):
        self.stdout.write('=== BIDS STATUS ===')
        bids = Bid.objects.all()
        for bid in bids:
            selected_offer_status = "None"
            if bid.selected_offer:
                selected_offer_status = f"ID:{bid.selected_offer.id}, delivery_completed:{bid.selected_offer.delivery_completed}"
            self.stdout.write(f'Bid {bid.id}: status={bid.status}, selected_offer={selected_offer_status}')

        self.stdout.write('\n=== OFFERS STATUS ===')
        offers = Offer.objects.all()
        for offer in offers:
            self.stdout.write(f'Offer {offer.id}: status={offer.status}, delivery_completed={offer.delivery_completed}, bid={offer.bid.id}, user={offer.user.full_name} ({offer.user.role})')

        self.stdout.write('\n=== COMPLETED DELIVERIES ===')
        completed_offers = Offer.objects.filter(status='accepted', delivery_completed=True)
        if completed_offers.exists():
            for offer in completed_offers:
                self.stdout.write(f'Completed: Offer {offer.id} for Bid {offer.bid.id} by {offer.user.full_name}')
        else:
            self.stdout.write('No completed deliveries found!')
