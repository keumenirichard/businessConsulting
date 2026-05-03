import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import {
  createIntervention, updateIntervention,
  getIntervention, getTypesIntervention
} from '../../api/interventionsApi';
import { getEquipements } from '../../api/equipementsApi';
import type { Intervention, TypeIntervention, Equipement } from '../../types';

// Champs du formulaire sans les champs calculés
type FormData = {
  equipement:          number;
  type_intervention:   number;
  date_planifiee:      string;
  description_panne:   string;
  statut_intervention: Intervention['statut_intervention'];
  priorite:            Intervention['priorite'];
};

const initialForm: FormData = {
  equipement:          0,
  type_intervention:   0,
  date_planifiee:      '',
  description_panne:   '',
  statut_intervention: 'Planifiée',
  priorite:            'Normale',
};

export default function InterventionForm() {
  const { id }                        = useParams();
  const [searchParams]                = useSearchParams();
  const navigate                      = useNavigate();
  const isEdit                        = !!id;
  const [form, setForm]               = useState<FormData>({
    ...initialForm,
    // Pré-remplir l'équipement si on vient de la fiche équipement
    equipement: Number(searchParams.get('equipement')) || 0,
  });
  const [equipements, setEquipements] = useState<Equipement[]>([]);
  const [types, setTypes]             = useState<TypeIntervention[]>([]);
  const [loading, setLoading]         = useState(false);
  const [erreur, setErreur]           = useState('');
  const [success, setSuccess]         = useState('');

  // Chargement des listes déroulantes
  useEffect(() => {
    getEquipements().then(({ data }: { data: Equipement[] }) => setEquipements(data));
    getTypesIntervention().then(({ data }: { data: TypeIntervention[] }) => setTypes(data));
  }, []);

  // Chargement des données en mode édition
  useEffect(() => {
    if (!isEdit) return;
    getIntervention(Number(id))
      .then(({ data: interv }: { data: Intervention }) => {
        setForm({
          equipement:          interv.equipement,
          type_intervention:   interv.type_intervention,
          date_planifiee:      interv.date_planifiee,
          description_panne:   interv.description_panne || '',
          statut_intervention: interv.statut_intervention,
          priorite:            interv.priorite,
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
        await updateIntervention(Number(id), form);
        setSuccess('Intervention modifiée avec succès.');
      } else {
        await createIntervention(form);
        setSuccess('Intervention créée avec succès.');
      }
      setTimeout(() => navigate('/interventions'), 1000);
    } catch {
      setErreur('Une erreur est survenue. Vérifiez les informations.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout titre={isEdit ? 'Modifier une intervention' : 'Nouvelle intervention'}>
      <div className="max-w-2xl mx-auto space-y-6">

        <button onClick={() => navigate('/interventions')} className="btn btn-ghost btn-sm gap-2">
          <ArrowLeft size={16} /> Retour à la liste
        </button>

        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-[#1F3864] mb-4">
              {isEdit ? 'Modifier les informations' : 'Planifier une intervention'}
            </h3>

            {erreur  && <div className="alert alert-error  mb-4"><span className="text-sm">{erreur}</span></div>}
            {success && <div className="alert alert-success mb-4"><span className="text-sm">{success}</span></div>}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Équipement */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Équipement *</span>
                </label>
                <select
                  name="equipement"
                  value={form.equipement}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                  required
                >
                  <option value={0} disabled>Sélectionner un équipement</option>
                  {(Array.isArray(equipements)? equipements :[]).map(eq => (
                    <option key={eq.id} value={eq.id}>
                      {eq.marque} {eq.modele} — {eq.client_nom}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type d'intervention */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Type d'intervention *</span>
                </label>
                <select
                  name="type_intervention"
                  value={form.type_intervention}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                  required
                >
                  <option value={0} disabled>Sélectionner un type</option>
                  {(Array.isArray(types)? types :[]).map(t => (
                    <option key={t.id} value={t.id}>{t.libelle}</option>
                  ))}
                </select>
              </div>

              {/* Date + Priorité */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Date planifiée *</span>
                  </label>
                  <input
                    type="date"
                    name="date_planifiee"
                    value={form.date_planifiee}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Priorité *</span>
                  </label>
                  <select
                    name="priorite"
                    value={form.priorite}
                    onChange={handleChange}
                    className="select select-bordered w-full"
                  >
                    <option value="Urgente">🔴 Urgente</option>
                    <option value="Haute">🟠 Haute</option>
                    <option value="Normale">🟢 Normale</option>
                    <option value="Basse">⚪ Basse</option>
                  </select>
                </div>
              </div>

              {/* Statut (uniquement en édition) */}
              {isEdit && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Statut</span>
                  </label>
                  <select
                    name="statut_intervention"
                    value={form.statut_intervention}
                    onChange={handleChange}
                    className="select select-bordered w-full"
                  >
                    <option value="Planifiée">Planifiée</option>
                    <option value="En cours">En cours</option>
                    <option value="Terminée">Terminée</option>
                    <option value="Annulée">Annulée</option>
                  </select>
                </div>
              )}

              {/* Description de la panne */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Description de la panne</span>
                </label>
                <textarea
                  name="description_panne"
                  value={form.description_panne}
                  onChange={handleChange}
                  className="textarea textarea-bordered w-full"
                  placeholder="Décrivez le problème signalé par le client..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end pt-2">
                <button type="submit" className="btn btn-primary gap-2" disabled={loading}>
                  {loading
                    ? <span className="loading loading-spinner loading-sm" />
                    : <><Save size={16} />{isEdit ? 'Enregistrer' : 'Planifier'}</>
                  }
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}