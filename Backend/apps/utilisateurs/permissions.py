from rest_framework.permissions import BasePermission

# Hiérarchie des rôles : index = niveau de pouvoir
HIERARCHIE = ['technicien', 'commercial', 'resp_stocks',
              'resp_technique', 'directeur', 'admin']

def niveau(role):
    """Retourne le niveau hiérarchique d'un rôle."""
    try:
        return HIERARCHIE.index(role)
    except ValueError:
        return -1


class EstAdmin(BasePermission):
    """Réservé aux administrateurs uniquement."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class EstAdminOuDirecteur(BasePermission):
    """Réservé aux admins et directeurs."""
    def has_permission(self, request, view):
        return (request.user.is_authenticated and
                request.user.role in ['admin', 'directeur'])


class EstRespTechniqueOuPlus(BasePermission):
    """Resp. technique, directeur, admin."""
    def has_permission(self, request, view):
        return (request.user.is_authenticated and
                niveau(request.user.role) >= niveau('resp_technique'))


class EstCommercialOuPlus(BasePermission):
    """Commercial, directeur, admin."""
    def has_permission(self, request, view):
        return (request.user.is_authenticated and
                request.user.role in ['commercial', 'directeur', 'admin'])


class EstRespStocksOuPlus(BasePermission):
    """Resp. stocks, directeur, admin."""
    def has_permission(self, request, view):
        return (request.user.is_authenticated and
                request.user.role in ['resp_stocks', 'directeur', 'admin'])


class PeutGererUtilisateur(BasePermission):
    """
    Un utilisateur ne peut gérer que des comptes
    de niveau strictement inférieur au sien.
    """
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        # Ne peut pas se modifier soi-même via l'API admin
        if obj == request.user:
            return False
        return niveau(request.user.role) > niveau(obj.role)