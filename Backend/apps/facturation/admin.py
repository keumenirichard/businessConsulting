from django.contrib import admin
from .models import Devis, LigneDevis, Facture, LigneFacture, Paiement

@admin.register(Devis)
class DevisAdmin(admin.ModelAdmin):
    list_display  = ['numero_devis', 'client', 'date_devis', 'montant_ht', 'statut_devis']
    list_filter   = ['statut_devis']
    search_fields = ['numero_devis', 'client__nom_client']

@admin.register(LigneDevis)
class LigneDevisAdmin(admin.ModelAdmin):
    list_display = ['devis', 'designation', 'quantite', 'prix_unitaire']

@admin.register(Facture)
class FactureAdmin(admin.ModelAdmin):
    list_display  = ['numero_facture', 'client', 'date_facture', 'montant_ht', 'montant_paye', 'statut_paiement']
    list_filter   = ['statut_paiement']
    search_fields = ['numero_facture', 'client__nom_client']

@admin.register(LigneFacture)
class LigneFactureAdmin(admin.ModelAdmin):
    list_display = ['facture', 'designation', 'quantite', 'prix_unitaire']

@admin.register(Paiement)
class PaiementAdmin(admin.ModelAdmin):
    list_display  = ['facture', 'date_paiement', 'montant', 'mode_paiement', 'reference']
    list_filter   = ['mode_paiement']