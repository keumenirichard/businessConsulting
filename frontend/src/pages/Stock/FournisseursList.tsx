import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Plus, Pencil, Search } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import { getFournisseurs, createFournisseur, updateFournisseur } from '../../api/stockApi';
import {type Fournisseur } from '../../types';

export default function FournisseursList() {
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [loading, setLoading]           = useState(true);
  const [recherche, setRecherche]       = useState('');
  const [showForm, setShowForm]         = useState(false);
  const [editing, setEditing]           = useState<Fournisseur | null>(null);
  const [form, setForm]                 = useState({
    nom_fournisseur: '',
    contact:         '',
    telephone:       '',
    email:           '',
    adresse:         '',
    pays:            'Cameroun',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const charger = () => {
    getFournisseurs()
      .then(({ data }: { data: Fournisseur[] }) => setFournisseurs(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { charger(); }, []);

  const ouvrirForm = (f?: Fournisseur) => {
    if (f) {
      setEditing(f);
      setForm({
        nom_fournisseur: f.nom_fournisseur,
        contact:         f.contact || '',
        telephone:       f.telephone || '',
        email:           f.email || '',
        adresse:         f.adresse || '',
        pays:            f.pays,
      });
    } else {
      setEditing(null);
      setForm({ nom_fournisseur:'', contact:'', telephone:'', email:'', adresse:'', pays:'Cameroun' });
    }
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updateFournisseur(editing.id, form);
      } else {
        await createFournisseur(form);
      }
      setSuccess(editing ? 'Fournisseur modifié.' : 'Fournisseur créé.');
      setShowForm(false);
      charger();
      setTimeout(() => setSuccess(''), 2000);
    } finally {
      setSaving(false);
    }
  };

  const filtres =(Array.isArray(fournisseurs)? fournisseurs : []).filter(f =>
    f.nom_fournisseur.toLowerCase().includes(recherche.toLowerCase()) ||
    (f.contact || '').toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <Layout titre="Fournisseurs">
      <div className="space-y-6">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#1F3864] p-2 rounded-lg">
              <Truck className="text-white w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Fournisseurs</h3>
              <p className="text-sm text-gray-500">{fournisseurs.length} fournisseur(s)</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/stock/commandes')} className="btn btn-ghost btn-sm">
              Commandes
            </button>
            <button onClick={() => ouvrirForm()} className="btn btn-primary btn-sm gap-2">
              <Plus size={16} /> Nouveau fournisseur
            </button>
          </div>
        </div>

        {success && <div className="alert alert-success"><span className="text-sm">{success}</span></div>}

        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-4">
            <label className="input input-bordered flex items-center gap-2">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={recherche}
                onChange={e => setRecherche(e.target.value)}
                className="grow text-sm"
              />
            </label>
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead className="bg-[#1F3864] text-white">
                <tr>
                  <th>Nom</th>
                  <th>Contact</th>
                  <th>Téléphone</th>
                  <th>Email</th>
                  <th>Pays</th>
                  <th className="text-center">Statut</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-10">
                    <span className="loading loading-spinner loading-md text-primary" />
                  </td></tr>
                ) : filtres.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-10 text-gray-400">
                    Aucun fournisseur trouvé
                  </td></tr>
                ) : (
                  filtres.map(f => (
                    <tr key={f.id} className="hover">
                      <td className="font-medium text-sm">{f.nom_fournisseur}</td>
                      <td className="text-sm text-gray-500">{f.contact || '—'}</td>
                      <td className="text-sm">{f.telephone || '—'}</td>
                      <td className="text-sm text-gray-500">{f.email || '—'}</td>
                      <td className="text-sm">{f.pays}</td>
                      <td className="text-center">
                        <span className={`badge badge-sm ${f.actif ? 'badge-success' : 'badge-ghost'}`}>
                          {f.actif ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td>
                        <div className="flex justify-center">
                          <button
                            onClick={() => ouvrirForm(f)}
                            className="btn btn-ghost btn-xs text-yellow-500"
                          >
                            <Pencil size={14} />
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

      {/* Modal fournisseur */}
      {showForm && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-[#1F3864] mb-4">
              {editing ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}
            </h3>
            <form onSubmit={handleSave} className="space-y-3">
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Nom *</span></label>
                <input type="text" value={form.nom_fournisseur}
                  onChange={e => setForm(f => ({ ...f, nom_fournisseur: e.target.value }))}
                  className="input input-bordered w-full" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Contact</span></label>
                  <input type="text" value={form.contact}
                    onChange={e => setForm(f => ({ ...f, contact: e.target.value }))}
                    className="input input-bordered w-full" />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Téléphone</span></label>
                  <input type="text" value={form.telephone}
                    onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))}
                    className="input input-bordered w-full" />
                </div>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Email</span></label>
                <input type="email" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="input input-bordered w-full" />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Pays</span></label>
                <input type="text" value={form.pays}
                  onChange={e => setForm(f => ({ ...f, pays: e.target.value }))}
                  className="input input-bordered w-full" />
              </div>
              <div className="modal-action">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                  {saving ? <span className="loading loading-spinner loading-xs" /> : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={() => setShowForm(false)} />
        </div>
      )}

    </Layout>
  );
}