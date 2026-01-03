from django.urls import path
from . import views

app_name = "bids"

urlpatterns = [
    path("", views.BidListCreateView.as_view(), name="bid-list-create"),
    path("<int:pk>/", views.BidDetailView.as_view(), name="bid-detail"),
    path("<int:bid_id>/request-deletion/", views.request_bid_deletion_view, name="request-bid-deletion"),
    path("my-bids/", views.my_bids_view, name="my-bids"),
]
