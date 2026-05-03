from rest_framework import serializers
from .models import Fournisseur, Piece, Stock, CommandeAchat, LigneCommande

class FournisseurSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Fournisseur
        fields = '__all__'

class PieceSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Piece
        fields = '__all__'

class StockSerializer(serializers.ModelSerializer):
    piece_designation  = serializers.CharField(
                             source='piece.designation',
                             read_only=True
                         )
    piece_reference    = serializers.CharField(
                             source='piece.reference_piece',
                             read_only=True
                         )
    seuil_alerte       = serializers.IntegerField(
                             source='piece.seuil_alerte',
                             read_only=True
                         )
    en_alerte          = serializers.BooleanField(read_only=True)
    quantite_disponible= serializers.IntegerField(read_only=True)

    class Meta:
        model  = Stock
        fields = '__all__'

class LigneCommandeSerializer(serializers.ModelSerializer):
    piece_designation = serializers.CharField(
                            source='piece.designation',
                            read_only=True
                        )
    class Meta:
        model  = LigneCommande
        fields = '__all__'

class CommandeAchatSerializer(serializers.ModelSerializer):
    fournisseur_nom = serializers.CharField(
                          source='fournisseur.nom_fournisseur',
                          read_only=True
                      )
    lignes          = LigneCommandeSerializer(many=True, read_only=True)

    class Meta:
        model  = CommandeAchat
        fields = '__all__'