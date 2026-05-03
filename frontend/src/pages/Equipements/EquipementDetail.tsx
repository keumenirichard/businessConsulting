import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Thermometer, MapPin, Calendar, Zap } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import { getEquipement } from '../../api/equipementsApi';
import {type Equipement } from '../../types';

const statutBadge: Record<Equipement['statut'], string> = {
  'En service':     'badge-success',
  'En panne':       'badge-error',
  'Décommissionné': 'badge-ghost',
};

export default function EquipementDetail() {
  const { id }                        = useParams();
  const navigate                      = useNavigate();
  const [equipement, setEquipement]   = useState<Equipement | null>(null);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    getEquipement(Number(id))
      .then(({ data }: { data: Equipement }) => setEquipement(data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <Layout titre="Fiche équipement">
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    </Layout>
  );

  if (!equipement) return (
    <Layout titre="Fiche équipement">
      <div className="alert alert-error">Équipement introuvable.</div>
    </Layout>
  );

  return (
    <Layout titre="Fiche équipement">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/equipements')}
            className="btn btn-ghost btn-sm gap-2"
          >
            <ArrowLeft size={16} />
            Retour
          </button>
          <button
            onClick={() => navigate(`/equipements/${id}/modifier`)}
            className="btn btn-warning btn-sm gap-2"
          >
            <Pencil size={16} />
            Modifier
          </button>
        </div>

        {/* Carte principale */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-[#1F3864] p-3 rounded-xl">
                <Thermometer className="text-white w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#1F3864]">
                  {equipement.marque} — {equipement.modele}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="badge badge-ghost badge-sm">
                    {equipement.type_equipement}
                  </span>
                  <span className={`badge badge-sm ${statutBadge[equipement.statut]}`}>
                    {equipement.statut}
                  </span>
                </div>
              </div>
            </div>

            <div className="divider my-2" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-sm">
                <Calendar size={16} className="text-[#2E75B6]" />
                <div>
                  <p className="text-gray-400 text-xs">Date d'installation</p>
                  <p>{new Date(equipement.date_installation).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Zap size={16} className="text-[#2E75B6]" />
                <div>
                  <p className="text-gray-400 text-xs">Puissance</p>
                  <p>{equipement.puissance_kw ? `${equipement.puissance_kw} kW` : '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin size={16} className="text-[#2E75B6]" />
                <div>
                  <p className="text-gray-400 text-xs">Localisation</p>
                  <p>{equipement.localisation || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar size={16} className="text-[#2E75B6]" />
                <div>
                  <p className="text-gray-400 text-xs">Fin de garantie</p>
                  <p>{equipement.garantie_fin
                    ? new Date(equipement.garantie_fin).toLocaleDateString('fr-FR')
                    : '—'}
                  </p>
                </div>
              </div>
            </div>

            {equipement.numero_serie && (
              <>
                <div className="divider my-2" />
                <p className="text-sm text-gray-500">
                  N° Série : <span className="font-medium">{equipement.numero_serie}</span>
                </p>
              </>
            )}
          </div>
        </div>

        {/* Client */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="font-semibold text-[#1F3864] mb-2">Client propriétaire</h3>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{equipement.client_nom}</p>
              <button
                onClick={() => navigate(`/clients/${equipement.client}`)}
                className="btn btn-ghost btn-xs text-blue-500"
              >
                Voir la fiche →
              </button>
            </div>
          </div>
        </div>

        {/* Historique interventions */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#1F3864]">Historique des interventions</h3>
              <button
                onClick={() => navigate(`/interventions/nouveau?equipement=${id}`)}
                className="btn btn-outline btn-primary btn-xs"
              >
                + Planifier
              </button>
            </div>
            <p className="text-sm text-gray-400">
              Les interventions s'afficheront ici.
            </p>
          </div>
        </div>

      </div>
    </Layout>
  );
}