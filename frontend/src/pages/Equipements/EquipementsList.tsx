import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Pencil, Trash2, Thermometer } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import { useEquipements } from '../../hooks/useEquipements';
import {type Equipement } from '../../types';

const statutBadge: Record<Equipement['statut'], string> = {
  'En service':       'badge-success',
  'En panne':         'badge-error',
  'Décommissionné':   'badge-ghost',
};

export default function EquipementsList() {
  const { equipements, loading, erreur, supprimerEquipement } = useEquipements();
  const [recherche, setRecherche]   = useState('');
  const [filtreStatut, setFiltreStatut] = useState('tous');
  const [filtreType, setFiltreType]     = useState('tous');
  const [aSupprimer, setASupprimer] = useState<Equipement | null>(null);
  const navigate = useNavigate();

  const equipementsFiltres = (Array.isArray(equipements)? equipements:[]).filter(e => {
    const matchRecherche =
      e.marque.toLowerCase().includes(recherche.toLowerCase()) ||
      e.modele.toLowerCase().includes(recherche.toLowerCase()) ||
      (e.numero_serie?.toLowerCase().includes(recherche.toLowerCase()) ?? false) ||
      e.client_nom.toLowerCase().includes(recherche.toLowerCase());
    const matchStatut = filtreStatut === 'tous' || e.statut === filtreStatut;
    const matchType   = filtreType === 'tous'   || e.type_equipement === filtreType;
    return matchRecherche && matchStatut && matchType;
  });

  const confirmerSuppression = async () => {
    if (aSupprimer) {
      await supprimerEquipement(aSupprimer.id);
      setASupprimer(null);
    }
  };

  return (
    <Layout titre="Équipements">
      <div className="space-y-6">

        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#1F3864] p-2 rounded-lg">
              <Thermometer className="text-white w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Liste des équipements</h3>
              <p className="text-sm text-gray-500">
                {equipementsFiltres.length} équipement(s) enregistré(s)
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/equipements/nouveau')}
            className="btn btn-primary btn-sm gap-2"
          >
            <Plus size={16} />
            Nouvel équipement
          </button>
        </div>

        {/* Filtres */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <label className="input input-bordered flex items-center gap-2 flex-1">
                <Search size={16} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par marque, modèle, client..."
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
                <option value="En service">En service</option>
                <option value="En panne">En panne</option>
                <option value="Décommissionné">Décommissionné</option>
              </select>
              <select
                className="select select-bordered text-sm w-full sm:w-48"
                value={filtreType}
                onChange={e => setFiltreType(e.target.value)}
              >
                <option value="tous">Tous les types</option>
                <option value="Split">Split</option>
                <option value="Cassette">Cassette</option>
                <option value="Multi-split">Multi-split</option>
                <option value="Armoire frigorifique">Armoire frigorifique</option>
                <option value="Chambre froide">Chambre froide</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
          </div>
        </div>

        {/* Erreur */}
        {erreur && (
          <div className="alert alert-error">
            <span>{erreur}</span>
          </div>
        )}

        {/* Tableau */}
        <div className="card bg-base-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead className="bg-[#1F3864] text-white">
                <tr>
                  <th>Équipement</th>
                  <th>Type</th>
                  <th>Client</th>
                  <th>N° Série</th>
                  <th>Installation</th>
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
                ) : equipementsFiltres.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-gray-400">
                      Aucun équipement trouvé
                    </td>
                  </tr>
                ) : (
                  equipementsFiltres.map(eq => (
                    <tr key={eq.id} className="hover">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="bg-[#2E75B6]/10 p-2 rounded-lg">
                            <Thermometer size={16} className="text-[#2E75B6]" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{eq.marque}</p>
                            <p className="text-xs text-gray-400">{eq.modele}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-ghost badge-sm">
                          {eq.type_equipement}
                        </span>
                      </td>
                      <td className="text-sm">{eq.client_nom}</td>
                      <td className="text-sm text-gray-500">
                        {eq.numero_serie || '—'}
                      </td>
                      <td className="text-sm">
                        {new Date(eq.date_installation).toLocaleDateString('fr-FR')}
                      </td>
                      <td>
                        <span className={`badge badge-sm ${statutBadge[eq.statut]}`}>
                          {eq.statut}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => navigate(`/equipements/${eq.id}`)}
                            className="btn btn-ghost btn-xs text-blue-500"
                            title="Voir"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => navigate(`/equipements/${eq.id}/modifier`)}
                            className="btn btn-ghost btn-xs text-yellow-500"
                            title="Modifier"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setASupprimer(eq)}
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

      {/* Modal suppression */}
      {aSupprimer && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-red-500">Confirmer la suppression</h3>
            <p className="py-4 text-sm text-gray-600">
              Voulez-vous vraiment supprimer l'équipement{' '}
              <span className="font-semibold">
                {aSupprimer.marque} {aSupprimer.modele}
              </span> ?
            </p>
            <div className="modal-action">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setASupprimer(null)}
              >
                Annuler
              </button>
              <button
                className="btn btn-error btn-sm"
                onClick={confirmerSuppression}
              >
                Supprimer
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setASupprimer(null)} />
        </div>
      )}

    </Layout>
  );
}