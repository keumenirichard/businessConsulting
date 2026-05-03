from rest_framework.routers import DefaultRouter
from .views import (
    FournisseurViewSet, PieceViewSet,
    StockViewSet, CommandeAchatViewSet,
    LigneCommandeViewSet
)

router = DefaultRouter()
router.register(r'fournisseurs',   FournisseurViewSet,   basename='fournisseur')
router.register(r'pieces',         PieceViewSet,         basename='piece')
router.register(r'stocks',         StockViewSet,         basename='stock')
router.register(r'commandes',      CommandeAchatViewSet, basename='commande')
router.register(r'lignes-commande',LigneCommandeViewSet, basename='ligne-commande')
urlpatterns = router.urls