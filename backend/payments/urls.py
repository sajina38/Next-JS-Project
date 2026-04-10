from django.urls import path

from . import views

urlpatterns = [
    path("payments/khalti/config/", views.KhaltiConfigView.as_view(), name="khalti-config"),
    path("payments/khalti/initiate/", views.KhaltiInitiateView.as_view(), name="khalti-initiate"),
    path("payments/khalti/verify/", views.KhaltiVerifyView.as_view(), name="khalti-verify"),
]
