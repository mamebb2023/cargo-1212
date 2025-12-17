from django.db import models
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

        if user.role == "admin":
            # Admins see all ratings
            return Rating.objects.all().order_by("-created_at")
        else:
            # Users see ratings they gave or received
            return Rating.objects.filter(
                models.Q(rater=user) | models.Q(ratee=user)
            ).order_by("-created_at")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        rating = serializer.save()

        # Create notification for the ratee
        Notification.create_notification(
            user=rating.ratee,
            title="New Rating Received",
            message=f"You received a {rating.score}-star rating from {rating.rater.full_name} for bid '{rating.bid.title}'",
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

    bid_id = request.data.get("bid")
    ratee_id = request.data.get("ratee")  # The user being rated
    score = request.data.get("rating") or request.data.get("score")
    comment = request.data.get("comment", "")

    if not bid_id or not ratee_id or not score:
        return Response(
            api_response(
                success=False, message="Bid ID, ratee ID, and rating score are required"
            ),
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        from apps.bids.models import Bid
        from django.contrib.auth import get_user_model

        User = get_user_model()
        bid = Bid.objects.select_related("selected_offer__user").get(id=bid_id)
        ratee = User.objects.get(id=ratee_id)
    except Bid.DoesNotExist:
        return Response(
            api_response(success=False, message="Bid not found"),
            status=status.HTTP_404_NOT_FOUND,
        )
    except User.DoesNotExist:
        return Response(
            api_response(success=False, message="User to rate not found"),
            status=status.HTTP_404_NOT_FOUND,
        )

    # Check if bid is completed
    print(f"DEBUG: Bid status is {bid.status}, selected_offer: {bid.selected_offer}")
    if bid.status != "completed":
        return Response(
            api_response(
                success=False,
                message=f"You can only rate completed bids (current status: {bid.status})",
            ),
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Check if the rater and ratee were involved in this bid
    if request.user not in [
        bid.user,
        bid.selected_offer.user if bid.selected_offer else None,
    ]:
        return Response(
            api_response(
                success=False, message="You are not authorized to rate this bid"
            ),
            status=status.HTTP_403_FORBIDDEN,
        )

    if ratee not in [bid.user, bid.selected_offer.user if bid.selected_offer else None]:
        return Response(
            api_response(
                success=False,
                message="The user you are trying to rate was not involved in this bid",
            ),
            status=status.HTTP_400_BAD_REQUEST,
        )

    if request.user == ratee:
        return Response(
            api_response(success=False, message="You cannot rate yourself"),
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Check if rating already exists
    if Rating.objects.filter(rater=request.user, ratee=ratee, bid=bid).exists():
        return Response(
            api_response(
                success=False, message="You have already rated this user for this bid"
            ),
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Create the rating
    rating = Rating.objects.create(
        rater=request.user,
        ratee=ratee,
        bid=bid,
        score=int(score),
        comment=comment,
    )

    # Create notification
    Notification.create_notification(
        user=rating.ratee,
        title="New Rating Received",
        message=f"You received a {rating.score}-star rating from {rating.rater.full_name} for bid '{rating.bid.title}'",
        notification_type="rating_received",
        related_bid=rating.bid,
    )

    return Response(
        api_response(success=True, message="Rating submitted successfully"),
        status=status.HTTP_201_CREATED,
    )
