from rest_framework import serializers
from .models import TypeIntervention, Technicien, Intervention, Affectation, UtilisationPiece

class TypeInterventionSerializer(serializers.ModelSerializer):
    class Meta:
        model  = TypeIntervention
        fields = '__all__'

class TechnicienSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Technicien
        fields = '__all__'

class AffectationSerializer(serializers.ModelSerializer):
    technicien_nom = serializers.CharField(
        source='technicien.__str__', read_only=True
    )
    class Meta:
        model  = Affectation
        fields = '__all__'

class UtilisationPieceSerializer(serializers.ModelSerializer):
    piece_designation = serializers.CharField(
        source='piece.designation', read_only=True
    )
    class Meta:
        model  = UtilisationPiece
        fields = '__all__'

class InterventionSerializer(serializers.ModelSerializer):
    client_nom         = serializers.CharField(
                             source='equipement.client.nom_client',
                             read_only=True
                         )
    equipement_label   = serializers.CharField(
                             source='equipement.__str__',
                             read_only=True
                         )
    type_label         = serializers.CharField(
                             source='type_intervention.libelle',
                             read_only=True
                         )
    affectations       = AffectationSerializer(
                             source='affectation_set',
                             many=True,
                             read_only=True
                         )
    pieces_utilisees   = UtilisationPieceSerializer(
                             source='utilisationpiece_set',
                             many=True,
                             read_only=True
                         )

    class Meta:
        model  = Intervention
        fields = '__all__'