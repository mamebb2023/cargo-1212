from django.urls import path
from . import views

app_name = "admin_panel"

urlpatterns = [
    path("dashboard/", views.admin_dashboard_view, name="admin-dashboard"),
    path("users/", views.AdminUserListView.as_view(), name="admin-users"),
    path("bids/", views.AdminBidListView.as_view(), name="admin-bids"),
    path("offers/", views.AdminOfferListView.as_view(), name="admin-offers"),
    path("ratings/", views.AdminRatingListView.as_view(), name="admin-ratings"),
    path("payments/", views.AdminPaymentListView.as_view(), name="admin-payments"),
    path("pending-reviews/", views.pending_reviews_view, name="pending-reviews"),
]
