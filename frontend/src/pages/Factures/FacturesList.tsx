import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt, Plus, Search, Eye } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import { useFactures } from '../../hooks/useFacturation';
import {type Facture } from '../../types';

const statutBadge: Record<Facture['statut_paiement'], string> = {
  'Impayée':  'badge-error',
  'Partielle':'badge-warning',
  'Payée':    'badge-success',
};

export default function FacturesList() {
  const { factures, loading, erreur } = useFactures();
  const [recherche, setRecherche]     = useState('');
  const [filtreStatut, setFiltreStatut] = useState('tous');
  const navigate = useNavigate();
   console.log(factures.length);
  const facturesFiltrees = (Array.isArray(factures)? factures:[]).filter(f => {
    const matchRecherche =
      f.numero_facture.toLowerCase().includes(recherche.toLowerCase()) ||
      f.client_nom.toLowerCase().includes(recherche.toLowerCase());
    const matchStatut = filtreStatut === 'tous' || f.statut_paiement === filtreStatut;
    return matchRecherche && matchStatut;
  });

  // Calcul du total des montants restants à percevoir
  const totalRestant = (Array.isArray(factures)? factures : []).reduce((sum, f) => sum + f.montant_restant, 0);

  return (
    <Layout titre="Factures">
      <div className="space-y-6">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#1F3864] p-2 rounded-lg">
              <Receipt className="text-white w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Liste des factures</h3>
              <p className="text-sm text-gray-500">{factures.length>0?factures.length:0} facture(s)</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/factures/nouveau')}
            className="btn btn-primary btn-sm gap-2"
          >
            <Plus size={16} /> Nouvelle facture
          </button>
        </div>

        {/* Cartes résumé */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body p-4">
              <p className="text-xs text-gray-400">Total factures</p>
              <p className="text-2xl font-bold text-[#1F3864]">{factures.length}</p>
            </div>
          </div>
          <div className="card bg-red-50 shadow-sm">
            <div className="card-body p-4">
              <p className="text-xs text-red-400">Impayées</p>
              <p className="text-2xl font-bold text-red-500">
                {(Array.isArray(factures)? factures:[]).filter(f => f.statut_paiement === 'Impayée').length}
              </p>
            </div>
          </div>
          <div className="card bg-orange-50 shadow-sm">
            <div className="card-body p-4">
              <p className="text-xs text-orange-400">Montant restant à percevoir</p>
              <p className="text-lg font-bold text-orange-500">
                {totalRestant.toLocaleString('fr-FR')} FCFA
              </p>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <label className="input input-bordered flex items-center gap-2 flex-1">
                <Search size={16} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par numéro ou client..."
                  value={recherche}
                  onChange={e => setRecherche(e.target.value)}
                  className="grow text-sm"
                />
              </label>
              <select
                className="select select-bordered text-sm w-full sm:w-44"
                value={filtreStatut}
                onChange={e => setFiltreStatut(e.target.value)}
              >
                <option value="tous">Tous les statuts</option>
                <option value="Impayée">Impayée</option>
                <option value="Partielle">Partielle</option>
                <option value="Payée">Payée</option>
              </select>
            </div>
          </div>
        </div>

        {erreur && <div className="alert alert-error"><span>{erreur}</span></div>}

        <div className="card bg-base-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead className="bg-[#1F3864] text-white">
                <tr>
                  <th>Numéro</th>
                  <th>Client</th>
                  <th>Date</th>
                  <th className="text-right">Montant TTC</th>
                  <th className="text-right">Payé</th>
                  <th className="text-right">Restant</th>
                  <th>Statut</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10">
                      <span className="loading loading-spinner loading-md text-primary" />
                    </td>
                  </tr>
                ) : facturesFiltrees.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-gray-400">
                      Aucune facture trouvée
                    </td>
                  </tr>
                ) : (
                  facturesFiltrees.map(f => (
                    <tr key={f.id} className="hover">
                      <td className="font-mono text-sm">{f.numero_facture}</td>
                      <td className="text-sm">{f.client_nom}</td>
                      <td className="text-sm">
                        {new Date(f.date_facture).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="text-right text-sm font-medium">
                        {Number(f.montant_ttc).toLocaleString('fr-FR')} FCFA
                      </td>
                      <td className="text-right text-sm text-green-600">
                        {Number(f.montant_paye).toLocaleString('fr-FR')} FCFA
                      </td>
                      <td className="text-right text-sm text-red-500">
                        {f.montant_restant.toLocaleString('fr-FR')} FCFA
                      </td>
                      <td>
                        <span className={`badge badge-sm ${statutBadge[f.statut_paiement]}`}>
                          {f.statut_paiement}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => navigate(`/factures/${f.id}`)}
                            className="btn btn-ghost btn-xs text-blue-500"
                            title="Voir"
                          >
                            <Eye size={15} />
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