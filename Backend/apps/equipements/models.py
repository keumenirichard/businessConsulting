from django.db import models
from apps.clients.models import Client
 
 
class Equipement(models.Model):
    TYPE_CHOICES = [
        ('Split', 'Split'),
        ('Cassette', 'Cassette'),
        ('Multi-split', 'Multi-split'),
        ('Armoire frigorifique', 'Armoire frigorifique'),
        ('Chambre froide', 'Chambre froide'),
        ('Autre', 'Autre'),
    ]
    STATUT_CHOICES = [
        ('En service', 'En service'),
        ('En panne', 'En panne'),
        ('Décommissionné', 'Décommissionné'),
    ]
 
    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,  # CASCADE au lieu de RESTRICT
        related_name='equipements'
    )
    marque            = models.CharField(max_length=80)
    modele            = models.CharField(max_length=100)
    numero_serie      = models.CharField(max_length=80, unique=True,
                                         blank=True, null=True)
    type_equipement   = models.CharField(max_length=30, choices=TYPE_CHOICES)
    puissance_kw      = models.DecimalField(max_digits=5, decimal_places=2,
                                            blank=True, null=True)
    date_installation = models.DateField()
    localisation      = models.TextField(blank=True, null=True)
    statut            = models.CharField(max_length=20,
                                         choices=STATUT_CHOICES,
                                         default='En service')
    garantie_fin      = models.DateField(blank=True, null=True)
 
    class Meta:
        db_table = 'equipement'
        ordering = ['marque', 'modele']
 
    def __str__(self):
        return f"{self.marque} {self.modele} — {self.client}"