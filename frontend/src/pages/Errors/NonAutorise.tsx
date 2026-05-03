import { useNavigate } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';

export default function NonAutorise() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-red-100 p-5 rounded-full">
            <ShieldOff className="text-red-500 w-12 h-12" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Accès refusé</h1>
        <p className="text-gray-500 mb-6 text-sm">
          Vous n'avez pas les droits nécessaires pour accéder à cette page.
        </p>
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary btn-sm">
          Retour au tableau de bord
        </button>
      </div>
    </div>
  );
}