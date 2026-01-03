from django.urls import path
from . import views

app_name = "admin_panel"

urlpatterns = [
    path("dashboard/", views.admin_dashboard_view, name="admin-dashboard"),
    path("users/", views.AdminUserListView.as_view(), name="admin-users"),
    path("bids/", views.AdminBidListView.as_view(), name="admin-bids"),
    path("offers/", views.AdminOfferListView.as_view(), name="admin-offers"),
    path("bid-deletion-requests/", views.AdminBidDeletionRequestListView.as_view(), name="admin-bid-deletion-requests"),
    path("bid-deletion-requests/<int:request_id>/handle/", views.handle_bid_deletion_request_view, name="handle-bid-deletion-request"),
    path("ratings/", views.AdminRatingListView.as_view(), name="admin-ratings"),
    path("payments/", views.AdminPaymentListView.as_view(), name="admin-payments"),
    path("pending-reviews/", views.pending_reviews_view, name="pending-reviews"),
]
