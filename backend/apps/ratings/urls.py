from django.urls import path
from . import views

app_name = "ratings"

urlpatterns = [
    path("", views.RatingListCreateView.as_view(), name="rating-list-create"),
    path("reviews/create/", views.create_bid_review_view, name="create-bid-review"),
]
