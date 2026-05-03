import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Pencil, Wrench, User,
  Package, FileText, Clock
} from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import { getIntervention, updateIntervention } from '../../api/interventionsApi';
import AffectationForm from './AffectationForm';
import UtilisationPieceForm from './UtilisationPieceForm';
import type { Intervention } from '../../types';

const statutBadge: Record<Intervention['statut_intervention'], string> = {
  'Planifiée': 'badge-info',
  'En cours':  'badge-warning',
  'Terminée':  'badge-success',
  'Annulée':   'badge-error',
};

export default function InterventionDetail() {
  const { id }                          = useParams();
  const navigate                        = useNavigate();
  const [intervention, setIntervention] = useState<Intervention | null>(null);
  const [rapport, setRapport]           = useState('');
  const [loading, setLoading]           = useState(true);
  const [savingRapport, setSavingRapport] = useState(false);
  const [success, setSuccess]           = useState('');

  const chargerIntervention = useCallback(() => {
    getIntervention(Number(id))
      .then(({ data }: { data: Intervention }) => {
        setIntervention(data);
        setRapport(data.rapport_technicien || '');
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { chargerIntervention(); }, [chargerIntervention]);

  const sauvegarderRapport = async () => {
    if (!intervention) return;
    setSavingRapport(true);
    try {
      const { data: updated } = await updateIntervention(intervention.id, {
        rapport_technicien: rapport
      });
      setIntervention(updated);
      setSuccess('Rapport sauvegardé.');
      setTimeout(() => setSuccess(''), 2000);
    } finally {
      setSavingRapport(false);
    }
  };

  const changerStatut = async (statut: Intervention['statut_intervention']) => {
    if (!intervention) return;
    const { data: updated } = await updateIntervention(intervention.id, {
      statut_intervention: statut
    });
    setIntervention(updated);
    setSuccess(`Statut mis à jour : ${statut}`);
    setTimeout(() => setSuccess(''), 2000);
  };

  if (loading) return (
    <Layout titre="Fiche intervention">
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    </Layout>
  );

  if (!intervention) return (
    <Layout titre="Fiche intervention">
      <div className="alert alert-error">Intervention introuvable.</div>
    </Layout>
  );

  return (
    <Layout titre="Fiche intervention">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/interventions')} className="btn btn-ghost btn-sm gap-2">
            <ArrowLeft size={16} /> Retour
          </button>
          <div className="flex gap-2">
            {intervention.statut_intervention === 'Planifiée' && (
              <button onClick={() => changerStatut('En cours')} className="btn btn-warning btn-sm">
                Démarrer
              </button>
            )}
            {intervention.statut_intervention === 'En cours' && (
              <button onClick={() => changerStatut('Terminée')} className="btn btn-success btn-sm">
                Terminer
              </button>
            )}
            <button
              onClick={() => navigate(`/interventions/${id}/modifier`)}
              className="btn btn-ghost btn-sm gap-2"
            >
              <Pencil size={16} /> Modifier
            </button>
          </div>
        </div>

        {success && <div className="alert alert-success"><span className="text-sm">{success}</span></div>}

        {/* Carte principale */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-[#1F3864] p-3 rounded-xl">
                  <Wrench className="text-white w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#1F3864]">
                    Intervention #{intervention.id}
                  </h2>
                  <p className="text-sm text-gray-500">{intervention.type_label}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`badge ${statutBadge[intervention.statut_intervention]}`}>
                  {intervention.statut_intervention}
                </span>
                <span className="text-xs text-gray-400">Priorité : {intervention.priorite}</span>
              </div>
            </div>

            <div className="divider" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-400 text-xs mb-1">Client</p>
                <p className="font-medium">{intervention.client_nom}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Équipement</p>
                <p className="font-medium">{intervention.equipement_label}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1 flex items-center gap-1">
                  <Clock size={12} /> Date planifiée
                </p>
                <p className="font-medium">
                  {new Date(intervention.date_planifiee).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>

            {intervention.description_panne && (
              <>
                <div className="divider" />
                <div>
                  <p className="text-gray-400 text-xs mb-2 flex items-center gap-1">
                    <FileText size={12} /> Description de la panne
                  </p>
                  <p className="text-sm bg-gray-50 rounded-lg p-3">
                    {intervention.description_panne}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Techniciens affectés */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="font-semibold text-[#1F3864] flex items-center gap-2 mb-4">
              <User size={18} /> Techniciens affectés
            </h3>
            <AffectationForm
              interventionId={intervention.id}
              affectations={intervention.affectations}
              onUpdate={chargerIntervention}
            />
          </div>
        </div>

        {/* Pièces utilisées */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="font-semibold text-[#1F3864] flex items-center gap-2 mb-4">
              <Package size={18} /> Pièces utilisées
            </h3>
            <UtilisationPieceForm
              interventionId={intervention.id}
              piecesUtilisees={intervention.pieces_utilisees}
              onUpdate={chargerIntervention}
            />
          </div>
        </div>

        {/* Rapport technicien */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="font-semibold text-[#1F3864] flex items-center gap-2 mb-4">
              <FileText size={18} /> Rapport du technicien
            </h3>
            <textarea
              value={rapport}
              onChange={e => setRapport(e.target.value)}
              className="textarea textarea-bordered w-full"
              placeholder="Saisir le rapport d'intervention..."
              rows={5}
              disabled={intervention.statut_intervention === 'Terminée'}
            />
            {intervention.statut_intervention !== 'Terminée' && (
              <div className="flex justify-end mt-3">
                <button
                  onClick={sauvegarderRapport}
                  className="btn btn-primary btn-sm"
                  disabled={savingRapport}
                >
                  {savingRapport
                    ? <span className="loading loading-spinner loading-sm" />
                    : 'Sauvegarder le rapport'
                  }
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </Layout>
  );
}