import React, { useState } from 'react';
import { SavedClient } from '../types';
import { User, Building2, MapPin, Trash2, Plus, Search, Loader2, Mail, FileText, Phone } from 'lucide-react';
import { cloudSaveClient, cloudDeleteClient } from '../services/supabaseClient';
import { ConfirmDialog } from './ui/ConfirmDialog';

interface ClientsPanelProps {
  clients: SavedClient[];
  onRefresh: () => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  onSelect?: (client: SavedClient) => void;
  selectionMode?: boolean;
}

export const ClientsPanel: React.FC<ClientsPanelProps> = ({ clients, onRefresh, showToast, onSelect, selectionMode = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const [newClient, setNewClient] = useState<Partial<SavedClient>>({
    name: '', company: '', email: '', address: '', vatId: '', phone: ''
  });

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async () => {
    if (!newClient.name && !newClient.company) {
      showToast("Inserisci almeno un Nome o una Ragione Sociale.", 'warning');
      return;
    }
    setIsSaving(true);
    try {
      await cloudSaveClient(newClient);
      onRefresh();
      setIsCreating(false);
      setNewClient({ name: '', company: '', email: '', address: '', vatId: '', phone: '' });
      showToast("Cliente salvato con successo!", 'success');
    } catch (e) {
      showToast("Errore nel salvataggio del cliente.", 'error');
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await cloudDeleteClient(deleteTarget);
      onRefresh();
      showToast("Cliente eliminato.", 'success');
    } catch (e) {
      showToast("Errore nell'eliminazione.", 'error');
    }
    setDeleteTarget(null);
  };

  const inputClass = "w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/40 focus:outline-none focus:border-brand-400 bg-white text-slate-900 transition-colors";

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Elimina Cliente"
        message="Vuoi eliminare definitivamente questo cliente dalla rubrica?"
        confirmLabel="Elimina"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {!selectionMode && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-600 flex items-center justify-center">
                <Users size={20} />
              </div>
              Anagrafica Clienti
            </h2>
            <p className="text-slate-500 text-sm mt-1">Gestisci i tuoi contatti e le aziende clienti.</p>
          </div>
          <button
            onClick={() => setIsCreating(!isCreating)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-sm ${isCreating
                ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                : 'bg-gradient-to-r from-brand-500 to-brand-700 text-white hover:shadow-lg hover:shadow-brand-500/25'
              }`}
          >
            {isCreating ? 'Annulla' : <><Plus size={18} /> Nuovo Cliente</>}
          </button>
        </div>
      )}

      {/* Create Form */}
      {isCreating && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-lg animate-slide-up">
          <h3 className="font-bold text-slate-800 mb-6 text-lg border-b border-slate-100 pb-3">Nuovo Contatto</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Nome Referente</label>
              <input placeholder="Es. Mario Rossi" className={inputClass}
                value={newClient.name} onChange={e => setNewClient({ ...newClient, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Ragione Sociale</label>
              <input placeholder="Es. Azienda SRL" className={inputClass}
                value={newClient.company} onChange={e => setNewClient({ ...newClient, company: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Email</label>
              <input placeholder="email@esempio.com" className={inputClass}
                value={newClient.email} onChange={e => setNewClient({ ...newClient, email: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Telefono</label>
              <input placeholder="+39 333 000 0000" className={inputClass}
                value={newClient.phone || ''} onChange={e => setNewClient({ ...newClient, phone: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">P.IVA / Cod. Fiscale</label>
              <input placeholder="IT00000000000" className={inputClass}
                value={newClient.vatId} onChange={e => setNewClient({ ...newClient, vatId: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Indirizzo Completo</label>
              <input placeholder="Via Roma 1, 00100 Milano" className={inputClass}
                value={newClient.address} onChange={e => setNewClient({ ...newClient, address: e.target.value })} />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button onClick={handleSave} disabled={isSaving}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-2.5 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-emerald-500/25 flex items-center gap-2 transition-all disabled:opacity-60"
            >
              {isSaving ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />}
              Salva Cliente
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
        <input
          type="text" placeholder="Cerca per nome o azienda..."
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/40 focus:outline-none focus:border-brand-400 bg-white text-slate-900 shadow-sm transition-colors"
        />
      </div>

      {/* Clients Grid */}
      <div className={`grid grid-cols-1 ${selectionMode ? '' : 'md:grid-cols-2 lg:grid-cols-3'} gap-4`}>
        {filteredClients.map(client => (
          <div
            key={client.id}
            onClick={() => onSelect && onSelect(client)}
            className={`bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm group hover:shadow-md hover:border-brand-300 transition-all ${onSelect ? 'cursor-pointer active:scale-[0.98]' : ''}`}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3 mb-3 min-w-0">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${client.company ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                  {client.company ? <Building2 size={20} /> : <User size={20} />}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-800 truncate">{client.company || client.name}</div>
                  {client.company && <div className="text-xs text-slate-500 truncate">{client.name}</div>}
                </div>
              </div>
              {!selectionMode && (
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteTarget(client.id); }}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            <div className="space-y-1.5 pl-1">
              {client.email && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Mail size={13} className="text-slate-400 shrink-0" />
                  <a href={`mailto:${client.email}`} className="hover:text-brand-600 truncate" onClick={e => e.stopPropagation()}>{client.email}</a>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Phone size={13} className="text-slate-400 shrink-0" />
                  <span>{client.phone}</span>
                </div>
              )}
              {client.address && (
                <div className="flex items-start gap-2 text-sm text-slate-500">
                  <MapPin size={13} className="text-slate-400 mt-0.5 shrink-0" />
                  <span className="truncate">{client.address}</span>
                </div>
              )}
              {client.vatId && (
                <div className="inline-block bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-md font-mono mt-1.5">
                  {client.vatId}
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredClients.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
            <User size={44} className="mx-auto text-slate-200 mb-3" />
            <p className="text-slate-500 font-semibold">Nessun cliente trovato.</p>
            <p className="text-sm text-slate-400 mt-1">Prova a cambiare i filtri o aggiungi un nuovo cliente.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Users: React.FC<{ size: number, className?: string }> = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);