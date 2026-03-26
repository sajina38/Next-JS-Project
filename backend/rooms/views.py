from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from users.permissions import IsAdmin

from .models import HotelSettings, Room
from .serializers import HotelSettingsSerializer, RoomSerializer


class AdminHotelSettingsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        serializer = HotelSettingsSerializer(HotelSettings.load())
        return Response(serializer.data)

    def patch(self, request):
        instance = HotelSettings.load()
        serializer = HotelSettingsSerializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class AdminRoomListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        rooms = Room.objects.all().order_by("room_number")
        serializer = RoomSerializer(rooms, many=True, context={"request": request})
        return Response(serializer.data)

    def post(self, request):
        serializer = RoomSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            RoomSerializer(serializer.instance, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class AdminRoomDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, pk):
        room = get_object_or_404(Room, pk=pk)
        new_status = request.data.get("room_status")
        if new_status is None:
            return Response(
                {"error": "room_status is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        valid = {c.value for c in Room.RoomStatus}
        if new_status not in valid:
            return Response(
                {"error": "Invalid room_status."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        room.room_status = new_status
        room.save(update_fields=["room_status"])
        return Response(RoomSerializer(room, context={"request": request}).data)

    def delete(self, request, pk):
        room = get_object_or_404(Room, pk=pk)
        room.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
def room_list(request):
    rooms = Room.objects.all()
    serializer = RoomSerializer(rooms, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
def room_detail(request, pk):
    try:
        room = Room.objects.get(pk=pk)
    except Room.DoesNotExist:
        return Response({"error": "Room not found"}, status=404)
    serializer = RoomSerializer(room, context={'request': request})
    return Response(serializer.data)
