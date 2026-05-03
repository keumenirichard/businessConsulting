import { useState, useEffect } from 'react';
import type { Devis, Facture } from '../types';
import { getDevis, getFactures } from '../api/facturationApi';

export function useDevis(statut?: string) {
  const [devis, setDevis]     = useState<Devis[]>([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur]   = useState('');

  useEffect(() => {
    const fechData = async()=>{
      try {
        setLoading(true);
        const res = await getDevis(statut);
        setDevis(res.data)
      } catch {
        setErreur('Erreur lors du chargement des devis.')
        
      }finally{
        setLoading(false);
      }
    };
    fechData();
    
  }, [statut]);

  return { devis, setDevis, loading, erreur };
}

export function useFactures(statut?: string) {
  const [factures, setFactures] = useState<Facture[]>([]);
  const [loading, setLoading]   = useState(true);
  const [erreur, setErreur]     = useState('');

  useEffect(() => {
    const fechData2 = async()=>{
      try {
        setLoading(true);
        const res = await getFactures(statut);
        setFactures(res.data)
      } catch {
        setErreur('Erreur lors du chargement des factures.')
        
      }finally{
        setLoading(false);
      }
    };
    fechData2();
    
    // setLoading(true);
    // getFactures(statut)
    //   .then(({ data }) => setFactures(data))
    //   .catch(() => setErreur('Erreur lors du chargement des factures.'))
    //   .finally(() => setLoading(false));
  }, [statut]);

  return { factures, setFactures, loading, erreur };
}