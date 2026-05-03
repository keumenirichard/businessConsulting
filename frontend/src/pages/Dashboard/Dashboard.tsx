import { useEffect, useState } from 'react';
import {
  Users, Wrench, Receipt, AlertTriangle,
  TrendingUp, Calendar
} from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import { getClients } from '../../api/clientsApi';
import { getInterventions, getPlanningJour } from '../../api/interventionsApi';
import { getStockAlertes } from '../../api/stockApi';
import { getFactures } from '../../api/facturationApi';
import type { Client, Intervention, Stock, Facture } from '../../types';

export default function Dashboard() {
  const [clients, setClients]           = useState<Client[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [alertes, setAlertes]           = useState<Stock[]>([]);
  const [factures, setFactures]         = useState<Facture[]>([]);
  const [planning, setPlanning]         = useState<Intervention[]>([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    // Chargement parallèle de toutes les données du dashboard
    Promise.all([
      getClients(),
      getInterventions(),
      getStockAlertes(),
      getFactures(),
      getPlanningJour(),
    ]).then(([c, i, a, f, p]) => {
      
      setClients(c.data || []);
      setInterventions(i.data || []);
      setAlertes(a.data|| []);
      setFactures(f.data || []);
      setPlanning(p.data || []);
    }).finally(() => setLoading(false));
   
  }, []);

  // Calcul du CA du mois en cours
  const maintenant     = new Date();
  const caMensuel      = (Array.isArray(factures) ? factures : [])
  .filter(f => {
      const date = new Date(f.date_facture);
      return date.getMonth() === maintenant.getMonth() &&
             date.getFullYear() === maintenant.getFullYear();
    })
    .reduce((sum, f) => sum + Number(f.montant_ttc), 0);

  // Interventions du mois
  const interventionsMois = (Array.isArray(interventions)? interventions : []).filter(i => {
    const date = new Date(i.date_planifiee);
    return date.getMonth() === maintenant.getMonth() &&
           date.getFullYear() === maintenant.getFullYear();
  });

  const kpis = [
    {
      label:  'Clients actifs',
      valeur: (Array.isArray(clients)? clients : []).filter(c => c.actif).length,
      icone:  Users,
      couleur:'text-[#1F3864]',
      bg:     'bg-blue-50',
    },
    {
      label:  'Interventions du mois',
      valeur: interventionsMois.length,
      icone:  Wrench,
      couleur:'text-[#2E75B6]',
      bg:     'bg-blue-50',
    },
    {
      label:  'CA mensuel (FCFA)',
      valeur: caMensuel.toLocaleString('fr-FR'),
      icone:  TrendingUp,
      couleur:'text-green-600',
      bg:     'bg-green-50',
    },
    {
      label:  'Alertes stock',
      valeur: alertes.length,
      icone:  AlertTriangle,
      couleur:'text-red-500',
      bg:     'bg-red-50',
    },
  ];

  if (loading) return (
    <Layout titre="Tableau de bord">
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    </Layout>
  );

  return (
    <Layout titre="Tableau de bord">
      <div className="space-y-6">

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map(({ label, valeur, icone: Icon, couleur, bg }) => (
            <div key={label} className="card bg-base-100 shadow-sm">
              <div className="card-body p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">{label}</p>
                    <p className={`text-2xl font-bold ${couleur}`}>{valeur}</p>
                  </div>
                  <div className={`${bg} p-3 rounded-xl`}>
                    <Icon className={`${couleur} w-6 h-6`} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Planning du jour */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h3 className="font-semibold text-[#1F3864] flex items-center gap-2 mb-4">
                <Calendar size={18} /> Planning du jour
              </h3>
              {planning.length === 0 ? (
                <p className="text-sm text-gray-400">Aucune intervention prévue aujourd'hui.</p>
              ) : (
                <div className="space-y-3">
                  {planning.map(i => (
                    <div
                      key={i.id}
                      className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{i.client_nom}</p>
                        <p className="text-xs text-gray-400">{i.equipement_label}</p>
                      </div>
                      <span className={`badge badge-sm ${
                        i.priorite === 'Urgente' ? 'badge-error' :
                        i.priorite === 'Haute'   ? 'badge-warning' : 'badge-ghost'
                      }`}>
                        {i.priorite}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Alertes stock */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h3 className="font-semibold text-[#1F3864] flex items-center gap-2 mb-4">
                <AlertTriangle size={18} className="text-red-500" /> Alertes stock
              </h3>
              {alertes.length === 0 ? (
                <p className="text-sm text-gray-400">Aucune alerte de stock.</p>
              ) : (
                <div className="space-y-3">
                  {alertes.slice(0, 5).map(s => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between bg-red-50 rounded-lg px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{s.piece_designation}</p>
                        <p className="text-xs text-gray-400">{s.piece_reference}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-red-500">
                          {s.quantite_disponible} restant(s)
                        </p>
                        <p className="text-xs text-gray-400">
                          Seuil : {s.seuil_alerte}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Dernières factures */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="font-semibold text-[#1F3864] flex items-center gap-2 mb-4">
              <Receipt size={18} /> Dernières factures
            </h3>
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Numéro</th>
                    <th>Client</th>
                    <th>Date</th>
                    <th className="text-right">Montant TTC</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {factures.slice(0, 5).map(f => (
                    <tr key={f.id}>
                      <td className="font-mono text-xs">{f.numero_facture}</td>
                      <td className="text-sm">{f.client_nom}</td>
                      <td className="text-sm">
                        {new Date(f.date_facture).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="text-right text-sm font-medium">
                        {Number(f.montant_ttc).toLocaleString('fr-FR')} FCFA
                      </td>
                      <td>
                        <span className={`badge badge-sm ${
                          f.statut_paiement === 'Payée'    ? 'badge-success' :
                          f.statut_paiement === 'Partielle'? 'badge-warning' : 'badge-error'
                        }`}>
                          {f.statut_paiement}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}