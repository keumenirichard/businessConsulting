from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Fournisseur, Piece, Stock, CommandeAchat, LigneCommande
from .serializers import (
    FournisseurSerializer, PieceSerializer,
    StockSerializer, CommandeAchatSerializer,
    LigneCommandeSerializer
)

class FournisseurViewSet(viewsets.ModelViewSet):
    queryset         = Fournisseur.objects.all()
    serializer_class = FournisseurSerializer
    filter_backends  = [filters.SearchFilter]
    search_fields    = ['nom_fournisseur', 'contact']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        from apps.utilisateurs.permissions import EstRespStocksOuPlus
        return [EstRespStocksOuPlus()]


class PieceViewSet(viewsets.ModelViewSet):
    queryset         = Piece.objects.all()
    serializer_class = PieceSerializer
    filter_backends  = [filters.SearchFilter]
    search_fields    = ['reference_piece', 'designation', 'categorie']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        from apps.utilisateurs.permissions import EstRespStocksOuPlus
        return [EstRespStocksOuPlus()]


class StockViewSet(viewsets.ModelViewSet):
    queryset         = Stock.objects.select_related('piece').all()
    serializer_class = StockSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'alertes']:
            return [IsAuthenticated()]
        from apps.utilisateurs.permissions import EstRespStocksOuPlus
        return [EstRespStocksOuPlus()]

    @action(detail=False, methods=['get'], url_path='alertes')
    def alertes(self, request):
        stocks     = [s for s in self.get_queryset() if s.en_alerte]
        serializer = self.get_serializer(stocks, many=True)
        return Response(serializer.data)


class CommandeAchatViewSet(viewsets.ModelViewSet):
    serializer_class = CommandeAchatSerializer
    filter_backends  = [filters.SearchFilter]
    search_fields    = ['numero_commande']

    def get_permissions(self):
        from apps.utilisateurs.permissions import EstRespStocksOuPlus
        return [EstRespStocksOuPlus()]

    def get_queryset(self):
        qs     = CommandeAchat.objects.select_related('fournisseur').all()
        statut = self.request.query_params.get('statut')
        if statut:
            qs = qs.filter(statut_commande=statut)
        return qs


class LigneCommandeViewSet(viewsets.ModelViewSet):
    queryset         = LigneCommande.objects.all()
    serializer_class = LigneCommandeSerializer

    def get_permissions(self):
        from apps.utilisateurs.permissions import EstRespStocksOuPlus
        return [EstRespStocksOuPlus()]