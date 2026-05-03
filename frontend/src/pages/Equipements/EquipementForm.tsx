import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import { createEquipement, updateEquipement, getEquipement } from '../../api/equipementsApi';
import { getClients } from '../../api/clientsApi';
import {type Equipement, type Client } from '../../types';

type FormData = Omit<Equipement, 'id' | 'client_nom'>;

const initialForm: FormData = {
  client:            0,
  marque:            '',
  modele:            '',
  numero_serie:      '',
  type_equipement:   'Split',
  puissance_kw:      undefined,
  date_installation: '',
  localisation:      '',
  statut:            'En service',
  garantie_fin:      '',
};

export default function EquipementForm() {
  const { id }                      = useParams();
  const [searchParams]              = useSearchParams();
  const navigate                    = useNavigate();
  const isEdit                      = !!id;
  const [form, setForm]             = useState<FormData>({
    ...initialForm,
    client: Number(searchParams.get('client')) || 0,
  });
  const [clients, setClients]       = useState<Client[]>([]);
  const [loading, setLoading]       = useState(false);
  const [erreur, setErreur]         = useState('');
  const [success, setSuccess]       = useState('');

  useEffect(() => {
    getClients().then(({ data }: { data: Client[] }) => setClients(data));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    getEquipement(Number(id))
      .then(({ data: eq }: { data: Equipement }) => {
        setForm({
          client:            eq.client,
          marque:            eq.marque,
          modele:            eq.modele,
          numero_serie:      eq.numero_serie || '',
          type_equipement:   eq.type_equipement,
          puissance_kw:      eq.puissance_kw,
          date_installation: eq.date_installation,
          localisation:      eq.localisation || '',
          statut:            eq.statut,
          garantie_fin:      eq.garantie_fin || '',
        });
      })
      .catch(() => setErreur('Impossible de charger les données.'));
  }, [id, isEdit]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur('');
    setLoading(true);
    try {
      if (isEdit) {
        await updateEquipement(Number(id), form);
        setSuccess('Équipement modifié avec succès.');
      } else {
        await createEquipement(form);
        setSuccess('Équipement créé avec succès.');
      }
      setTimeout(() => navigate('/equipements'), 1000);
    } catch {
      setErreur('Une erreur est survenue. Vérifiez les informations.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout titre={isEdit ? 'Modifier un équipement' : 'Nouvel équipement'}>
      <div className="max-w-2xl mx-auto space-y-6">

        <button
          onClick={() => navigate('/equipements')}
          className="btn btn-ghost btn-sm gap-2"
        >
          <ArrowLeft size={16} />
          Retour à la liste
        </button>

        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-[#1F3864] mb-4">
              {isEdit ? 'Modifier les informations' : 'Informations de l\'équipement'}
            </h3>

            {erreur && <div className="alert alert-error mb-4"><span className="text-sm">{erreur}</span></div>}
            {success && <div className="alert alert-success mb-4"><span className="text-sm">{success}</span></div>}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Client */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Client *</span>
                </label>
                <select
                  name="client"
                  value={form.client}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                  required
                >
                  <option value={0} disabled>Sélectionner un client</option>
                  {(Array.isArray(clients)? clients : []).map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nom_client} {c.prenom_client}
                    </option>
                  ))}
                </select>
              </div>

              {/* Marque + Modèle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Marque *</span>
                  </label>
                  <input
                    type="text"
                    name="marque"
                    value={form.marque}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="Ex: Daikin, Samsung, LG"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Modèle *</span>
                  </label>
                  <input
                    type="text"
                    name="modele"
                    value={form.modele}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="Ex: FTXB35C"
                    required
                  />
                </div>
              </div>

              {/* Type + Puissance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Type *</span>
                  </label>
                  <select
                    name="type_equipement"
                    value={form.type_equipement}
                    onChange={handleChange}
                    className="select select-bordered w-full"
                  >
                    <option value="Split">Split</option>
                    <option value="Cassette">Cassette</option>
                    <option value="Multi-split">Multi-split</option>
                    <option value="Armoire frigorifique">Armoire frigorifique</option>
                    <option value="Chambre froide">Chambre froide</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Puissance (kW)</span>
                  </label>
                  <input
                    type="number"
                    name="puissance_kw"
                    value={form.puissance_kw || ''}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="Ex: 3.5"
                    step="0.1"
                  />
                </div>
              </div>

              {/* Numéro de série */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Numéro de série</span>
                </label>
                <input
                  type="text"
                  name="numero_serie"
                  value={form.numero_serie}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="Numéro de série constructeur"
                />
              </div>

              {/* Date installation + Garantie */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Date d'installation *</span>
                  </label>
                  <input
                    type="date"
                    name="date_installation"
                    value={form.date_installation}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Fin de garantie</span>
                  </label>
                  <input
                    type="date"
                    name="garantie_fin"
                    value={form.garantie_fin}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                  />
                </div>
              </div>

              {/* Statut */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Statut *</span>
                </label>
                <select
                  name="statut"
                  value={form.statut}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                >
                  <option value="En service">En service</option>
                  <option value="En panne">En panne</option>
                  <option value="Décommissionné">Décommissionné</option>
                </select>
              </div>

              {/* Localisation */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Localisation</span>
                </label>
                <textarea
                  name="localisation"
                  value={form.localisation}
                  onChange={handleChange}
                  className="textarea textarea-bordered w-full"
                  placeholder="Lieu précis chez le client (salle, étage...)"
                  rows={2}
                />
              </div>

              {/* Bouton */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="btn btn-primary gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : (
                    <>
                      <Save size={16} />
                      {isEdit ? 'Enregistrer les modifications' : 'Créer l\'équipement'}
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}