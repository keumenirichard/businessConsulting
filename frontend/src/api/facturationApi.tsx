import api from './axiosInstance';
import type { Devis, LigneDevis, Facture, LigneFacture, Paiement } from '../types';
// interface ApiResponse< T >{
//  count:number; 

//  next: string |null;
//  previous: string|null;
//  results: T[]
// }
// ── Devis ─────────────────────────────────────────────────────────
export const getDevis = (statut?: string) =>
  api.get<Devis[]>('devis/', { params: statut ? { statut } : {} });

export const getDevisById = (id: number) =>
  api.get<Devis>(`devis/${id}/`);

export const createDevis = (data: Partial<Devis>) =>
  api.post<Devis   >('devis/', data);

export const updateDevis = (id: number, data: Partial<Devis>) =>
  api.put<Devis>(`devis/${id}/`, data);

export const deleteDevis = (id: number) =>
  api.delete(`devis/${id}/`);

// Convertir un devis accepté en facture
export const convertirEnFacture = (id: number) =>
  api.post<Facture>(`devis/${id}/convertir-facture/`);

export const createLigneDevis = (data: Partial<LigneDevis>) =>
  api.post<LigneDevis>('lignes-devis/', data);

export const deleteLigneDevis = (id: number) =>
  api.delete(`lignes-devis/${id}/`);

// ── Factures ──────────────────────────────────────────────────────
export const getFactures = (statut?: string) =>
  api.get<Facture[]>('factures/', { params: statut ? { statut } : {} });

export const getFacture = (id: number) =>
  api.get<Facture>(`factures/${id}/`);

export const createFacture = (data: Partial<Facture>) =>
  api.post<Facture>('factures/', data);

export const updateFacture = (id: number, data: Partial<Facture>) =>
  api.put <Facture>(`factures/${id}/`, data);

export const createLigneFacture = (data: Partial<LigneFacture>) =>
  api.post<LigneFacture   >('lignes-facture/', data);

export const deleteLigneFacture = (id: number) =>
  api.delete(`lignes-facture/${id}/`);

// ── Paiements ─────────────────────────────────────────────────────
export const getPaiements = () =>
  api.get <Paiement[]>('paiements/');

export const createPaiement = (data: Partial<Paiement>) =>
  api.post<Paiement>('paiements/', data);