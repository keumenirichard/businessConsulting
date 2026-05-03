import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import { createFacture, createLigneFacture } from '../../api/facturationApi';
import { getClients } from '../../api/clientsApi';
import { getPieces } from '../../api/stockApi';
import type { Client, Piece } from '../../types';

type LigneForm = {
  piece:         number;
  designation:   string;
  quantite:      number;
  prix_unitaire: number;
};

export default function FactureForm() {
  const navigate            = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [pieces, setPieces]   = useState<Piece[]>([]);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur]   = useState('');
  const [success, setSuccess] = useState('');

  const [clientId, setClientId]     = useState<number>(0);
  const [tva, setTva]               = useState(19.25);
  const [dateEcheance, setDateEcheance] = useState('');
  const [lignes, setLignes]         = useState<LigneForm[]>([
    { piece: 0, designation: '', quantite: 1, prix_unitaire: 0 }
  ]);

  useEffect(() => {
    getClients().then(({ data }: { data: Client[] }) => setClients(data));
    getPieces().then(({ data }: { data: Piece[] }) => setPieces(data));
  }, []);

  const handleSelectPiece = (index: number, pieceId: number) => {
    const piece = pieces.find(p => p.id === pieceId);
    if (!piece) return;
    const nouvLignes = [...lignes];
    nouvLignes[index] = {
      piece:         piece.id,
      designation:   piece.designation,
      quantite:      nouvLignes[index].quantite,
      prix_unitaire: Number(piece.prix_unitaire_vente),
    };
    setLignes(nouvLignes);
  };

  const handleLigneChange = (index: number, champ: keyof LigneForm, valeur: string | number) => {
    const nouvLignes = [...lignes];
    nouvLignes[index] = { ...nouvLignes[index], [champ]: valeur };
    setLignes(nouvLignes);
  };

  const montantHT  = lignes.reduce((s, l) => s + l.quantite * l.prix_unitaire, 0);
  const montantTTC = montantHT * (1 + tva / 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (clientId === 0) { setErreur('Veuillez sélectionner un client.'); return; }
    if (lignes.some(l => l.piece === 0)) { setErreur('Sélectionnez une pièce pour chaque ligne.'); return; }
    setErreur('');
    setLoading(true);
    try {
      const numero = `FAC-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
      const { data: facture } = await createFacture({
        client:         clientId,
        numero_facture: numero,
        montant_ht:     montantHT,
        taux_tva:       tva,
        date_echeance:  dateEcheance || undefined,
      });
      // Créer les lignes
      for (const ligne of lignes) {
        await createLigneFacture({
          facture:       facture.id,
          piece:         ligne.piece,
          designation:   ligne.designation,
          quantite:      ligne.quantite,
          prix_unitaire: ligne.prix_unitaire,
        });
      }
      setSuccess('Facture créée avec succès.');
      setTimeout(() => navigate(`/factures/${facture.id}`), 1000);
    } catch {
      setErreur('Erreur lors de la création de la facture.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout titre="Nouvelle facture">
      <div className="max-w-4xl mx-auto space-y-6">

        <button onClick={() => navigate('/factures')} className="btn btn-ghost btn-sm gap-2">
          <ArrowLeft size={16} /> Retour aux factures
        </button>

        <form onSubmit={handleSubmit} className="space-y-6">

          {erreur  && <div className="alert alert-error"><span className="text-sm">{erreur}</span></div>}
          {success && <div className="alert alert-success"><span className="text-sm">{success}</span></div>}

          {/* Infos générales */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h3 className="card-title text-[#1F3864] mb-4">Informations de la facture</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                <div className="form-control sm:col-span-1">
                  <label className="label">
                    <span className="label-text font-medium">Client *</span>
                  </label>
                  <select
                    value={clientId}
                    onChange={e => setClientId(Number(e.target.value))}
                    className="select select-bordered w-full"
                    required
                  >
                    <option value={0} disabled>Sélectionner un client</option>
                    {(Array.isArray(clients)? clients : []).map(c => (
                      <option key={c.id} value={c.id}>
                        {c.nom_client} {c.prenom_client}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">TVA (%)</span>
                  </label>
                  <input
                    type="number"
                    value={tva}
                    onChange={e => setTva(Number(e.target.value))}
                    className="input input-bordered w-full"
                    step="0.01" min={0}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Date d'échéance</span>
                  </label>
                  <input
                    type="date"
                    value={dateEcheance}
                    onChange={e => setDateEcheance(e.target.value)}
                    className="input input-bordered w-full"
                  />
                </div>

              </div>
            </div>
          </div>

          {/* Lignes */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h3 className="card-title text-[#1F3864]">Lignes de facturation</h3>
                <button
                  type="button"
                  onClick={() => setLignes(p => [...p, { piece:0, designation:'', quantite:1, prix_unitaire:0 }])}
                  className="btn btn-outline btn-primary btn-sm gap-2"
                >
                  <Plus size={15} /> Ajouter
                </button>
              </div>

              <div className="space-y-3">
                {(Array.isArray(lignes)? lignes : []).map((ligne, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end bg-gray-50 p-3 rounded-lg">

                    <div className="col-span-12 sm:col-span-4">
                      <label className="label py-1">
                        <span className="label-text text-xs font-medium">Pièce *</span>
                      </label>
                      <select
                        value={ligne.piece}
                        onChange={e => handleSelectPiece(index, Number(e.target.value))}
                        className="select select-bordered select-sm w-full"
                      >
                        <option value={0} disabled>Sélectionner</option>
                        {(Array.isArray(pieces)? pieces : []).map(p => (
                          <option key={p.id} value={p.id}>
                            [{p.reference_piece}] {p.designation}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-12 sm:col-span-3">
                      <label className="label py-1">
                        <span className="label-text text-xs font-medium">Désignation</span>
                      </label>
                      <input
                        type="text"
                        value={ligne.designation}
                        onChange={e => handleLigneChange(index, 'designation', e.target.value)}
                        className="input input-bordered input-sm w-full"
                      />
                    </div>

                    <div className="col-span-4 sm:col-span-2">
                      <label className="label py-1">
                        <span className="label-text text-xs font-medium">Qté</span>
                      </label>
                      <input
                        type="number"
                        value={ligne.quantite}
                        onChange={e => handleLigneChange(index, 'quantite', Number(e.target.value))}
                        className="input input-bordered input-sm w-full"
                        min={1}
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-2">
                      <label className="label py-1">
                        <span className="label-text text-xs font-medium">Prix unitaire</span>
                      </label>
                      <input
                        type="number"
                        value={ligne.prix_unitaire}
                        onChange={e => handleLigneChange(index, 'prix_unitaire', Number(e.target.value))}
                        className="input input-bordered input-sm w-full"
                        min={0}
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-1 flex justify-center">
                      <button
                        type="button"
                        onClick={() => setLignes(p => p.filter((_, i) => i !== index))}
                        className="btn btn-ghost btn-sm text-red-400"
                        disabled={lignes.length === 1}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="col-span-12 text-right text-xs text-gray-400 pr-2">
                      Sous-total : {(ligne.quantite * ligne.prix_unitaire).toLocaleString('fr-FR')} FCFA
                    </div>
                  </div>
                ))}
              </div>

              {/* Totaux */}
              <div className="flex justify-end mt-6">
                <div className="bg-gray-50 rounded-xl p-4 w-72 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Montant HT</span>
                    <span>{montantHT.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">TVA ({tva}%)</span>
                    <span>{(montantTTC - montantHT).toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="divider my-1" />
                  <div className="flex justify-between font-bold text-[#1F3864] text-base">
                    <span>Total TTC</span>
                    <span>{montantTTC.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="btn btn-primary gap-2" disabled={loading}>
              {loading
                ? <span className="loading loading-spinner loading-sm" />
                : <><Save size={16} /> Créer la facture</>
              }
            </button>
          </div>

        </form>
      </div>
    </Layout>
  );
}