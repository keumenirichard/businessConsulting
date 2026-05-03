import { useNavigate } from 'react-router-dom';
import { SearchX } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-blue-100 p-5 rounded-full">
            <SearchX className="text-[#2E75B6] w-12 h-12" />
          </div>
        </div>
        <h1 className="text-6xl font-bold text-[#1F3864] mb-2">404</h1>
        <p className="text-gray-500 mb-6 text-sm">Page introuvable.</p>
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary btn-sm">
          Retour au tableau de bord
        </button>
      </div>
    </div>
  );
}