import React, { useState, useEffect } from 'react';
import { X, Cloud, Link2, LogOut, CheckCircle, Shield } from 'lucide-react';
import { initSupabase, isSupabaseConfigured, disconnectSupabase, getSupabaseUrl } from '../services/supabaseClient';

interface CloudSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => void;
}

export const CloudSettings: React.FC<CloudSettingsProps> = ({ isOpen, onClose, onConnect }) => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsConnected(isSupabaseConfigured());
      setUrl(localStorage.getItem('supabase_url') || import.meta.env.VITE_SUPABASE_URL || '');
      setKey(localStorage.getItem('supabase_key') || import.meta.env.VITE_SUPABASE_KEY || '');
    }
  }, [isOpen]);

  const handleSave = () => {
    const success = initSupabase(url, key);
    if (success) {
      setIsConnected(true);
      onConnect();
      onClose();
    }
  };

  const handleDisconnect = () => {
    disconnectSupabase();
    setIsConnected(false);
    onClose();
    window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="bg-gradient-to-r from-brand-700 to-brand-500 p-5 flex justify-between items-center text-white">
          <h2 className="font-bold flex items-center gap-2.5 text-lg">
            <Cloud size={22} /> Cloud Sync
          </h2>
          <button onClick={onClose} className="hover:bg-white/15 p-1.5 rounded-full transition-colors"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-5">

          {isConnected ? (
            <div className="text-center py-4 space-y-5">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle size={32} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Connesso al Cloud</h3>
                <p className="text-sm text-slate-500 mt-1">I tuoi dati vengono sincronizzati automaticamente su Supabase.</p>
                <p className="text-xs text-slate-400 mt-2 font-mono break-all bg-slate-50 p-2 rounded-lg">{getSupabaseUrl()}</p>
              </div>
              <button
                onClick={handleDisconnect}
                className="px-5 py-2.5 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl text-sm font-semibold flex items-center gap-2 mx-auto transition-colors"
              >
                <LogOut size={16} /> Disconnetti
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl">
                <Shield size={18} className="text-brand-500 mt-0.5 shrink-0" />
                <p className="text-xs text-slate-500">
                  Inserisci le credenziali del tuo progetto Supabase per sincronizzare preventivi e clienti sul cloud.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Project URL</label>
                <input type="text" value={url} onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://xyz.supabase.co"
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/40 focus:outline-none focus:border-brand-400 text-sm transition-colors" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">API Key (anon)</label>
                <input type="password" value={key} onChange={(e) => setKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIs..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/40 focus:outline-none focus:border-brand-400 text-sm font-mono transition-colors" />
              </div>

              <button
                onClick={handleSave}
                className="w-full py-3 bg-gradient-to-r from-brand-500 to-brand-700 hover:shadow-lg hover:shadow-brand-500/25 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Link2 size={18} /> Connetti Database
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};