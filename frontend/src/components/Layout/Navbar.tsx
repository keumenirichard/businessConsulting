import { Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  titre: string;
}

export default function Navbar({ titre }: NavbarProps) {
  const { login, role } = useAuth();

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">

      {/* Titre page */}
      <h2 className="text-lg font-semibold text-[#1F3864]">{titre}</h2>

      {/* Droite */}
      <div className="flex items-center gap-4">

        {/* Notifications */}
        <div className="indicator">
          <span className="indicator-item badge badge-error badge-xs"></span>
          <button className="btn btn-ghost btn-circle btn-sm">
            <Bell size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Profil */}
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-lg transition"
          >
            <div className="avatar placeholder">
              <div className="bg-[#2E75B6] text-white rounded-full w-8 text-center">
                <span className="text-xs text-center">
                  {login?.charAt(0).toUpperCase()}
                  {/* <User size={18}/> */}
                </span>
              </div>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-700">{login}</p>
              <p className="text-xs text-gray-400 capitalize">{role}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}