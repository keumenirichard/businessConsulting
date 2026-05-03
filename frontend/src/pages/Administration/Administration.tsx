import { useEffect, useState } from 'react';
import {
  Settings, Plus, ToggleLeft, ToggleRight,
  Shield, AlertTriangle, Key
} from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import api from '../../api/axiosInstance';
import { usePermissions } from '../../hooks/useAuth';
import {type Utilisateur } from '../../types';
// interface ApiResponse< T >{
//  count:number; 

//  next: string |null;
//  previous: string|null;
//  results: T[]
// }
// Hiérarchie visuelle des rôles
const HIERARCHIE: Record<Utilisateur['role'], number> = {
  technicien:      1,
  commercial:      2,
  resp_stocks:     3,
  resp_technique:  4,
  directeur:       5,
  admin:           6,
};

const ROLE_LABEL: Record<Utilisateur['role'], string> = {
  admin:           'Administrateur',
  directeur:       'Directeur',
  resp_technique:  'Resp. Technique',
  technicien:      'Technicien',
  commercial:      'Commercial',
  resp_stocks:     'Resp. Stocks',
};

const ROLE_BADGE: Record<Utilisateur['role'], string> = {
  admin:           'badge-error',
  directeur:       'badge-warning',
  resp_technique:  'badge-info',
  technicien:      'badge-ghost',
  commercial:      'badge-success',
  resp_stocks:     'badge-primary',
};

// Droits par module selon le rôle
const DROITS_PAR_ROLE: Record<Utilisateur['role'], string[]> = {
  admin:          ['Accès total à tous les modules', 'Gestion des utilisateurs', 'Paramétrage système'],
  directeur:      ['Tableau de bord', 'Lecture de tous les modules', 'Rapports et statistiques'],
  resp_technique: ['Clients (lecture)', 'Équipements', 'Interventions', 'Planning techniciens'],
  commercial:     ['Clients', 'Équipements (lecture)', 'Devis', 'Factures'],
  resp_stocks:    ['Stock', 'Pièces', 'Commandes fournisseurs'],
  technicien:     ['Planning (les siennes)', 'Fiches intervention', 'Rapport intervention'],
};

