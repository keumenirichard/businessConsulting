import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Pencil, Trash2, Wrench } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import { useInterventions } from '../../hooks/useInterventions';
import {type Intervention } from '../../types';

// Couleurs des badges selon le statut
const statutBadge: Record<Intervention['statut_intervention'], string> = {
  'Planifiée': 'badge-info',
  'En cours':  'badge-warning',
  'Terminée':  'badge-success',
  'Annulée':   'badge-error',
};

// Couleurs des badges selon la priorité
const prioriteBadge: Record<Intervention['priorite'], string> = {
  'Urgente': 'badge-error',
  'Haute':   'badge-warning',
  'Normale': 'badge-ghost',
  'Basse':   'badge-ghost',
};

export default function InterventionsList() {
  const { interventions, loading, erreur, supprimerIntervention } = useInterventions();
  const [recherche, setRecherche]       = useState('');
  const [filtreStatut, setFiltreStatut] = useState('tous');
  const [filtrePriorite, setFiltrePriorite] = useState('tous');
  const [aSupprimer, setASupprimer]     = useState<Intervention | null>(null);
  const navigate = useNavigate();

  // Filtrage local des interventions
  const interventionsFiltrees =(Array.isArray(interventions)? interventions : []).filter(i => {
    const matchRecherche =
      i.client_nom.toLowerCase().includes(recherche.toLowerCase()) ||
      i.equipement_label.toLowerCase().includes(recherche.toLowerCase()) ||
      i.type_label.toLowerCase().includes(recherche.toLowerCase());
    const matchStatut    = filtreStatut === 'tous'    || i.statut_intervention === filtreStatut;
    const matchPriorite  = filtrePriorite === 'tous'  || i.priorite === filtrePriorite;
    return matchRecherche && matchStatut && matchPriorite;
  });

  const confirmerSuppression = async () => {
    if (aSupprimer) {
      await supprimerIntervention(aSupprimer.id);
      setASupprimer(null);
    }
  };

  return (
    <Layout titre="Interventions">
      <div className="space-y-6">

        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#1F3864] p-2 rounded-lg">
              <Wrench className="text-white w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Liste des interventions</h3>
              <p className="text-sm text-gray-500">
                {interventions.length>0?interventions.length:0} intervention(s) enregistrée(s)
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/interventions/nouveau')}
            className="btn btn-primary btn-sm gap-2"
          >
            <Plus size={16} />
            Nouvelle intervention
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
                  placeholder="Rechercher par client, équipement, type..."
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
                <option value="Planifiée">Planifiée</option>
                <option value="En cours">En cours</option>
                <option value="Terminée">Terminée</option>
                <option value="Annulée">Annulée</option>
              </select>
              <select
                className="select select-bordered text-sm w-full sm:w-44"
                value={filtrePriorite}
                onChange={e => setFiltrePriorite(e.target.value)}
              >
                <option value="tous">Toutes priorités</option>
                <option value="Urgente">Urgente</option>
                <option value="Haute">Haute</option>
                <option value="Normale">Normale</option>
                <option value="Basse">Basse</option>
              </select>
            </div>
          </div>
        </div>

        {/* Erreur */}
        {erreur && <div className="alert alert-error"><span>{erreur}</span></div>}

        {/* Tableau */}
        <div className="card bg-base-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead className="bg-[#1F3864] text-white">
                <tr>
                  <th>Client</th>
                  <th>Équipement</th>
                  <th>Type</th>
                  <th>Date planifiée</th>
                  <th>Priorité</th>
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
                ) : interventionsFiltrees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-gray-400">
                      Aucune intervention trouvée
                    </td>
                  </tr>
                ) : (
                  interventionsFiltrees.map(intervention => (
                    <tr key={intervention.id} className="hover">
                      <td className="text-sm font-medium">{intervention.client_nom}</td>
                      <td className="text-sm text-gray-500">{intervention.equipement_label}</td>
                      <td>
                        <span className="badge badge-ghost badge-sm">
                          {intervention.type_label}
                        </span>
                      </td>
                      <td className="text-sm">
                        {new Date(intervention.date_planifiee).toLocaleDateString('fr-FR')}
                      </td>
                      <td>
                        <span className={`badge badge-sm ${prioriteBadge[intervention.priorite]}`}>
                          {intervention.priorite}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-sm ${statutBadge[intervention.statut_intervention]}`}>
                          {intervention.statut_intervention}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => navigate(`/interventions/${intervention.id}`)}
                            className="btn btn-ghost btn-xs text-blue-500"
                            title="Voir"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => navigate(`/interventions/${intervention.id}/modifier`)}
                            className="btn btn-ghost btn-xs text-yellow-500"
                            title="Modifier"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setASupprimer(intervention)}
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
              Voulez-vous vraiment supprimer cette intervention pour{' '}
              <span className="font-semibold">{aSupprimer.client_nom}</span> ?
            </p>
            <div className="modal-action">
              <button className="btn btn-ghost btn-sm" onClick={() => setASupprimer(null)}>
                Annuler
              </button>
              <button className="btn btn-error btn-sm" onClick={confirmerSuppression}>
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