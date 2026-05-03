import { useState, useEffect } from 'react';
import {type Equipement } from '../types';
import { getEquipements, deleteEquipement } from '../api/equipementsApi';

export function useEquipements(clientId?: number) {
  const [equipements, setEquipements] = useState<Equipement[]>([]);
  const [loading, setLoading]         = useState(true);
  const [erreur, setErreur]           = useState('');

  const fetchEquipements = async () => {
    setLoading(true);
    setErreur('');
    try {
      const { data } = await getEquipements(clientId);
      setEquipements(data);
    } catch {
      setErreur('Erreur lors du chargement des équipements.');
    } finally {
      setLoading(false);
    }
  };

  const supprimerEquipement = async (id: number) => {
    try {
      await deleteEquipement(id);
      setEquipements(prev => prev.filter(e => e.id !== id));
    } catch {
      setErreur('Erreur lors de la suppression.');
    }
  };

  useEffect(() => {
    fetchEquipements();
  }, [clientId]);

  return { equipements, loading, erreur, fetchEquipements, supprimerEquipement };
}