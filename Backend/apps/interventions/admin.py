from django.contrib import admin
from .models import TypeIntervention, Technicien, Intervention, Affectation, UtilisationPiece

@admin.register(TypeIntervention)
class TypeInterventionAdmin(admin.ModelAdmin):
    list_display = ['libelle', 'duree_estimee_h']

@admin.register(Technicien)
class TechnicienAdmin(admin.ModelAdmin):
    list_display  = ['nom', 'prenom', 'specialite', 'telephone', 'actif']
    list_filter   = ['actif', 'specialite']
    search_fields = ['nom', 'prenom']

@admin.register(Intervention)
class InterventionAdmin(admin.ModelAdmin):
    list_display  = ['id', 'equipement', 'type_intervention', 'date_planifiee', 'statut_intervention', 'priorite']
    list_filter   = ['statut_intervention', 'priorite', 'type_intervention']
    search_fields = ['equipement__marque', 'equipement__client__nom_client']

@admin.register(Affectation)
class AffectationAdmin(admin.ModelAdmin):
    list_display = ['intervention', 'technicien', 'role_affectation', 'heure_debut', 'heure_fin']

@admin.register(UtilisationPiece)
class UtilisationPieceAdmin(admin.ModelAdmin):
    list_display = ['intervention', 'piece', 'quantite_utilisee', 'prix_unitaire_applique']