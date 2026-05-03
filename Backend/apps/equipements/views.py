from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from .models import Equipement
from .serializers import EquipementSerializer

class EquipementViewSet(viewsets.ModelViewSet):
    queryset           = Equipement.objects.select_related('client').all()
    serializer_class   = EquipementSerializer
    permission_classes = [IsAuthenticated]
    filter_backends    = [filters.SearchFilter, filters.OrderingFilter]
    search_fields      = ['marque', 'modele', 'numero_serie']
    ordering_fields    = ['marque', 'date_installation']

    def get_queryset(self):
        qs        = super().get_queryset()
        client_id = self.request.query_params.get('client')
        statut    = self.request.query_params.get('statut')
        if client_id:
            qs = qs.filter(client_id=client_id)
        if statut:
            qs = qs.filter(statut=statut)
        return qs