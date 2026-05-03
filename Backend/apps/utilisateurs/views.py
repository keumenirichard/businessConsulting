from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.utils import timezone
from .models import Utilisateur
from .serializers import UtilisateurSerializer, CreerUtilisateurSerializer
from .permissions import PeutGererUtilisateur, EstAdmin, HIERARCHIE

class CustomTokenSerializer(TokenObtainPairSerializer):
    username_field = 'login'

    def validate(self, attrs):
        data = super().validate(attrs)
        # Enrichir le token avec le rôle et le login
        data['role']  = self.user.role
        data['login'] = self.user.login
        # Mettre à jour la dernière connexion
        self.user.derniere_connexion = timezone.now()
        self.user.save(update_fields=['derniere_connexion'])
        return data


class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenSerializer


class UtilisateurViewSet(viewsets.ModelViewSet):
    queryset = Utilisateur.objects.all()

    def get_permissions(self):
        if self.action == 'create':
            # Seul un admin peut créer des comptes
            return [EstAdmin()]
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), PeutGererUtilisateur()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == 'create':
            return CreerUtilisateurSerializer
        return UtilisateurSerializer

    def create(self, request, *args, **kwargs):
        """
        Vérification : l'admin ne peut créer que des comptes
        de niveau inférieur au sien.
        """
        role_cible = request.data.get('role', '')
        niveau_createur = HIERARCHIE.index(request.user.role) if request.user.role in HIERARCHIE else -1
        niveau_cible    = HIERARCHIE.index(role_cible) if role_cible in HIERARCHIE else -1

        if niveau_cible >= niveau_createur:
            return Response(
                {'erreur': 'Vous ne pouvez pas créer un compte avec un rôle supérieur ou égal au vôtre.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        """
        Empêche de modifier son propre compte via l'API admin
        et de modifier un compte de niveau supérieur ou égal.
        """
        instance = self.get_object()
        if instance == request.user:
            return Response(
                {'erreur': 'Vous ne pouvez pas modifier votre propre compte via cette interface.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().partial_update(request, *args, **kwargs)