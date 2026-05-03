import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Eye, Pencil, Trash2, Users } from "lucide-react";
import Layout from "../../components/Layout/Layout";
import { useClients } from "../../hooks/useClients";
import { type Client } from "../../types";

export default function ClientsList() {
  const { clients, loading, erreur, supprimerClient } = useClients();
  const [recherche, setRecherche] = useState("");
  const [filtre, setFiltre] = useState<"tous" | "Particulier" | "Entreprise">(
    "tous",
  );
  const [clientASupprimer, setClientASupprimer] = useState<Client | null>(null);
  const navigate = useNavigate();

  const clientsFiltres = (Array.isArray(clients) ? clients : []).filter((c) => {
    const matchRecherche =
      c.nom_client.toLowerCase().includes(recherche.toLowerCase()) ||
      c.telephone.includes(recherche) ||
      (c.email?.toLowerCase().includes(recherche.toLowerCase()) ?? false);
    const matchFiltre = filtre === "tous" || c.type_client === filtre;
    return matchRecherche && matchFiltre;
  });

  const confirmerSuppression = async () => {
    if (clientASupprimer) {
      await supprimerClient(clientASupprimer.id);
      setClientASupprimer(null);
    }
  };
  console.log(clientsFiltres.length);
  return (
    <Layout titre="Clients">
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#1F3864] p-2 rounded-lg">
              <Users className="text-white w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Liste des clients</h3>
              <p className="text-sm text-gray-500">
                {clients.length > 0 ? clients.length : 0} client(s)
                enregistré(s)
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/clients/nouveau")}
            className="btn btn-primary btn-sm gap-2"
          >
            <Plus size={16} />
            Nouveau client
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
                  placeholder="Rechercher par nom, téléphone, email..."
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  className="grow text-sm"
                />
              </label>
              <select
                className="select select-bordered text-sm w-full sm:w-48"
                value={filtre}
                onChange={(e) => setFiltre(e.target.value as typeof filtre)}
              >
                <option value="tous">Tous les types</option>
                <option value="Particulier">Particulier</option>
                <option value="Entreprise">Entreprise</option>
              </select>
            </div>
          </div>
        </div>

        {/* Erreur */}
        {erreur && (
          <div className="alert alert-error">
            <span>{erreur}</span>
          </div>
        )}

        {/* Tableau */}
        <div className="card bg-base-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead className="bg-[#1F3864] text-white">
                <tr>
                  <th>Nom complet</th>
                  <th>Type</th>
                  <th>Téléphone</th>
                  <th>Email</th>
                  <th>Statut</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10">
                      <span className="loading loading-spinner loading-md text-primary" />
                    </td>
                  </tr>
                ) : clientsFiltres.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-400">
                      Aucun client trouvé
                    </td>
                  </tr>
                ) : (
                  clientsFiltres.map((client) => (
                    <tr key={client.id} className="hover">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar placeholder">
                            <div className="bg-[#2E75B6]/10 text-[#2E75B6] rounded-full w-9">
                              <span className="text-sm font-bold">
                                {client.nom_client.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {client.nom_client} {client.prenom_client}
                            </p>
                            <p className="text-xs text-gray-400">
                              Depuis le{" "}
                              {new Date(
                                client.date_creation,
                              ).toLocaleDateString("fr-FR")}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge badge-sm ${
                            client.type_client === "Entreprise"
                              ? "badge-primary"
                              : "badge-ghost"
                          }`}
                        >
                          {client.type_client}
                        </span>
                      </td>
                      <td className="text-sm">{client.telephone}</td>
                      <td className="text-sm text-gray-500">
                        {client.email || "—"}
                      </td>
                      <td>
                        <span
                          className={`badge badge-sm ${
                            client.actif ? "badge-success" : "badge-error"
                          }`}
                        >
                          {client.actif ? "Actif" : "Inactif"}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => navigate(`/clients/${client.id}`)}
                            className="btn btn-ghost btn-xs text-blue-500"
                            title="Voir"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/clients/${client.id}/modifier`)
                            }
                            className="btn btn-ghost btn-xs text-yellow-500"
                            title="Modifier"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setClientASupprimer(client)}
                            className="btn btn-ghost btn-xs text-red-500"
                            title="Désactiver"
                          >
                            <Trash2 size={15} />
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
      </div>

      {/* Modal confirmation suppression */}
      {clientASupprimer && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-red-500">
              Confirmer la désactivation
            </h3>
            <p className="py-4 text-sm text-gray-600">
              Voulez-vous désactiver le client{" "}
              <span className="font-semibold">
                {clientASupprimer.nom_client}
              </span>{" "}
              ? Il ne sera plus visible mais ses données seront conservées.
            </p>
            <div className="modal-action">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setClientASupprimer(null)}
              >
                Annuler
              </button>
              <button
                className="btn btn-error btn-sm"
                onClick={confirmerSuppression}
              >
                Supprimer
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setClientASupprimer(null)}
          />
        </div>
      )}
    </Layout>
  );
}
