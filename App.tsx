import React, { useState, useEffect, useRef } from 'react';
import { EditorPanel } from './components/EditorPanel';
import { QuotePreview } from './components/QuotePreview';
import { HistoryPanel } from './components/HistoryPanel';
import { CloudSettings } from './components/CloudSettings';
import { Dashboard } from './components/Dashboard';
import { ClientsPanel } from './components/ClientsPanel';
import { Toast, ToastType } from './components/ui/Toast';
import { QuoteData, LineItem, CompanyInfo, ClientInfo, SavedClient, QuoteStatus } from './types';
import {
  Download, LayoutList, PenTool, Save, Cloud, RefreshCw, Loader2, Wifi, WifiOff,
  LayoutDashboard, Users, ArrowLeft, FileText, Menu, X, Settings
} from 'lucide-react';
import {
  isSupabaseConfigured, cloudSaveQuote, cloudGetQuotes, cloudDeleteQuote,
  cloudSaveCompany, cloudGetCompany, cloudGetClients
} from './services/supabaseClient';

const DEFAULT_COMPANY: CompanyInfo = {
  name: "Mario Rossi Web Dev",
  email: "mario@example.com",
  phone: "+39 333 1234567",
  address: "Via Creativa 42, 20100 Milano (MI)",
  vatId: "IT12345678901",
  logoUrl: "",
  website: ""
};

const INITIAL_CLIENT: ClientInfo = {
  name: "", company: "", email: "", address: "", vatId: ""
};

const INITIAL_ITEMS: LineItem[] = [
  {
    id: "1",
    name: "Servizio 1",
    description: "Descrizione del servizio...",
    quantity: 1,
    unitPrice: 100,
    taxRate: 0
  }
];

const FORFETTARIO_NOTES = `Operazione effettuata ai sensi dell'articolo 1, commi da 54 a 89, della Legge n. 190/2014 così come modificato dalla Legge n. 208/2015.
Operazione non soggetta a ritenuta alla fonte a titolo di acconto imposte sui redditi.
Imposta di bollo da 2 euro assolta sull'originale per importi superiori a 77,47 euro.`;

type View = 'dashboard' | 'editor' | 'history' | 'clients';

