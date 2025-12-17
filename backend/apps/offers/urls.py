from django.urls import path
from . import views

app_name = 'offers'

urlpatterns = [
    path('', views.OfferListCreateView.as_view(), name='offer-list-create'),
    path('<int:pk>/', views.OfferDetailView.as_view(), name='offer-detail'),
    path('<int:offer_id>/accept/', views.accept_offer_view, name='accept-offer'),
    path('<int:offer_id>/reject/', views.reject_offer_view, name='reject-offer'),
    path('<int:offer_id>/complete-delivery/', views.complete_delivery_view, name='complete-delivery'),
]
