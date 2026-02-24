from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Room

@api_view(['GET'])
def room_list(request):
    rooms = Room.objects.all().values()
    return Response(rooms)
    