import React, { useState } from 'react';
import { QuoteData, LineItem, SavedClient } from '../types';
import { Plus, Trash2, Wand2, Briefcase, User, FileText, ChevronDown, ChevronUp, Globe, Loader2, Save, Check, Database, Upload, Download, Search, X } from 'lucide-react';
import { improveDescription, fetchCompanyData } from '../services/geminiService';

interface EditorPanelProps {
  data: QuoteData;
  onChange: (updates: Partial<QuoteData>) => void;
  onSaveProfile: () => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  savedClients: SavedClient[]; // Passed from App
}

export const EditorPanel: React.FC<EditorPanelProps> = ({ data, onChange, onSaveProfile, onExport, onImport, savedClients }) => {
  const [activeSection, setActiveSection] = useState<string>('company');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isFetchingSite, setIsFetchingSite] = useState(false);
  const [savedProfileSuccess, setSavedProfileSuccess] = useState(false);
  const [showClientSearch, setShowClientSearch] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? '' : section);
  };

  const handleCompanyChange = (field: string, value: string) => {
    onChange({ company: { ...data.company, [field]: value } });
  };

  const handleClientChange = (field: string, value: string) => {
    onChange({ client: { ...data.client, [field]: value } });
  };

  const selectClient = (client: SavedClient) => {
    onChange({
      client: {
        name: client.name,
        company: client.company,
        address: client.address,
        email: client.email,
        vatId: client.vatId
      }
    });
    setShowClientSearch(false);
  };

  const handleItemChange = (id: string, field: keyof LineItem, value: any) => {
    const newItems = data.items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    );
    onChange({ items: newItems });
  };

  const deleteItem = (id: string) => {
    onChange({ items: data.items.filter(item => item.id !== id) });
  };

  const addItem = () => {
    const newItem: LineItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
      taxRate: 0 // Default 0 for Forfettario
    };
    onChange({ items: [...data.items, newItem] });
  };

  const handleAiImprove = async (id: string, text: string, name: string) => {
    setLoadingId(id);
    const improved = await improveDescription(text, name);
    handleItemChange(id, 'description', improved);
    setLoadingId(null);
  };

  const handleAutoFillCompany = async () => {
    if (!data.company.website) {
      alert("Inserisci prima un URL del sito web.");
      return;
    }
    setIsFetchingSite(true);
    const info = await fetchCompanyData(data.company.website);
    setIsFetchingSite(false);
    
    if (info) {
      onChange({
        company: {
          ...data.company,
          name: info.name || data.company.name,
          address: info.address || data.company.address,
          email: info.email || data.company.email,
          phone: info.phone || data.company.phone,
          logoUrl: info.logoUrl || data.company.logoUrl,
        }
      });
    } else {
      alert("Non sono riuscito a trovare informazioni per questo sito.");
    }
  };

  const handleSaveProfileWrapper = () => {
    onSaveProfile();
    setSavedProfileSuccess(true);
    setTimeout(() => setSavedProfileSuccess(false), 2000);
  };

  const filteredSavedClients = savedClients.filter(c => 
    c.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) || 
    c.company?.toLowerCase().includes(clientSearchTerm.toLowerCase())
  );

  const inputClass = "w-full p-2 border border-slate-300 rounded bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-odoo-500 focus:outline-none focus:border-odoo-500";

  return (
    <div className="space-y-6">
      
      {/* General Settings */}
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
        <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
           <FileText size={16} /> Dati Preventivo
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Numero</label>
            <input 
              type="text" 
              value={data.number}
              onChange={(e) => onChange({ number: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Data</label>
            <input 
              type="date" 
              value={data.date}
              onChange={(e) => onChange({ date: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Company Section */}
      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
        <button 
          onClick={() => toggleSection('company')}
          className="w-full bg-slate-50 p-3 flex items-center justify-between font-medium text-slate-700 hover:bg-slate-100"
        >
          <span className="flex items-center gap-2"><Briefcase size={16} /> La Tua Azienda</span>
          {activeSection === 'company' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {activeSection === 'company' && (
          <div className="p-4 space-y-3 bg-white">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-xs text-slate-500 mb-1 block">Sito Web (es. www.mariosito.it)</label>
                <input 
                  placeholder="Inserisci URL..." 
                  className={inputClass}
                  value={data.company.website || ''}
                  onChange={(e) => handleCompanyChange('website', e.target.value)}
                />
              </div>
              <button 
                onClick={handleAutoFillCompany}
                disabled={isFetchingSite}
                className="p-2 mb-[1px] bg-odoo-500 text-white rounded hover:bg-odoo-600 disabled:opacity-50 flex items-center gap-1 min-w-[120px] justify-center"
                title="Cerca dati dal sito"
              >
                {isFetchingSite ? <Loader2 className="animate-spin" size={18} /> : <><Globe size={18} /> Auto-fill</>}
              </button>
            </div>
            
            <input 
              placeholder="Nome Completo / Azienda" 
              className={inputClass}
              value={data.company.name}
              onChange={(e) => handleCompanyChange('name', e.target.value)}
            />
            <input 
              placeholder="Indirizzo (Via, Cap, Città)" 
              className={inputClass}
              value={data.company.address}
              onChange={(e) => handleCompanyChange('address', e.target.value)}
            />
            <input 
              placeholder="P.IVA / Codice Fiscale" 
              className={inputClass}
              value={data.company.vatId}
              onChange={(e) => handleCompanyChange('vatId', e.target.value)}
            />
             <input 
              placeholder="URL Logo (es. https://...)" 
              className={inputClass}
              value={data.company.logoUrl}
              onChange={(e) => handleCompanyChange('logoUrl', e.target.value)}
            />
            <input 
              placeholder="Email" 
              className={inputClass}
              value={data.company.email}
              onChange={(e) => handleCompanyChange('email', e.target.value)}
            />
             <input 
              placeholder="Telefono" 
              className={inputClass}
              value={data.company.phone}
              onChange={(e) => handleCompanyChange('phone', e.target.value)}
            />
             <input 
              placeholder="IBAN (per pagamenti)" 
              className={inputClass}
              value={data.company.iban || ''}
              onChange={(e) => handleCompanyChange('iban', e.target.value)}
            />

            <button 
              onClick={handleSaveProfileWrapper}
              disabled={savedProfileSuccess}
              className={`w-full mt-2 py-2 text-xs font-medium border rounded flex items-center justify-center gap-2 transition-all ${
                savedProfileSuccess 
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                : 'text-odoo-600 bg-odoo-50 border-odoo-100 hover:bg-odoo-100'
              }`}
            >
              {savedProfileSuccess ? <Check size={14} /> : <Save size={14} />} 
              {savedProfileSuccess ? "Dati salvati con successo!" : "Salva dati predefiniti (Cloud/Locale)"}
            </button>
          </div>
        )}
      </div>

      {/* Client Section */}
      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
        <button 
          onClick={() => toggleSection('client')}
          className="w-full bg-slate-50 p-3 flex items-center justify-between font-medium text-slate-700 hover:bg-slate-100"
        >
          <span className="flex items-center gap-2"><User size={16} /> Cliente</span>
          {activeSection === 'client' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {activeSection === 'client' && (
          <div className="p-4 space-y-3 bg-white">
            
            {/* Client Search Feature */}
            <div className="flex justify-end mb-2">
               {!showClientSearch ? (
                 <button 
                  onClick={() => setShowClientSearch(true)}
                  className="text-xs flex items-center gap-1 text-odoo-600 hover:underline font-medium"
                 >
                   <Search size={12} /> Cerca da rubrica
                 </button>
               ) : (
                 <div className="w-full bg-slate-50 p-2 rounded border border-slate-200 mb-2 relative shadow-lg z-10">
                    <button onClick={() => setShowClientSearch(false)} className="absolute right-2 top-2 text-slate-400 hover:text-red-500"><X size={14} /></button>
                    <p className="text-xs font-bold text-slate-500 mb-2">Seleziona Cliente salvato:</p>
                    
                    <input 
                      autoFocus
                      type="text"
                      className="w-full p-1.5 mb-2 text-xs border border-slate-300 rounded bg-white text-slate-900"
                      placeholder="Filtra..."
                      value={clientSearchTerm}
                      onChange={(e) => setClientSearchTerm(e.target.value)}
                    />

                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {filteredSavedClients.length === 0 ? <p className="text-xs text-slate-400 italic">Nessun cliente trovato.</p> : null}
                      {filteredSavedClients.map(c => (
                        <div 
                          key={c.id} 
                          onClick={() => selectClient(c)}
                          className="p-2 bg-white border border-slate-100 rounded text-sm cursor-pointer hover:bg-odoo-50 hover:text-odoo-700 flex justify-between group"
                        >
                          <span className="font-medium">{c.company || c.name}</span>
                          <span className="text-xs text-slate-400 group-hover:text-odoo-500">{c.vatId}</span>
                        </div>
                      ))}
                    </div>
                 </div>
               )}
            </div>

            <input 
              placeholder="Nome Cliente / Referente" 
              className={inputClass}
              value={data.client.name}
              onChange={(e) => handleClientChange('name', e.target.value)}
            />
            <input 
              placeholder="Ragione Sociale Cliente" 
              className={inputClass}
              value={data.client.company}
              onChange={(e) => handleClientChange('company', e.target.value)}
            />
            <input 
              placeholder="Indirizzo Cliente" 
              className={inputClass}
              value={data.client.address}
              onChange={(e) => handleClientChange('address', e.target.value)}
            />
             <input 
              placeholder="P.IVA Cliente" 
              className={inputClass}
              value={data.client.vatId}
              onChange={(e) => handleClientChange('vatId', e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Items Section */}
      <div>
        <h3 className="font-semibold text-slate-700 mb-3 flex items-center justify-between">
          <span>Servizi & Prodotti</span>
        </h3>
        
        <div className="space-y-4">
          {data.items.map((item, index) => (
            <div key={item.id} className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm group">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-slate-400">#{index + 1}</span>
                <button onClick={() => deleteItem(item.id)} className="text-red-400 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className="space-y-3">
                <input 
                  placeholder="Nome servizio (es. Consulenza)" 
                  className="w-full p-2 font-medium border-b border-slate-200 focus:border-odoo-500 focus:outline-none bg-white text-slate-900 placeholder:text-slate-400"
                  value={item.name}
                  onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                />
                
                <div className="relative">
                  <textarea 
                    placeholder="Descrizione..." 
                    rows={2}
                    className="w-full p-2 text-sm text-slate-900 bg-white border border-slate-200 rounded focus:ring-1 focus:ring-odoo-500 focus:outline-none pr-10 placeholder:text-slate-400"
                    value={item.description}
                    onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                  />
                  <button 
                    onClick={() => handleAiImprove(item.id, item.description, item.name)}
                    disabled={loadingId === item.id}
                    className={`absolute top-2 right-2 p-1 rounded hover:bg-slate-100 transition-colors ${loadingId === item.id ? 'animate-spin text-odoo-500' : 'text-slate-400 hover:text-odoo-500'}`}
                    title="Migliora con AI"
                  >
                    <Wand2 size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-slate-500">Prezzo (€)</label>
                    <input 
                      type="number" 
                      className={inputClass}
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Q.tà</label>
                    <input 
                      type="number" 
                      className={inputClass}
                      value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">IVA (%)</label>
                    <input 
                      type="number" 
                      className={inputClass}
                      value={item.taxRate}
                      onChange={(e) => handleItemChange(item.id, 'taxRate', parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={addItem}
          className="mt-4 w-full py-2 border-2 border-dashed border-odoo-200 text-odoo-600 rounded-lg hover:bg-odoo-50 hover:border-odoo-300 transition-colors flex items-center justify-center gap-2 font-medium"
        >
          <Plus size={18} /> Aggiungi Riga
        </button>
      </div>

       {/* Notes Section */}
       <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
        <h3 className="font-semibold text-slate-700 mb-2 text-sm">Note & Termini</h3>
        <textarea 
          value={data.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          className="w-full p-2 border border-slate-300 rounded text-sm min-h-[120px] bg-white text-slate-900 placeholder:text-slate-400 focus:ring-odoo-500 focus:outline-none"
        />
      </div>

      {/* Backup & Data Section */}
      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white mt-8">
        <button 
          onClick={() => toggleSection('data')}
          className="w-full bg-slate-100 p-3 flex items-center justify-between font-medium text-slate-700 hover:bg-slate-200"
        >
          <span className="flex items-center gap-2"><Database size={16} /> Gestione Dati (Backup)</span>
          {activeSection === 'data' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {activeSection === 'data' && (
          <div className="p-4 bg-white space-y-4">
            <p className="text-xs text-slate-500">
              I dati sono salvati solo su questo computer. Scarica un backup regolarmente per non perdere i tuoi preventivi.
            </p>
            
            <div className="flex gap-2">
              <button 
                onClick={onExport}
                className="flex-1 py-2 px-3 bg-odoo-50 text-odoo-700 border border-odoo-200 rounded-md hover:bg-odoo-100 flex items-center justify-center gap-2 text-sm font-medium transition-colors"
              >
                <Download size={14} /> Scarica Backup
              </button>
              
              <label className="flex-1 py-2 px-3 bg-white text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 flex items-center justify-center gap-2 text-sm font-medium transition-colors cursor-pointer">
                <Upload size={14} /> Ripristina
                <input 
                  type="file" 
                  accept=".json" 
                  className="hidden" 
                  onChange={onImport}
                />
              </label>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};