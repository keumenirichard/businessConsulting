from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Devis, LigneDevis, Facture, LigneFacture, Paiement
from .serializers import (
    DevisSerializer, LigneDevisSerializer,
    FactureSerializer, LigneFactureSerializer,
    PaiementSerializer
)

class DevisViewSet(viewsets.ModelViewSet):
    serializer_class = DevisSerializer
    filter_backends  = [filters.SearchFilter]
    search_fields    = ['numero_devis', 'client__nom_client']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        from apps.utilisateurs.permissions import EstCommercialOuPlus
        return [EstCommercialOuPlus()]

    def get_queryset(self):
        qs     = Devis.objects.select_related('client').all()
        statut = self.request.query_params.get('statut')
        if statut:
            qs = qs.filter(statut_devis=statut)
        return qs

    @action(detail=True, methods=['post'], url_path='convertir-facture')
    def convertir_facture(self, request, pk=None):
        devis = self.get_object()
        if devis.statut_devis != 'Accepté':
            return Response(
                {'erreur': 'Seul un devis accepté peut être converti.'},
                status=400
            )
        if hasattr(devis, 'facture'):
            return Response(
                {'erreur': 'Ce devis a déjà une facture.'},
                status=400
            )
        import random
        from django.utils import timezone
        numero  = f"FAC-{timezone.now().year}-{random.randint(1000,9999)}"
        facture = Facture.objects.create(
            client         = devis.client,
            devis          = devis,
            numero_facture = numero,
            montant_ht     = devis.montant_ht,
            taux_tva       = devis.taux_tva,
        )
        # Copier les lignes du devis dans la facture
        for ligne in devis.lignes.all():
            LigneFacture.objects.create(
                facture       = facture,
                piece         = ligne.piece,
                designation   = ligne.designation,
                quantite      = ligne.quantite,
                prix_unitaire = ligne.prix_unitaire,
            )
        serializer = FactureSerializer(facture)
        return Response(serializer.data, status=201)


class LigneDevisViewSet(viewsets.ModelViewSet):
    queryset         = LigneDevis.objects.all()
    serializer_class = LigneDevisSerializer
    permission_classes = [IsAuthenticated]


class FactureViewSet(viewsets.ModelViewSet):
    serializer_class = FactureSerializer
    filter_backends  = [filters.SearchFilter]
    search_fields    = ['numero_facture', 'client__nom_client']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        from apps.utilisateurs.permissions import EstCommercialOuPlus
        return [EstCommercialOuPlus()]

    def get_queryset(self):
        qs     = Facture.objects.select_related('client').all()
        statut = self.request.query_params.get('statut')
        if statut:
            qs = qs.filter(statut_paiement=statut)
        return qs


class LigneFactureViewSet(viewsets.ModelViewSet):
    queryset           = LigneFacture.objects.all()
    serializer_class   = LigneFactureSerializer
    permission_classes = [IsAuthenticated]


class PaiementViewSet(viewsets.ModelViewSet):
    queryset         = Paiement.objects.select_related('facture').all()
    serializer_class = PaiementSerializer

    def get_permissions(self):
        from apps.utilisateurs.permissions import EstCommercialOuPlus
        return [EstCommercialOuPlus()]

    def perform_create(self, serializer):
        """
        À chaque paiement créé, on met à jour
        le montant payé et le statut de la facture.
        """
        paiement = serializer.save()
        facture  = paiement.facture
        facture.montant_paye = float(facture.montant_paye) + float(paiement.montant)
        if float(facture.montant_paye) >= float(facture.montant_ttc):
            facture.statut_paiement = 'Payée'
        elif float(facture.montant_paye) > 0:
            facture.statut_paiement = 'Partielle'
        facture.save()