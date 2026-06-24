import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Lock, Mail, Smartphone, ArrowRight, ShieldAlert } from 'lucide-react';
import API from '../../utils/axios';
import logoImg from '../../assets/cell-xchange-logo.jpeg';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await API.post('/auth/login', { email, password });
      login(res.data);
      navigate('/admin');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden font-sans">
      {/* Decorative gradient meshes */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] bg-emerald-900/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Glassmorphic Card */}
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-8 rounded-2xl shadow-2xl z-10 transition-all duration-300">
        {/* Branding header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <img src={logoImg} alt="Cell Xchange Logo" className="w-16 h-16 rounded-2xl object-cover mb-4 border border-slate-800 shadow-md" />
          <h2 className="text-2xl font-black text-white tracking-tight">Cell Xchange</h2>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">CMS, CRM & Billing Portal</p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 bg-rose-950/20 border border-rose-900/30 text-rose-400 p-3 rounded-lg text-xs mb-5">
            <ShieldAlert size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 tracking-wide block">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="e.g. admin@cellxchange.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white placeholder-slate-600 transition-all"
              />
              <Mail className="absolute left-3.5 top-3.5 text-slate-600" size={16} />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-300 tracking-wide">Password</label>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white placeholder-slate-600 transition-all"
              />
              <Lock className="absolute left-3.5 top-3.5 text-slate-600" size={16} />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-500 disabled:bg-primary-800/80 text-white font-bold py-2.5 rounded-lg text-sm transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-primary-950/20 mt-2"
          >
            {loading ? 'Signing you in...' : 'Sign In'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div className="mt-8 text-center text-[10px] text-slate-600 leading-normal">
          <p>© 2026 Cell Xchange. All rights reserved.</p>
          <p className="mt-1">Authorized store personnel only. Action logs are actively audited.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
