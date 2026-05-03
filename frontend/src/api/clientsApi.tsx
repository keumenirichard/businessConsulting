import api from './axiosInstance';
import { type Client } from '../types';

// interface ApiResponse< T >{
//  count:number; 

//  next: string |null;
//  previous: string|null;
//  results: T[]
// }

export const getClients = () =>
  api.get<Client[]>('clients/');

export const getClient = (id: number) =>
  api.get<Client>(`clients/${id}/`);

export const createClient = (data: Partial<Client>) =>
  api.post<Client> ('clients/', data);

export const updateClient = (id: number, data: Partial<Client>) =>
  api.put<Client> (`clients/${id}/`, data);

export const deleteClient = (id: number) =>
  api.delete(`clients/${id}/`);