import React, { useState, useEffect, useRef } from 'react';
import { EditorPanel } from './components/EditorPanel';
import { QuotePreview } from './components/QuotePreview';
import { HistoryPanel } from './components/HistoryPanel';
import { CloudSettings } from './components/CloudSettings';
import { Dashboard } from './components/Dashboard';
import { ClientsPanel } from './components/ClientsPanel';
import { Toast, ToastType } from './components/ui/Toast';
import { QuoteData, LineItem, CompanyInfo, ClientInfo, SavedClient } from './types';
import { Download, LayoutList, PenTool, Save, Cloud, RefreshCw, Loader2, Wifi, WifiOff, LayoutDashboard, Users, ArrowLeft, LogOut } from 'lucide-react';
import { 
  isSupabaseConfigured, 
  cloudSaveQuote, 
  cloudGetQuotes, 
  cloudDeleteQuote, 
  cloudSaveCompany,
  cloudGetCompany,
  cloudGetClients
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
  name: "",
  company: "",
  email: "",
  address: "",
  vatId: ""
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

const FORFETTARIO_NOTES = `Operazione effettuata ai sensi dell’articolo 1, commi da 54 a 89, della Legge n. 190/2014 così come modificato dalla Legge n. 208/2015.
Operazione non soggetta a ritenuta alla fonte a titolo di acconto imposte sui redditi.
Imposta di bollo da 2 euro assolta sull'originale per importi superiori a 77,47 euro.`;

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'editor' | 'history' | 'clients'>('dashboard');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  
  // Data State
  const [history, setHistory] = useState<QuoteData[]>([]);
  const [savedClients, setSavedClients] = useState<SavedClient[]>([]);
  const [toast, setToast] = useState<{msg: string, type: ToastType} | null>(null);

  const showToast = (msg: string, type: ToastType = 'success') => {
    setToast({ msg, type });
  };
  
  // Quote State
  const [quoteData, setQuoteData] = useState<QuoteData>(() => {
    const savedDraft = localStorage.getItem('autoquote_draft');
    if (savedDraft) {
      try { return JSON.parse(savedDraft); } catch (e) {}
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
      currency: 'EUR'
    };
  });

  const quoteDataRef = useRef(quoteData);

  useEffect(() => {
    quoteDataRef.current = quoteData;
  }, [quoteData]);

  const loadData = async () => {
    if (isSupabaseConfigured()) {
       setIsCloudConnected(true);
       try {
         const [cloudQuotes, cloudClients, cloudProfile] = await Promise.all([
           cloudGetQuotes(),
           cloudGetClients(),
           cloudGetCompany()
         ]);
         
         setHistory(cloudQuotes);
         setSavedClients(cloudClients);
         
         if (cloudProfile && !localStorage.getItem('autoquote_draft')) {
           setQuoteData(prev => ({ ...prev, company: cloudProfile }));
         }
       } catch (e) {
         console.error(e);
       }
    } else {
       const savedHistory = localStorage.getItem('autoquote_history');
       if (savedHistory) setHistory(JSON.parse(savedHistory));
    }
  };

  useEffect(() => {
    loadData();
  }, [isCloudConnected]);

  // Auto-save Interval (Local Only)
  useEffect(() => {
    const interval = setInterval(() => {
      setIsSaving(true);
      setTimeout(() => {
        localStorage.setItem('autoquote_draft', JSON.stringify(quoteDataRef.current));
        setLastSaved(new Date());
        setIsSaving(false);
      }, 600);
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
      if (typeof window.html2pdf === 'undefined') {
        throw new Error("Libreria PDF non caricata.");
      }
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
        await loadData(); // Reload all lists
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
     setIsSaving(true);
      setTimeout(() => {
        localStorage.setItem('autoquote_draft', JSON.stringify(quoteDataRef.current));
        setLastSaved(new Date());
        setIsSaving(false);
        showToast("Bozza salvata", 'info');
      }, 400);
  };

  const loadFromHistory = (quote: QuoteData) => {
    setQuoteData(JSON.parse(JSON.stringify(quote)));
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
      showToast("Eliminato (Locale)", 'success');
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
      currency: 'EUR'
    });
    setView('editor');
  };

  // --- RENDER LOGIC ---

  // 1. Editor View (Split Screen)
  if (view === 'editor') {
    return (
      <div className="min-h-screen flex flex-col md:flex-row text-slate-800 font-sans bg-slate-100">
        {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
        
        {/* Sidebar */}
        <div className="w-full md:w-5/12 lg:w-1/3 bg-white border-r border-slate-200 h-auto md:h-screen flex flex-col no-print shadow-xl z-10">
           {/* Editor Header */}
           <div className="p-4 border-b border-slate-100 bg-white flex justify-between items-center">
             <button 
               onClick={() => setView('dashboard')}
               className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium transition-colors"
             >
               <ArrowLeft size={18} /> Dashboard
             </button>
             <div className="flex items-center gap-2">
                 <div className="w-8 h-8 bg-odoo-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                    AQ
                 </div>
                 <span className="font-bold text-slate-700">Editor</span>
             </div>
           </div>

           {/* Editor Content */}
           <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
             <div className="flex gap-2 mb-6">
                 <button 
                  onClick={saveToHistory}
                  disabled={isSaving}
                  className="flex-1 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 flex items-center justify-center gap-2 text-sm font-medium shadow-md transition-all active:scale-95 disabled:opacity-70"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  {isCloudConnected ? 'Salva su Cloud' : 'Salva Locale'}
                </button>
                <button 
                  onClick={createNewQuote}
                  className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium shadow-sm transition-all active:scale-95"
                  title="Nuovo preventivo vuoto"
                >
                  Nuovo
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 mb-4 px-1">
                 <div className="flex items-center gap-2">
                    {isSaving ? (
                      <>
                        <RefreshCw size={12} className="animate-spin text-odoo-500" />
                        <span className="text-odoo-600 font-medium">Salvataggio...</span>
                      </>
                    ) : lastSaved ? (
                      <>
                        <Cloud size={12} className={isCloudConnected ? "text-blue-500" : "text-emerald-500"} />
                        <span>{isCloudConnected ? "Cloud" : "Bozza"} {lastSaved.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </>
                    ) : (
                      <span>Modifiche non salvate</span>
                    )}
                 </div>
                 <button onClick={forceAutoSave} className="text-slate-400 hover:text-slate-600 underline decoration-slate-300 underline-offset-2">
                   Salva ora
                 </button>
              </div>

              <EditorPanel 
                data={quoteData} 
                onChange={updateQuote}
                onSaveProfile={saveCompanyProfile}
                onExport={() => {}} 
                onImport={() => {}} 
                savedClients={savedClients}
              />
           </div>
        </div>

        {/* Right Preview */}
        <div className="w-full md:w-7/12 lg:w-2/3 bg-slate-200/80 h-auto md:h-screen overflow-y-auto p-4 md:p-8 flex flex-col items-center backdrop-blur-sm">
           <div className="w-full max-w-[210mm] mb-6 flex justify-between items-center">
             <div className="flex items-center gap-2">
               <div className={`w-2 h-2 rounded-full ${lastSaved && !isSaving ? 'bg-emerald-500' : 'bg-amber-400'}`}></div>
               <div className="text-sm text-slate-600 font-medium">Anteprima Live</div>
             </div>
             <button 
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="group flex items-center gap-2 px-5 py-2.5 bg-odoo-600 text-white rounded-lg shadow-lg shadow-odoo-600/20 hover:bg-odoo-700 transition-all font-medium active:translate-y-0.5 disabled:opacity-70 disabled:cursor-wait"
            >
              {isGeneratingPdf ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} className="group-hover:animate-bounce" />}
              {isGeneratingPdf ? 'Generazione...' : 'Scarica PDF'}
            </button>
          </div>
          <div className="bg-white shadow-2xl w-full max-w-[210mm] min-h-[297mm] p-[15mm] md:p-[20mm] relative animate-in fade-in zoom-in-95 duration-500">
             <QuotePreview data={quoteData} />
          </div>
        </div>
      </div>
    );
  }

  // 2. Full Screen Management Views (Dashboard, Clients, History)
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <CloudSettings 
        isOpen={isCloudModalOpen} 
        onClose={() => setIsCloudModalOpen(false)} 
        onConnect={() => { setIsCloudConnected(true); loadData(); showToast("Cloud Connesso!", 'success'); }}
      />

      {/* Main Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center gap-2">
                <div className="w-8 h-8 bg-odoo-500 rounded-lg flex items-center justify-center text-white">
                  <PenTool size={18} />
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-800">AutoQuote</span>
              </div>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                <button 
                  onClick={() => setView('dashboard')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${view === 'dashboard' ? 'border-odoo-500 text-odoo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                >
                  <LayoutDashboard size={18} className="mr-2" /> Dashboard
                </button>
                <button 
                  onClick={() => setView('clients')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${view === 'clients' ? 'border-odoo-500 text-odoo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                >
                  <Users size={18} className="mr-2" /> Clienti
                </button>
                <button 
                  onClick={() => setView('history')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${view === 'history' ? 'border-odoo-500 text-odoo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                >
                  <LayoutList size={18} className="mr-2" /> Storico
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                  onClick={() => { createNewQuote(); }}
                  className="bg-odoo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-odoo-700 transition-colors shadow-md shadow-odoo-600/20"
                >
                  + Nuovo Preventivo
              </button>
              <button 
                onClick={() => setIsCloudModalOpen(true)}
                className={`p-2 rounded-full transition-colors ${isCloudConnected ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                title={isCloudConnected ? "Connesso a Supabase" : "Connetti Cloud"}
              >
                  {isCloudConnected ? <Wifi size={18} /> : <WifiOff size={18} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
        
        {view === 'dashboard' && (
          <Dashboard 
            quotes={history} 
            clientCount={savedClients.length} 
            onNavigate={setView} 
            onLoadQuote={loadFromHistory} 
          />
        )}
        
        {view === 'clients' && (
          <div className="bg-transparent">
             <ClientsPanel clients={savedClients} onRefresh={loadData} />
          </div>
        )}
        
        {view === 'history' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[500px]">
             <HistoryPanel 
               history={history} 
               onLoad={loadFromHistory} 
               onDelete={deleteFromHistory} 
             />
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-400">
          AutoQuote Pro &copy; {new Date().getFullYear()} - Professional Invoicing System
        </div>
      </footer>

    </div>
  );
};

export default App;