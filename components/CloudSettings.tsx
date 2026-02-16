import React, { useState, useEffect } from 'react';
import { X, Cloud, Link2, LogOut, CheckCircle } from 'lucide-react';
import { initSupabase, isSupabaseConfigured, disconnectSupabase, DEFAULT_URL, DEFAULT_KEY } from '../services/supabaseClient';

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
      // Use stored values, or fallback to the provided defaults so the input isn't empty
      setUrl(localStorage.getItem('supabase_url') || DEFAULT_URL);
      setKey(localStorage.getItem('supabase_key') || DEFAULT_KEY);
    }
  }, [isOpen]);

  const handleSave = () => {
    const success = initSupabase(url, key);
    if (success) {
      setIsConnected(true);
      onConnect();
      onClose();
    } else {
      alert("Configurazione non valida.");
    }
  };

  const handleDisconnect = () => {
    disconnectSupabase();
    setIsConnected(false);
    setUrl(DEFAULT_URL); // Reset to defaults on UI
    setKey(DEFAULT_KEY);
    onClose();
    window.location.reload(); // Reload to apply changes
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
          <h2 className="font-bold flex items-center gap-2">
            <Cloud size={20} className="text-odoo-400" /> Cloud Sync (Supabase)
          </h2>
          <button onClick={onClose} className="hover:bg-white/10 p-1 rounded-full"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-4">
          
          {isConnected ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={32} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Connesso al Cloud</h3>
                <p className="text-sm text-slate-500">I tuoi preventivi vengono salvati su Supabase.</p>
                <p className="text-xs text-slate-400 mt-1 font-mono break-all">{url}</p>
              </div>
              <button 
                onClick={handleDisconnect}
                className="px-4 py-2 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium flex items-center gap-2 mx-auto"
              >
                <LogOut size={16} /> Disconnetti
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-500 mb-4">
                Configurazione database Supabase.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Project URL</label>
                <input 
                  type="text" 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://xyz.supabase.co"
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-odoo-500 focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">API Key</label>
                <input 
                  type="password" 
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI..."
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-odoo-500 focus:outline-none text-sm font-mono"
                />
              </div>

              <div className="pt-2">
                <button 
                  onClick={handleSave}
                  className="w-full py-2.5 bg-odoo-600 hover:bg-odoo-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <Link2 size={18} /> Connetti Database
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};