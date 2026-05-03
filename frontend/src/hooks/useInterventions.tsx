import { useState, useEffect } from 'react';
import {type Intervention } from '../types';
import { getInterventions, deleteIntervention } from '../api/interventionsApi';

export function useInterventions(params?: Record<string, string>) {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading]             = useState(true);
  const [erreur, setErreur]               = useState('');

  const fetchInterventions = async () => {
    setLoading(true);
    setErreur('');
    try {
      const { data } = await getInterventions(params);
      setInterventions(data);
    } catch {
      setErreur('Erreur lors du chargement des interventions.');
    } finally {
      setLoading(false);
    }
  };

  const supprimerIntervention = async (id: number) => {
    try {
      await deleteIntervention(id);
      setInterventions(prev => prev.filter(i => i.id !== id));
    } catch {
      setErreur('Erreur lors de la suppression.');
    }
  };

  useEffect(() => {
    fetchInterventions();
  }, []);

  return { interventions, loading, erreur, fetchInterventions, supprimerIntervention };
}