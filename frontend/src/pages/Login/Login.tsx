import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff, Thermometer, FishIcon} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { type AuthTokens } from '../../types';

export default function Login() {
  const [form, setForm]         = useState({ login: '', password: '' });
  const [erreur, setErreur]     = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate                = useNavigate();
  const { signin }              = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur('');
    setLoading(true);
    try {
      const { data } = await axios.post<AuthTokens>(
        'http://localhost:8000/api/login/',
        form
      );
      signin(data.login, data.role, data.access, data.refresh);
      navigate('/dashboard');
    } catch {
      setErreur('Identifiants incorrects. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#1F3864] to-[#2E75B6] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="bg-white/10 p-4 rounded-full">
              <FishIcon className="text-white w-10 h-10" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white"><span>Ets</span> Business Consulting</h1>
          <p className="text-blue-200 mt-1 text-sm">Système de Gestion Numérique</p>
        </div>

        {/* Card */}
        <div className="card bg-base-100 shadow-2xl">
          <div className="card-body p-8">
            <h2 className="card-title text-[#1F3864] text-xl mb-6 justify-center">
              Connexion
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Identifiant</span>
                </label>
                <input
                  type="text"
                  name="login"
                  value={form.login}
                  onChange={handleChange}
                  placeholder="Votre identifiant"
                  className="input input-bordered w-full focus:input-primary"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Mot de passe</span>
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="input input-bordered w-full focus:input-primary pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {erreur && (
                <div className="alert alert-error py-2">
                  <span className="text-sm">{erreur}</span>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary w-full mt-2"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <>
                    <LogIn size={18} />
                    Se connecter
                  </>
                )}
              </button>

            </form>
          </div>
        </div>

        <p className="text-center text-blue-200 text-xs mt-6">
          © 2026 Business Consulting — Tous droits réservés
        </p>
      </div>
    </div>
  );
}