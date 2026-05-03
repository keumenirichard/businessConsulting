import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Eye, ArrowLeft } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import { getCommandes } from '../../api/stockApi';
import {type  CommandeAchat } from '../../types';

const statutBadge: Record<CommandeAchat['statut_commande'], string> = {
  'En attente': 'badge-warning',
  'Confirmée':  'badge-info',
  'Livrée':     'badge-success',
  'Annulée':    'badge-error',
};

export default function CommandesList() {
  const [commandes, setCommandes]   = useState<CommandeAchat[]>([]);
  const [loading, setLoading]       = useState(true);
  const [filtreStatut, setFiltreStatut] = useState('tous');
  const navigate = useNavigate();

  useEffect(() => {
    getCommandes(filtreStatut === 'tous' ? undefined : filtreStatut)
      .then(({ data }: { data: CommandeAchat[] }) => setCommandes(data))
      .finally(() => setLoading(false));
  }, [filtreStatut]);

  return (
    <Layout titre="Commandes fournisseurs">
      <div className="space-y-6">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/stock')} className="btn btn-ghost btn-sm gap-1">
              <ArrowLeft size={15} /> Stock
            </button>
            <div className="bg-[#1F3864] p-2 rounded-lg">
              <ShoppingCart className="text-white w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Bons de commande</h3>
              <p className="text-sm text-gray-500">{commandes.length} commande(s)</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/stock/commandes/nouveau')}
            className="btn btn-primary btn-sm gap-2"
          >
            <Plus size={16} /> Nouvelle commande
          </button>
        </div>

        {/* Filtre statut */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-4">
            <select
              className="select select-bordered text-sm w-full sm:w-48"
              value={filtreStatut}
              onChange={e => setFiltreStatut(e.target.value)}
            >
              <option value="tous">Tous les statuts</option>
              <option value="En attente">En attente</option>
              <option value="Confirmée">Confirmée</option>
              <option value="Livrée">Livrée</option>
              <option value="Annulée">Annulée</option>
            </select>
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead className="bg-[#1F3864] text-white">
                <tr>
                  <th>N° Commande</th>
                  <th>Fournisseur</th>
                  <th>Date commande</th>
                  <th>Livraison prévue</th>
                  <th className="text-right">Montant</th>
                  <th>Statut</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-10">
                    <span className="loading loading-spinner loading-md text-primary" />
                  </td></tr>
                ) : commandes.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-10 text-gray-400">
                    Aucune commande trouvée
                  </td></tr>
                ) : (
                 (Array.isArray(commandes)? commandes :[]).map(c => (
                    <tr key={c.id} className="hover">
                      <td className="font-mono text-sm">{c.numero_commande}</td>
                      <td className="text-sm">{c.fournisseur_nom}</td>
                      <td className="text-sm">
                        {new Date(c.date_commande).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="text-sm">
                        {c.date_livraison_prevue
                          ? new Date(c.date_livraison_prevue).toLocaleDateString('fr-FR')
                          : '—'}
                      </td>
                      <td className="text-right text-sm font-medium">
                        {Number(c.montant_total).toLocaleString('fr-FR')} FCFA
                      </td>
                      <td>
                        <span className={`badge badge-sm ${statutBadge[c.statut_commande]}`}>
                          {c.statut_commande}
                        </span>
                      </td>
                      <td>
                        <div className="flex justify-center">
                          <button
                            onClick={() => navigate(`/stock/commandes/${c.id}`)}
                            className="btn btn-ghost btn-xs text-blue-500"
                          >
                            <Eye size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </Layout>
  );
}