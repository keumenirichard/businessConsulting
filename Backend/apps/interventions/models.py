from django.db import models
from apps.equipements.models import Equipement
 
 
class TypeIntervention(models.Model):
    libelle         = models.CharField(max_length=80, unique=True)
    description     = models.TextField(blank=True, null=True)
    duree_estimee_h = models.DecimalField(max_digits=4, decimal_places=1,
                                           blank=True, null=True)
 
    class Meta:
        db_table = 'type_intervention'
 
    def __str__(self):
        return self.libelle
 
 
class Technicien(models.Model):
    nom           = models.CharField(max_length=100)
    prenom        = models.CharField(max_length=100)
    specialite    = models.CharField(max_length=100, blank=True, null=True)
    telephone     = models.CharField(max_length=20, blank=True, null=True)
    email         = models.EmailField(blank=True, null=True)
    date_embauche = models.DateField()
    actif         = models.BooleanField(default=True)
 
    class Meta:
        db_table = 'technicien'
        ordering = ['nom', 'prenom']
 
    def __str__(self):
        return f"{self.nom} {self.prenom}"
 
 
class Intervention(models.Model):
    STATUT_CHOICES = [
        ('Planifiée', 'Planifiée'),
        ('En cours', 'En cours'),
        ('Terminée', 'Terminée'),
        ('Annulée', 'Annulée'),
    ]
    PRIORITE_CHOICES = [
        ('Urgente', 'Urgente'),
        ('Haute', 'Haute'),
        ('Normale', 'Normale'),
        ('Basse', 'Basse'),
    ]
 
    equipement = models.ForeignKey(
        Equipement,
        on_delete=models.CASCADE,  # CASCADE
        related_name='interventions'
    )
    type_intervention  = models.ForeignKey(
                             TypeIntervention,
                             on_delete=models.RESTRICT
                         )
    date_planifiee     = models.DateField()
    date_realisation   = models.DateField(blank=True, null=True)
    description_panne  = models.TextField(blank=True, null=True)
    rapport_technicien = models.TextField(blank=True, null=True)
    statut_intervention= models.CharField(max_length=20,
                                           choices=STATUT_CHOICES,
                                           default='Planifiée')
    duree_heures       = models.DecimalField(max_digits=4, decimal_places=1,
                                              blank=True, null=True)
    priorite           = models.CharField(max_length=10,
                                           choices=PRIORITE_CHOICES,
                                           default='Normale')
 
    # Relations N-N via tables d'association
    techniciens = models.ManyToManyField(
                      Technicien,
                      through='Affectation',
                      related_name='interventions'
                  )
    pieces      = models.ManyToManyField(
                      'stock.Piece',
                      through='UtilisationPiece',
                      related_name='interventions'
                  )
 
    class Meta:
        db_table = 'intervention'
        ordering = ['-date_planifiee']
 
    def __str__(self):
        return f"Intervention #{self.pk} — {self.equipement}"
 
 
# Table d'association : TECHNICIEN <-> INTERVENTION
class Affectation(models.Model):
    ROLE_CHOICES = [
        ('Principal', 'Principal'),
        ('Assistant', 'Assistant'),
    ]
 
    intervention = models.ForeignKey(
        Intervention,
        on_delete=models.CASCADE,  # déjà CASCADE, OK
    )
    technicien       = models.ForeignKey(Technicien, on_delete=models.RESTRICT)
    role_affectation = models.CharField(max_length=15,
                                         choices=ROLE_CHOICES,
                                         default='Principal')
    heure_debut      = models.TimeField(blank=True, null=True)
    heure_fin        = models.TimeField(blank=True, null=True)
 
    class Meta:
        db_table = 'affectation'
        unique_together = ('intervention', 'technicien')
 
    def __str__(self):
        return f"{self.technicien} → {self.intervention} ({self.role_affectation})"
 
 
# Table d'association : INTERVENTION <-> PIECE
class UtilisationPiece(models.Model):
    intervention          = models.ForeignKey(Intervention,
                                               on_delete=models.CASCADE)
    piece                 = models.ForeignKey('stock.Piece',
                                               on_delete=models.RESTRICT)
    quantite_utilisee     = models.PositiveIntegerField(default=1)
    prix_unitaire_applique= models.DecimalField(max_digits=10, decimal_places=2)
 
    class Meta:
        db_table = 'utilisation_piece'
        unique_together = ('intervention', 'piece')
 
    def __str__(self):
        return f"{self.piece} x{self.quantite_utilisee} — {self.intervention}"
 
 