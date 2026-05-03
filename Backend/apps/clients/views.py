from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from .models import Client
from .serializers import ClientSerializer

class ClientViewSet(viewsets.ModelViewSet):
    """
    Clients : lecture pour tous les authentifiés,
    écriture pour commercial et plus.
    """
    serializer_class   = ClientSerializer
    filter_backends    = [filters.SearchFilter, filters.OrderingFilter]
    search_fields      = ['nom_client', 'prenom_client', 'telephone', 'email']
    ordering_fields    = ['nom_client', 'date_creation']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            # Lecture : tous les rôles
            return [IsAuthenticated()]
        # Écriture : commercial et plus
        from apps.utilisateurs.permissions import EstCommercialOuPlus
        return [EstCommercialOuPlus()]

    def get_queryset(self):
        qs = Client.objects.all()
        # Technicien : lecture seule, pas de filtre supplémentaire
        return qs