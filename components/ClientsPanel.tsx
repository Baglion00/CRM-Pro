import React, { useState } from 'react';
import { SavedClient } from '../types';
import { User, Building2, MapPin, Trash2, Plus, Search, Loader2, Mail, FileText } from 'lucide-react';
import { cloudSaveClient, cloudDeleteClient } from '../services/supabaseClient';

interface ClientsPanelProps {
  clients: SavedClient[];
  onRefresh: () => void;
  onSelect?: (client: SavedClient) => void; // Optional: if used in selection mode
  selectionMode?: boolean;
}

export const ClientsPanel: React.FC<ClientsPanelProps> = ({ clients, onRefresh, onSelect, selectionMode = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // New Client Form State
  const [newClient, setNewClient] = useState<Partial<SavedClient>>({
    name: '',
    company: '',
    email: '',
    address: '',
    vatId: ''
  });

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async () => {
    if (!newClient.name && !newClient.company) {
      alert("Inserisci almeno un Nome o una Ragione Sociale.");
      return;
    }
    
    setIsSaving(true);
    try {
      await cloudSaveClient(newClient);
      onRefresh();
      setIsCreating(false);
      setNewClient({ name: '', company: '', email: '', address: '', vatId: '' });
    } catch (e) {
      alert("Errore salvataggio cliente");
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Sei sicuro di voler eliminare questo cliente?")) return;
    try {
      await cloudDeleteClient(id);
      onRefresh();
    } catch (e) {
      alert("Errore eliminazione");
    }
  };

  const inputClass = "w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-odoo-500 focus:outline-none bg-white text-slate-900";

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {!selectionMode && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
             <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <UsersIcon /> Anagrafica Clienti
            </h2>
            <p className="text-slate-500 text-sm mt-1">Gestisci i tuoi contatti e le aziende clienti.</p>
          </div>
         
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm ${isCreating ? 'bg-slate-200 text-slate-700' : 'bg-odoo-600 text-white hover:bg-odoo-700'}`}
          >
            {isCreating ? 'Annulla Creazione' : <><Plus size={18} /> Nuovo Cliente</>}
          </button>
        </div>
      )}

      {/* Create Form */}
      {isCreating && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-lg animate-in slide-in-from-top-2">
          <h3 className="font-bold text-slate-800 mb-6 text-lg border-b border-slate-100 pb-2">Nuovo Contatto</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Nome Referente</label>
              <input 
                placeholder="Es. Mario Rossi" 
                className={inputClass}
                value={newClient.name}
                onChange={e => setNewClient({...newClient, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Ragione Sociale</label>
              <input 
                placeholder="Es. Azienda SRL" 
                className={inputClass}
                value={newClient.company}
                onChange={e => setNewClient({...newClient, company: e.target.value})}
              />
            </div>
            <div>
               <label className="block text-xs font-bold text-slate-500 mb-1">Email</label>
               <input 
                placeholder="email@esempio.com" 
                className={inputClass}
                value={newClient.email}
                onChange={e => setNewClient({...newClient, email: e.target.value})}
              />
            </div>
             <div>
               <label className="block text-xs font-bold text-slate-500 mb-1">P.IVA / Cod. Fiscale</label>
               <input 
                placeholder="IT00000000000" 
                className={inputClass}
                value={newClient.vatId}
                onChange={e => setNewClient({...newClient, vatId: e.target.value})}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1">Indirizzo Completo</label>
              <input 
                placeholder="Via Roma 1, 00100 Milano" 
                className={inputClass}
                value={newClient.address}
                onChange={e => setNewClient({...newClient, address: e.target.value})}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
             <button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-emerald-600 text-white px-8 py-2.5 rounded-lg text-sm font-bold hover:bg-emerald-700 flex items-center gap-2 shadow-md shadow-emerald-600/20"
             >
               {isSaving ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />} 
               Salva Cliente
             </button>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Cerca per nome o azienda..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-odoo-500 focus:outline-none bg-white text-slate-900 shadow-sm"
        />
      </div>

      {/* Clients Grid */}
      <div className={`grid grid-cols-1 ${selectionMode ? 'md:grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-3'} gap-4`}>
        {filteredClients.map(client => (
          <div 
            key={client.id} 
            onClick={() => onSelect && onSelect(client)}
            className={`bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-odoo-300 hover:shadow-md transition-all ${onSelect ? 'cursor-pointer active:scale-[0.98]' : ''}`}
          >
            <div>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3 font-bold text-slate-800 text-lg mb-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${client.company ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {client.company ? <Building2 size={20} /> : <User size={20} />}
                  </div>
                  <div className="leading-tight">
                    <div>{client.company || client.name}</div>
                    {client.company && <div className="text-xs text-slate-500 font-normal">{client.name}</div>}
                  </div>
                </div>
                {!selectionMode && (
                   <button 
                    onClick={(e) => handleDelete(e, client.id)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Elimina"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
              
              <div className="space-y-2 mt-2 pl-1">
                {client.email && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Mail size={14} className="text-slate-400" /> 
                    <a href={`mailto:${client.email}`} className="hover:text-odoo-600 hover:underline" onClick={e => e.stopPropagation()}>{client.email}</a>
                  </div>
                )}
                {client.address && (
                  <div className="flex items-start gap-2 text-sm text-slate-500">
                    <MapPin size={14} className="text-slate-400 mt-0.5" /> 
                    <span>{client.address}</span>
                  </div>
                )}
                {client.vatId && (
                  <div className="inline-block bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded font-mono mt-1">
                    {client.vatId}
                  </div>
                )}
              </div>
            </div>
            
            {selectionMode && (
               <div className="mt-4 pt-3 border-t border-slate-100 text-center text-odoo-600 text-sm font-medium">
                 Clicca per selezionare
               </div>
            )}
          </div>
        ))}

        {filteredClients.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
             <User size={48} className="mx-auto text-slate-300 mb-3" />
             <p className="text-slate-500 font-medium">Nessun cliente trovato.</p>
             <p className="text-sm text-slate-400">Prova a cambiare i filtri o aggiungi un nuovo cliente.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users text-odoo-500"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);