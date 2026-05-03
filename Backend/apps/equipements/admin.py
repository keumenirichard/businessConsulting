from django.contrib import admin

from .models import Equipement

@admin.register(Equipement)
class EquipementAdmin(admin.ModelAdmin):
    list_display  = ['marque', 'modele', 'type_equipement', 'client', 'statut', 'date_installation']
    list_filter   = ['type_equipement', 'statut']
    search_fields = ['marque', 'modele', 'numero_serie']