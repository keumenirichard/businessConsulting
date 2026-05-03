import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import { createClient, updateClient, getClient } from '../../api/clientsApi';
import { type Client } from '../../types';

type FormData = Omit<Client, 'id' | 'date_creation'>;

const initialForm: FormData = {
  nom_client:    '',
  prenom_client: '',
  type_client:   'Particulier',
  telephone:     '',
  email:         '',
  adresse:       '',
  actif:         true,
};

export default function ClientForm() {
  const { id }                    = useParams();
  const navigate                  = useNavigate();
  const isEdit                    = !!id;
  const [form, setForm]           = useState<FormData>(initialForm);
  const [loading, setLoading]     = useState(false);
  const [erreur, setErreur]       = useState('');
  const [success, setSuccess]     = useState('');

  useEffect(() => {
  if (!isEdit) return;
  
  getClient(Number(id))
    .then(({ data: clientData }: { data: Client }) => {
      setForm({
        nom_client:    clientData.nom_client,
        prenom_client: clientData.prenom_client || '',
        type_client:   clientData.type_client,
        telephone:     clientData.telephone,
        email:         clientData.email || '',
        adresse:       clientData.adresse || '',
        actif:         clientData.actif,
      });
    })
    .catch(() => setErreur('Impossible de charger les données du client.'));
}, [id, isEdit]);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur('');
    setLoading(true);
    try {
      if (isEdit) {
        await updateClient(Number(id), form);
        setSuccess('Client modifié avec succès.');
      } else {
        await createClient(form);
        setSuccess('Client créé avec succès.');
      }
      setTimeout(() => navigate('/clients'), 1000);
    } catch {
      setErreur('Une erreur est survenue. Vérifiez les informations.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout titre={isEdit ? 'Modifier un client' : 'Nouveau client'}>
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Bouton retour */}
        <button
          onClick={() => navigate('/clients')}
          className="btn btn-ghost btn-sm gap-2"
        >
          <ArrowLeft size={16} />
          Retour à la liste
        </button>

        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-[#1F3864] mb-4">
              {isEdit ? 'Modifier les informations' : 'Informations du client'}
            </h3>

            {erreur && (
              <div className="alert alert-error mb-4">
                <span className="text-sm">{erreur}</span>
              </div>
            )}
            {success && (
              <div className="alert alert-success mb-4">
                <span className="text-sm">{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Type client */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Type de client *</span>
                </label>
                <select
                  name="type_client"
                  value={form.type_client}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                >
                  <option value="Particulier">Particulier</option>
                  <option value="Entreprise">Entreprise</option>
                </select>
              </div>

              {/* Nom + Prénom */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Nom *</span>
                  </label>
                  <input
                    type="text"
                    name="nom_client"
                    value={form.nom_client}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="Nom de famille / Raison sociale"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Prénom</span>
                  </label>
                  <input
                    type="text"
                    name="prenom_client"
                    value={form.prenom_client}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="Prénom (optionnel)"
                  />
                </div>
              </div>

              {/* Téléphone + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Téléphone *</span>
                  </label>
                  <input
                    type="tel"
                    name="telephone"
                    value={form.telephone}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="Ex: 699000000"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Email</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="email@exemple.com"
                  />
                </div>
              </div>

              {/* Adresse */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Adresse</span>
                </label>
                <textarea
                  name="adresse"
                  value={form.adresse}
                  onChange={handleChange}
                  className="textarea textarea-bordered w-full"
                  placeholder="Quartier, ville..."
                  rows={3}
                />
              </div>

              {/* Actif */}
              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-4">
                  <input
                    type="checkbox"
                    name="actif"
                    checked={form.actif}
                    onChange={handleChange}
                    className="toggle toggle-primary"
                  />
                  <span className="label-text font-medium">Client actif</span>
                </label>
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
                      {isEdit ? 'Enregistrer les modifications' : 'Créer le client'}
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