export default function Administration() {
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [showDroits, setShowDroits]     = useState(false);
  const [showMdp, setShowMdp]           = useState<Utilisateur | null>(null);
  const [erreur, setErreur]             = useState('');
  const [success, setSuccess]           = useState('');
  const [nouveauMdp, setNouveauMdp]     = useState('');

  const { peutGererUtilisateur, estAdmin, role: roleActuel } = usePermissions();

  const [form, setForm] = useState({
    login:    '',
    password: '',
    role:     'technicien' as Utilisateur['role'],
  });

  const chargerUtilisateurs = async() => {
    setLoading(true);
    setErreur('');
     
    try {
      
      const { data } = await api.get<Utilisateur[]>('utilisateurs/')
      setUtilisateurs(data);
      console.log(utilisateurs);
    } catch {
      setErreur('Erreur lors du chargement des utilisateurs.');
    }finally{
       setLoading(false);
    }
   
   
  };

  useEffect(() => { 
        chargerUtilisateurs(); 
  
  }, []);

  // Créer un utilisateur (admin seulement)
  const handleCreer = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur('');
    // Vérification : ne peut pas créer un rôle supérieur ou égal au sien
    if (!peutGererUtilisateur(form.role) && form.role !== 'technicien') {
      setErreur('Vous ne pouvez pas créer un compte avec un rôle supérieur ou égal au vôtre.');
      return;
    }
    try {
      await api.post('utilisateurs/', form);
      console.log(form);
      setSuccess('Utilisateur créé avec succès.');
      setShowForm(false);
      setForm({ login: '', password: '', role: 'technicien' });
      chargerUtilisateurs();
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setErreur('Erreur. Le login est peut-être déjà utilisé.');
    }
  };

  // Activer / désactiver — vérification des droits
  const toggleActif = async (u: Utilisateur) => {
    if (!peutGererUtilisateur(u.role)) {
      setErreur(`Vous ne pouvez pas modifier un compte de rôle supérieur ou égal au vôtre.`);
      setTimeout(() => setErreur(''), 3000);
      return;
    }
    // Empêcher de se désactiver soi-même
    if (u.login === localStorage.getItem('login')) {
      setErreur('Vous ne pouvez pas désactiver votre propre compte.');
      setTimeout(() => setErreur(''), 3000);
      return;
    }
    await api.patch(`utilisateurs/${u.id}/`, { actif: !u.actif });
    chargerUtilisateurs();
    setSuccess(`Compte ${u.actif ? 'désactivé' : 'activé'} avec succès.`);
    setTimeout(() => setSuccess(''), 2000);
  };

  // Changer mot de passe
  const handleChangerMdp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showMdp) return;
    if (!peutGererUtilisateur(showMdp.role)) {
      setErreur('Droits insuffisants pour modifier ce mot de passe.');
      setShowMdp(null);
      return;
    }
    try {
      await api.patch(`utilisateurs/${showMdp.id}/`, { password: nouveauMdp });
      setSuccess('Mot de passe modifié avec succès.');
      setShowMdp(null);
      setNouveauMdp('');
      setTimeout(() => setSuccess(''), 2000);
    } catch {
      setErreur('Erreur lors de la modification du mot de passe.');
    }
  };

  // Roles disponibles selon le niveau de l'utilisateur courant
  const rolesDisponibles = Object.entries(HIERARCHIE)
    .filter(([r]) => peutGererUtilisateur(r as Utilisateur['role']))
    .map(([r]) => r as Utilisateur['role']);
  
  
  return (
    <Layout titre="Administration">
      <div className="space-y-6">

        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#1F3864] p-2 rounded-lg">
              <Settings className="text-white w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Gestion des utilisateurs</h3>
              <p className="text-sm text-gray-500">
                {utilisateurs.length>0?utilisateurs.length:0 } compte(s) — Connecté en tant que{' '}
                <span className="font-medium">{ROLE_LABEL[roleActuel as Utilisateur['role']]}</span>
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowDroits(true)}
              className="btn btn-ghost btn-sm gap-2"
            >
              <Shield size={16} /> Tableau des droits
            </button>
            {estAdmin && (
              <button
                onClick={() => setShowForm(true)}
                className="btn btn-primary btn-sm gap-2"
              >
                <Plus size={16} /> Nouvel utilisateur
              </button>
            )}
          </div>
        </div>

        {success && <div className="alert alert-success"><span className="text-sm">{success}</span></div>}
        {erreur  && <div className="alert alert-error"><span className="text-sm">{erreur}</span></div>}

        {/* Légende hiérarchie */}
        <div className="card bg-blue-50 border border-blue-100 shadow-sm">
          <div className="card-body p-4">
            <p className="text-sm text-blue-700 flex items-center gap-2">
              <Shield size={16} />
              <strong>Règle des droits :</strong> Vous ne pouvez gérer que les comptes
              dont le rôle est strictement inférieur au vôtre dans la hiérarchie.
              Un administrateur ne peut pas être modifié par un directeur.
            </p>
          </div>
        </div>

        {/* Tableau utilisateurs */}
        <div className="card bg-base-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead className="bg-[#1F3864] text-white">
                <tr>
                  <th>Login</th>
                  <th>Rôle</th>
                  <th>Niveau</th>
                  <th>Date création</th>
                  <th>Dernière connexion</th>
                  <th className="text-center">Statut</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                 
                {loading ? (
                
                  <tr><td colSpan={7} className="text-center py-10">
                    <span className="loading loading-spinner loading-md text-primary" />
                  </td></tr>
                ) : (Array.isArray(utilisateurs)?utilisateurs:[]).length===0? (
                  <tr><td colSpan={7} className="text-center py-10 text-gray-400">
                    Aucun utilisateur trouvé
                  </td></tr>
                  
                ) : (
                  (Array.isArray(utilisateurs)? utilisateurs : []).map(u => {
                  
                    // Peut-on agir sur cet utilisateur ?
                    const peutAgir = peutGererUtilisateur(u.role) && u.login !== localStorage.getItem('login');
                    return (
                      <tr key={u.id} className={`hover ${!peutAgir ? 'opacity-70' : ''}`}>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="avatar placeholder">
                              <div className="bg-[#2E75B6]/10 text-[#2E75B6] rounded-full w-8">
                                <span className="text-xs font-bold">
                                  {u.login.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <span className="font-medium text-sm">{u.login}</span>
                            {/* Indicateur si c'est le compte connecté */}
                            {u.login === localStorage.getItem('login') && (
                              <span className="badge badge-ghost badge-xs">Vous</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`badge badge-sm ${ROLE_BADGE[u.role]}`}>
                            {ROLE_LABEL[u.role]}
                          </span>
                        </td>
                        <td>
                          {/* Barre de niveau hiérarchique */}
                          <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                              {Array.from({ length: 6 }, (_, i) => (
                                <div
                                  key={i}
                                  className={`w-2 h-3 rounded-sm ${
                                    i < HIERARCHIE[u.role]
                                      ? 'bg-[#2E75B6]'
                                      : 'bg-gray-200'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-400">
                              {HIERARCHIE[u.role]}/6
                            </span>
                          </div>
                        </td>
                        <td className="text-sm text-gray-500">
                          {new Date(u.date_creation).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="text-sm text-gray-500">
                          {u.derniere_connexion
                            ? new Date(u.derniere_connexion).toLocaleString('fr-FR')
                            : 'Jamais connecté'
                          }
                        </td>
                        <td className="text-center">
                          <span className={`badge badge-sm ${u.actif ? 'badge-success' : 'badge-error'}`}>
                            {u.actif ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center justify-center gap-1">
                            {peutAgir ? (
                              <>
                                {/* Toggle actif/inactif */}
                                <button
                                  onClick={() => toggleActif(u)}
                                  className={`btn btn-ghost btn-xs ${u.actif ? 'text-red-400' : 'text-green-500'}`}
                                  title={u.actif ? 'Désactiver' : 'Activer'}
                                >
                                  {u.actif ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                                </button>
                                {/* Changer mot de passe */}
                                <button
                                  onClick={() => { setShowMdp(u); setNouveauMdp(''); }}
                                  className="btn btn-ghost btn-xs text-blue-400"
                                  title="Changer le mot de passe"
                                >
                                  <Key size={15} />
                                </button>
                              </>
                            ) : (
                              // Pas les droits → icône cadenas
                              <span title="Droits insuffisants">
                                <Shield size={15} className="text-gray-300" />
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ── Modal création utilisateur ── */}
      {showForm && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-[#1F3864] mb-4">
              Créer un utilisateur
            </h3>
            <form onSubmit={handleCreer} className="space-y-4">

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Login *</span>
                </label>
                <input
                  type="text"
                  value={form.login}
                  onChange={e => setForm(f => ({ ...f, login: e.target.value }))}
                  className="input input-bordered w-full"
                  placeholder="Identifiant unique"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Mot de passe *</span>
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="input input-bordered w-full"
                  placeholder="Mot de passe initial"
                  required
                  minLength={6}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Rôle *</span>
                </label>
                <select
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value as Utilisateur['role'] }))}
                  className="select select-bordered w-full"
                >
                  {/* Afficher uniquement les rôles que l'utilisateur peut attribuer */}
                  {rolesDisponibles.map(r => (
                    <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                  ))}
                </select>
                <label className="label">
                  <span className="label-text-alt text-gray-400">
                    Vous ne pouvez attribuer que des rôles inférieurs au vôtre.
                  </span>
                </label>
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowForm(false)}
                >
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Créer
                </button>
              </div>

            </form>
          </div>
          <div className="modal-backdrop" onClick={() => setShowForm(false)} />
        </div>
      )}

      {/* ── Modal changement mot de passe ── */}
      {showMdp && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-[#1F3864] mb-1 flex items-center gap-2">
              <Key size={18} /> Changer le mot de passe
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Compte : <span className="font-medium">{showMdp.login}</span>
            </p>
            <form onSubmit={handleChangerMdp} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Nouveau mot de passe *</span>
                </label>
                <input
                  type="password"
                  value={nouveauMdp}
                  onChange={e => setNouveauMdp(e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="Minimum 6 caractères"
                  minLength={6}
                  required
                />
              </div>
              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowMdp(null)}
                >
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Changer
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={() => setShowMdp(null)} />
        </div>
      )}

      {/* ── Modal tableau des droits ── */}
      {showDroits && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg text-[#1F3864] mb-4 flex items-center gap-2">
              <Shield size={18} /> Tableau des droits d'accès
            </h3>
            <div className="space-y-3">
              {(Object.entries(DROITS_PAR_ROLE) as [Utilisateur['role'], string[]][])
                .sort((a, b) => HIERARCHIE[b[0]] - HIERARCHIE[a[0]])
                .map(([role, droits]) => (
                  <div key={role} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`badge badge-sm ${ROLE_BADGE[role]}`}>
                        {ROLE_LABEL[role]}
                      </span>
                      <span className="text-xs text-gray-400">
                        Niveau {HIERARCHIE[role]}/6
                      </span>
                    </div>
                    <ul className="space-y-1">
                      {droits.map(d => (
                        <li key={d} className="text-sm text-gray-600 flex items-center gap-2">
                          <span className="text-green-500">✓</span> {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              }
            </div>

            {/* Avertissement */}
            <div className="alert alert-warning mt-4 py-2">
              <AlertTriangle size={16} />
              <span className="text-xs">
                Un utilisateur ne peut jamais gérer un compte de niveau supérieur ou égal au sien.
                Un administrateur ne peut être modifié que par un autre administrateur.
              </span>
            </div>

            <div className="modal-action">
              <button className="btn btn-ghost btn-sm" onClick={() => setShowDroits(false)}>
                Fermer
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowDroits(false)} />
        </div>
      )}

    </Layout>
  );
}