const App: React.FC = () => {
  const [view, setView] = useState<View>('dashboard');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [history, setHistory] = useState<QuoteData[]>([]);
  const [savedClients, setSavedClients] = useState<SavedClient[]>([]);
  const [toast, setToast] = useState<{ msg: string, type: ToastType } | null>(null);

  const showToast = (msg: string, type: ToastType = 'success') => {
    setToast({ msg, type });
  };

  const [quoteData, setQuoteData] = useState<QuoteData>(() => {
    const savedDraft = localStorage.getItem('autoquote_draft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (!parsed.status) parsed.status = 'draft';
        return parsed;
      } catch (e) { }
    }
    const savedCompany = localStorage.getItem('autoquote_company');
    const company = savedCompany ? JSON.parse(savedCompany) : DEFAULT_COMPANY;

    return {
      id: crypto.randomUUID(),
      number: `PREV-${new Date().getFullYear()}-001`,
      date: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      company: company,
      client: INITIAL_CLIENT,
      items: INITIAL_ITEMS,
      notes: `Validità offerta: 30 giorni.\nPagamento: Bonifico Bancario a 30gg d.f.\n\n${FORFETTARIO_NOTES}`,
      currency: 'EUR',
      status: 'draft' as QuoteStatus
    };
  });

  const quoteDataRef = useRef(quoteData);
  useEffect(() => { quoteDataRef.current = quoteData; }, [quoteData]);

  const loadData = async () => {
    if (isSupabaseConfigured()) {
      setIsCloudConnected(true);
      try {
        const [cloudQuotes, cloudClients, cloudProfile] = await Promise.all([
          cloudGetQuotes(), cloudGetClients(), cloudGetCompany()
        ]);
        // Ensure status exists on all quotes
        setHistory(cloudQuotes.map(q => ({ ...q, status: q.status || 'draft' })));
        setSavedClients(cloudClients);
        if (cloudProfile && !localStorage.getItem('autoquote_draft')) {
          setQuoteData(prev => ({ ...prev, company: cloudProfile }));
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      const savedHistory = localStorage.getItem('autoquote_history');
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed.map((q: any) => ({ ...q, status: q.status || 'draft' })));
      }
    }
  };

  useEffect(() => { loadData(); }, [isCloudConnected]);

  // Auto-save
  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem('autoquote_draft', JSON.stringify(quoteDataRef.current));
      setLastSaved(new Date());
    }, 120000);
    return () => clearInterval(interval);
  }, []);

  const handleDownloadPDF = async () => {
    setIsGeneratingPdf(true);
    showToast("Generazione PDF in corso...", "info");

    const element = document.getElementById('quote-preview-content');
    if (!element) {
      showToast("Errore: Impossibile trovare il preventivo.", "error");
      setIsGeneratingPdf(false);
      return;
    }

    const opt = {
      margin: 0,
      filename: `${quoteData.number.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      if (typeof window.html2pdf === 'undefined') throw new Error("Libreria PDF non caricata.");
      await window.html2pdf().from(element).set(opt).save();
      showToast("PDF scaricato con successo!", "success");
    } catch (error) {
      console.error("PDF Error:", error);
      showToast("Errore durante il download del PDF.", "error");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const updateQuote = (updates: Partial<QuoteData>) => {
    setQuoteData(prev => ({ ...prev, ...updates }));
  };

  const saveCompanyProfile = async () => {
    if (isCloudConnected) {
      try {
        await cloudSaveCompany(quoteData.company);
        showToast("Azienda salvata nel Cloud!", 'success');
      } catch (e) {
        showToast("Errore salvataggio cloud", 'error');
      }
    } else {
      localStorage.setItem('autoquote_company', JSON.stringify(quoteData.company));
    }
    localStorage.setItem('autoquote_draft', JSON.stringify(quoteData));
    setLastSaved(new Date());
  };

  const saveToHistory = async () => {
    if (isCloudConnected) {
      setIsSaving(true);
      try {
        await cloudSaveQuote(quoteData);
        await loadData();
        showToast("Salvato su Supabase!", 'success');
      } catch (e) {
        showToast("Errore salvataggio Cloud", 'error');
      } finally {
        setIsSaving(false);
      }
    } else {
      const newHistory = [quoteData, ...history.filter(h => h.id !== quoteData.id)];
      setHistory(newHistory);
      localStorage.setItem('autoquote_history', JSON.stringify(newHistory));
      showToast("Preventivo salvato in locale.", 'success');
    }
  };

  const forceAutoSave = () => {
    localStorage.setItem('autoquote_draft', JSON.stringify(quoteDataRef.current));
    setLastSaved(new Date());
    showToast("Bozza salvata", 'info');
  };

  const loadFromHistory = (quote: QuoteData) => {
    setQuoteData(JSON.parse(JSON.stringify({ ...quote, status: quote.status || 'draft' })));
    setView('editor');
    showToast(`Preventivo ${quote.number} caricato.`, 'info');
  };

  const deleteFromHistory = async (id: string) => {
    if (isCloudConnected) {
      try {
        await cloudDeleteQuote(id);
        setHistory(prev => prev.filter(h => h.id !== id));
        showToast("Eliminato dal Cloud", 'success');
      } catch (e) {
        showToast("Errore eliminazione cloud", 'error');
      }
    } else {
      const newHistory = history.filter(h => h.id !== id);
      setHistory(newHistory);
      localStorage.setItem('autoquote_history', JSON.stringify(newHistory));
      showToast("Eliminato", 'success');
    }
  };

  const createNewQuote = () => {
    localStorage.removeItem('autoquote_draft');
    setLastSaved(null);
    const company = quoteData.company;

    setQuoteData({
      id: crypto.randomUUID(),
      number: `PREV-${new Date().getFullYear()}-${String(history.length + 2).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      company: company,
      client: INITIAL_CLIENT,
      items: INITIAL_ITEMS,
      notes: quoteData.notes,
      currency: 'EUR',
      status: 'draft'
    });
    setView('editor');
  };

  // --- Nav items ---
  const navItems = [
    { key: 'dashboard' as View, icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { key: 'clients' as View, icon: <Users size={20} />, label: 'Clienti' },
    { key: 'history' as View, icon: <LayoutList size={20} />, label: 'Storico' },
  ];

  // --- EDITOR VIEW ---
  if (view === 'editor') {
    return (
      <div className="min-h-screen flex flex-col md:flex-row text-slate-800 font-sans bg-surface">
        {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

        {/* Editor Sidebar */}
        <div className="w-full md:w-5/12 lg:w-[420px] bg-white border-r border-slate-200/80 h-auto md:h-screen flex flex-col no-print shadow-lg z-10">
          {/* Editor Header */}
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <button
              onClick={() => setView('dashboard')}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium transition-colors"
            >
              <ArrowLeft size={18} /> Dashboard
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-md shadow-brand-500/20">
                AQ
              </div>
              <span className="font-bold text-slate-700">Editor</span>
            </div>
          </div>

          {/* Editor Actions */}
          <div className="flex-1 overflow-y-auto p-5">
            <div className="flex gap-2 mb-5">
              <button
                onClick={saveToHistory} disabled={isSaving}
                className="flex-1 py-2.5 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl hover:shadow-lg hover:shadow-slate-900/25 flex items-center justify-center gap-2 text-sm font-semibold transition-all active:scale-[0.97] disabled:opacity-70"
              >
                {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                {isCloudConnected ? 'Salva su Cloud' : 'Salva Locale'}
              </button>
              <button
                onClick={createNewQuote}
                className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 text-sm font-semibold shadow-sm transition-all active:scale-[0.97]"
              >
                Nuovo
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 mb-5 px-1">
              <div className="flex items-center gap-2">
                {isSaving ? (
                  <>
                    <RefreshCw size={12} className="animate-spin text-brand-500" />
                    <span className="text-brand-600 font-medium">Salvataggio...</span>
                  </>
                ) : lastSaved ? (
                  <>
                    <div className={`w-2 h-2 rounded-full ${isCloudConnected ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                    <span>{isCloudConnected ? "Cloud" : "Bozza"} {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Modifiche non salvate</span>
                  </>
                )}
              </div>
              <button onClick={forceAutoSave} className="text-brand-500 hover:text-brand-700 font-medium transition-colors">
                Salva ora
              </button>
            </div>

            <EditorPanel
              data={quoteData}
              onChange={updateQuote}
              onSaveProfile={saveCompanyProfile}
              onExport={() => { }}
              onImport={() => { }}
              savedClients={savedClients}
              showToast={showToast}
            />
          </div>
        </div>

        {/* Preview Area */}
        <div className="w-full md:w-7/12 lg:flex-1 bg-slate-200/60 h-auto md:h-screen overflow-y-auto p-4 md:p-8 flex flex-col items-center">
          <div className="w-full max-w-[210mm] mb-5 flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className={`w-2.5 h-2.5 rounded-full ${lastSaved && !isSaving ? 'bg-emerald-500' : 'bg-amber-400'}`} />
              <span className="text-sm text-slate-600 font-medium">Anteprima Live</span>
            </div>
            <button
              onClick={handleDownloadPDF} disabled={isGeneratingPdf}
              className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-500 to-brand-700 text-white rounded-xl shadow-lg shadow-brand-500/20 hover:shadow-xl hover:shadow-brand-500/30 transition-all font-semibold active:scale-[0.97] disabled:opacity-70"
            >
              {isGeneratingPdf ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} className="group-hover:animate-bounce" />}
              {isGeneratingPdf ? 'Generazione...' : 'Scarica PDF'}
            </button>
          </div>
          <div className="bg-white shadow-2xl w-full max-w-[210mm] min-h-[297mm] p-[15mm] md:p-[20mm] relative animate-fade-in rounded-sm">
            <QuotePreview data={quoteData} />
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN LAYOUT (Dashboard, Clients, History) ---
  return (
    <div className="min-h-screen bg-surface font-sans text-slate-900 flex">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <CloudSettings
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
        onConnect={() => { setIsCloudConnected(true); loadData(); showToast("Cloud Connesso!", 'success'); }}
      />

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-[220px] bg-white border-r border-slate-200/80 h-screen flex-col sticky top-0 shadow-sm">
        {/* Logo */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <PenTool size={18} />
            </div>
            <div>
              <span className="font-bold text-slate-800 text-sm">AutoQuote</span>
              <span className="block text-[10px] text-slate-400 font-medium -mt-0.5">PRO</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => setView(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${view === item.key
                ? 'bg-brand-50 text-brand-700 shadow-sm'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-100 space-y-1">
          <button
            onClick={() => createNewQuote()}
            className="w-full py-2.5 bg-gradient-to-r from-brand-500 to-brand-700 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-brand-500/25 transition-all active:scale-[0.97] flex items-center justify-center gap-2"
          >
            <FileText size={16} /> Nuovo Preventivo
          </button>
          <button
            onClick={() => setIsCloudModalOpen(true)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${isCloudConnected
              ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
              : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`}
          >
            {isCloudConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
            {isCloudConnected ? 'Cloud Connesso' : 'Connetti Cloud'}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="flex justify-between items-center px-4 h-14">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center text-white text-sm">
              <PenTool size={16} />
            </div>
            <span className="font-bold text-slate-800 text-sm">AutoQuote Pro</span>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="bg-white border-t border-slate-100 p-3 space-y-1 animate-slide-down">
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => { setView(item.key); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${view === item.key ? 'bg-brand-50 text-brand-700' : 'text-slate-500 hover:bg-slate-50'
                  }`}
              >
                {item.icon} {item.label}
              </button>
            ))}
            <button
              onClick={() => { createNewQuote(); setMobileMenuOpen(false); }}
              className="w-full py-2.5 bg-gradient-to-r from-brand-500 to-brand-700 text-white rounded-xl text-sm font-semibold mt-2"
            >
              + Nuovo Preventivo
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 md:h-screen md:overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20 md:pt-8 animate-fade-in">
          {view === 'dashboard' && (
            <Dashboard
              quotes={history} clientCount={savedClients.length}
              onNavigate={setView} onLoadQuote={loadFromHistory}
            />
          )}

          {view === 'clients' && (
            <ClientsPanel clients={savedClients} onRefresh={loadData} showToast={showToast} />
          )}

          {view === 'history' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 min-h-[500px]">
              <HistoryPanel history={history} onLoad={loadFromHistory} onDelete={deleteFromHistory} />
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-100 py-6 mt-8">
          <div className="max-w-6xl mx-auto px-4 text-center text-xs text-slate-400">
            AutoQuote Pro &copy; {new Date().getFullYear()} — Creato da Andrea Baglioni
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;