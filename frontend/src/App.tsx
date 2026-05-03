import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/Layout/PrivateRoute';

import Login              from './pages/Login/Login';
import Dashboard          from './pages/Dashboard/Dashboard';
import NotFound           from './pages/Errors/NotFound';
import NonAutorise        from './pages/Errors/NonAutorise';

import ClientsList        from './pages/Clients/ClientsList';
import ClientForm         from './pages/Clients/ClientForm';
import ClientDetail       from './pages/Clients/ClientDetail';

import EquipementsList    from './pages/Equipements/EquipementsList';
import EquipementForm     from './pages/Equipements/EquipementForm';
import EquipementDetail   from './pages/Equipements/EquipementDetail';

import InterventionsList  from './pages/Interventions/InterventionsList';
import InterventionForm   from './pages/Interventions/InterventionForm';
import InterventionDetail from './pages/Interventions/InterventionDetail';
import TechniciensList    from './pages/Interventions/TechniciensList';

import StockList          from './pages/Stock/StockList';
import PieceForm          from './pages/Stock/PieceForm';
import CommandesList      from './pages/Stock/CommandesList';
import CommandeDetail     from './pages/Stock/CommandeDetail';
import CommandeForm       from './pages/Stock/CommandeForm';
import FournisseursList   from './pages/Stock/FournisseursList';

import DevisList          from './pages/Devis/DevisList';
import DevisDetail        from './pages/Devis/DevisDetail';
import DevisForm          from './pages/Devis/DevisForm';

import FacturesList       from './pages/Factures/FacturesList';
import FactureDetail      from './pages/Factures/FactureDetail';
import FactureForm        from './pages/Factures/FactureForm';

import Administration     from './pages/Administration/Administration';

// Wrapper avec protection par rôle
const PR = ({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: string[];
}) => <PrivateRoute rolesPermis={roles}>{children}</PrivateRoute>;

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Publiques */}
          <Route path="/"             element={<Navigate to="/login" />} />
          <Route path="/login"        element={<Login />} />
          <Route path="/non-autorise" element={<NonAutorise />} />
          <Route path="*"             element={<NotFound />} />

          {/* Dashboard — tous les rôles */}
          <Route path="/dashboard" element={<PR><Dashboard /></PR>} />

          {/* Clients — commercial et plus */}
          <Route path="/clients"              element={<PR roles={['admin','directeur','resp_technique','commercial']}><ClientsList /></PR>} />
          <Route path="/clients/nouveau"      element={<PR roles={['admin','directeur','commercial']}><ClientForm /></PR>} />
          <Route path="/clients/:id"          element={<PR roles={['admin','directeur','resp_technique','commercial']}><ClientDetail /></PR>} />
          <Route path="/clients/:id/modifier" element={<PR roles={['admin','directeur','commercial']}><ClientForm /></PR>} />

          {/* Équipements */}
          <Route path="/equipements"              element={<PR><EquipementsList /></PR>} />
          <Route path="/equipements/nouveau"      element={<PR roles={['admin','directeur','resp_technique']}><EquipementForm /></PR>} />
          <Route path="/equipements/:id"          element={<PR><EquipementDetail /></PR>} />
          <Route path="/equipements/:id/modifier" element={<PR roles={['admin','directeur','resp_technique']}><EquipementForm /></PR>} />

          {/* Interventions */}
          <Route path="/interventions"              element={<PR><InterventionsList /></PR>} />
          <Route path="/interventions/nouveau"      element={<PR roles={['admin','directeur','resp_technique']}><InterventionForm /></PR>} />
          <Route path="/interventions/:id"          element={<PR><InterventionDetail /></PR>} />
          <Route path="/interventions/:id/modifier" element={<PR roles={['admin','directeur','resp_technique']}><InterventionForm /></PR>} />

          {/* Techniciens */}
          <Route path="/techniciens" element={<PR roles={['admin','directeur','resp_technique']}><TechniciensList /></PR>} />

          {/* Stock */}
          <Route path="/stock"                     element={<PR roles={['admin','directeur','resp_stocks','resp_technique']}><StockList /></PR>} />
          <Route path="/stock/pieces/nouveau"      element={<PR roles={['admin','resp_stocks']}><PieceForm /></PR>} />
          <Route path="/stock/pieces/:id/modifier" element={<PR roles={['admin','resp_stocks']}><PieceForm /></PR>} />
          <Route path="/stock/commandes"           element={<PR roles={['admin','directeur','resp_stocks']}><CommandesList /></PR>} />
          <Route path="/stock/commandes/nouveau"   element={<PR roles={['admin','resp_stocks']}><CommandeForm /></PR>} />
          <Route path="/stock/commandes/:id"       element={<PR roles={['admin','directeur','resp_stocks']}><CommandeDetail /></PR>} />
          <Route path="/stock/fournisseurs"        element={<PR roles={['admin','directeur','resp_stocks']}><FournisseursList /></PR>} />

          {/* Devis */}
          <Route path="/devis"              element={<PR roles={['admin','directeur','commercial']}><DevisList /></PR>} />
          <Route path="/devis/nouveau"      element={<PR roles={['admin','commercial']}><DevisForm /></PR>} />
          <Route path="/devis/:id"          element={<PR roles={['admin','directeur','commercial']}><DevisDetail /></PR>} />
          <Route path="/devis/:id/modifier" element={<PR roles={['admin','commercial']}><DevisForm /></PR>} />

          {/* Factures */}
          <Route path="/factures"        element={<PR roles={['admin','directeur','commercial']}><FacturesList /></PR>} />
          <Route path="/factures/nouveau" element={<PR roles={['admin','commercial']}><FactureForm /></PR>} />
          <Route path="/factures/:id"    element={<PR roles={['admin','directeur','commercial']}><FactureDetail /></PR>} />

          {/* Administration — admin uniquement */}
          <Route path="/administration" element={<PR roles={['admin']}><Administration /></PR>} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;