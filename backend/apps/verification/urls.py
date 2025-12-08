from django.urls import path
from . import views

app_name = 'verification'

urlpatterns = [
    path('', views.VerificationDocumentListCreateView.as_view(), name='document-list-create'),
    path('<int:pk>/', views.VerificationDocumentDetailView.as_view(), name='document-detail'),
]
