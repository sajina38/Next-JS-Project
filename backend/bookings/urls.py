from django.urls import path

from . import views

urlpatterns = [
    path('bookings/', views.booking_list_create, name='booking-list-create'),
]
