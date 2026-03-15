from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Room


@api_view(['GET'])
def room_list(request):
    rooms = Room.objects.all().values()
    return Response(rooms)


@api_view(['GET'])
def room_detail(request, pk):
    room = Room.objects.filter(pk=pk).values().first()
    if not room:
        return Response({"error": "Room not found"}, status=404)
    return Response(room)