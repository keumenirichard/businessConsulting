import api from './axiosInstance';
import { type Equipement } from '../types';
// interface ApiResponse< T >{
//  count:number; 

//  next: string |null;
//  previous: string|null;
//  results: T[]
// }
export const getEquipements = (clientId?: number) =>
  api.get<Equipement [] >('equipements/', {
    params: clientId ? { client: clientId } : {}
  });

export const getEquipement = (id: number) =>
  api.get <Equipement>(`equipements/${id}/`);

export const createEquipement = (data: Partial<Equipement>) =>
  api.post<Equipement>('equipements/', data);

export const updateEquipement = (id: number, data: Partial<Equipement>) =>
  api.put<Equipement>(`equipements/${id}/`, data);

export const deleteEquipement = (id: number) =>
  api.delete(`equipements/${id}/`);