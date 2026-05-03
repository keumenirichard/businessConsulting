import api from './axiosInstance';
import type { Piece, Stock, Fournisseur, CommandeAchat, LigneCommande } from '../types';

// ── Pièces ────────────────────────────────────────────────────────
export const getPieces = () =>
  api.get<Piece[]>('pieces/');

export const getPiece = (id: number) =>
  api.get<Piece>(`pieces/${id}/`);

export const createPiece = (data: Partial<Piece>) =>
  api.post<Piece>('pieces/', data);

export const updatePiece = (id: number, data: Partial<Piece>) =>
  api.put<Piece>(`pieces/${id}/`, data);

export const deletePiece = (id: number) =>
  api.delete(`pieces/${id}/`);

// ── Stock ─────────────────────────────────────────────────────────
export const getStocks = () =>
  api.get<Stock[]>('stocks/');

export const getStockAlertes = () =>
  api.get<Stock[]>('stocks/alertes/');

export const updateStock = (id: number, data: Partial<Stock>) =>
  api.put<Stock>(`stocks/${id}/`, data);

// ── Fournisseurs ──────────────────────────────────────────────────
export const getFournisseurs = () =>
  api.get<Fournisseur[]>('fournisseurs/');

export const getFournisseur = (id: number) =>
  api.get<Fournisseur>(`fournisseurs/${id}/`);

export const createFournisseur = (data: Partial<Fournisseur>) =>
  api.post<Fournisseur>('fournisseurs/', data);

export const updateFournisseur = (id: number, data: Partial<Fournisseur>) =>
  api.put<Fournisseur>(`fournisseurs/${id}/`, data);

// ── Commandes achat ───────────────────────────────────────────────
export const getCommandes = (statut?: string) =>
  api.get<CommandeAchat[]>('commandes/', { params: statut ? { statut } : {} });

export const getCommande = (id: number) =>
  api.get<CommandeAchat>(`commandes/${id}/`);

export const createCommande = (data: Partial<CommandeAchat>) =>
  api.post<CommandeAchat>('commandes/', data);

export const updateCommande = (id: number, data: Partial<CommandeAchat>) =>
  api.put<CommandeAchat>(`commandes/${id}/`, data);

export const createLigneCommande = (data: Partial<LigneCommande>) =>
  api.post<LigneCommande>('lignes-commande/', data);

export const updateLigneCommande = (id: number, data: Partial<LigneCommande>) =>
  api.put<LigneCommande>(`lignes-commande/${id}/`, data);