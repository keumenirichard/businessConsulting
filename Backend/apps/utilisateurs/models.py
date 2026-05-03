from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from apps.interventions.models import Technicien
 
 
class UtilisateurManager(BaseUserManager):
    def create_user(self, login, password=None, **extra_fields):
        if not login:
            raise ValueError("Le login est obligatoire")
        user = self.model(login=login, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
 
    def create_superuser(self, login, password=None, **extra_fields):
        extra_fields.setdefault('role', 'admin')
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(login, password, **extra_fields)
 
 
class Utilisateur(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('admin', 'Administrateur'),
        ('directeur', 'Directeur Général'),
        ('resp_technique', 'Responsable Technique'),
        ('technicien', 'Technicien'),
        ('commercial', 'Commercial'),
        ('resp_stocks', 'Responsable Stocks'),
    ]
 
    login              = models.CharField(max_length=80, unique=True)
    role               = models.CharField(max_length=20, choices=ROLE_CHOICES)
    actif              = models.BooleanField(default=True)
    date_creation      = models.DateField(auto_now_add=True)
    derniere_connexion = models.DateTimeField(blank=True, null=True)
    technicien         = models.OneToOneField(
                             Technicien,
                             on_delete=models.SET_NULL,
                             null=True, blank=True,
                             related_name='utilisateur'
                         )
    is_staff           = models.BooleanField(default=False)
 
    objects = UtilisateurManager()
 
    USERNAME_FIELD  = 'login'
    REQUIRED_FIELDS = ['role']
 
    class Meta:
        db_table = 'utilisateur'
 
    def __str__(self):
        return f"{self.login} ({self.role})"
 