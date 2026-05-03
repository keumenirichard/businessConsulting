import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import { createDevis, updateDevis, getDevisById, createLigneDevis } from '../../api/facturationApi';
import { getClients } from '../../api/clientsApi';
import { getPieces } from '../../api/stockApi';
import type { Client, Piece, Devis } from '../../types';

type LigneForm = {
  piece:         number;
  designation:   string;
  quantite:      number;
  prix_unitaire: number;
};

export default function DevisForm() {
  const { id }            = useParams();
  const navigate          = useNavigate();
  const isEdit            = !!id;

  const [clients, setClients]   = useState<Client[]>([]);
  const [pieces, setPieces]     = useState<Piece[]>([]);
  const [loading, setLoading]   = useState(false);
  const [erreur, setErreur]     = useState('');
  const [success, setSuccess]   = useState('');

  // Champs du devis
  const [clientId, setClientId]       = useState<number>(0);
  const [validite, setValidite]       = useState(30);
  const [tva, setTva]                 = useState(19.25);
  const [notes, setNotes]             = useState('');
  const [lignes, setLignes]           = useState<LigneForm[]>([
    { piece: 0, designation: '', quantite: 1, prix_unitaire: 0 }
  ]);

  useEffect(() => {
    
    getClients().then(({ data }: { data: Client[] }) => setClients(data));
    getPieces().then(({ data }: { data: Piece[] }) => setPieces(data));
  }, []);

  // Pré-remplir en mode édition
  useEffect(() => {
    if (!isEdit) return;
    getDevisById(Number(id)).then(({ data: d }: { data: Devis }) => {
      setClientId(d.client);
      setValidite(d.validite_jours);
      setTva(Number(d.taux_tva));
      setNotes(d.notes || '');
      if (d.lignes.length > 0) {
        setLignes(d.lignes.map(l => ({
          piece:         l.piece,
          designation:   l.designation,
          quantite:      l.quantite,
          prix_unitaire: Number(l.prix_unitaire),
        })));
      }
    });
  }, [id, isEdit]);

  // Quand on choisit une pièce dans une ligne, pré-remplir le prix et la désignation
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

  const ajouterLigne = () => {
    setLignes(prev => [...prev, { piece: 0, designation: '', quantite: 1, prix_unitaire: 0 }]);
  };

  const supprimerLigne = (index: number) => {
    setLignes(prev => prev.filter((_, i) => i !== index));
  };

  // Calcul totaux
  const montantHT  = lignes.reduce((s, l) => s + (l.quantite * l.prix_unitaire), 0);
  const montantTTC = montantHT * (1 + tva / 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (clientId === 0) { setErreur('Veuillez sélectionner un client.'); return; }
    if (lignes.some(l => l.piece === 0)) { setErreur('Veuillez sélectionner une pièce pour chaque ligne.'); return; }
    setErreur('');
    setLoading(true);
    try {
      // Générer un numéro de devis automatique
      const numero = `DEV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
      let devisId: number;

      if (isEdit) {
        const { data: d } = await updateDevis(Number(id), {
          client:         clientId,
          validite_jours: validite,
          taux_tva:       tva,
          montant_ht:     montantHT,
          notes,
        });
        devisId = d.id;
      } else {
        const { data: d } = await createDevis({
          client:         clientId,
          numero_devis:   numero,
          validite_jours: validite,
          taux_tva:       tva,
          montant_ht:     montantHT,
          notes,
        });
        devisId = d.id;
        // Créer les lignes du devis
        for (const ligne of lignes) {
          await createLigneDevis({
            devis:         devisId,
            piece:         ligne.piece,
            designation:   ligne.designation,
            quantite:      ligne.quantite,
            prix_unitaire: ligne.prix_unitaire,
          });
        }
      }

      setSuccess('Devis enregistré avec succès.');
      setTimeout(() => navigate(`/devis/${devisId}`), 1000);
    } catch {
      setErreur('Erreur lors de l\'enregistrement. Vérifiez les informations.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout titre={isEdit ? 'Modifier le devis' : 'Nouveau devis'}>
      <div className="max-w-4xl mx-auto space-y-6">

        <button onClick={() => navigate('/devis')} className="btn btn-ghost btn-sm gap-2">
          <ArrowLeft size={16} /> Retour aux devis
        </button>

        <form onSubmit={handleSubmit} className="space-y-6">

          {erreur  && <div className="alert alert-error"><span className="text-sm">{erreur}</span></div>}
          {success && <div className="alert alert-success"><span className="text-sm">{success}</span></div>}

          {/* Infos générales */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h3 className="card-title text-[#1F3864] mb-4">Informations générales</h3>
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
                    {(Array.isArray(clients)?clients : []).map(c => (
                      <option key={c.id} value={c.id}>
                        {c.nom_client} {c.prenom_client}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Validité (jours)</span>
                  </label>
                  <input
                    type="number"
                    value={validite}
                    onChange={e => setValidite(Number(e.target.value))}
                    className="input input-bordered w-full"
                    min={1}
                  />
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
                    step="0.01"
                    min={0}
                  />
                </div>

              </div>

              <div className="form-control mt-2">
                <label className="label">
                  <span className="label-text font-medium">Notes / Conditions</span>
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="textarea textarea-bordered w-full"
                  rows={2}
                  placeholder="Conditions particulières, délais, remarques..."
                />
              </div>
            </div>
          </div>

          {/* Lignes du devis */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h3 className="card-title text-[#1F3864]">Lignes du devis</h3>
                <button
                  type="button"
                  onClick={ajouterLigne}
                  className="btn btn-outline btn-primary btn-sm gap-2"
                >
                  <Plus size={15} /> Ajouter une ligne
                </button>
              </div>

              <div className="space-y-3">
                {lignes.map((ligne, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end bg-gray-50 p-3 rounded-lg">

                    {/* Pièce */}
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

                    {/* Désignation */}
                    <div className="col-span-12 sm:col-span-3">
                      <label className="label py-1">
                        <span className="label-text text-xs font-medium">Désignation</span>
                      </label>
                      <input
                        type="text"
                        value={ligne.designation}
                        onChange={e => handleLigneChange(index, 'designation', e.target.value)}
                        className="input input-bordered input-sm w-full"
                        placeholder="Libellé affiché"
                      />
                    </div>

                    {/* Quantité */}
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

                    {/* Prix unitaire */}
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

                    {/* Supprimer */}
                    <div className="col-span-2 sm:col-span-1 flex justify-center">
                      <button
                        type="button"
                        onClick={() => supprimerLigne(index)}
                        className="btn btn-ghost btn-sm text-red-400"
                        disabled={lignes.length === 1}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {/* Sous-total de la ligne */}
                    <div className="col-span-12 text-right text-xs text-gray-500 pr-2">
                      Sous-total : {(ligne.quantite * ligne.prix_unitaire).toLocaleString('fr-FR')} FCFA
                    </div>

                  </div>
                ))}
              </div>

              {/* Récapitulatif totaux */}
              <div className="flex justify-end mt-6">
                <div className="bg-gray-50 rounded-xl p-4 w-72 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Montant HT</span>
                    <span className="font-medium">{montantHT.toLocaleString('fr-FR')} FCFA</span>
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

          {/* Bouton soumission */}
          <div className="flex justify-end">
            <button type="submit" className="btn btn-primary gap-2" disabled={loading}>
              {loading
                ? <span className="loading loading-spinner loading-sm" />
                : <><Save size={16} />{isEdit ? 'Enregistrer les modifications' : 'Créer le devis'}</>
              }
            </button>
          </div>

        </form>
      </div>
    </Layout>
  );
}