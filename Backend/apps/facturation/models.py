from django.db import models
from apps.clients.models import Client
from apps.stock.models import Piece
 
 
class Devis(models.Model):
    STATUT_CHOICES = [
        ('Brouillon', 'Brouillon'),
        ('Envoyé', 'Envoyé'),
        ('Accepté', 'Accepté'),
        ('Refusé', 'Refusé'),
        ('Expiré', 'Expiré'),
    ]
 
    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,  # CASCADE
        related_name='devis'
    )
    numero_devis   = models.CharField(max_length=20, unique=True)
    date_devis     = models.DateField(auto_now_add=True)
    validite_jours = models.PositiveIntegerField(default=30)
    montant_ht     = models.DecimalField(max_digits=12, decimal_places=2,
                                          default=0.00)
    taux_tva       = models.DecimalField(max_digits=5, decimal_places=2,
                                          default=19.25)
    statut_devis   = models.CharField(max_length=20,
                                       choices=STATUT_CHOICES,
                                       default='Brouillon')
    notes          = models.TextField(blank=True, null=True)
 
    # Relation N-N via table d'association
    pieces = models.ManyToManyField(
                 Piece,
                 through='LigneDevis',
                 related_name='devis'
             )
 
    class Meta:
        db_table = 'devis'
        ordering = ['-date_devis']
 
    @property
    def montant_ttc(self):
        return round(float(self.montant_ht) * (1 + float(self.taux_tva) / 100), 2)
 
    def __str__(self):
        return f"{self.numero_devis} — {self.client}"
 
 
# Table d'association : DEVIS <-> PIECE
class LigneDevis(models.Model):
    devis         = models.ForeignKey(Devis, on_delete=models.CASCADE,
                                       related_name='lignes')
    piece         = models.ForeignKey(Piece, on_delete=models.RESTRICT)
    designation   = models.CharField(max_length=200)
    quantite      = models.PositiveIntegerField()
    prix_unitaire = models.DecimalField(max_digits=10, decimal_places=2)
 
    class Meta:
        db_table = 'ligne_devis'
        unique_together = ('devis', 'piece')
 
    @property
    def sous_total(self):
        return round(float(self.quantite) * float(self.prix_unitaire), 2)
 
    def __str__(self):
        return f"{self.designation} x{self.quantite}"
 
 
class Facture(models.Model):
    STATUT_CHOICES = [
        ('Impayée', 'Impayée'),
        ('Partielle', 'Partielle'),
        ('Payée', 'Payée'),
    ]
 
    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,  # CASCADE
        related_name='factures'
    )
    devis = models.OneToOneField(
        Devis,
        on_delete=models.SET_NULL,  # SET_NULL — on garde la facture si le devis est supprimé
        null=True, blank=True,
        related_name='facture'
    )
    numero_facture  = models.CharField(max_length=20, unique=True)
    date_facture    = models.DateField(auto_now_add=True)
    montant_ht      = models.DecimalField(max_digits=12, decimal_places=2,
                                           default=0.00)
    taux_tva        = models.DecimalField(max_digits=5, decimal_places=2,
                                           default=19.25)
    montant_paye    = models.DecimalField(max_digits=12, decimal_places=2,
                                           default=0.00)
    statut_paiement = models.CharField(max_length=20,
                                        choices=STATUT_CHOICES,
                                        default='Impayée')
    date_echeance   = models.DateField(blank=True, null=True)
 
    # Relation N-N via table d'association
    pieces = models.ManyToManyField(
                 Piece,
                 through='LigneFacture',
                 related_name='factures'
             )
 
    class Meta:
        db_table = 'facture'
        ordering = ['-date_facture']
 
    @property
    def montant_ttc(self):
        return round(float(self.montant_ht) * (1 + float(self.taux_tva) / 100), 2)
 
    @property
    def montant_restant(self):
        return round(self.montant_ttc - float(self.montant_paye), 2)
 
    def __str__(self):
        return f"{self.numero_facture} — {self.client}"
 
 
# Table d'association : FACTURE <-> PIECE
class LigneFacture(models.Model):
    facture       = models.ForeignKey(Facture, on_delete=models.CASCADE,
                                       related_name='lignes')
    piece         = models.ForeignKey(Piece, on_delete=models.RESTRICT)
    designation   = models.CharField(max_length=200)
    quantite      = models.PositiveIntegerField()
    prix_unitaire = models.DecimalField(max_digits=10, decimal_places=2)
 
    class Meta:
        db_table = 'ligne_facture'
        unique_together = ('facture', 'piece')
 
    @property
    def sous_total(self):
        return round(float(self.quantite) * float(self.prix_unitaire), 2)
 
    def __str__(self):
        return f"{self.designation} x{self.quantite}"
 
 
class Paiement(models.Model):
    MODE_CHOICES = [
        ('Espèces', 'Espèces'),
        ('Mobile Money', 'Mobile Money'),
        ('Virement', 'Virement'),
        ('Chèque', 'Chèque'),
    ]
 
    facture = models.ForeignKey(
        Facture,
        on_delete=models.CASCADE,  # CASCADE au lieu de RESTRICT
        related_name='paiements'
    )
    date_paiement = models.DateField()
    montant       = models.DecimalField(max_digits=12, decimal_places=2)
    mode_paiement = models.CharField(max_length=20, choices=MODE_CHOICES)
    reference     = models.CharField(max_length=100, blank=True, null=True)
    notes         = models.TextField(blank=True, null=True)
 
    class Meta:
        db_table = 'paiement'
        ordering = ['-date_paiement']
 
    def __str__(self):
        return f"Paiement {self.montant} FCFA — {self.facture}"
 