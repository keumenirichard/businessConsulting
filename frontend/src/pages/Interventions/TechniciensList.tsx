import { useEffect, useState } from 'react';
import { HardHat, Plus, Pencil, Search } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import { getTechniciens, createTechnicien, updateTechnicien } from '../../api/interventionsApi';
import {type Technicien } from '../../types';

export default function TechniciensList() {
  const [techniciens, setTechniciens] = useState<Technicien[]>([]);
  const [loading, setLoading]         = useState(true);
  const [recherche, setRecherche]     = useState('');
  const [showForm, setShowForm]       = useState(false);
  const [editing, setEditing]         = useState<Technicien | null>(null);
  const [form, setForm]               = useState({
    nom: '', prenom: '', specialite: '',
    telephone: '', email: '',
    date_embauche: '', actif: true,
  });
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState('');

  const charger = () => {
    getTechniciens()
      .then(({ data }: { data: Technicien[] }) => setTechniciens(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { charger(); }, []);

  const ouvrirForm = (t?: Technicien) => {
    if (t) {
      setEditing(t);
      setForm({
        nom: t.nom, prenom: t.prenom,
        specialite: t.specialite || '',
        telephone: t.telephone || '',
        email: t.email || '',
        date_embauche: t.date_embauche,
        actif: t.actif,
      });
    } else {
      setEditing(null);
      setForm({ nom:'', prenom:'', specialite:'', telephone:'', email:'', date_embauche:'', actif:true });
    }
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updateTechnicien(editing.id, form);
      } else {
        await createTechnicien(form);
      }
      setSuccess(editing ? 'Technicien modifié.' : 'Technicien créé.');
      setShowForm(false);
      charger();
      setTimeout(() => setSuccess(''), 2000);
    } finally {
      setSaving(false);
    }
  };

  const filtres = (Array.isArray(techniciens)?techniciens:[]).filter(t =>
    `${t.nom} ${t.prenom}`.toLowerCase().includes(recherche.toLowerCase()) ||
    (t.specialite || '').toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <Layout titre="Techniciens">
      <div className="space-y-6">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#1F3864] p-2 rounded-lg">
              <HardHat className="text-white w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Techniciens</h3>
              <p className="text-sm text-gray-500">{techniciens.length>0?techniciens.length:0} technicien(s)</p>
            </div>
          </div>
          <button onClick={() => ouvrirForm()} className="btn btn-primary btn-sm gap-2">
            <Plus size={16} /> Nouveau technicien
          </button>
        </div>

        {success && <div className="alert alert-success"><span className="text-sm">{success}</span></div>}

        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-4">
            <label className="input input-bordered flex items-center gap-2">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom ou spécialité..."
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
                  <th>Nom complet</th>
                  <th>Spécialité</th>
                  <th>Téléphone</th>
                  <th>Email</th>
                  <th>Date embauche</th>
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
                    Aucun technicien trouvé
                  </td></tr>
                ) : (
                  filtres.map(t => (
                    <tr key={t.id} className="hover">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar placeholder">
                            <div className="bg-[#2E75B6]/10 text-[#2E75B6] rounded-full w-9">
                              <span className="text-sm font-bold">{t.nom.charAt(0)}</span>
                            </div>
                          </div>
                          <p className="font-medium text-sm">{t.nom} {t.prenom}</p>
                        </div>
                      </td>
                      <td className="text-sm text-gray-500">{t.specialite || '—'}</td>
                      <td className="text-sm">{t.telephone || '—'}</td>
                      <td className="text-sm text-gray-500">{t.email || '—'}</td>
                      <td className="text-sm">
                        {new Date(t.date_embauche).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="text-center">
                        <span className={`badge badge-sm ${t.actif ? 'badge-success' : 'badge-ghost'}`}>
                          {t.actif ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td>
                        <div className="flex justify-center">
                          <button
                            onClick={() => ouvrirForm(t)}
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

      {/* Modal technicien */}
      {showForm && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-[#1F3864] mb-4">
              {editing ? 'Modifier le technicien' : 'Nouveau technicien'}
            </h3>
            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Nom *</span></label>
                  <input type="text" value={form.nom}
                    onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                    className="input input-bordered w-full" required />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Prénom *</span></label>
                  <input type="text" value={form.prenom}
                    onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))}
                    className="input input-bordered w-full" required />
                </div>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Spécialité</span></label>
                <input type="text" value={form.specialite}
                  onChange={e => setForm(f => ({ ...f, specialite: e.target.value }))}
                  className="input input-bordered w-full"
                  placeholder="Froid industriel, Climatisation résidentielle..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Téléphone</span></label>
                  <input type="text" value={form.telephone}
                    onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))}
                    className="input input-bordered w-full" />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Email</span></label>
                  <input type="email" value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="input input-bordered w-full" />
                </div>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Date d'embauche *</span></label>
                <input type="date" value={form.date_embauche}
                  onChange={e => setForm(f => ({ ...f, date_embauche: e.target.value }))}
                  className="input input-bordered w-full" required />
              </div>
              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-4">
                  <input type="checkbox" checked={form.actif}
                    onChange={e => setForm(f => ({ ...f, actif: e.target.checked }))}
                    className="toggle toggle-primary" />
                  <span className="label-text font-medium">Technicien actif</span>
                </label>
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