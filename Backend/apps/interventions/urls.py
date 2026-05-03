from rest_framework.routers import DefaultRouter
from .views import (
    TypeInterventionViewSet, TechnicienViewSet,
    InterventionViewSet, AffectationViewSet,
    UtilisationPieceViewSet
)

router = DefaultRouter()
router.register(r'types-intervention', TypeInterventionViewSet, basename='type-intervention')
router.register(r'techniciens',        TechnicienViewSet,       basename='technicien')
router.register(r'interventions',      InterventionViewSet,     basename='intervention')
router.register(r'affectations',       AffectationViewSet,      basename='affectation')
router.register(r'utilisations-pieces',UtilisationPieceViewSet, basename='utilisation-piece')
urlpatterns = router.urls