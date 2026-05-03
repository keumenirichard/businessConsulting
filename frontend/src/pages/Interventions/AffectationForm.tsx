import { useState, useEffect } from 'react';
import { UserPlus, X } from 'lucide-react';
import { getTechniciens, createAffectation, deleteAffectation } from '../../api/interventionsApi';
import type { Technicien, Affectation } from '../../types';

interface Props {
  interventionId: number;
  affectations:   Affectation[];
  onUpdate:       () => void;
}

export default function AffectationForm({ interventionId, affectations, onUpdate }: Props) {
  const [techniciens, setTechniciens] = useState<Technicien[]>([]);
  const [techId, setTechId]           = useState<number>(0);
  const [role, setRole]               = useState<'Principal' | 'Assistant'>('Principal');
  const [heureDebut, setHeureDebut]   = useState('');
  const [heureFin, setHeureFin]       = useState('');
  const [saving, setSaving]           = useState(false);
  const [erreur, setErreur]           = useState('');

  useEffect(() => {
    getTechniciens().then(({ data }: { data: Technicien[] }) => setTechniciens(data));
  }, []);

  // IDs des techniciens déjà affectés
  const dejAffectes = affectations.map(a => a.technicien);

  const handleAjouter = async () => {
    if (techId === 0) return;
    if (dejAffectes.includes(techId)) {
      setErreur('Ce technicien est déjà affecté.');
      return;
    }
    setSaving(true);
    setErreur('');
    try {
      await createAffectation({
        intervention:     interventionId,
        technicien:       techId,
        role_affectation: role,
        heure_debut:      heureDebut || undefined,
        heure_fin:        heureFin || undefined,
      });
      setTechId(0);
      setHeureDebut('');
      setHeureFin('');
      onUpdate();
    } catch {
      setErreur('Erreur lors de l\'affectation.');
    } finally {
      setSaving(false);
    }
  };

  const handleSupprimer = async (affectationId: number) => {
    await deleteAffectation(affectationId);
    onUpdate();
  };

  return (
    <div className="space-y-4">

      {/* Liste des techniciens affectés */}
      {affectations.length > 0 && (
        <div className="space-y-2">
          {affectations.map(a => (
            <div key={a.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2">
              <div className="flex items-center gap-3">
                <div className="avatar placeholder">
                  <div className="bg-[#2E75B6]/10 text-[#2E75B6] rounded-full w-8">
                    <span className="text-xs">{a.technicien_nom.charAt(0)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">{a.technicien_nom}</p>
                  {(a.heure_debut || a.heure_fin) && (
                    <p className="text-xs text-gray-400">
                      {a.heure_debut} — {a.heure_fin}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge badge-sm ${a.role_affectation === 'Principal' ? 'badge-primary' : 'badge-ghost'}`}>
                  {a.role_affectation}
                </span>
                <button
                  onClick={() => handleSupprimer(a.id)}
                  className="btn btn-ghost btn-xs text-red-400"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {erreur && <p className="text-red-500 text-xs">{erreur}</p>}

      {/* Formulaire d'ajout */}
      <div className="grid grid-cols-12 gap-2 items-end bg-blue-50 p-3 rounded-lg">
        <div className="col-span-12 sm:col-span-4">
          <label className="label py-1">
            <span className="label-text text-xs font-medium">Technicien</span>
          </label>
          <select
            value={techId}
            onChange={e => setTechId(Number(e.target.value))}
            className="select select-bordered select-sm w-full"
          >
            <option value={0} disabled>Sélectionner</option>
            {techniciens
              .filter(t => !dejAffectes.includes(t.id))
              .map(t => (
                <option key={t.id} value={t.id}>{t.nom} {t.prenom}</option>
              ))
            }
          </select>
        </div>
        <div className="col-span-6 sm:col-span-2">
          <label className="label py-1">
            <span className="label-text text-xs font-medium">Rôle</span>
          </label>
          <select
            value={role}
            onChange={e => setRole(e.target.value as 'Principal' | 'Assistant')}
            className="select select-bordered select-sm w-full"
          >
            <option value="Principal">Principal</option>
            <option value="Assistant">Assistant</option>
          </select>
        </div>
        <div className="col-span-6 sm:col-span-2">
          <label className="label py-1">
            <span className="label-text text-xs font-medium">Heure début</span>
          </label>
          <input
            type="time"
            value={heureDebut}
            onChange={e => setHeureDebut(e.target.value)}
            className="input input-bordered input-sm w-full"
          />
        </div>
        <div className="col-span-6 sm:col-span-2">
          <label className="label py-1">
            <span className="label-text text-xs font-medium">Heure fin</span>
          </label>
          <input
            type="time"
            value={heureFin}
            onChange={e => setHeureFin(e.target.value)}
            className="input input-bordered input-sm w-full"
          />
        </div>
        <div className="col-span-6 sm:col-span-2">
          <button
            type="button"
            onClick={handleAjouter}
            className="btn btn-primary btn-sm w-full gap-1"
            disabled={saving || techId === 0}
          >
            {saving ? <span className="loading loading-spinner loading-xs" /> : <><UserPlus size={14} /> Affecter</>}
          </button>
        </div>
      </div>
    </div>
  );
}