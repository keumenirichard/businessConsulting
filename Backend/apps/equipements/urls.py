from rest_framework.routers import DefaultRouter
from .views import EquipementViewSet

router = DefaultRouter()
router.register(r'equipements', EquipementViewSet)
urlpatterns = router.urls