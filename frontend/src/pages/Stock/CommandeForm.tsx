import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import { getFournisseurs, getPieces, createCommande, createLigneCommande } from '../../api/stockApi';
import type { Fournisseur, Piece } from '../../types';

type LigneForm = {
  piece:              number;
  designation:        string;
  quantite_commandee: number;
  prix_unitaire_achat:number;
};

export default function CommandeForm() {
  const navigate                  = useNavigate();
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [pieces, setPieces]       = useState<Piece[]>([]);
  const [loading, setLoading]     = useState(false);
  const [erreur, setErreur]       = useState('');
  const [success, setSuccess]     = useState('');
  const [fournisseurId, setFournisseurId] = useState<number>(0);
  const [dateLivraison, setDateLivraison] = useState('');
  const [notes, setNotes]         = useState('');
  const [lignes, setLignes]       = useState<LigneForm[]>([
    { piece: 0, designation: '', quantite_commandee: 1, prix_unitaire_achat: 0 }
  ]);

  useEffect(() => {
    getFournisseurs().then(({ data }: { data: Fournisseur[] }) => setFournisseurs(data));
    getPieces().then(({ data }: { data: Piece[] }) => setPieces(data));
  }, []);

  const handleSelectPiece = (index: number, pieceId: number) => {
    const piece = pieces.find(p => p.id === pieceId);
    if (!piece) return;
    const nouvLignes = [...lignes];
    nouvLignes[index] = {
      piece:               piece.id,
      designation:         piece.designation,
      quantite_commandee:  nouvLignes[index].quantite_commandee,
      prix_unitaire_achat: Number(piece.prix_unitaire_achat),
    };
    setLignes(nouvLignes);
  };

  const handleLigneChange = (index: number, champ: keyof LigneForm, valeur: string | number) => {
    const nouvLignes = [...lignes];
    nouvLignes[index] = { ...nouvLignes[index], [champ]: valeur };
    setLignes(nouvLignes);
  };

  const montantTotal = lignes.reduce(
    (s, l) => s + l.quantite_commandee * l.prix_unitaire_achat, 0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fournisseurId === 0) { setErreur('Veuillez sélectionner un fournisseur.'); return; }
    if (lignes.some(l => l.piece === 0)) { setErreur('Sélectionnez une pièce pour chaque ligne.'); return; }
    setErreur('');
    setLoading(true);
    try {
      const numero = `BC-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
      const { data: commande } = await createCommande({
        fournisseur:          fournisseurId,
        numero_commande:      numero,
        date_livraison_prevue:dateLivraison || undefined,
        montant_total:        montantTotal,
        notes,
      });
      for (const ligne of lignes) {
        await createLigneCommande({
          commande:            commande.id,
          piece:               ligne.piece,
          quantite_commandee:  ligne.quantite_commandee,
          prix_unitaire_achat: ligne.prix_unitaire_achat,
        });
      }
      setSuccess('Bon de commande créé avec succès.');
      setTimeout(() => navigate(`/stock/commandes/${commande.id}`), 1000);
    } catch {
      setErreur('Erreur lors de la création du bon de commande.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout titre="Nouveau bon de commande">
      <div className="max-w-4xl mx-auto space-y-6">

        <button onClick={() => navigate('/stock/commandes')} className="btn btn-ghost btn-sm gap-2">
          <ArrowLeft size={16} /> Retour aux commandes
        </button>

        <form onSubmit={handleSubmit} className="space-y-6">

          {erreur  && <div className="alert alert-error"><span className="text-sm">{erreur}</span></div>}
          {success && <div className="alert alert-success"><span className="text-sm">{success}</span></div>}

          {/* Infos générales */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h3 className="card-title text-[#1F3864] mb-4">Informations de la commande</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                <div className="form-control sm:col-span-1">
                  <label className="label">
                    <span className="label-text font-medium">Fournisseur *</span>
                  </label>
                  <select
                    value={fournisseurId}
                    onChange={e => setFournisseurId(Number(e.target.value))}
                    className="select select-bordered w-full"
                    required
                  >
                    <option value={0} disabled>Sélectionner un fournisseur</option>
                    {(Array.isArray(fournisseurs)? fournisseurs :[]).map(f => (
                      <option key={f.id} value={f.id}>{f.nom_fournisseur}</option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Date livraison prévue</span>
                  </label>
                  <input
                    type="date"
                    value={dateLivraison}
                    onChange={e => setDateLivraison(e.target.value)}
                    className="input input-bordered w-full"
                  />
                </div>

                <div className="form-control sm:col-span-3">
                  <label className="label">
                    <span className="label-text font-medium">Notes</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="textarea textarea-bordered w-full"
                    rows={2}
                    placeholder="Remarques, conditions de livraison..."
                  />
                </div>

              </div>
            </div>
          </div>

          {/* Lignes de commande */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h3 className="card-title text-[#1F3864]">Pièces à commander</h3>
                <button
                  type="button"
                  onClick={() => setLignes(p => [...p, {
                    piece: 0, designation: '', quantite_commandee: 1, prix_unitaire_achat: 0
                  }])}
                  className="btn btn-outline btn-primary btn-sm gap-2"
                >
                  <Plus size={15} /> Ajouter
                </button>
              </div>

              <div className="space-y-3">
                {lignes.map((ligne, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end bg-gray-50 p-3 rounded-lg">

                    <div className="col-span-12 sm:col-span-5">
                      <label className="label py-1">
                        <span className="label-text text-xs font-medium">Pièce *</span>
                      </label>
                      <select
                        value={ligne.piece}
                        onChange={e => handleSelectPiece(index, Number(e.target.value))}
                        className="select select-bordered select-sm w-full"
                      >
                        <option value={0} disabled>Sélectionner</option>
                        {(Array.isArray(pieces)? pieces:[]).map(p => (
                          <option key={p.id} value={p.id}>
                            [{p.reference_piece}] {p.designation}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-4 sm:col-span-2">
                      <label className="label py-1">
                        <span className="label-text text-xs font-medium">Quantité</span>
                      </label>
                      <input
                        type="number"
                        value={ligne.quantite_commandee}
                        onChange={e => handleLigneChange(index, 'quantite_commandee', Number(e.target.value))}
                        className="input input-bordered input-sm w-full"
                        min={1}
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-4">
                      <label className="label py-1">
                        <span className="label-text text-xs font-medium">Prix unitaire (FCFA)</span>
                      </label>
                      <input
                        type="number"
                        value={ligne.prix_unitaire_achat}
                        onChange={e => handleLigneChange(index, 'prix_unitaire_achat', Number(e.target.value))}
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

                    <div className="col-span-12 text-right text-xs text-gray-400">
                      Sous-total : {(ligne.quantite_commandee * ligne.prix_unitaire_achat).toLocaleString('fr-FR')} FCFA
                    </div>

                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="flex justify-end mt-4">
                <div className="bg-gray-50 rounded-xl p-4 w-64 text-sm">
                  <div className="flex justify-between font-bold text-[#1F3864] text-base">
                    <span>Montant total</span>
                    <span>{montantTotal.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="btn btn-primary gap-2" disabled={loading}>
              {loading
                ? <span className="loading loading-spinner loading-sm" />
                : <><Save size={16} /> Créer le bon de commande</>
              }
            </button>
          </div>

        </form>
      </div>
    </Layout>
  );
}