import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Wrench,
  Package, FileText, Receipt, Settings,
  LogOut, Thermometer, Menu, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

// Définition des items du menu avec les rôles autorisés
const menuItems = [
  {
    path:         '/dashboard',
    label:        'Tableau de bord',
    icon:         LayoutDashboard,
    rolesPermis:  ['admin','directeur','resp_technique','technicien','commercial','resp_stocks'],
  },
  {
    path:         '/clients',
    label:        'Clients',
    icon:         Users,
    rolesPermis:  ['admin','directeur','resp_technique','commercial'],
  },
  {
    path:         '/equipements',
    label:        'Équipements',
    icon:         Thermometer,
    rolesPermis:  ['admin','directeur','resp_technique','technicien','commercial'],
  },
  {
    path:         '/interventions',
    label:        'Interventions',
    icon:         Wrench,
    rolesPermis:  ['admin','directeur','resp_technique','technicien'],
  },
  {
    path:         '/stock',
    label:        'Stock',
    icon:         Package,
    rolesPermis:  ['admin','directeur','resp_stocks','resp_technique'],
  },
  {
    path:         '/devis',
    label:        'Devis',
    icon:         FileText,
    rolesPermis:  ['admin','directeur','commercial'],
  },
  {
    path:         '/factures',
    label:        'Factures',
    icon:         Receipt,
    rolesPermis:  ['admin','directeur','commercial'],
  },
  {
    path:         '/administration',
    label:        'Administration',
    icon:         Settings,
    rolesPermis:  ['admin'],
  },
];

export default function Sidebar() {
  const { signout, role }   = useAuth();
  const navigate            = useNavigate();
  const [ouvert, setOuvert] = useState(false);

  const handleLogout = () => {
    signout();
    navigate('/login');
  };

  // Filtrer les items selon le rôle connecté
  const itemsFiltres = menuItems.filter(item =>
    role && item.rolesPermis.includes(role)
  );

  const contenuMenu = (
    <div className="w-64 min-h-screen bg-[#1F3864] flex flex-col no-scrollbar">

      {/* Logo + bouton fermer (mobile) */}
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-lg">
            <Thermometer className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-white font-bold text-sm leading-tight">Business</h1>
            <h1 className="text-white font-bold text-sm leading-tight">Consulting</h1>
          </div>
        </div>
        <button
          className="lg:hidden text-white/60 hover:text-white"
          onClick={() => setOuvert(false)}
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {itemsFiltres.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            onClick={() => setOuvert(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-[#2E75B6] text-white font-medium shadow'
                  : 'text-blue-200 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Rôle + Déconnexion */}
      <div className="p-4 border-t border-white/10">
        <div className="mb-3 px-4">
          <span className="badge badge-info badge-sm capitalize">{role}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-all w-full"
        >
          <LogOut size={18} />
          Déconnexion
        </button>
      </div>

    </div>
  );

  return (
    <>
      {/* Bouton hamburger mobile */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 bg-[#1F3864] text-white p-2 rounded-lg shadow"
        onClick={() => setOuvert(true)}
      >
        <Menu size={20} />
      </button>

      {/* Sidebar desktop — toujours visible */}
      <div className="hidden lg:block">{contenuMenu}</div>

      {/* Sidebar mobile — overlay */}
      {ouvert && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="relative z-50">{contenuMenu}</div>
          {/* Fond sombre pour fermer */}
          <div
            className="flex-1 bg-black/50"
            onClick={() => setOuvert(false)}
          />
        </div>
      )}
    </>
  );
}