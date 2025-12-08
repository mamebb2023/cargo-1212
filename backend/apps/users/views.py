from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.db import models
from .models import User
from .serializers import (
    UserSerializer, UserRegistrationSerializer, UserLoginSerializer,
    UserProfileSerializer, CarrierRegistrationSerializer, TopRatedCarrierSerializer
)
from utils.response import api_response


class UserRegistrationView(generics.CreateAPIView):
    """User registration view"""

    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        user_data = UserSerializer(user).data

        return Response(api_response(
            success=True,
            message="Registration successful. Your documents are being reviewed.",
            data={
                'user': user_data,
                'access_token': access_token,
                'refresh_token': str(refresh)
            }
        ), status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """User login view"""

    serializer = UserLoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.validated_data['user']

    # Generate JWT tokens
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)

    user_data = UserSerializer(user).data

    return Response(api_response(
        success=True,
        message="Login successful",
        data={
            'user': user_data,
            'access_token': access_token,
            'refresh_token': str(refresh)
        }
    ), status=status.HTTP_200_OK)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """User profile view"""

    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user

    def retrieve(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = UserSerializer(user)
        return Response(api_response(
            success=True,
            message="Profile retrieved successfully",
            data=serializer.data
        ))

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        user_data = UserSerializer(user).data
        return Response(api_response(
            success=True,
            message="Profile updated successfully",
            data=user_data
        ))


class TopRatedCarriersView(generics.ListAPIView):
    """Get top-rated carriers"""

    permission_classes = [IsAuthenticated]
    serializer_class = TopRatedCarrierSerializer

    def get_queryset(self):
        role = self.request.query_params.get('role', 'carrier')
        return User.objects.filter(
            role=role,
            is_verified=True,
            total_ratings__gt=0
        ).order_by('-average_rating', '-total_ratings')[:50]

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)

        # Calculate additional stats
        total_carriers = queryset.count()
        avg_rating = queryset.aggregate(
            models.Avg('average_rating')
        )['average_rating__avg'] or 0

        total_reviews = sum(user.total_ratings for user in queryset)

        return Response(api_response(
            success=True,
            message="Top-rated carriers retrieved successfully",
            data={
                'carriers': serializer.data,
                'stats': {
                    'total_carriers': total_carriers,
                    'average_rating': round(avg_rating, 1),
                    'total_reviews': total_reviews
                }
            }
        ))


class UserRatingView(generics.RetrieveAPIView):
    """Get user rating information"""

    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def retrieve(self, request, *args, **kwargs):
        try:
            user = User.objects.get(id=self.kwargs['user_id'])
        except User.DoesNotExist:
            return Response(api_response(
                success=False,
                message="User not found"
            ), status=status.HTTP_404_NOT_FOUND)

        # Get user's rating information
        from apps.ratings.models import Rating

        user_ratings = Rating.objects.filter(carrier=user).order_by('-created_at')
        ratings_data = []

        for rating in user_ratings:
            ratings_data.append({
                'id': rating.id,
                'score': rating.score,
                'comment': rating.comment,
                'created_at': rating.created_at,
                'shipper': {
                    'id': rating.user.id,
                    'full_name': rating.user.full_name,
                    'company_name': getattr(rating.user, 'company_name', '')
                },
                'bid': {
                    'id': rating.bid.id,
                    'title': rating.bid.title
                }
            })

        user_data = {
            'id': user.id,
            'full_name': user.full_name,
            'email': user.email,
            'company_name': user.company_name,
            'carrier_type': user.carrier_type,
            'average_rating': user.average_rating,
            'total_ratings': user.total_ratings,
            'ratings': ratings_data
        }

        return Response(api_response(
            success=True,
            message="User rating information retrieved successfully",
            data=user_data
        ))
