import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Search, Eye, Pencil, Trash2 } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import { useDevis } from '../../hooks/useFacturation';
import { deleteDevis, convertirEnFacture } from '../../api/facturationApi';
import {type Devis } from '../../types';

const statutBadge: Record<Devis['statut_devis'], string> = {
  'Brouillon': 'badge-ghost',
  'Envoyé':    'badge-info',
  'Accepté':   'badge-success',
  'Refusé':    'badge-error',
  'Expiré':    'badge-warning',
};

export default function DevisList() {
  const { devis, setDevis, loading, erreur } = useDevis();
  const [recherche, setRecherche]             = useState('');
  const [filtreStatut, setFiltreStatut]       = useState('tous');
  const [converting, setConverting]           = useState<number | null>(null);
  const navigate = useNavigate();

  const devisFiltres = (Array.isArray(devis)? devis :[]).filter(d => {
    const matchRecherche =
      d.numero_devis.toLowerCase().includes(recherche.toLowerCase()) ||
      d.client_nom.toLowerCase().includes(recherche.toLowerCase());
    const matchStatut = filtreStatut === 'tous' || d.statut_devis === filtreStatut;
    return matchRecherche && matchStatut;
  });

  const handleSupprimer = async (id: number) => {
    await deleteDevis(id);
    setDevis(prev => prev.filter(d => d.id !== id));
  };

  // Convertir un devis accepté en facture
  const handleConvertir = async (d: Devis) => {
    if (d.statut_devis !== 'Accepté') return;
    setConverting(d.id);
    try {
      await convertirEnFacture(d.id);
      navigate('/factures');
    } finally {
      setConverting(null);
    }
  };

  return (
    <Layout titre="Devis">
      <div className="space-y-6">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#1F3864] p-2 rounded-lg">
              <FileText className="text-white w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Liste des devis</h3>
              <p className="text-sm text-gray-500">{devis.length>0?devis.length:0} devis enregistré(s)</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/devis/nouveau')}
            className="btn btn-primary btn-sm gap-2"
          >
            <Plus size={16} /> Nouveau devis
          </button>
        </div>

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
                <option value="Brouillon">Brouillon</option>
                <option value="Envoyé">Envoyé</option>
                <option value="Accepté">Accepté</option>
                <option value="Refusé">Refusé</option>
                <option value="Expiré">Expiré</option>
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
                  <th className="text-right">Montant HT</th>
                  <th className="text-right">Montant TTC</th>
                  <th>Statut</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10">
                      <span className="loading loading-spinner loading-md text-primary" />
                    </td>
                  </tr>
                ) : devisFiltres.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-gray-400">
                      Aucun devis trouvé
                    </td>
                  </tr>
                ) : (
                  devisFiltres.map(d => (
                    <tr key={d.id} className="hover">
                      <td className="font-mono text-sm">{d.numero_devis}</td>
                      <td className="text-sm">{d.client_nom}</td>
                      <td className="text-sm">
                        {new Date(d.date_devis).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="text-right text-sm">
                        {Number(d.montant_ht).toLocaleString('fr-FR')} FCFA
                      </td>
                      <td className="text-right text-sm font-medium">
                        {Number(d.montant_ttc).toLocaleString('fr-FR')} FCFA
                      </td>
                      <td>
                        <span className={`badge badge-sm ${statutBadge[d.statut_devis]}`}>
                          {d.statut_devis}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => navigate(`/devis/${d.id}`)}
                            className="btn btn-ghost btn-xs text-blue-500"
                            title="Voir"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => navigate(`/devis/${d.id}/modifier`)}
                            className="btn btn-ghost btn-xs text-yellow-500"
                            title="Modifier"
                          >
                            <Pencil size={15} />
                          </button>
                          {/* Convertir en facture si devis accepté */}
                          {d.statut_devis === 'Accepté' && (
                            <button
                              onClick={() => handleConvertir(d)}
                              className="btn btn-ghost btn-xs text-green-500"
                              title="Convertir en facture"
                              disabled={converting === d.id}
                            >
                              {converting === d.id
                                ? <span className="loading loading-spinner loading-xs" />
                                : '→ Facture'
                              }
                            </button>
                          )}
                          <button
                            onClick={() => handleSupprimer(d.id)}
                            className="btn btn-ghost btn-xs text-red-500"
                            title="Supprimer"
                          >
                            <Trash2 size={15} />
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