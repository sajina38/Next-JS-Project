from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Room
from .serializers import RoomSerializer


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
