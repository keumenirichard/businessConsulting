from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import TypeIntervention, Technicien, Intervention, Affectation, UtilisationPiece
from .serializers import (
    TypeInterventionSerializer, TechnicienSerializer,
    InterventionSerializer, AffectationSerializer,
    UtilisationPieceSerializer
)

class TypeInterventionViewSet(viewsets.ModelViewSet):
    queryset           = TypeIntervention.objects.all()
    serializer_class   = TypeInterventionSerializer
    permission_classes = [IsAuthenticated]


class TechnicienViewSet(viewsets.ModelViewSet):
    queryset           = Technicien.objects.all()
    serializer_class   = TechnicienSerializer
    permission_classes = [IsAuthenticated]
    filter_backends    = [filters.SearchFilter]
    search_fields      = ['nom', 'prenom', 'specialite']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        from apps.utilisateurs.permissions import EstRespTechniqueOuPlus
        return [EstRespTechniqueOuPlus()]


class InterventionViewSet(viewsets.ModelViewSet):
    serializer_class   = InterventionSerializer
    filter_backends    = [filters.SearchFilter, filters.OrderingFilter]
    search_fields      = ['equipement__marque', 'equipement__client__nom_client']
    ordering_fields    = ['date_planifiee', 'priorite']

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'planning_jour', 'urgentes']:
            return [IsAuthenticated()]
        from apps.utilisateurs.permissions import EstRespTechniqueOuPlus
        return [EstRespTechniqueOuPlus()]

    def get_queryset(self):
        user = self.request.user
        qs   = Intervention.objects.select_related(
            'equipement__client', 'type_intervention'
        ).prefetch_related('techniciens', 'pieces').all()

        # Un technicien ne voit que SES interventions
        if user.role == 'technicien':
            try:
                qs = qs.filter(techniciens=user.technicien)
            except Exception:
                qs = qs.none()

        # Filtres optionnels
        statut     = self.request.query_params.get('statut')
        priorite   = self.request.query_params.get('priorite')
        technicien = self.request.query_params.get('technicien')
        if statut:     qs = qs.filter(statut_intervention=statut)
        if priorite:   qs = qs.filter(priorite=priorite)
        if technicien: qs = qs.filter(techniciens__id=technicien)
        return qs

    @action(detail=False, methods=['get'], url_path='planning-jour')
    def planning_jour(self, request):
        today = timezone.now().date()
        interventions = self.get_queryset().filter(date_planifiee=today)
        serializer    = self.get_serializer(interventions, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='urgentes')
    def urgentes(self, request):
        interventions = self.get_queryset().filter(
            priorite='Urgente',
            statut_intervention__in=['Planifiée', 'En cours']
        )
        serializer = self.get_serializer(interventions, many=True)
        return Response(serializer.data)


class AffectationViewSet(viewsets.ModelViewSet):
    queryset           = Affectation.objects.all()
    serializer_class   = AffectationSerializer
    permission_classes = [IsAuthenticated]


class UtilisationPieceViewSet(viewsets.ModelViewSet):
    queryset           = UtilisationPiece.objects.all()
    serializer_class   = UtilisationPieceSerializer
    permission_classes = [IsAuthenticated]