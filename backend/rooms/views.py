from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from users.permissions import IsAdmin

from .models import Room
from .serializers import RoomSerializer


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
