import { useState, useEffect } from 'react';
import { PackagePlus, X } from 'lucide-react';
import { createUtilisationPiece, deleteUtilisationPiece } from '../../api/interventionsApi';
import { getPieces } from '../../api/stockApi';
import type { Piece, UtilisationPiece } from '../../types';

interface Props {
  interventionId:  number;
  piecesUtilisees: UtilisationPiece[];
  onUpdate:        () => void;
}

export default function UtilisationPieceForm({ interventionId, piecesUtilisees, onUpdate }: Props) {
  const [pieces, setPieces]   = useState<Piece[]>([]);
  const [pieceId, setPieceId] = useState<number>(0);
  const [qte, setQte]         = useState(1);
  const [prix, setPrix]       = useState(0);
  const [saving, setSaving]   = useState(false);
  const [erreur, setErreur]   = useState('');

  useEffect(() => {
    getPieces().then(({ data }: { data: Piece[] }) => setPieces(data));
  }, []);

  const dejUtilisees = piecesUtilisees.map(p => p.piece);

  // Pré-remplir le prix quand on sélectionne une pièce
  const handleSelectPiece = (id: number) => {
    setPieceId(id);
    const piece = pieces.find(p => p.id === id);
    if (piece) setPrix(Number(piece.prix_unitaire_vente));
  };

  const handleAjouter = async () => {
    if (pieceId === 0) return;
    if (dejUtilisees.includes(pieceId)) {
      setErreur('Cette pièce est déjà enregistrée pour cette intervention.');
      return;
    }
    setSaving(true);
    setErreur('');
    try {
      await createUtilisationPiece({
        intervention:          interventionId,
        piece:                 pieceId,
        quantite_utilisee:     qte,
        prix_unitaire_applique:prix,
      });
      setPieceId(0);
      setQte(1);
      setPrix(0);
      onUpdate();
    } catch {
      setErreur('Erreur lors de l\'ajout de la pièce.');
    } finally {
      setSaving(false);
    }
  };

  const handleSupprimer = async (id: number) => {
    await deleteUtilisationPiece(id);
    onUpdate();
  };

  return (
    <div className="space-y-4">

      {/* Liste des pièces utilisées */}
      {piecesUtilisees.length > 0 && (
        <table className="table table-sm">
          <thead>
            <tr>
              <th>Pièce</th>
              <th className="text-center">Qté</th>
              <th className="text-right">Prix unitaire</th>
              <th className="text-right">Sous-total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {piecesUtilisees.map(p => (
              <tr key={p.id}>
                <td className="text-sm">{p.piece_designation}</td>
                <td className="text-center text-sm">{p.quantite_utilisee}</td>
                <td className="text-right text-sm">
                  {Number(p.prix_unitaire_applique).toLocaleString('fr-FR')} FCFA
                </td>
                <td className="text-right text-sm font-medium">
                  {(p.quantite_utilisee * Number(p.prix_unitaire_applique)).toLocaleString('fr-FR')} FCFA
                </td>
                <td>
                  <button
                    onClick={() => handleSupprimer(p.id)}
                    className="btn btn-ghost btn-xs text-red-400"
                  >
                    <X size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {erreur && <p className="text-red-500 text-xs">{erreur}</p>}

      {/* Formulaire d'ajout */}
      <div className="grid grid-cols-12 gap-2 items-end bg-blue-50 p-3 rounded-lg">
        <div className="col-span-12 sm:col-span-5">
          <label className="label py-1">
            <span className="label-text text-xs font-medium">Pièce</span>
          </label>
          <select
            value={pieceId}
            onChange={e => handleSelectPiece(Number(e.target.value))}
            className="select select-bordered select-sm w-full"
          >
            <option value={0} disabled>Sélectionner une pièce</option>
            {pieces
              .filter(p => !dejUtilisees.includes(p.id))
              .map(p => (
                <option key={p.id} value={p.id}>
                  [{p.reference_piece}] {p.designation}
                </option>
              ))
            }
          </select>
        </div>
        <div className="col-span-4 sm:col-span-2">
          <label className="label py-1">
            <span className="label-text text-xs font-medium">Quantité</span>
          </label>
          <input
            type="number"
            value={qte}
            onChange={e => setQte(Number(e.target.value))}
            className="input input-bordered input-sm w-full"
            min={1}
          />
        </div>
        <div className="col-span-6 sm:col-span-3">
          <label className="label py-1">
            <span className="label-text text-xs font-medium">Prix appliqué</span>
          </label>
          <input
            type="number"
            value={prix}
            onChange={e => setPrix(Number(e.target.value))}
            className="input input-bordered input-sm w-full"
            min={0}
          />
        </div>
        <div className="col-span-6 sm:col-span-2">
          <button
            type="button"
            onClick={handleAjouter}
            className="btn btn-primary btn-sm w-full gap-1"
            disabled={saving || pieceId === 0}
          >
            {saving
              ? <span className="loading loading-spinner loading-xs" />
              : <><PackagePlus size={14} /> Ajouter</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}