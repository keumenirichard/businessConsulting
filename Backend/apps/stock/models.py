from django.db import models
 
 
class Fournisseur(models.Model):
    nom_fournisseur = models.CharField(max_length=150)
    contact         = models.CharField(max_length=100, blank=True, null=True)
    telephone       = models.CharField(max_length=20, blank=True, null=True)
    email           = models.EmailField(blank=True, null=True)
    adresse         = models.TextField(blank=True, null=True)
    pays            = models.CharField(max_length=80, default='Cameroun')
    actif           = models.BooleanField(default=True)
 
    class Meta:
        db_table = 'fournisseur'
        ordering = ['nom_fournisseur']
 
    def __str__(self):
        return self.nom_fournisseur
 
 
class Piece(models.Model):
    reference_piece     = models.CharField(max_length=60, unique=True)
    designation         = models.CharField(max_length=200)
    categorie           = models.CharField(max_length=80, blank=True, null=True)
    unite               = models.CharField(max_length=20, default='pièce')
    prix_unitaire_achat = models.DecimalField(max_digits=10, decimal_places=2)
    prix_unitaire_vente = models.DecimalField(max_digits=10, decimal_places=2)
    seuil_alerte        = models.PositiveIntegerField(default=5)
    actif               = models.BooleanField(default=True)
    fournisseurs        = models.ManyToManyField(
                              Fournisseur,
                              blank=True,
                              related_name='pieces'
                          )
 
    class Meta:
        db_table = 'piece'
        ordering = ['designation']
 
    def __str__(self):
        return f"[{self.reference_piece}] {self.designation}"
 
 
class Stock(models.Model):
    piece             = models.OneToOneField(
                            Piece,
                            on_delete=models.CASCADE,
                            related_name='stock'
                        )
    quantite_en_stock = models.PositiveIntegerField(default=0)
    quantite_reservee = models.PositiveIntegerField(default=0)
    localisation      = models.CharField(max_length=150, blank=True, null=True)
    date_derniere_maj = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'stock'

    def __str__(self):
        return f"{self.piece} — {self.quantite_en_stock} {self.piece.unite}"

    @property
    def quantite_disponible(self):
        return self.quantite_en_stock - self.quantite_reservee

    @property
    def en_alerte(self):
        return self.quantite_disponible < self.piece.seuil_alerte
 
class CommandeAchat(models.Model):
    STATUT_CHOICES = [
        ('En attente', 'En attente'),
        ('Confirmée', 'Confirmée'),
        ('Livrée', 'Livrée'),
        ('Annulée', 'Annulée'),
    ]
 
    fournisseur           = models.ForeignKey(
                                Fournisseur,
                                on_delete=models.RESTRICT,
                                related_name='commandes'
                            )
    numero_commande       = models.CharField(max_length=20, unique=True)
    date_commande         = models.DateField(auto_now_add=True)
    date_livraison_prevue = models.DateField(blank=True, null=True)
    date_livraison_reelle = models.DateField(blank=True, null=True)
    statut_commande       = models.CharField(max_length=20,
                                              choices=STATUT_CHOICES,
                                              default='En attente')
    montant_total         = models.DecimalField(max_digits=12, decimal_places=2,
                                                 default=0.00)
    notes                 = models.TextField(blank=True, null=True)
 
    # Relation N-N via table d'association
    pieces = models.ManyToManyField(
                 Piece,
                 through='LigneCommande',
                 related_name='commandes'
             )
 
    class Meta:
        db_table = 'commande_achat'
        ordering = ['-date_commande']
 
    def __str__(self):
        return f"{self.numero_commande} — {self.fournisseur}"
 
 
# Table d'association : COMMANDE_ACHAT <-> PIECE
class LigneCommande(models.Model):
    commande            = models.ForeignKey(CommandeAchat,
                                             on_delete=models.CASCADE,
                                             related_name='lignes')
    piece               = models.ForeignKey(Piece, on_delete=models.RESTRICT)
    quantite_commandee  = models.PositiveIntegerField()
    prix_unitaire_achat = models.DecimalField(max_digits=10, decimal_places=2)
    quantite_recue      = models.PositiveIntegerField(default=0)
 
    class Meta:
        db_table = 'ligne_commande'
        unique_together = ('commande', 'piece')
 
    def __str__(self):
        return f"{self.piece} x{self.quantite_commandee} — {self.commande}"
 
