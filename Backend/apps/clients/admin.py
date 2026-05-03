from django.contrib import admin
from .models import Client

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display  = ['nom_client', 'prenom_client', 'type_client', 'telephone', 'email', 'actif']
    list_filter   = ['type_client', 'actif']
    search_fields = ['nom_client', 'prenom_client', 'telephone', 'email']