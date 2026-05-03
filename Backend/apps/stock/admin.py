from django.contrib import admin
from .models import Fournisseur, Piece, Stock, CommandeAchat, LigneCommande

@admin.register(Fournisseur)
class FournisseurAdmin(admin.ModelAdmin):
    list_display  = ['nom_fournisseur', 'contact', 'telephone', 'pays', 'actif']
    list_filter   = ['actif', 'pays']
    search_fields = ['nom_fournisseur']

@admin.register(Piece)
class PieceAdmin(admin.ModelAdmin):
    list_display  = ['reference_piece', 'designation', 'categorie', 'prix_unitaire_vente', 'seuil_alerte', 'actif']
    list_filter   = ['categorie', 'actif']
    search_fields = ['reference_piece', 'designation']

@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display  = ['piece', 'quantite_en_stock', 'quantite_reservee', 'localisation', 'date_derniere_maj']
    search_fields = ['piece__designation', 'localisation']

@admin.register(CommandeAchat)
class CommandeAchatAdmin(admin.ModelAdmin):
    list_display  = ['numero_commande', 'fournisseur', 'date_commande', 'statut_commande', 'montant_total']
    list_filter   = ['statut_commande']
    search_fields = ['numero_commande']

@admin.register(LigneCommande)
class LigneCommandeAdmin(admin.ModelAdmin):
    list_display = ['commande', 'piece', 'quantite_commandee', 'quantite_recue', 'prix_unitaire_achat']