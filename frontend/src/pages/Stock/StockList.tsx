import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, Plus, Search, AlertTriangle,
  CheckCircle, Pencil, Trash2, ShoppingCart
} from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import { useStock } from '../../hooks/useStock';
import { getPieces, deletePiece, updateStock } from '../../api/stockApi';
import type { Piece, Stock } from '../../types';

export default function StockList() {
  const { stocks, stocksEnAlerte, loading, erreur, fetchStocks } = useStock();
  const [recherche, setRecherche]       = useState('');
  const [filtreAlerte, setFiltreAlerte] = useState<'tous' | 'alerte' | 'ok'>('tous');
  const [onglet, setOnglet]             = useState<'stock' | 'pieces'>('stock');
  const [pieces, setPieces]             = useState<Piece[]>([]);
  const [loadingPieces, setLoadingPieces] = useState(false);
  const [pieceASupp, setPieceASupp]     = useState<Piece | null>(null);

  // Modal ajustement stock
  const [stockModal, setStockModal]     = useState<Stock | null>(null);
  const [nouvelleQte, setNouvelleQte]   = useState('');
  const [nouvelleLoc, setNouvelleLoc]   = useState('');
  const [savingStock, setSavingStock]   = useState(false);
  const [success, setSuccess]           = useState('');
  const navigate = useNavigate();

  // Charger les pièces quand on switch l'onglet
  const chargerPieces = () => {
    setLoadingPieces(true);
    getPieces()
      .then(response => setPieces(response.data))
      .finally(() => setLoadingPieces(false));
  };

  const handleOnglet = (o: 'stock' | 'pieces') => {
    setOnglet(o);
    if (o === 'pieces' && pieces.length === 0) chargerPieces();
  };

  // Supprimer une pièce
  const handleSupprimerPiece = async () => {
    if (!pieceASupp) return;
    await deletePiece(pieceASupp.id);
    setPieces(prev => prev.filter(p => p.id !== pieceASupp.id));
    setPieceASupp(null);
  };

  // Ajuster le stock manuellement
  const handleAjusterStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockModal) return;
    setSavingStock(true);
    try {
      await updateStock(stockModal.id, {
        quantite_en_stock: Number(nouvelleQte),
        localisation:      nouvelleLoc,
      });
      setSuccess('Stock mis à jour.');
      setStockModal(null);
      fetchStocks();
      setTimeout(() => setSuccess(''), 2000);
    } finally {
      setSavingStock(false);
    }
  };

  const ouvrirModalStock = (s: Stock) => {
    setStockModal(s);
    setNouvelleQte(String(s.quantite_en_stock));
    setNouvelleLoc(s.localisation || '');
  };

  // Filtrage du stock
  const stocksFiltres = (Array.isArray(stocks)? stocks :[]).filter(s => {
    const matchR =
      s.piece_designation.toLowerCase().includes(recherche.toLowerCase()) ||
      s.piece_reference.toLowerCase().includes(recherche.toLowerCase());
    const matchA =
      filtreAlerte === 'tous'   ? true :
      filtreAlerte === 'alerte' ? s.en_alerte : !s.en_alerte;
    return matchR && matchA;
  });

  // Filtrage des pièces
  const piecesFiltrees = (Array.isArray(pieces)? pieces :[]).filter(p =>
    p.designation.toLowerCase().includes(recherche.toLowerCase()) ||
    p.reference_piece.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <Layout titre="Gestion du Stock">
      <div className="space-y-6">

        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#1F3864] p-2 rounded-lg">
              <Package className="text-white w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Gestion du Stock</h3>
              <p className="text-sm text-gray-500">
                {stocksEnAlerte.length} alerte(s) en cours
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => navigate('/stock/pieces/nouveau')}
              className="btn btn-outline btn-primary btn-sm gap-2"
            >
              <Plus size={16} /> Nouvelle pièce
            </button>
            <button
              onClick={() => navigate('/stock/commandes')}
              className="btn btn-primary btn-sm gap-2"
            >
              <ShoppingCart size={16} /> Commandes
            </button>
          </div>
        </div>

        {success && <div className="alert alert-success"><span className="text-sm">{success}</span></div>}

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body p-4">
              <p className="text-xs text-gray-400">Total références</p>
              <p className="text-2xl font-bold text-[#1F3864]">{stocks.length}</p>
            </div>
          </div>
          <div className="card bg-red-50 shadow-sm border border-red-100">
            <div className="card-body p-4">
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertTriangle size={12} /> En alerte
              </p>
              <p className="text-2xl font-bold text-red-500">{stocksEnAlerte.length}</p>
            </div>
          </div>
          <div className="card bg-green-50 shadow-sm border border-green-100">
            <div className="card-body p-4">
              <p className="text-xs text-green-500 flex items-center gap-1">
                <CheckCircle size={12} /> Stock OK
              </p>
              <p className="text-2xl font-bold text-green-600">
                {(stocks.length - stocksEnAlerte.length)>0?(stocks.length - stocksEnAlerte.length):0}
              </p>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="tabs tabs-boxed bg-base-100 shadow-sm w-fit">
          <button
            className={`tab ${onglet === 'stock' ? 'tab-active' : ''}`}
            onClick={() => handleOnglet('stock')}
          >
            État du stock
          </button>
          <button
            className={`tab ${onglet === 'pieces' ? 'tab-active' : ''}`}
            onClick={() => handleOnglet('pieces')}
          >
            Catalogue pièces
          </button>
        </div>

        {/* Filtres */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <label className="input input-bordered flex items-center gap-2 flex-1">
                <Search size={16} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par référence ou désignation..."
                  value={recherche}
                  onChange={e => setRecherche(e.target.value)}
                  className="grow text-sm"
                />
              </label>
              {onglet === 'stock' && (
                <select
                  className="select select-bordered text-sm w-full sm:w-48"
                  value={filtreAlerte}
                  onChange={e => setFiltreAlerte(e.target.value as typeof filtreAlerte)}
                >
                  <option value="tous">Tous les stocks</option>
                  <option value="alerte">En alerte uniquement</option>
                  <option value="ok">Stock OK</option>
                </select>
              )}
            </div>
          </div>
        </div>

        {erreur && <div className="alert alert-error"><span>{erreur}</span></div>}

        {/* ── ONGLET STOCK ── */}
        {onglet === 'stock' && (
          <div className="card bg-base-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead className="bg-[#1F3864] text-white">
                  <tr>
                    <th>Référence</th>
                    <th>Désignation</th>
                    <th className="text-center">Qté dispo</th>
                    <th className="text-center">Réservée</th>
                    <th className="text-center">Seuil</th>
                    <th>Localisation</th>
                    <th className="text-center">État</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={8} className="text-center py-10">
                      <span className="loading loading-spinner loading-md text-primary" />
                    </td></tr>
                  ) : stocksFiltres.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-10 text-gray-400">
                      Aucun stock trouvé
                    </td></tr>
                  ) : (
                    stocksFiltres.map(s => (
                      <tr key={s.id} className={`hover ${s.en_alerte ? 'bg-red-50/40' : ''}`}>
                        <td className="text-sm font-mono">{s.piece_reference}</td>
                        <td className="text-sm">{s.piece_designation}</td>
                        <td className="text-center">
                          <span className={`font-bold text-sm ${s.en_alerte ? 'text-red-500' : 'text-green-600'}`}>
                            {s.quantite_disponible}
                          </span>
                        </td>
                        <td className="text-center text-sm text-gray-400">{s.quantite_reservee}</td>
                        <td className="text-center text-sm text-gray-400">{s.seuil_alerte}</td>
                        <td className="text-sm text-gray-500">{s.localisation || '—'}</td>
                        <td className="text-center">
                          {s.en_alerte ? (
                            <span className="badge badge-error badge-sm gap-1">
                              <AlertTriangle size={10} /> Alerte
                            </span>
                          ) : (
                            <span className="badge badge-success badge-sm gap-1">
                              <CheckCircle size={10} /> OK
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="flex justify-center">
                            <button
                              onClick={() => ouvrirModalStock(s)}
                              className="btn btn-ghost btn-xs text-yellow-500"
                              title="Ajuster le stock"
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
        )}

        {/* ── ONGLET PIECES ── */}
        {onglet === 'pieces' && (
          <div className="card bg-base-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead className="bg-[#1F3864] text-white">
                  <tr>
                    <th>Référence</th>
                    <th>Désignation</th>
                    <th>Catégorie</th>
                    <th>Unité</th>
                    <th className="text-right">Prix achat</th>
                    <th className="text-right">Prix vente</th>
                    <th className="text-center">Seuil</th>
                    <th className="text-center">Statut</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingPieces ? (
                    <tr><td colSpan={9} className="text-center py-10">
                      <span className="loading loading-spinner loading-md text-primary" />
                    </td></tr>
                  ) : piecesFiltrees.length === 0 ? (
                    <tr><td colSpan={9} className="text-center py-10 text-gray-400">
                      Aucune pièce trouvée
                    </td></tr>
                  ) : (
                    piecesFiltrees.map(p => (
                      <tr key={p.id} className="hover">
                        <td className="font-mono text-sm">{p.reference_piece}</td>
                        <td className="text-sm">{p.designation}</td>
                        <td className="text-sm text-gray-500">{p.categorie || '—'}</td>
                        <td className="text-sm">{p.unite}</td>
                        <td className="text-right text-sm">
                          {Number(p.prix_unitaire_achat).toLocaleString('fr-FR')} FCFA
                        </td>
                        <td className="text-right text-sm font-medium">
                          {Number(p.prix_unitaire_vente).toLocaleString('fr-FR')} FCFA
                        </td>
                        <td className="text-center text-sm">{p.seuil_alerte}</td>
                        <td className="text-center">
                          <span className={`badge badge-sm ${p.actif ? 'badge-success' : 'badge-ghost'}`}>
                            {p.actif ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="flex justify-center gap-1">
                            <button
                              onClick={() => navigate(`/stock/pieces/${p.id}/modifier`)}
                              className="btn btn-ghost btn-xs text-yellow-500"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => setPieceASupp(p)}
                              className="btn btn-ghost btn-xs text-red-500"
                            >
                              <Trash2 size={14} />
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
        )}

      </div>

      {/* Modal ajustement stock */}
      {stockModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-[#1F3864] mb-1">Ajuster le stock</h3>
            <p className="text-sm text-gray-500 mb-4">{stockModal.piece_designation}</p>
            <form onSubmit={handleAjusterStock} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Nouvelle quantité *</span>
                </label>
                <input
                  type="number"
                  value={nouvelleQte}
                  onChange={e => setNouvelleQte(e.target.value)}
                  className="input input-bordered w-full"
                  min={0}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Localisation</span>
                </label>
                <input
                  type="text"
                  value={nouvelleLoc}
                  onChange={e => setNouvelleLoc(e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="Zone A, Étagère 3..."
                />
              </div>
              <div className="modal-action">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStockModal(null)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={savingStock}>
                  {savingStock ? <span className="loading loading-spinner loading-xs" /> : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={() => setStockModal(null)} />
        </div>
      )}

      {/* Modal suppression pièce */}
      {pieceASupp && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-red-500">Confirmer la suppression</h3>
            <p className="py-4 text-sm text-gray-600">
              Supprimer la pièce{' '}
              <span className="font-semibold">{pieceASupp.designation}</span> ?
            </p>
            <div className="modal-action">
              <button className="btn btn-ghost btn-sm" onClick={() => setPieceASupp(null)}>
                Annuler
              </button>
              <button className="btn btn-error btn-sm" onClick={handleSupprimerPiece}>
                Supprimer
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setPieceASupp(null)} />
        </div>
      )}

    </Layout>
  );
}