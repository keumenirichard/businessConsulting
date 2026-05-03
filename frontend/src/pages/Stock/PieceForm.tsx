import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import { createPiece, updatePiece, getPiece } from '../../api/stockApi';
import {type Piece } from '../../types';

type FormData = Omit<Piece, 'id'>;

const initialForm: FormData = {
  reference_piece:     '',
  designation:         '',
  categorie:           '',
  unite:               'pièce',
  prix_unitaire_achat: 0,
  prix_unitaire_vente: 0,
  seuil_alerte:        5,
  actif:               true,
};

export default function PieceForm() {
  const { id }                = useParams();
  const navigate              = useNavigate();
  const isEdit                = !!id;
  const [form, setForm]       = useState<FormData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur]   = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    getPiece(Number(id))
      .then(({ data }: { data: Piece }) => {
        setForm({
          reference_piece:     data.reference_piece,
          designation:         data.designation,
          categorie:           data.categorie || '',
          unite:               data.unite,
          prix_unitaire_achat: data.prix_unitaire_achat,
          prix_unitaire_vente: data.prix_unitaire_vente,
          seuil_alerte:        data.seuil_alerte,
          actif:               data.actif,
        });
      })
      .catch(() => setErreur('Impossible de charger les données.'));
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur('');
    setLoading(true);
    try {
      if (isEdit) {
        await updatePiece(Number(id), form);
        setSuccess('Pièce modifiée avec succès.');
      } else {
        await createPiece(form);
        setSuccess('Pièce créée avec succès.');
      }
      setTimeout(() => navigate('/stock'), 1000);
    } catch {
      setErreur('Erreur. Vérifiez que la référence est unique.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout titre={isEdit ? 'Modifier une pièce' : 'Nouvelle pièce'}>
      <div className="max-w-2xl mx-auto space-y-6">

        <button onClick={() => navigate('/stock')} className="btn btn-ghost btn-sm gap-2">
          <ArrowLeft size={16} /> Retour au stock
        </button>

        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-[#1F3864] mb-4">
              {isEdit ? 'Modifier la pièce' : 'Nouvelle pièce détachée'}
            </h3>

            {erreur  && <div className="alert alert-error  mb-4"><span className="text-sm">{erreur}</span></div>}
            {success && <div className="alert alert-success mb-4"><span className="text-sm">{success}</span></div>}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Référence + Désignation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Référence *</span>
                  </label>
                  <input
                    type="text"
                    name="reference_piece"
                    value={form.reference_piece}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="Ex: COMP-001"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Catégorie</span>
                  </label>
                  <input
                    type="text"
                    name="categorie"
                    value={form.categorie}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="Compresseur, Filtre, Gaz..."
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Désignation *</span>
                </label>
                <input
                  type="text"
                  name="designation"
                  value={form.designation}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="Description complète de la pièce"
                  required
                />
              </div>

              {/* Prix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Prix d'achat (FCFA) *</span>
                  </label>
                  <input
                    type="number"
                    name="prix_unitaire_achat"
                    value={form.prix_unitaire_achat}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    min={0}
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Prix de vente (FCFA) *</span>
                  </label>
                  <input
                    type="number"
                    name="prix_unitaire_vente"
                    value={form.prix_unitaire_vente}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    min={0}
                    required
                  />
                </div>
              </div>

              {/* Unité + Seuil */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Unité</span>
                  </label>
                  <select
                    name="unite"
                    value={form.unite}
                    onChange={handleChange}
                    className="select select-bordered w-full"
                  >
                    <option value="pièce">Pièce</option>
                    <option value="kg">Kilogramme (kg)</option>
                    <option value="litre">Litre</option>
                    <option value="mètre">Mètre</option>
                    <option value="rouleau">Rouleau</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Seuil d'alerte</span>
                  </label>
                  <input
                    type="number"
                    name="seuil_alerte"
                    value={form.seuil_alerte}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    min={0}
                  />
                </div>
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
                  <span className="label-text font-medium">Pièce active</span>
                </label>
              </div>

              <div className="flex justify-end pt-2">
                <button type="submit" className="btn btn-primary gap-2" disabled={loading}>
                  {loading
                    ? <span className="loading loading-spinner loading-sm" />
                    : <><Save size={16} />{isEdit ? 'Enregistrer' : 'Créer la pièce'}</>
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