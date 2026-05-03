import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Package } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import { getCommande, updateCommande, updateLigneCommande } from '../../api/stockApi';
import {type CommandeAchat } from '../../types';

const statutBadge: Record<CommandeAchat['statut_commande'], string> = {
  'En attente': 'badge-warning',
  'Confirmée':  'badge-info',
  'Livrée':     'badge-success',
  'Annulée':    'badge-error',
};

export default function CommandeDetail() {
  const { id }                          = useParams();
  const navigate                        = useNavigate();
  const [commande, setCommande]         = useState<CommandeAchat | null>(null);
  const [loading, setLoading]           = useState(true);
  const [qtesRecues, setQtesRecues]     = useState<Record<number, number>>({});
  const [saving, setSaving]             = useState(false);
  const [success, setSuccess]           = useState('');

  const chargerCommande = () => {
    getCommande(Number(id))
      .then(({ data }: { data: CommandeAchat }) => {
        setCommande(data);
        // Initialiser les quantités reçues
        const init: Record<number, number> = {};
        data.lignes.forEach(l => { init[l.id] = l.quantite_recue; });
        setQtesRecues(init);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { chargerCommande(); }, [id]);

  // Enregistrer la réception des marchandises
  const handleReception = async () => {
    if (!commande) return;
    setSaving(true);
    try {
      // Mettre à jour les quantités reçues de chaque ligne
      for (const ligne of commande.lignes) {
        await updateLigneCommande(ligne.id, {
          quantite_recue: qtesRecues[ligne.id] ?? ligne.quantite_recue,
        });
      }
      // Vérifier si toutes les lignes sont entièrement livrées
      const touteLivre = commande.lignes.every(
        l => (qtesRecues[l.id] ?? 0) >= l.quantite_commandee
      );
      if (touteLivre) {
        await updateCommande(commande.id, { statut_commande: 'Livrée' });
      } else {
        await updateCommande(commande.id, { statut_commande: 'Confirmée' });
      }
      setSuccess('Réception enregistrée. Le stock a été mis à jour automatiquement.');
      chargerCommande();
      setTimeout(() => setSuccess(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <Layout titre="Détail commande">
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    </Layout>
  );

  if (!commande) return (
    <Layout titre="Détail commande">
      <div className="alert alert-error">Commande introuvable.</div>
    </Layout>
  );

  return (
    <Layout titre="Détail commande">
      <div className="max-w-4xl mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/stock/commandes')} className="btn btn-ghost btn-sm gap-2">
            <ArrowLeft size={16} /> Retour aux commandes
          </button>
          {commande.statut_commande !== 'Livrée' && commande.statut_commande !== 'Annulée' && (
            <button
              onClick={handleReception}
              className="btn btn-success btn-sm gap-2"
              disabled={saving}
            >
              {saving
                ? <span className="loading loading-spinner loading-xs" />
                : <><CheckCircle size={16} /> Enregistrer la réception</>
              }
            </button>
          )}
        </div>

        {success && <div className="alert alert-success"><span className="text-sm">{success}</span></div>}

        {/* En-tête commande */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-[#1F3864] p-3 rounded-xl">
                  <Package className="text-white w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#1F3864] font-mono">
                    {commande.numero_commande}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Fournisseur : {commande.fournisseur_nom}
                  </p>
                </div>
              </div>
              <span className={`badge ${statutBadge[commande.statut_commande]}`}>
                {commande.statut_commande}
              </span>
            </div>

            <div className="divider" />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-400 text-xs mb-1">Date commande</p>
                <p className="font-medium">
                  {new Date(commande.date_commande).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Livraison prévue</p>
                <p className="font-medium">
                  {commande.date_livraison_prevue
                    ? new Date(commande.date_livraison_prevue).toLocaleDateString('fr-FR')
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Livraison réelle</p>
                <p className="font-medium">
                  {commande.date_livraison_reelle
                    ? new Date(commande.date_livraison_reelle).toLocaleDateString('fr-FR')
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Montant total</p>
                <p className="font-bold text-[#1F3864]">
                  {Number(commande.montant_total).toLocaleString('fr-FR')} FCFA
                </p>
              </div>
            </div>

            {commande.notes && (
              <>
                <div className="divider" />
                <p className="text-sm text-gray-500">{commande.notes}</p>
              </>
            )}
          </div>
        </div>

        {/* Lignes avec saisie des quantités reçues */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="font-semibold text-[#1F3864] mb-4">
              Lignes de commande — Réception
            </h3>
            <div className="overflow-x-auto">
              <table className="table">
                <thead className="bg-gray-50">
                  <tr>
                    <th>Désignation</th>
                    <th className="text-center">Qté commandée</th>
                    <th className="text-center">Qté reçue</th>
                    <th className="text-right">Prix unitaire</th>
                    <th className="text-right">Sous-total</th>
                    <th className="text-center">État</th>
                  </tr>
                </thead>
                <tbody>
                  {commande.lignes.map(ligne => {
                    const qteRecue = qtesRecues[ligne.id] ?? ligne.quantite_recue;
                    const complete  = qteRecue >= ligne.quantite_commandee;
                    return (
                      <tr key={ligne.id}>
                        <td className="text-sm">{ligne.piece_designation}</td>
                        <td className="text-center text-sm">{ligne.quantite_commandee}</td>
                        <td className="text-center">
                          {/* Saisie de la quantité reçue si pas encore livrée */}
                          {commande.statut_commande !== 'Livrée' ? (
                            <input
                              type="number"
                              value={qteRecue}
                              onChange={e => setQtesRecues(prev => ({
                                ...prev,
                                [ligne.id]: Number(e.target.value)
                              }))}
                              className="input input-bordered input-xs w-20 text-center"
                              min={0}
                              max={ligne.quantite_commandee}
                            />
                          ) : (
                            <span className="text-sm font-medium">{ligne.quantite_recue}</span>
                          )}
                        </td>
                        <td className="text-right text-sm">
                          {Number(ligne.prix_unitaire_achat).toLocaleString('fr-FR')} FCFA
                        </td>
                        <td className="text-right text-sm font-medium">
                          {(ligne.quantite_commandee * Number(ligne.prix_unitaire_achat))
                            .toLocaleString('fr-FR')} FCFA
                        </td>
                        <td className="text-center">
                          <span className={`badge badge-sm ${complete ? 'badge-success' : 'badge-warning'}`}>
                            {complete ? 'Complet' : 'Partiel'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}