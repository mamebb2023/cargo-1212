from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Rating
from .serializers import RatingSerializer, RatingCreateSerializer, RatingListSerializer
from apps.notifications.models import Notification
from utils.response import api_response


class RatingListCreateView(generics.ListCreateAPIView):
    """List and create ratings"""

    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return RatingCreateSerializer
        return RatingListSerializer

    def get_queryset(self):
        user = self.request.user

        if user.role == "shipper":
            # Shippers see ratings they gave
            return Rating.objects.filter(user=user).order_by("-created_at")
        elif user.role == "carrier":
            # Carriers see ratings they received
            return Rating.objects.filter(carrier=user).order_by("-created_at")
        elif user.role == "admin":
            # Admins see all ratings
            return Rating.objects.all().order_by("-created_at")

        return Rating.objects.none()

    def create(self, request, *args, **kwargs):
        if request.user.role != "shipper":
            return Response(
                api_response(success=False, message="Only shippers can create ratings"),
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        rating = serializer.save()

        # Create notification for the carrier
        Notification.create_notification(
            user=rating.carrier,
            title="New Rating Received",
            message=f"You received a {rating.score}-star rating from {rating.user.full_name} for bid '{rating.bid.title}'",
            notification_type="rating_received",
            related_bid=rating.bid,
        )

        rating_data = RatingSerializer(rating).data
        return Response(
            api_response(
                success=True, message="Rating submitted successfully", data=rating_data
            ),
            status=status.HTTP_201_CREATED,
        )

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(
            api_response(
                success=True,
                message="Ratings retrieved successfully",
                data=serializer.data,
            )
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_bid_review_view(request):
    """Create rating/review for a completed bid (matches frontend endpoint)"""

    if request.user.role != "shipper":
        return Response(
            api_response(success=False, message="Only shippers can create ratings"),
            status=status.HTTP_403_FORBIDDEN,
        )

    bid_id = request.data.get("bid")
    score = request.data.get("rating") or request.data.get("score")
    comment = request.data.get("comment", "")

    if not bid_id or not score:
        return Response(
            api_response(success=False, message="Bid ID and rating score are required"),
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        from apps.bids.models import Bid

        bid = Bid.objects.get(id=bid_id)
    except Bid.DoesNotExist:
        return Response(
            api_response(success=False, message="Bid not found"),
            status=status.HTTP_404_NOT_FOUND,
        )

    # Check if user can rate this bid
    if bid.user != request.user:
        return Response(
            api_response(success=False, message="You can only rate your own bids"),
            status=status.HTTP_403_FORBIDDEN,
        )

    if bid.status != "completed":
        return Response(
            api_response(success=False, message="You can only rate completed bids"),
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not bid.selected_offer:
        return Response(
            api_response(success=False, message="No carrier was selected for this bid"),
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Check if rating already exists
    if Rating.objects.filter(
        user=request.user, bid=bid, carrier=bid.selected_offer.user
    ).exists():
        return Response(
            api_response(success=False, message="You have already rated this bid"),
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Create the rating
    rating = Rating.objects.create(
        user=request.user,
        carrier=bid.selected_offer.user,
        bid=bid,
        score=int(score),
        comment=comment,
    )

    # Create notification
    Notification.create_notification(
        user=rating.carrier,
        title="New Rating Received",
        message=f"You received a {rating.score}-star rating from {rating.user.full_name} for bid '{rating.bid.title}'",
        notification_type="rating_received",
        related_bid=rating.bid,
    )

    return Response(
        api_response(success=True, message="Rating submitted successfully"),
        status=status.HTTP_201_CREATED,
    )
