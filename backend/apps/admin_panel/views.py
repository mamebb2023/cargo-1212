from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count, Q
from apps.users.models import User
from apps.bids.models import Bid
from apps.offers.models import Offer
from apps.payments.models import Payment
from apps.verification.models import VerificationDocument
from apps.ratings.models import Rating
from .serializers import (
    AdminUserSerializer,
    AdminStatsSerializer,
    AdminBidSerializer,
    AdminOfferSerializer,
    AdminRatingSerializer,
)
from utils.response import api_response


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_dashboard_view(request):
    """Admin dashboard with statistics"""

    if request.user.role != "admin":
        return Response(
            api_response(success=False, message="Access denied. Admin role required."),
            status=status.HTTP_403_FORBIDDEN,
        )

    # Calculate statistics
    stats = {
        "total_users": User.objects.count(),
        "total_shippers": User.objects.filter(role="shipper").count(),
        "total_carriers": User.objects.filter(role="carrier").count(),
        "total_bids": Bid.objects.count(),
        "active_bids": Bid.objects.filter(status="active").count(),
        "completed_bids": Bid.objects.filter(status="completed").count(),
        "total_offers": Offer.objects.count(),
        "pending_payments": Payment.objects.filter(status="pending").count(),
        "pending_documents": VerificationDocument.objects.filter(
            status="pending"
        ).count(),
        "total_ratings": Rating.objects.count(),
    }

    serializer = AdminStatsSerializer(stats)
    return Response(
        api_response(
            success=True,
            message="Admin dashboard statistics retrieved successfully",
            data=serializer.data,
        )
    )


class AdminUserListView(generics.ListAPIView):
    """Admin view for managing users"""

    permission_classes = [IsAuthenticated]
    serializer_class = AdminUserSerializer

    def get_queryset(self):
        if self.request.user.role != "admin":
            return User.objects.none()

        queryset = User.objects.all().order_by("-created_at")

        # Apply filters
        role = self.request.query_params.get("role")
        if role:
            queryset = queryset.filter(role=role)

        verified = self.request.query_params.get("verified")
        if verified == "true":
            queryset = queryset.filter(is_verified=True)
        elif verified == "false":
            queryset = queryset.filter(is_verified=False)

        return queryset

    def list(self, request, *args, **kwargs):
        if request.user.role != "admin":
            return Response(
                api_response(
                    success=False, message="Access denied. Admin role required."
                ),
                status=status.HTTP_403_FORBIDDEN,
            )

        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(
            api_response(
                success=True,
                message="Users retrieved successfully",
                data=serializer.data,
            )
        )


class AdminBidListView(generics.ListAPIView):
    """Admin view for managing bids"""

    permission_classes = [IsAuthenticated]
    serializer_class = AdminBidSerializer

    def get_queryset(self):
        if self.request.user.role != "admin":
            return Bid.objects.none()

        queryset = Bid.objects.all().order_by("-created_at")

        # Apply filters
        status_filter = self.request.query_params.get("status")
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        return queryset

    def list(self, request, *args, **kwargs):
        if request.user.role != "admin":
            return Response(
                api_response(
                    success=False, message="Access denied. Admin role required."
                ),
                status=status.HTTP_403_FORBIDDEN,
            )

        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(
            api_response(
                success=True,
                message="Bids retrieved successfully",
                data=serializer.data,
            )
        )


class AdminOfferListView(generics.ListAPIView):
    """Admin view for managing offers"""

    permission_classes = [IsAuthenticated]
    serializer_class = AdminOfferSerializer

    def get_queryset(self):
        if self.request.user.role != "admin":
            return Offer.objects.none()

        queryset = Offer.objects.all().order_by("-created_at")

        # Apply filters
        status_filter = self.request.query_params.get("status")
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        return queryset

    def list(self, request, *args, **kwargs):
        if request.user.role != "admin":
            return Response(
                api_response(
                    success=False, message="Access denied. Admin role required."
                ),
                status=status.HTTP_403_FORBIDDEN,
            )

        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(
            api_response(
                success=True,
                message="Offers retrieved successfully",
                data=serializer.data,
            )
        )


class AdminRatingListView(generics.ListAPIView):
    """Admin view for managing ratings"""

    permission_classes = [IsAuthenticated]
    serializer_class = AdminRatingSerializer

    def get_queryset(self):
        if self.request.user.role != "admin":
            return Rating.objects.none()

        return Rating.objects.all().order_by("-created_at")

    def list(self, request, *args, **kwargs):
        if request.user.role != "admin":
            return Response(
                api_response(
                    success=False, message="Access denied. Admin role required."
                ),
                status=status.HTTP_403_FORBIDDEN,
            )

        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(
            api_response(
                success=True,
                message="Ratings retrieved successfully",
                data=serializer.data,
            )
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def pending_reviews_view(request):
    """Get all pending items that need admin review"""

    if request.user.role != "admin":
        return Response(
            api_response(success=False, message="Access denied. Admin role required."),
            status=status.HTTP_403_FORBIDDEN,
        )

    pending_payments = Payment.objects.filter(status="pending").count()
    pending_documents = VerificationDocument.objects.filter(status="pending").count()

    pending_items = {
        "pending_payments": pending_payments,
        "pending_documents": pending_documents,
        "total_pending": pending_payments + pending_documents,
    }

    return Response(
        api_response(
            success=True,
            message="Pending reviews count retrieved successfully",
            data=pending_items,
        )
    )
