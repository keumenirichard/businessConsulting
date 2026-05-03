import { useState, useEffect } from 'react';
import {type Client } from '../types';
import { getClients, updateClient } from '../api/clientsApi';

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur]   = useState('');

  const fetchClients = async () => {
    setLoading(true);
    setErreur('');
    try {
      const { data } = await getClients();
      console.log("data:", data);
      setClients(data);
    } catch {
      setErreur('Erreur lors du chargement des clients.');
    } finally {
      setLoading(false);
    }
  };
  const supprimerClient = async (id: number) => {
  try {
    const client = clients.find(c => c.id === id);

    if (!client) return;

    await updateClient(id, {
      ...client,
      actif: false
    });

    setClients(prev => prev.filter(c => c.id !== id));
  } catch {
    setErreur('Erreur lors de la désactivation.');
  }
};

//   const supprimerClient = async (id: number) => {
//   try {
//     // Désactivation logique au lieu de DELETE
//     await updateClient(id, { actif: false });
//     setClients(prev => prev.filter(c => c.id !== id));
//   } catch {
//     setErreur('Erreur lors de la désactivation.');
//   }
// };

  useEffect(() => {
    fetchClients();
  }, []);

  return { clients, loading, erreur, fetchClients, supprimerClient };
}