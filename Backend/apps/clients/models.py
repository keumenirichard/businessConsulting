from django.db import models

class Client(models.Model):
    TYPE_CHOICES = [('Particulier','Particulier'),('Entreprise','Entreprise')]

    nom_client    = models.CharField(max_length=100)
    prenom_client = models.CharField(max_length=100, blank=True, null=True)
    type_client   = models.CharField(max_length=20, choices=TYPE_CHOICES)
    telephone     = models.CharField(max_length=20, unique=True)
    email         = models.EmailField(unique=True, blank=True, null=True)
    adresse       = models.TextField(blank=True, null=True)
    date_creation = models.DateField(auto_now_add=True)
    actif         = models.BooleanField(default=True)
    
    def desactiver(self):
        """Désactivation logique au lieu de suppression physique."""
        self.actif = False
        self.save()
    class Meta:
        db_table = 'client'
        ordering = ['nom_client']

    def __str__(self):
        return f'{self.nom_client} {self.prenom_client or ""}'.strip()

