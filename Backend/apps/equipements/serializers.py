from rest_framework import serializers
from .models import Equipement

class EquipementSerializer(serializers.ModelSerializer):
    client_nom = serializers.CharField(source='client.nom_client', read_only=True)

    class Meta:
        model  = Equipement
        fields = '__all__'