import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, FileText, CheckCircle } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import { getDevisById, convertirEnFacture, updateDevis } from '../../api/facturationApi';
import {type Devis } from '../../types';

const statutBadge: Record<Devis['statut_devis'], string> = {
  'Brouillon': 'badge-ghost',
  'Envoyé':    'badge-info',
  'Accepté':   'badge-success',
  'Refusé':    'badge-error',
  'Expiré':    'badge-warning',
};

export default function DevisDetail() {
  const { id }                    = useParams();
  const navigate                  = useNavigate();
  const [devis, setDevis]         = useState<Devis | null>(null);
  const [loading, setLoading]     = useState(true);
  const [converting, setConverting] = useState(false);
  const [success, setSuccess]     = useState('');
  const [erreur, setErreur]       = useState('');

  useEffect(() => {
    getDevisById(Number(id))
      .then(({ data }: { data: Devis }) => setDevis(data))
      .finally(() => setLoading(false));
  }, [id]);

  // Changer le statut du devis
  const changerStatut = async (statut: Devis['statut_devis']) => {
    if (!devis) return;
    const { data: updated } = await updateDevis(devis.id, { statut_devis: statut });
    setDevis(updated);
    setSuccess(`Statut mis à jour : ${statut}`);
    setTimeout(() => setSuccess(''), 2000);
  };

  // Convertir en facture
  const handleConvertir = async () => {
    if (!devis) return;
    setConverting(true);
    setErreur('');
    try {
      await convertirEnFacture(devis.id);
      navigate('/factures');
    } catch {
      setErreur('Impossible de convertir. Vérifiez que le devis est bien accepté.');
    } finally {
      setConverting(false);
    }
  };

  if (loading) return (
    <Layout titre="Détail devis">
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    </Layout>
  );

  if (!devis) return (
    <Layout titre="Détail devis">
      <div className="alert alert-error">Devis introuvable.</div>
    </Layout>
  );

  return (
    <Layout titre="Détail devis">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/devis')} className="btn btn-ghost btn-sm gap-2">
            <ArrowLeft size={16} /> Retour
          </button>
          <div className="flex gap-2">
            {/* Changer statut */}
            {devis.statut_devis === 'Brouillon' && (
              <button
                onClick={() => changerStatut('Envoyé')}
                className="btn btn-info btn-sm"
              >
                Marquer Envoyé
              </button>
            )}
            {devis.statut_devis === 'Envoyé' && (
              <>
                <button
                  onClick={() => changerStatut('Accepté')}
                  className="btn btn-success btn-sm"
                >
                  Accepté
                </button>
                <button
                  onClick={() => changerStatut('Refusé')}
                  className="btn btn-error btn-sm"
                >
                  Refusé
                </button>
              </>
            )}
            {/* Convertir en facture si accepté */}
            {devis.statut_devis === 'Accepté' && (
              <button
                onClick={handleConvertir}
                className="btn btn-success btn-sm gap-2"
                disabled={converting}
              >
                {converting
                  ? <span className="loading loading-spinner loading-xs" />
                  : <><CheckCircle size={15} /> Convertir en facture</>
                }
              </button>
            )}
            <button
              onClick={() => navigate(`/devis/${id}/modifier`)}
              className="btn btn-warning btn-sm gap-2"
            >
              <Pencil size={16} /> Modifier
            </button>
          </div>
        </div>

        {success && <div className="alert alert-success"><span className="text-sm">{success}</span></div>}
        {erreur  && <div className="alert alert-error"><span className="text-sm">{erreur}</span></div>}

        {/* En-tête devis */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-[#1F3864] p-3 rounded-xl">
                  <FileText className="text-white w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#1F3864] font-mono">
                    {devis.numero_devis}
                  </h2>
                  <p className="text-sm text-gray-500">Client : {devis.client_nom}</p>
                </div>
              </div>
              <span className={`badge ${statutBadge[devis.statut_devis]}`}>
                {devis.statut_devis}
              </span>
            </div>

            <div className="divider" />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-400 text-xs mb-1">Date du devis</p>
                <p className="font-medium">
                  {new Date(devis.date_devis).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Validité</p>
                <p className="font-medium">{devis.validite_jours} jours</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">TVA</p>
                <p className="font-medium">{devis.taux_tva}%</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Montant TTC</p>
                <p className="font-bold text-[#1F3864] text-base">
                  {Number(devis.montant_ttc).toLocaleString('fr-FR')} FCFA
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lignes du devis */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="font-semibold text-[#1F3864] mb-4">Lignes du devis</h3>
            {devis.lignes.length === 0 ? (
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
                      {devis.lignes.map(l => (
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
                      <span>{Number(devis.montant_ht).toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">TVA ({devis.taux_tva}%)</span>
                      <span>
                        {(Number(devis.montant_ttc) - Number(devis.montant_ht))
                          .toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                    <div className="divider my-1" />
                    <div className="flex justify-between font-bold text-[#1F3864]">
                      <span>Total TTC</span>
                      <span>{Number(devis.montant_ttc).toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Notes */}
        {devis.notes && (
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h3 className="font-semibold text-[#1F3864] mb-2">Notes</h3>
              <p className="text-sm text-gray-600">{devis.notes}</p>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}