from django.urls import path
from . import views

app_name = "users"

urlpatterns = [
    path("register/", views.UserRegistrationView.as_view(), name="register"),
    path("login/", views.login_view, name="login"),
    path("profile/", views.UserProfileView.as_view(), name="profile"),
    path("top-rated/", views.TopRatedCarriersView.as_view(), name="top-rated"),
    path("<int:user_id>/rating/", views.UserRatingView.as_view(), name="user-rating"),
]
