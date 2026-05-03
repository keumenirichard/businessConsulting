from rest_framework import serializers
from .models import Utilisateur

class UtilisateurSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Utilisateur
        # Ne jamais exposer le hash du mot de passe
        fields = ['id', 'login', 'role', 'actif',
                  'date_creation', 'derniere_connexion', 'technicien']
        read_only_fields = ['date_creation', 'derniere_connexion']


class CreerUtilisateurSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model  = Utilisateur
        fields = ['login', 'password', 'role', 'technicien']

    def validate_login(self, value):
        """Le login doit être unique et sans espaces."""
        if ' ' in value:
            raise serializers.ValidationError("Le login ne doit pas contenir d'espaces.")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        user     = Utilisateur(**validated_data)
        user.set_password(password)
        user.save()
        return user