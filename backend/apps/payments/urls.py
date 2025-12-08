from django.urls import path
from . import views

app_name = 'payments'

urlpatterns = [
    path('', views.PaymentListCreateView.as_view(), name='payment-list-create'),
    path('<int:pk>/', views.PaymentDetailView.as_view(), name='payment-detail'),
]
