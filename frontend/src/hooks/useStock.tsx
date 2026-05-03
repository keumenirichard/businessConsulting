import { useState, useEffect } from 'react';
import type{ Stock } from '../types';
import { getStocks } from '../api/stockApi';

export function useStock() {
  const [stocks, setStocks]   = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur]   = useState('');

  const fetchStocks = async () => {
    setLoading(true);
    setErreur('');
    try {
      const { data } = await getStocks();
      setStocks(data);
    } catch {
      setErreur('Erreur lors du chargement du stock.');
    } finally {
      setLoading(false);
    }
  };

  const stocksEnAlerte = (Array.isArray(stocks)? stocks :[]).filter(s => s.en_alerte);

  useEffect(() => {
    fetchStocks();
  }, []);

  return { stocks, stocksEnAlerte, loading, erreur, fetchStocks };
}