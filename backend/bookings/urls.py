from django.urls import path

from . import views

urlpatterns = [
    path("bookings/", views.BookingListCreateView.as_view(), name="booking-list-create"),
]
