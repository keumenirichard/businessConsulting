import api from './axiosInstance';
import type { Intervention, Affectation, UtilisationPiece, TypeIntervention, Technicien } from '../types';
// interface ApiResponse< T >{
//  count:number; 

//  next: string |null;
//  previous: string|null;
//  results: T[]
// }
// ── Types d'intervention ──────────────────────────────────────────
export const getTypesIntervention = () =>
  api.get<TypeIntervention[]>('types-intervention/');

// ── Techniciens ───────────────────────────────────────────────────
export const getTechniciens = () =>
  api.get<Technicien[]>('techniciens/');

export const getTechnicien = (id: number) =>
  api.get<Technicien>(`techniciens/${id}/`);

export const createTechnicien = (data: Partial<Technicien>) =>
  api.post<Technicien>('techniciens/', data);

export const updateTechnicien = (id: number, data: Partial<Technicien>) =>
  api.put<Technicien>(`techniciens/${id}/`, data);

// ── Interventions ─────────────────────────────────────────────────
export const getInterventions = (params?: Record<string, string>) =>
  api.get<Intervention[]>('interventions/', { params });

export const getIntervention = (id: number) =>
  api.get<Intervention>(`interventions/${id}/`);

export const createIntervention = (data: Partial<Intervention>) =>
  api.post<Intervention>('interventions/', data);

export const updateIntervention = (id: number, data: Partial<Intervention>) =>
  api.put<Intervention>(`interventions/${id}/`, data);

export const deleteIntervention = (id: number) =>
  api.delete(`interventions/${id}/`);

export const getPlanningJour = () =>
  api.get<Intervention[]>('interventions/planning-jour/');

export const getInterventionsUrgentes = () =>
  api.get<Intervention[]>('interventions/urgentes/');

// ── Affectations ──────────────────────────────────────────────────
export const createAffectation = (data: Partial<Affectation>) =>
  api.post<Affectation>('affectations/', data);

export const deleteAffectation = (id: number) =>
  api.delete(`affectations/${id}/`);

// ── Utilisation pièces ────────────────────────────────────────────
export const createUtilisationPiece = (data: Partial<UtilisationPiece>) =>
  api.post<UtilisationPiece>('utilisations-pieces/', data);

export const deleteUtilisationPiece = (id: number) =>
  api.delete(`utilisations-pieces/${id}/`);