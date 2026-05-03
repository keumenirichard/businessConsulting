from django.contrib import admin
from .models import Utilisateur

@admin.register(Utilisateur)
class UtilisateurAdmin(admin.ModelAdmin):
    list_display  = ['login', 'role', 'actif', 'date_creation', 'derniere_connexion']
    list_filter   = ['role', 'actif']
    search_fields = ['login']