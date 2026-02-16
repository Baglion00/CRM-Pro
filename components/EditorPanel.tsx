import React, { useState, useMemo } from 'react';
import { QuoteData, LineItem, SavedClient, CatalogItem, STATUS_CONFIG, QuoteStatus } from '../types';
import { Plus, Trash2, Wand2, Briefcase, User, FileText, ChevronDown, ChevronUp, Globe, Loader2, Save, Check, Database, Upload, Download, Search, X, CalendarDays, Package } from 'lucide-react';
import { improveDescription, fetchCompanyData } from '../services/aiService';

interface EditorPanelProps {
  data: QuoteData;
  onChange: (updates: Partial<QuoteData>) => void;
  onSaveProfile: () => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  savedClients: SavedClient[];
  showToast: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  catalogItems?: CatalogItem[];
}

export const EditorPanel: React.FC<EditorPanelProps> = ({ data, onChange, onSaveProfile, onExport, onImport, savedClients, showToast, catalogItems = [] }) => {
  const [activeSection, setActiveSection] = useState<string>('company');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isFetchingSite, setIsFetchingSite] = useState(false);
  const [savedProfileSuccess, setSavedProfileSuccess] = useState(false);
  const [showClientSearch, setShowClientSearch] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [showCatalogPicker, setShowCatalogPicker] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');

  const filteredCatalog = useMemo(() => {
    if (!catalogSearch) return catalogItems;
    return catalogItems.filter(i => i.name.toLowerCase().includes(catalogSearch.toLowerCase()) || i.category.toLowerCase().includes(catalogSearch.toLowerCase()));
  }, [catalogItems, catalogSearch]);

  const addFromCatalog = (item: CatalogItem) => {
    const newItem: LineItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: item.name,
      description: item.description,
      quantity: 1,
      unitPrice: item.unitPrice,
      taxRate: item.taxRate,
    };
    onChange({ items: [...data.items, newItem] });
    setShowCatalogPicker(false);
    setCatalogSearch('');
    showToast(`"${item.name}" aggiunto al preventivo`, 'success');
  };

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
        vatId: client.vatId,
        phone: client.phone || '',
      }
    });
    setShowClientSearch(false);
    showToast(`Cliente "${client.company || client.name}" selezionato.`, 'info');
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
      taxRate: 0
    };
    onChange({ items: [...data.items, newItem] });
  };

  const handleAiImprove = async (id: string, text: string, name: string) => {
    setLoadingId(id);
    const improved = await improveDescription(text, name);
    handleItemChange(id, 'description', improved);
    setLoadingId(null);
    if (improved !== text) showToast("Descrizione migliorata con AI!", 'success');
  };

  const handleAutoFillCompany = async () => {
    if (!data.company.website) {
      showToast("Inserisci prima un URL del sito web.", 'warning');
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
      showToast("Dati aziendali compilati automaticamente!", 'success');
    } else {
      showToast("Non sono riuscito a trovare informazioni per questo sito.", 'warning');
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

  const inputClass = "w-full p-2.5 border border-slate-200 rounded-xl text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500/40 focus:outline-none focus:border-brand-400 transition-colors";

  const SectionHeader: React.FC<{ section: string; icon: React.ReactNode; label: string }> = ({ section, icon, label }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full p-3.5 flex items-center justify-between font-semibold text-slate-700 hover:bg-slate-50 transition-colors rounded-t-xl"
    >
      <span className="flex items-center gap-2.5">{icon} {label}</span>
      {activeSection === section ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
    </button>
  );

  const statusOptions: { value: QuoteStatus; label: string }[] = [
    { value: 'draft', label: '📝 Bozza' },
    { value: 'sent', label: '📤 Inviato' },
    { value: 'accepted', label: '✅ Accettato' },
    { value: 'rejected', label: '❌ Rifiutato' },
  ];

  return (
    <div className="space-y-5">

      {/* Quote General Info */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
        <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2 text-sm">
          <FileText size={15} /> Dati Preventivo
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Numero</label>
            <input type="text" value={data.number} onChange={(e) => onChange({ number: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Data</label>
            <input type="date" value={data.date} onChange={(e) => onChange({ date: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Scadenza</label>
            <input type="date" value={data.expiryDate} onChange={(e) => onChange({ expiryDate: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Stato</label>
            <select
              value={data.status || 'draft'}
              onChange={(e) => onChange({ status: e.target.value as QuoteStatus })}
              className={inputClass}
            >
              {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Company Section */}
      <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-sm">
        <SectionHeader section="company" icon={<Briefcase size={15} />} label="La Tua Azienda" />
        {activeSection === 'company' && (
          <div className="p-4 space-y-3 border-t border-slate-100">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-xs text-slate-500 mb-1 block">Sito Web</label>
                <input placeholder="www.miosito.it" className={inputClass}
                  value={data.company.website || ''} onChange={(e) => handleCompanyChange('website', e.target.value)} />
              </div>
              <button onClick={handleAutoFillCompany} disabled={isFetchingSite}
                className="p-2.5 mb-[1px] bg-gradient-to-r from-brand-500 to-brand-700 text-white rounded-xl hover:shadow-lg hover:shadow-brand-500/25 disabled:opacity-50 flex items-center gap-1.5 min-w-[110px] justify-center text-sm font-medium transition-all"
              >
                {isFetchingSite ? <Loader2 className="animate-spin" size={16} /> : <><Globe size={16} /> Auto-fill</>}
              </button>
            </div>

            <input placeholder="Nome Completo / Azienda" className={inputClass}
              value={data.company.name} onChange={(e) => handleCompanyChange('name', e.target.value)} />
            <input placeholder="Indirizzo (Via, Cap, Città)" className={inputClass}
              value={data.company.address} onChange={(e) => handleCompanyChange('address', e.target.value)} />
            <input placeholder="P.IVA / Codice Fiscale" className={inputClass}
              value={data.company.vatId} onChange={(e) => handleCompanyChange('vatId', e.target.value)} />
            <input placeholder="URL Logo (https://...)" className={inputClass}
              value={data.company.logoUrl} onChange={(e) => handleCompanyChange('logoUrl', e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Email" className={inputClass}
                value={data.company.email} onChange={(e) => handleCompanyChange('email', e.target.value)} />
              <input placeholder="Telefono" className={inputClass}
                value={data.company.phone} onChange={(e) => handleCompanyChange('phone', e.target.value)} />
            </div>
            <input placeholder="IBAN (per pagamenti)" className={inputClass}
              value={data.company.iban || ''} onChange={(e) => handleCompanyChange('iban', e.target.value)} />

            <button onClick={handleSaveProfileWrapper} disabled={savedProfileSuccess}
              className={`w-full mt-2 py-2.5 text-xs font-semibold border rounded-xl flex items-center justify-center gap-2 transition-all ${savedProfileSuccess
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                : 'text-brand-600 bg-brand-50 border-brand-100 hover:bg-brand-100'
                }`}
            >
              {savedProfileSuccess ? <Check size={14} /> : <Save size={14} />}
              {savedProfileSuccess ? "Salvataggio completato!" : "Salva dati predefiniti"}
            </button>
          </div>
        )}
      </div>

      {/* Client Section */}
      <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-sm">
        <SectionHeader section="client" icon={<User size={15} />} label="Cliente" />
        {activeSection === 'client' && (
          <div className="p-4 space-y-3 border-t border-slate-100">

            {/* Client Search */}
            <div className="flex justify-end mb-1">
              {!showClientSearch ? (
                <button onClick={() => setShowClientSearch(true)}
                  className="text-xs flex items-center gap-1.5 text-brand-600 hover:text-brand-700 font-semibold px-3 py-1.5 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors">
                  <Search size={12} /> Cerca da rubrica
                </button>
              ) : (
                <div className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 mb-1 relative shadow-lg z-10">
                  <button onClick={() => setShowClientSearch(false)} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-red-500 transition-colors"><X size={14} /></button>
                  <p className="text-xs font-bold text-slate-600 mb-2">Seleziona Cliente:</p>
                  <input autoFocus type="text"
                    className="w-full p-2 mb-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-900"
                    placeholder="Filtra..." value={clientSearchTerm} onChange={(e) => setClientSearchTerm(e.target.value)} />
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {filteredSavedClients.length === 0 ? <p className="text-xs text-slate-400 italic py-2">Nessun cliente trovato.</p> : null}
                    {filteredSavedClients.map(c => (
                      <div key={c.id} onClick={() => selectClient(c)}
                        className="p-2.5 bg-white border border-slate-100 rounded-lg text-sm cursor-pointer hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 flex justify-between group transition-colors">
                        <span className="font-medium">{c.company || c.name}</span>
                        <span className="text-xs text-slate-400 group-hover:text-brand-500">{c.vatId}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <input placeholder="Nome Cliente / Referente" className={inputClass}
              value={data.client.name} onChange={(e) => handleClientChange('name', e.target.value)} />
            <input placeholder="Ragione Sociale" className={inputClass}
              value={data.client.company} onChange={(e) => handleClientChange('company', e.target.value)} />
            <input placeholder="Indirizzo Cliente" className={inputClass}
              value={data.client.address} onChange={(e) => handleClientChange('address', e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="P.IVA Cliente" className={inputClass}
                value={data.client.vatId} onChange={(e) => handleClientChange('vatId', e.target.value)} />
              <input placeholder="Email Cliente" className={inputClass}
                value={data.client.email} onChange={(e) => handleClientChange('email', e.target.value)} />
            </div>
          </div>
        )}
      </div>

      {/* Items Section */}
      <div>
        <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2 text-sm">
          Servizi & Prodotti
          <span className="text-xs text-slate-400 font-normal">({data.items.length})</span>
        </h3>

        <div className="space-y-3">
          {data.items.map((item, index) => (
            <div key={item.id} className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-sm group hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">#{index + 1}</span>
                <button onClick={() => deleteItem(item.id)} className="text-slate-300 hover:text-red-500 p-1 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="space-y-3">
                <input placeholder="Nome servizio (es. Consulenza)"
                  className="w-full p-2.5 font-medium border-b border-slate-200 focus:border-brand-500 focus:outline-none bg-white text-slate-900 placeholder:text-slate-400 transition-colors"
                  value={item.name} onChange={(e) => handleItemChange(item.id, 'name', e.target.value)} />

                <div className="relative">
                  <textarea placeholder="Descrizione..." rows={2}
                    className="w-full p-2.5 text-sm text-slate-900 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/40 focus:outline-none pr-10 placeholder:text-slate-400 transition-colors"
                    value={item.description} onChange={(e) => handleItemChange(item.id, 'description', e.target.value)} />
                  <button onClick={() => handleAiImprove(item.id, item.description, item.name)}
                    disabled={loadingId === item.id}
                    className={`absolute top-2.5 right-2.5 p-1.5 rounded-lg transition-all ${loadingId === item.id ? 'animate-spin text-brand-500' : 'text-slate-400 hover:text-brand-500 hover:bg-brand-50'}`}
                    title="Migliora con AI">
                    <Wand2 size={15} />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 font-medium">Prezzo (€)</label>
                    <input type="number" className={inputClass} value={item.unitPrice}
                      onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-medium">Q.tà</label>
                    <input type="number" className={inputClass} value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-medium">IVA (%)</label>
                    <input type="number" className={inputClass} value={item.taxRate}
                      onChange={(e) => handleItemChange(item.id, 'taxRate', parseFloat(e.target.value) || 0)} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <button onClick={addItem}
            className="flex-1 py-2.5 border-2 border-dashed border-brand-200 text-brand-600 rounded-xl hover:bg-brand-50 hover:border-brand-300 transition-colors flex items-center justify-center gap-2 font-semibold text-sm">
            <Plus size={18} /> Aggiungi Riga
          </button>
          {catalogItems.length > 0 && (
            <button onClick={() => setShowCatalogPicker(true)}
              className="px-4 py-2.5 border-2 border-dashed border-violet-200 text-violet-600 rounded-xl hover:bg-violet-50 hover:border-violet-300 transition-colors flex items-center justify-center gap-2 font-semibold text-sm">
              <Package size={16} /> Da Catalogo
            </button>
          )}
        </div>

        {/* Catalog Picker Modal */}
        {showCatalogPicker && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Scegli dal Catalogo</h3>
                <button onClick={() => { setShowCatalogPicker(false); setCatalogSearch(''); }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                  <X size={18} />
                </button>
              </div>
              <div className="p-4">
                <div className="relative mb-3">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Cerca..." value={catalogSearch} onChange={e => setCatalogSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 outline-none text-sm" />
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {filteredCatalog.map(item => (
                    <button key={item.id} onClick={() => addFromCatalog(item)}
                      className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-brand-300 hover:bg-brand-50/50 transition-all flex justify-between items-center group">
                      <div>
                        <p className="font-semibold text-slate-700 text-sm">{item.name}</p>
                        <p className="text-xs text-slate-400">{item.category}</p>
                      </div>
                      <span className="text-sm font-bold text-slate-800">€{item.unitPrice.toFixed(2)}</span>
                    </button>
                  ))}
                  {filteredCatalog.length === 0 && (
                    <p className="text-center text-sm text-slate-400 py-4">Nessun prodotto trovato.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
        <h3 className="font-semibold text-slate-700 mb-2 text-sm">Note & Termini</h3>
        <textarea value={data.notes} onChange={(e) => onChange({ notes: e.target.value })}
          className="w-full p-2.5 border border-slate-200 rounded-xl text-sm min-h-[120px] bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500/40 focus:outline-none transition-colors" />
      </div>

      {/* Data Management */}
      <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-sm">
        <SectionHeader section="data" icon={<Database size={15} />} label="Gestione Dati (Backup)" />
        {activeSection === 'data' && (
          <div className="p-4 space-y-4 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Scarica un backup regolarmente per non perdere i tuoi preventivi.
            </p>
            <div className="flex gap-2">
              <button onClick={onExport}
                className="flex-1 py-2.5 px-3 bg-brand-50 text-brand-700 border border-brand-200 rounded-xl hover:bg-brand-100 flex items-center justify-center gap-2 text-sm font-medium transition-colors">
                <Download size={14} /> Scarica Backup
              </button>
              <label className="flex-1 py-2.5 px-3 bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center justify-center gap-2 text-sm font-medium transition-colors cursor-pointer">
                <Upload size={14} /> Ripristina
                <input type="file" accept=".json" className="hidden" onChange={onImport} />
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};