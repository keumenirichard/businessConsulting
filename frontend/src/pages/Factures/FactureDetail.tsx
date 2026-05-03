import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Receipt, Plus } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import { getFacture, createPaiement } from '../../api/facturationApi';
import type { Facture, Paiement } from '../../types';

const statutBadge: Record<Facture['statut_paiement'], string> = {
  'Impayée':  'badge-error',
  'Partielle':'badge-warning',
  'Payée':    'badge-success',
};

export default function FactureDetail() {
  const { id }                      = useParams();
  const navigate                    = useNavigate();
  const [facture, setFacture]       = useState<Facture | null>(null);
  const [loading, setLoading]       = useState(true);
  const [showPaiement, setShowPaiement] = useState(false);
  const [paiementForm, setPaiementForm] = useState({
    montant:       '',
    mode_paiement: 'Espèces' as Paiement['mode_paiement'],
    reference:     '',
    date_paiement: new Date().toISOString().split('T')[0],
  });
  const [savingPaiement, setSavingPaiement] = useState(false);
  const [erreur, setErreur]         = useState('');
  const [success, setSuccess]       = useState('');

  const chargerFacture = () => {
    getFacture(Number(id))
      .then(({ data }: { data: Facture }) => setFacture(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { chargerFacture(); }, [id]);

  // Enregistrer un paiement
  const handlePaiement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facture) return;
    setSavingPaiement(true);
    setErreur('');
    try {
      await createPaiement({
        facture:       facture.id,
        montant:       Number(paiementForm.montant),
        mode_paiement: paiementForm.mode_paiement,
        reference:     paiementForm.reference,
        date_paiement: paiementForm.date_paiement,
      });
      setSuccess('Paiement enregistré avec succès.');
      setShowPaiement(false);
      // Recharger la facture pour mettre à jour le statut
      chargerFacture();
      setTimeout(() => setSuccess(''), 2000);
    } catch {
      setErreur('Erreur lors de l\'enregistrement du paiement.');
    } finally {
      setSavingPaiement(false);
    }
  };

  if (loading) return (
    <Layout titre="Détail facture">
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    </Layout>
  );

  if (!facture) return (
    <Layout titre="Détail facture">
      <div className="alert alert-error">Facture introuvable.</div>
    </Layout>
  );

  return (
    <Layout titre="Détail facture">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/factures')} className="btn btn-ghost btn-sm gap-2">
            <ArrowLeft size={16} /> Retour
          </button>
          {/* Bouton paiement si facture non entièrement payée */}
          {facture.statut_paiement !== 'Payée' && (
            <button
              onClick={() => setShowPaiement(true)}
              className="btn btn-success btn-sm gap-2"
            >
              <Plus size={16} /> Enregistrer un paiement
            </button>
          )}
        </div>

        {success && <div className="alert alert-success"><span className="text-sm">{success}</span></div>}
        {erreur  && <div className="alert alert-error"><span className="text-sm">{erreur}</span></div>}

        {/* En-tête facture */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-[#1F3864] p-3 rounded-xl">
                  <Receipt className="text-white w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#1F3864] font-mono">
                    {facture.numero_facture}
                  </h2>
                  <p className="text-sm text-gray-500">Client : {facture.client_nom}</p>
                </div>
              </div>
              <span className={`badge ${statutBadge[facture.statut_paiement]}`}>
                {facture.statut_paiement}
              </span>
            </div>

            <div className="divider" />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-400 text-xs mb-1">Date facture</p>
                <p className="font-medium">
                  {new Date(facture.date_facture).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Échéance</p>
                <p className="font-medium">
                  {facture.date_echeance
                    ? new Date(facture.date_echeance).toLocaleDateString('fr-FR')
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Montant TTC</p>
                <p className="font-bold text-[#1F3864]">
                  {Number(facture.montant_ttc).toLocaleString('fr-FR')} FCFA
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Restant dû</p>
                <p className={`font-bold ${facture.montant_restant > 0 ? 'text-red-500' : 'text-green-600'}`}>
                  {facture.montant_restant.toLocaleString('fr-FR')} FCFA
                </p>
              </div>
            </div>

            {/* Barre de progression du paiement */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Progression du paiement</span>
                <span>
                  {Number(facture.montant_paye).toLocaleString('fr-FR')} /
                  {Number(facture.montant_ttc).toLocaleString('fr-FR')} FCFA
                </span>
              </div>
              <progress
                className="progress progress-success w-full"
                value={Number(facture.montant_paye)}
                max={Number(facture.montant_ttc)}
              />
            </div>
          </div>
        </div>

        {/* Lignes de facture */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="font-semibold text-[#1F3864] mb-4">Détail de la facture</h3>
            {facture.lignes.length === 0 ? (
              <p className="text-sm text-gray-400">Aucune ligne enregistrée.</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="table table-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th>Désignation</th>
                        <th className="text-center">Quantité</th>
                        <th className="text-right">Prix unitaire</th>
                        <th className="text-right">Sous-total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {facture.lignes.map(l => (
                        <tr key={l.id}>
                          <td className="text-sm">{l.designation}</td>
                          <td className="text-center text-sm">{l.quantite}</td>
                          <td className="text-right text-sm">
                            {Number(l.prix_unitaire).toLocaleString('fr-FR')} FCFA
                          </td>
                          <td className="text-right text-sm font-medium">
                            {Number(l.sous_total).toLocaleString('fr-FR')} FCFA
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totaux */}
                <div className="flex justify-end mt-4">
                  <div className="bg-gray-50 rounded-xl p-4 w-64 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Montant HT</span>
                      <span>{Number(facture.montant_ht).toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">TVA ({facture.taux_tva}%)</span>
                      <span>
                        {(Number(facture.montant_ttc) - Number(facture.montant_ht))
                          .toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                    <div className="divider my-1" />
                    <div className="flex justify-between font-bold text-[#1F3864]">
                      <span>Total TTC</span>
                      <span>{Number(facture.montant_ttc).toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Déjà payé</span>
                      <span>{Number(facture.montant_paye).toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <div className="flex justify-between font-bold text-red-500">
                      <span>Restant dû</span>
                      <span>{facture.montant_restant.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Modal paiement */}
      {showPaiement && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-[#1F3864] mb-4">
              Enregistrer un paiement
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Restant dû :{' '}
              <span className="font-bold text-red-500">
                {facture.montant_restant.toLocaleString('fr-FR')} FCFA
              </span>
            </p>

            <form onSubmit={handlePaiement} className="space-y-4">

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Montant *</span>
                </label>
                <input
                  type="number"
                  value={paiementForm.montant}
                  onChange={e => setPaiementForm(p => ({ ...p, montant: e.target.value }))}
                  className="input input-bordered w-full"
                  placeholder="Montant en FCFA"
                  max={facture.montant_restant}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Mode de paiement *</span>
                </label>
                <select
                  value={paiementForm.mode_paiement}
                  onChange={e => setPaiementForm(p => ({
                    ...p,
                    mode_paiement: e.target.value as Paiement['mode_paiement']
                  }))}
                  className="select select-bordered w-full"
                >
                  <option value="Espèces">Espèces</option>
                  <option value="Mobile Money">Mobile Money</option>
                  <option value="Virement">Virement</option>
                  <option value="Chèque">Chèque</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Date de paiement *</span>
                </label>
                <input
                  type="date"
                  value={paiementForm.date_paiement}
                  onChange={e => setPaiementForm(p => ({ ...p, date_paiement: e.target.value }))}
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Référence</span>
                </label>
                <input
                  type="text"
                  value={paiementForm.reference}
                  onChange={e => setPaiementForm(p => ({ ...p, reference: e.target.value }))}
                  className="input input-bordered w-full"
                  placeholder="N° transaction, reçu..."
                />
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowPaiement(false)}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-success btn-sm"
                  disabled={savingPaiement}
                >
                  {savingPaiement
                    ? <span className="loading loading-spinner loading-xs" />
                    : 'Confirmer le paiement'
                  }
                </button>
              </div>

            </form>
          </div>
          <div className="modal-backdrop" onClick={() => setShowPaiement(false)} />
        </div>
      )}

    </Layout>
  );
}