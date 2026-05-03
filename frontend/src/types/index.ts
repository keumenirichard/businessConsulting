export interface Client {
  id: number;
  nom_client: string;
  prenom_client?: string;
  type_client: 'Particulier' | 'Entreprise';
  telephone: string;
  email?: string;
  adresse?: string;
  date_creation: string;
  actif: boolean;
}

export interface Equipement {
  id: number;
  client: number;
  client_nom: string;
  marque: string;
  modele: string;
  numero_serie?: string;
  type_equipement: 'Split' | 'Cassette' | 'Multi-split' | 'Armoire frigorifique' | 'Chambre froide' | 'Autre';
  puissance_kw?: number;
  date_installation: string;
  localisation?: string;
  statut: 'En service' | 'En panne' | 'Décommissionné';
  garantie_fin?: string;
}

export interface Technicien {
  id: number;
  nom: string;
  prenom: string;
  specialite?: string;
  telephone?: string;
  email?: string;
  date_embauche: string;
  actif: boolean;
}

export interface TypeIntervention {
  id: number;
  libelle: string;
  description?: string;
  duree_estimee_h?: number;
}

export interface Affectation {
  id: number;
  intervention: number;
  technicien: number;
  technicien_nom: string;
  role_affectation: 'Principal' | 'Assistant';
  heure_debut?: string;
  heure_fin?: string;
}

export interface UtilisationPiece {
  id: number;
  intervention: number;
  piece: number;
  piece_designation: string;
  quantite_utilisee: number;
  prix_unitaire_applique: number;
}

export interface Intervention {
  id: number;
  equipement: number;
  equipement_label: string;
  client_nom: string;
  type_intervention: number;
  type_label: string;
  date_planifiee: string;
  date_realisation?: string;
  description_panne?: string;
  rapport_technicien?: string;
  statut_intervention: 'Planifiée' | 'En cours' | 'Terminée' | 'Annulée';
  duree_heures?: number;
  priorite: 'Urgente' | 'Haute' | 'Normale' | 'Basse';
  affectations: Affectation[];
  pieces_utilisees: UtilisationPiece[];
}

export interface Piece {
  id: number;
  reference_piece: string;
  designation: string;
  categorie?: string;
  unite: string;
  prix_unitaire_achat: number;
  prix_unitaire_vente: number;
  seuil_alerte: number;
  actif: boolean;
}

export interface Stock {
  id: number;
  piece: number;
  piece_designation: string;
  piece_reference: string;
  quantite_en_stock: number;
  quantite_reservee: number;
  quantite_disponible: number;
  seuil_alerte: number;
  localisation?: string;
  en_alerte: boolean;
  date_derniere_maj: string;
}

export interface Fournisseur {
  id: number;
  nom_fournisseur: string;
  contact?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  pays: string;
  actif: boolean;
}

export interface LigneCommande {
  id: number;
  commande: number;
  piece: number;
  piece_designation: string;
  quantite_commandee: number;
  prix_unitaire_achat: number;
  quantite_recue: number;
}

export interface CommandeAchat {
  id: number;
  fournisseur: number;
  fournisseur_nom: string;
  numero_commande: string;
  date_commande: string;
  date_livraison_prevue?: string;
  date_livraison_reelle?: string;
  statut_commande: 'En attente' | 'Confirmée' | 'Livrée' | 'Annulée';
  montant_total: number;
  notes?: string;
  lignes: LigneCommande[];
}

export interface LigneDevis {
  id: number;
  devis: number;
  piece: number;
  designation: string;
  quantite: number;
  prix_unitaire: number;
  sous_total: number;
}

export interface Devis {
  id: number;
  client: number;
  client_nom: string;
  numero_devis: string;
  date_devis: string;
  validite_jours: number;
  montant_ht: number;
  taux_tva: number;
  montant_ttc: number;
  statut_devis: 'Brouillon' | 'Envoyé' | 'Accepté' | 'Refusé' | 'Expiré';
  notes?: string;
  lignes: LigneDevis[];
}

export interface LigneFacture {
  id: number;
  facture: number;
  piece: number;
  designation: string;
  quantite: number;
  prix_unitaire: number;
  sous_total: number;
}

export interface Facture {
  id: number;
  client: number;
  client_nom: string;
  devis?: number;
  numero_facture: string;
  date_facture: string;
  montant_ht: number;
  taux_tva: number;
  montant_ttc: number;
  montant_paye: number;
  montant_restant: number;
  statut_paiement: 'Impayée' | 'Partielle' | 'Payée';
  date_echeance?: string;
  lignes: LigneFacture[];
}

export interface Paiement {
  id: number;
  facture: number;
  facture_numero: string;
  date_paiement: string;
  montant: number;
  mode_paiement: 'Espèces' | 'Mobile Money' | 'Virement' | 'Chèque';
  reference?: string;
  notes?: string;
}

export interface Utilisateur {
  id: number;
  login: string;
  role: 'admin' | 'directeur' | 'resp_technique' | 'technicien' | 'commercial' | 'resp_stocks';
  actif: boolean;
  date_creation: string;
  derniere_connexion?: string;
  technicien?: number;
}

export interface AuthTokens {
  access: string;
  refresh: string;
  role: string;
  login: string;
}