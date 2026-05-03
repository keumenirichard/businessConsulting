import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Pencil, Phone, Mail,
  MapPin, Thermometer, Plus, Eye
} from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import { getClient } from '../../api/clientsApi';
import { getEquipements } from '../../api/equipementsApi';
import type { Client, Equipement } from '../../types';

const statutBadge: Record<Equipement['statut'], string> = {
  'En service':     'badge-success',
  'En panne':       'badge-error',
  'Décommissionné': 'badge-ghost',
};

export default function ClientDetail() {
  const { id }                        = useParams();
  const navigate                      = useNavigate();
  const [client, setClient]           = useState<Client | null>(null);
  const [equipements, setEquipements] = useState<Equipement[]>([]);
  const [loading, setLoading]         = useState(true);
  const [loadingEq, setLoadingEq]     = useState(true);

  // Charger les infos du client
  useEffect(() => {
    getClient(Number(id))
      .then(({ data }: { data: Client }) => setClient(data))
      .finally(() => setLoading(false));
  }, [id]);

  // Charger les équipements liés à ce client
  useEffect(() => {
    if (!id) return;
    setLoadingEq(true);
    getEquipements(Number(id))
      .then(({ data }: { data: Equipement[] }) => setEquipements(data))
      .finally(() => setLoadingEq(false));
  }, [id]);

  if (loading) return (
    <Layout titre="Fiche client">
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    </Layout>
  );

  if (!client) return (
    <Layout titre="Fiche client">
      <div className="alert alert-error">Client introuvable.</div>
    </Layout>
  );

  return (
    <Layout titre="Fiche client">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/clients')}
            className="btn btn-ghost btn-sm gap-2"
          >
            <ArrowLeft size={16} /> Retour
          </button>
          <button
            onClick={() => navigate(`/clients/${id}/modifier`)}
            className="btn btn-warning btn-sm gap-2"
          >
            <Pencil size={16} /> Modifier
          </button>
        </div>

        {/* Carte principale */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="flex items-center gap-4 mb-4">
              <div className="avatar placeholder">
                <div className="bg-[#1F3864] text-white rounded-full w-16">
                  <span className="text-2xl font-bold">
                    {client.nom_client.charAt(0)}
                  </span>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#1F3864]">
                  {client.nom_client} {client.prenom_client}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`badge badge-sm ${
                    client.type_client === 'Entreprise' ? 'badge-primary' : 'badge-ghost'
                  }`}>
                    {client.type_client}
                  </span>
                  <span className={`badge badge-sm ${
                    client.actif ? 'badge-success' : 'badge-error'
                  }`}>
                    {client.actif ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
            </div>

            <div className="divider my-2" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-sm">
                <Phone size={16} className="text-[#2E75B6] shrink-0" />
                <span>{client.telephone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail size={16} className="text-[#2E75B6] shrink-0" />
                <span>{client.email || '—'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm sm:col-span-2">
                <MapPin size={16} className="text-[#2E75B6] shrink-0" />
                <span>{client.adresse || '—'}</span>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-400">
              Client enregistré le {new Date(client.date_creation).toLocaleDateString('fr-FR')}
            </div>
          </div>
        </div>

        {/* Équipements du client */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#1F3864] flex items-center gap-2">
                <Thermometer size={18} />
                Équipements installés
                {!loadingEq && (
                  <span className="badge badge-ghost badge-sm">{equipements.length}</span>
                )}
              </h3>
              <button
                onClick={() => navigate(`/equipements/nouveau?client=${id}`)}
                className="btn btn-outline btn-primary btn-xs gap-1"
              >
                <Plus size={13} /> Ajouter
              </button>
            </div>

            {loadingEq ? (
              <div className="flex justify-center py-6">
                <span className="loading loading-spinner loading-sm text-primary" />
              </div>
            ) : equipements.length === 0 ? (
              <div className="text-center py-6">
                <Thermometer size={32} className="text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">
                  Aucun équipement enregistré pour ce client.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {equipements.map(eq => (
                  <div
                    key={eq.id}
                    className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-[#2E75B6]/10 p-2 rounded-lg">
                        <Thermometer size={16} className="text-[#2E75B6]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {eq.marque} — {eq.modele}
                        </p>
                        <p className="text-xs text-gray-400">
                          {eq.type_equipement}
                          {eq.numero_serie ? ` · ${eq.numero_serie}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge badge-sm ${statutBadge[eq.statut]}`}>
                        {eq.statut}
                      </span>
                      <button
                        onClick={() => navigate(`/equipements/${eq.id}`)}
                        className="btn btn-ghost btn-xs text-blue-500"
                        title="Voir la fiche"
                      >
                        <Eye size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </Layout>
  );
}