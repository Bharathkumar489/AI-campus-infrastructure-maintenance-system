import React, { useState } from 'react';
import { LogIn, User, Lock, Sparkles, CheckCircle, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/Modal';

export function LoginModal({ isOpen, onClose }) {
  const { login, switchRole, presetUsers } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      onClose();
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (roleKey) => {
    switchRole(roleKey);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Role-Aware System Authentication" maxWidth="max-w-md">
      <div className="space-y-5">
        
        {/* Subtitle */}
        <p className="text-xs text-slate-500">
          Sign in using your institutional credentials, or select a pre-configured role to inspect the system.
        </p>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Institutional Email
            </label>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs">
              <User className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="email"
                required
                placeholder="e.g. admin@campus.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent outline-none w-full text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs">
              <Lock className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="password"
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent outline-none w-full text-slate-800"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Authenticating...' : 'Sign In with Credentials'}
          </button>
        </form>

        {/* Quick Demo Accounts */}
        <div className="pt-4 border-t border-slate-200 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            1-Click Demo Personas (Role Switch):
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="p-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl text-left text-xs transition"
            >
              <div className="font-bold text-slate-900">Dr. Sarah (Admin)</div>
              <div className="text-[10px] text-slate-500">Facilities Lead</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('requester')}
              className="p-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl text-left text-xs transition"
            >
              <div className="font-bold text-slate-900">Rohan (Student)</div>
              <div className="text-[10px] text-slate-500">CSBS Requester</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('technician')}
              className="p-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl text-left text-xs transition"
            >
              <div className="font-bold text-slate-900">Rajesh (Field Tech)</div>
              <div className="text-[10px] text-slate-500">HVAC Specialist</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('management')}
              className="p-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl text-left text-xs transition"
            >
              <div className="font-bold text-slate-900">Dr. Ramanathan</div>
              <div className="text-[10px] text-slate-500">Campus Director</div>
            </button>
          </div>
        </div>

      </div>
    </Modal>
  );
}
