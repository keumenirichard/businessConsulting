from rest_framework import serializers
from .models import Devis, LigneDevis, Facture, LigneFacture, Paiement

class LigneDevisSerializer(serializers.ModelSerializer):
    sous_total = serializers.FloatField(read_only=True)

    class Meta:
        model  = LigneDevis
        fields = '__all__'

class DevisSerializer(serializers.ModelSerializer):
    client_nom  = serializers.CharField(
                      source='client.nom_client',
                      read_only=True
                  )
    montant_ttc = serializers.FloatField(read_only=True)
    lignes      = LigneDevisSerializer(many=True, read_only=True)

    class Meta:
        model  = Devis
        fields = '__all__'

class LigneFactureSerializer(serializers.ModelSerializer):
    sous_total = serializers.FloatField(read_only=True)

    class Meta:
        model  = LigneFacture
        fields = '__all__'

class FactureSerializer(serializers.ModelSerializer):
    client_nom    = serializers.CharField(
                        source='client.nom_client',
                        read_only=True
                    )
    montant_ttc   = serializers.FloatField(read_only=True)
    montant_restant = serializers.FloatField(read_only=True)
    lignes        = LigneFactureSerializer(many=True, read_only=True)

    class Meta:
        model  = Facture
        fields = '__all__'

class PaiementSerializer(serializers.ModelSerializer):
    facture_numero = serializers.CharField(
                         source='facture.numero_facture',
                         read_only=True
                     )
    class Meta:
        model  = Paiement
        fields = '__all__'