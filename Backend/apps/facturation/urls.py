from rest_framework.routers import DefaultRouter
from .views import (
    DevisViewSet, LigneDevisViewSet,
    FactureViewSet, LigneFactureViewSet,
    PaiementViewSet
)

router = DefaultRouter()
router.register(r'devis',         DevisViewSet,        basename='devis')
router.register(r'lignes-devis',  LigneDevisViewSet,   basename='ligne-devis')
router.register(r'factures',      FactureViewSet,      basename='facture')
router.register(r'lignes-facture',LigneFactureViewSet, basename='ligne-facture')
router.register(r'paiements',     PaiementViewSet,     basename='paiement')
urlpatterns = router.urls