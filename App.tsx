import React, { useState, useEffect, useRef, useMemo } from 'react';
import { EditorPanel } from './components/EditorPanel';
import { QuotePreview } from './components/QuotePreview';
import { HistoryPanel } from './components/HistoryPanel';
import { CloudSettings } from './components/CloudSettings';
import { Dashboard } from './components/Dashboard';
import { ClientsPanel } from './components/ClientsPanel';
import { CatalogPanel } from './components/CatalogPanel';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { AuthScreen } from './components/AuthScreen';
import { SetupWizard } from './components/SetupWizard';
import { SettingsPanel } from './components/SettingsPanel';
import { ShareDialog } from './components/ShareDialog';
import { SignaturePad } from './components/SignaturePad';
import { PaymentTracker } from './components/PaymentTracker';
import { ClientPortal } from './components/ClientPortal';
import { ProfilePage } from './components/ProfilePage';
import { TeamManager } from './components/TeamManager';
import { PaymentIntegrations } from './components/PaymentIntegrations';
import { VPSSettings } from './components/VPSSettings';
import { PipelineView } from './components/PipelineView';
import { CalendarView } from './components/CalendarView';
import { AutomationsPanel } from './components/AutomationsPanel';
import { Sidebar } from './components/Sidebar';
import { Toast, ToastType } from './components/ui/Toast';
import { NotificationBell } from './components/ui/NotificationBell';
import {
  QuoteData, LineItem, CompanyInfo, ClientInfo, SavedClient, CatalogItem,
  SmtpConfig, QuoteStatus, PaymentStatus, TeamMember, UserRole,
  PaymentGatewayConfig, AutomationRule, AutomationLog, AutomationTrigger, InstallMode, AppSettings, EmailTemplate
} from './types';
import {
  Download, LayoutList, PenTool, Save, Cloud, RefreshCw, Loader2, Wifi, WifiOff,
  LayoutDashboard, Users, ArrowLeft, FileText, Menu, X, Settings, Package, BarChart3, LogOut,
  Share2, PenTool as SignIcon, CreditCard, Globe, Moon, Sun, Upload, DownloadCloud, UserCircle, UsersRound, Zap, Server, Kanban, Calendar
} from 'lucide-react';
import { loadRules, saveRules, loadAutomationLog, saveAutomationLog, evaluateRules } from './services/automationEngine';
import { loadGatewayConfigs, saveGatewayConfigs } from './services/paymentService';
import {
  isSupabaseConfigured, cloudSaveQuote, cloudGetQuotes, cloudDeleteQuote,
  cloudSaveCompany, cloudGetCompany, cloudGetClients,
  cloudSaveCatalogItem, cloudGetCatalogItems, cloudDeleteCatalogItem,
  authSignIn, authSignUp, authSignOut, authGetUser
} from './services/supabaseClient';
import { generateQuoteNumber, calculateExpiryDate, checkExpiredQuotes, getExpiryDays } from './services/automationService';
import { getReminders, Reminder } from './services/reminderService';
import { exportClientsCSV, parseClientsCSV, exportQuotesCSV, downloadCSV } from './services/csvService';

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

const DEFAULT_SMTP: SmtpConfig = {
  host: '',
  port: 587,
  secure: false,
  user: '',
  password: '',
  fromName: '',
  fromEmail: ''
};

type View = 'dashboard' | 'pipeline' | 'editor' | 'history' | 'clients' | 'catalog' | 'calendar' | 'analytics' | 'settings' | 'payments' | 'portal' | 'profile' | 'team' | 'automations' | 'integrations' | 'domains';

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
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [toast, setToast] = useState<{ msg: string, type: ToastType } | null>(null);

  // Auth state
  const [authUser, setAuthUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(() => localStorage.getItem('autoquote_offline') === 'true');
  const [needsSetup, setNeedsSetup] = useState(() => !localStorage.getItem('autoquote_setup_done'));

  // SMTP & Preferences state
  const [smtpConfig, setSmtpConfig] = useState<SmtpConfig | null>(() => {
    const saved = localStorage.getItem('autoquote_smtp');
    return saved ? JSON.parse(saved) : null;
  });

  const [installMode, setInstallMode] = useState<InstallMode>(() => {
    const saved = localStorage.getItem('autoquote_install_mode');
    return (saved as InstallMode) || 'local';
  });
  const [quotePrefix, setQuotePrefix] = useState(() => localStorage.getItem('autoquote_prefix') || 'PRV');
  const [defaultExpiryDays, setDefaultExpiryDays] = useState(() => parseInt(localStorage.getItem('autoquote_expiry_days') || '30'));
  const [defaultNotes, setDefaultNotes] = useState(() => localStorage.getItem('autoquote_default_notes') || FORFETTARIO_NOTES);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>(() => {
    const saved = localStorage.getItem('autoquote_templates');
    return saved ? JSON.parse(saved) : [];
  });


  // NEW: Share, Signature, Dark Mode, Portal
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isSignatureOpen, setIsSignatureOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('autoquote_dark') === 'true');
  const [portalQuote, setPortalQuote] = useState<QuoteData | null>(null);

  // NEW: Team, Automations, Payment Integrations
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem('autoquote_team');
    if (saved) try { return JSON.parse(saved); } catch { }
    return [{ id: 'owner_1', email: '', name: 'Proprietario', role: 'owner' as UserRole, status: 'active' as const, joinedAt: new Date().toISOString() }];
  });
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>(() => loadRules());
  const [automationLogs, setAutomationLogs] = useState<AutomationLog[]>(() => loadAutomationLog());
  const [gatewayConfigs, setGatewayConfigs] = useState<PaymentGatewayConfig[]>(() => loadGatewayConfigs());

  // Apply dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('autoquote_dark', isDarkMode.toString());
  }, [isDarkMode]);

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
      number: `PRV-${new Date().getFullYear()}-001`,
      date: new Date().toISOString().split('T')[0],
      expiryDate: calculateExpiryDate(new Date().toISOString().split('T')[0], getExpiryDays()),
      company: company,
      client: INITIAL_CLIENT,
      items: INITIAL_ITEMS,
      notes: defaultNotes,
      currency: 'EUR',
      status: 'draft' as QuoteStatus
    };
  });

  // Auth check on mount
  useEffect(() => {
    if (isOfflineMode || !isSupabaseConfigured()) {
      setAuthChecked(true);
      return;
    }
    authGetUser().then(user => {
      setAuthUser(user);
      setAuthChecked(true);
    });
  }, [isOfflineMode]);

  // Auth handlers
  const handleEmailLogin = async (email: string, password: string) => {
    setAuthError(null);
    try {
      const data = await authSignIn(email, password);
      setAuthUser(data.user);
    } catch (e: any) {
      setAuthError(e.message || 'Errore durante il login');
    }
  };

  const handleEmailSignUp = async (email: string, password: string) => {
    setAuthError(null);
    try {
      await authSignUp(email, password);
      showToast('Registrazione completata! Controlla la tua email per confermare.', 'success');
    } catch (e: any) {
      setAuthError(e.message || 'Errore durante la registrazione');
    }
  };

  const handleLogout = async () => {
    await authSignOut();
    setAuthUser(null);
  };

  const handleSkipAuth = () => {
    setIsOfflineMode(true);
    localStorage.setItem('autoquote_offline', 'true');
    setAuthChecked(true);
  };

  // --- Setup Handler ---
  const handleSetupComplete = (company: CompanyInfo, smtp: SmtpConfig, mode: InstallMode) => {
    setQuoteData(prev => ({ ...prev, company }));
    localStorage.setItem('autoquote_company', JSON.stringify(company));
    setSmtpConfig(smtp);
    localStorage.setItem('autoquote_smtp', JSON.stringify(smtp));
    setInstallMode(mode);
    localStorage.setItem('autoquote_install_mode', mode);
    localStorage.setItem('autoquote_setup_done', 'true');
    setNeedsSetup(false);
    showToast('Setup completato!', 'success');
  };

  const handleSwitchToVPS = () => {
    setInstallMode('vps');
    localStorage.setItem('autoquote_install_mode', 'vps');
    showToast('Modalità VPS attivata! Funzioni sbloccate.', 'success');
  };

  const handleSkipSetup = () => {
    localStorage.setItem('autoquote_setup_done', 'true');
    setNeedsSetup(false);
  };

  // Settings save handlers
  const handleSaveCompanySettings = (company: CompanyInfo) => {
    setQuoteData(prev => ({ ...prev, company }));
    localStorage.setItem('autoquote_company', JSON.stringify(company));
    if (isCloudConnected) {
      cloudSaveCompany(company).catch(() => showToast('Errore sync cloud', 'error'));
    }
  };

  const handleSaveSmtpSettings = (smtp: SmtpConfig) => {
    setSmtpConfig(smtp);
    localStorage.setItem('autoquote_smtp', JSON.stringify(smtp));
  };

  const handleSavePreferences = (prefs: { quotePrefix: string; defaultExpiryDays: number; defaultNotes: string }) => {
    setQuotePrefix(prefs.quotePrefix);
    setDefaultExpiryDays(prefs.defaultExpiryDays);
    setDefaultNotes(prefs.defaultNotes);
    localStorage.setItem('autoquote_prefix', prefs.quotePrefix);
    localStorage.setItem('autoquote_expiry_days', prefs.defaultExpiryDays.toString());
    localStorage.setItem('autoquote_default_notes', prefs.defaultNotes);
    setQuoteData(prev => ({ ...prev, notes: prefs.defaultNotes }));
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    handleSaveCompanySettings(newSettings.companyInfo);
    handleSaveSmtpSettings(newSettings.smtp);
    handleSavePreferences({
      quotePrefix: newSettings.quotePrefix,
      defaultExpiryDays: newSettings.defaultExpiryDays,
      defaultNotes: newSettings.defaultNotes
    });

    if (newSettings.emailTemplates) {
      setEmailTemplates(newSettings.emailTemplates);
      localStorage.setItem('autoquote_templates', JSON.stringify(newSettings.emailTemplates));
    }

    setIsDarkMode(newSettings.theme === 'dark');
    showToast('Impostazioni salvate!', 'success');
  };

  const handleExportData = () => {
    // Implement data export logic (e.g., download all local storage data)
    const data = {
      history: localStorage.getItem('autoquote_history'),
      catalog: localStorage.getItem('autoquote_catalog'),
      company: localStorage.getItem('autoquote_company'),
      smtp: localStorage.getItem('autoquote_smtp'),
      prefix: localStorage.getItem('autoquote_prefix'),
      expiryDays: localStorage.getItem('autoquote_expiry_days'),
      defaultNotes: localStorage.getItem('autoquote_default_notes'),
      team: localStorage.getItem('autoquote_team'),
      automationRules: localStorage.getItem('autoquote_automation_rules'),
      automationLogs: localStorage.getItem('autoquote_automation_logs'),
      gatewayConfigs: localStorage.getItem('autoquote_gateway_configs'),
      dark: localStorage.getItem('autoquote_dark'),
      offline: localStorage.getItem('autoquote_offline'),
      setupDone: localStorage.getItem('autoquote_setup_done'),
      installMode: localStorage.getItem('autoquote_install_mode'),
      templates: localStorage.getItem('autoquote_templates'),
    };
    const filename = `autoquote_backup_${new Date().toISOString().split('T')[0]}.json`;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Dati esportati con successo!', 'success');
  };

  const handleResetApp = () => {
    if (window.confirm('Sei sicuro di voler resettare l\'applicazione? Tutti i dati locali verranno cancellati.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // Reminders
  const reminders = useMemo<Reminder[]>(() => getReminders(history), [history]);

  const quoteDataRef = useRef(quoteData);
  useEffect(() => { quoteDataRef.current = quoteData; }, [quoteData]);

  const loadData = async () => {
    if (isSupabaseConfigured()) {
      setIsCloudConnected(true);
      try {
        const [cloudQuotes, cloudClients, cloudProfile, cloudCatalog] = await Promise.all([
          cloudGetQuotes(), cloudGetClients(), cloudGetCompany(), cloudGetCatalogItems()
        ]);
        const updatedQuotes = checkExpiredQuotes(
          cloudQuotes.map(q => ({ ...q, status: q.status || 'draft' }))
        );
        setHistory(updatedQuotes);
        setSavedClients(cloudClients);
        setCatalogItems(cloudCatalog);
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
        const updated = checkExpiredQuotes(parsed.map((q: any) => ({ ...q, status: q.status || 'draft' })));
        setHistory(updated);
      }
      const savedCatalog = localStorage.getItem('autoquote_catalog');
      if (savedCatalog) {
        setCatalogItems(JSON.parse(savedCatalog));
      }
    }
  };

  useEffect(() => { loadData(); }, [isCloudConnected, authUser]);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem('autoquote_draft', JSON.stringify(quoteDataRef.current));
      setLastSaved(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Catalog handlers
  const handleSaveCatalogItem = async (item: Partial<CatalogItem>) => {
    if (isCloudConnected) {
      try {
        const saved = await cloudSaveCatalogItem(item);
        setCatalogItems(prev => {
          const existing = prev.findIndex(i => i.id === saved.id);
          if (existing >= 0) {
            const updated = [...prev];
            updated[existing] = saved;
            return updated;
          }
          return [...prev, saved];
        });
      } catch (e) {
        showToast('Errore salvataggio catalogo', 'error');
      }
    } else {
      const newItem: CatalogItem = {
        id: item.id || crypto.randomUUID(),
        name: item.name || '',
        description: item.description || '',
        unitPrice: item.unitPrice || 0,
        taxRate: item.taxRate || 0,
        category: item.category || 'Generale',
      };
      const updated = item.id
        ? catalogItems.map(i => i.id === item.id ? { ...i, ...item } as CatalogItem : i)
        : [...catalogItems, newItem];
      setCatalogItems(updated);
      localStorage.setItem('autoquote_catalog', JSON.stringify(updated));
    }
  };

  const handleDeleteCatalogItem = async (id: string) => {
    if (isCloudConnected) {
      try {
        await cloudDeleteCatalogItem(id);
        setCatalogItems(prev => prev.filter(i => i.id !== id));
      } catch (e) {
        showToast('Errore eliminazione', 'error');
      }
    } else {
      const updated = catalogItems.filter(i => i.id !== id);
      setCatalogItems(updated);
      localStorage.setItem('autoquote_catalog', JSON.stringify(updated));
    }
  };

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
    const today = new Date().toISOString().split('T')[0];

    setQuoteData({
      id: crypto.randomUUID(),
      number: generateQuoteNumber(history),
      date: today,
      expiryDate: calculateExpiryDate(today, getExpiryDays()),
      company: company,
      client: INITIAL_CLIENT,
      items: INITIAL_ITEMS,
      notes: defaultNotes,
      currency: 'EUR',
      status: 'draft'
    });
    setView('editor');
  };

  // Handle reminder click
  const handleReminderClick = (quoteId: string) => {
    const quote = history.find(q => q.id === quoteId);
    if (quote) loadFromHistory(quote);
  };

  // --- NEW: Payment update handler ---
  const handleUpdatePayment = (quoteId: string, status: PaymentStatus, amount?: number) => {
    const updatePayment = (quotes: QuoteData[]) =>
      quotes.map(q => q.id === quoteId ? {
        ...q,
        paymentStatus: status,
        paidAmount: amount,
        paidDate: status === 'paid' ? new Date().toISOString().split('T')[0] : q.paidDate
      } : q);

    setHistory(prev => {
      const updated = updatePayment(prev);
      if (!isCloudConnected) {
        localStorage.setItem('autoquote_history', JSON.stringify(updated));
      } else {
        const q = updated.find(u => u.id === quoteId);
        if (q) cloudSaveQuote(q).catch(() => { });
      }
      return updated;
    });
  };

  // --- NEW: Signature handler ---
  const handleSignature = (signatureBase64: string, signerName: string) => {
    setQuoteData(prev => ({
      ...prev,
      signatureData: signatureBase64,
      signedBy: signerName,
      signedAt: new Date().toISOString()
    }));
    setIsSignatureOpen(false);
    showToast('Firma applicata!', 'success');
  };

  // --- NEW: Portal handlers ---
  const handlePortalAccept = () => {
    if (portalQuote) {
      handleUpdateQuoteStatus(portalQuote.id, 'accepted');
      setPortalQuote(prev => prev ? { ...prev, status: 'accepted' } : null);
      showToast('Preventivo accettato!', 'success');
    }
  };

  const handlePortalReject = () => {
    if (portalQuote) {
      handleUpdateQuoteStatus(portalQuote.id, 'rejected');
      setPortalQuote(prev => prev ? { ...prev, status: 'rejected' } : null);
      showToast('Preventivo rifiutato.', 'info');
    }
  };

  const handleUpdateQuoteStatus = (quoteId: string, status: QuoteStatus) => {
    setHistory(prev => {
      const updated = prev.map(q => q.id === quoteId ? { ...q, status } : q);
      if (!isCloudConnected) {
        localStorage.setItem('autoquote_history', JSON.stringify(updated));
      } else {
        const q = updated.find(u => u.id === quoteId);
        if (q) cloudSaveQuote(q).catch(() => { });
      }
      return updated;
    });
  };

  // --- NEW: CSV handlers ---
  const handleExportClients = () => {
    const csv = exportClientsCSV(savedClients);
    downloadCSV(csv, 'clienti_autoquote.csv');
    showToast('CSV clienti esportato!', 'success');
  };

  const handleImportClients = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseClientsCSV(text);
      if (parsed.length === 0) {
        showToast('Nessun cliente trovato nel CSV', 'error');
        return;
      }
      showToast(`${parsed.length} clienti importati!`, 'success');
    };
    reader.readAsText(file);
  };

  const handleExportQuotes = () => {
    const csv = exportQuotesCSV(history);
    downloadCSV(csv, 'preventivi_autoquote.csv');
    showToast('CSV preventivi esportato!', 'success');
  };

  // --- TEAM HANDLERS ---
  const handleInviteTeamMember = (email: string, name: string, role: UserRole) => {
    const newMember: TeamMember = {
      id: `tm_${Date.now()}`,
      email, name, role,
      status: 'invited',
      invitedBy: authUser?.email || 'owner',
      joinedAt: new Date().toISOString(),
    };
    const updated = [...teamMembers, newMember];
    setTeamMembers(updated);
    localStorage.setItem('autoquote_team', JSON.stringify(updated));
  };

  const handleUpdateMemberRole = (memberId: string, role: UserRole) => {
    const updated = teamMembers.map(m => m.id === memberId ? { ...m, role } : m);
    setTeamMembers(updated);
    localStorage.setItem('autoquote_team', JSON.stringify(updated));
  };

  const handleRemoveMember = (memberId: string) => {
    const updated = teamMembers.filter(m => m.id !== memberId);
    setTeamMembers(updated);
    localStorage.setItem('autoquote_team', JSON.stringify(updated));
  };

  // --- AUTOMATION HANDLERS ---
  const handleUpdateAutomationRules = (rules: AutomationRule[]) => {
    setAutomationRules(rules);
    saveRules(rules);
  };

  const handleClearAutomationLogs = () => {
    setAutomationLogs([]);
    saveAutomationLog([]);
  };

  // --- GATEWAY HANDLERS ---
  const handleSaveGatewayConfigs = (configs: PaymentGatewayConfig[]) => {
    setGatewayConfigs(configs);
    saveGatewayConfigs(configs);
  };

  // Run automation engine on load
  useEffect(() => {
    if (history.length > 0) {
      const newLogs = evaluateRules(history, automationRules, quoteData.company.name);
      if (newLogs.length > 0) {
        setAutomationLogs(prev => [...prev, ...newLogs]);
      }
    }
  }, [history.length]);

  // --- AUTH GUARD ---
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-900 via-brand-800 to-brand-950 flex items-center justify-center">
        <Loader2 size={32} className="text-white animate-spin" />
      </div>
    );
  }

  if (isSupabaseConfigured() && !authUser && !isOfflineMode) {
    return (
      <AuthScreen
        onEmailLogin={handleEmailLogin}
        onEmailSignUp={handleEmailSignUp}
        onSkip={handleSkipAuth}
        error={authError}
      />
    );
  }

  // --- SETUP WIZARD ---
  if (needsSetup) {
    return (
      <SetupWizard
        initialCompany={quoteData.company}
        onComplete={handleSetupComplete}
        onSkip={handleSkipSetup}
      />
    );
  }

  // --- CLIENT PORTAL VIEW ---
  if (view === 'portal' && portalQuote) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
        <div className="max-w-3xl mx-auto py-4 px-4">
          <button
            onClick={() => { setView('history'); setPortalQuote(null); }}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 font-medium text-sm mb-4 transition-colors"
          >
            <ArrowLeft size={16} /> Torna all'app
          </button>
        </div>
        <ClientPortal
          quote={portalQuote}
          onAccept={handlePortalAccept}
          onReject={handlePortalReject}
          onSign={() => setIsSignatureOpen(true)}
        />
        <SignaturePad
          isOpen={isSignatureOpen}
          onSave={(sig, name) => {
            setPortalQuote(prev => prev ? { ...prev, signatureData: sig, signedBy: name, signedAt: new Date().toISOString() } : null);
            if (portalQuote) {
              handleUpdateQuoteStatus(portalQuote.id, portalQuote.status);
              setHistory(prev => prev.map(q => q.id === portalQuote.id ? { ...q, signatureData: sig, signedBy: name, signedAt: new Date().toISOString() } : q));
            }
            setIsSignatureOpen(false);
            showToast('Firma applicata!', 'success');
          }}
          onCancel={() => setIsSignatureOpen(false)}
        />
      </div>
    );
  }

  // --- Nav items ---


  // --- EDITOR VIEW ---
  if (view === 'editor') {
    return (
      <div className="min-h-screen flex flex-col md:flex-row text-slate-800 font-sans bg-surface">
        {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
        <ShareDialog quote={quoteData} isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} showToast={showToast} />
        <SignaturePad isOpen={isSignatureOpen} onSave={handleSignature} onCancel={() => setIsSignatureOpen(false)} signerName={quoteData.client.name} />

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
            <div className="flex gap-2 mb-3">
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

            {/* NEW: Quick action buttons */}
            <div className="flex gap-1.5 mb-5">
              <button
                onClick={() => setIsShareOpen(true)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors flex items-center justify-center gap-1.5"
                title="Condividi via WhatsApp/Email"
              >
                <Share2 size={14} /> Condividi
              </button>
              <button
                onClick={() => setIsSignatureOpen(true)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-brand-50 text-brand-600 hover:bg-brand-100 transition-colors flex items-center justify-center gap-1.5"
                title="Firma digitale"
              >
                <SignIcon size={14} /> Firma
              </button>
              <button
                onClick={() => { setPortalQuote(quoteData); setView('portal'); }}
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex items-center justify-center gap-1.5"
                title="Portale cliente"
              >
                <Globe size={14} /> Portale
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

            {/* Ritenuta d'acconto toggle */}
            <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-600">Ritenuta d'acconto</label>
                <select
                  value={quoteData.ritenutaRate || 0}
                  onChange={e => updateQuote({ ritenutaRate: parseInt(e.target.value) })}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-brand-500/20 outline-none"
                >
                  <option value={0}>Nessuna</option>
                  <option value={20}>20% (standard)</option>
                  <option value={4}>4% (INPS)</option>
                  <option value={23}>23% (redditi)</option>
                </select>
              </div>
            </div>

            <EditorPanel
              data={quoteData}
              onChange={updateQuote}
              onSaveProfile={saveCompanyProfile}
              onExport={() => { }}
              onImport={() => { }}
              savedClients={savedClients}
              showToast={showToast}
              catalogItems={catalogItems}
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsShareOpen(true)}
                className="px-4 py-2.5 bg-[#25D366] text-white rounded-xl shadow-md shadow-[#25D366]/20 hover:shadow-lg transition-all font-semibold text-sm flex items-center gap-2"
              >
                <Share2 size={16} /> Condividi
              </button>
              <button
                onClick={handleDownloadPDF} disabled={isGeneratingPdf}
                className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-500 to-brand-700 text-white rounded-xl shadow-lg shadow-brand-500/20 hover:shadow-xl hover:shadow-brand-500/30 transition-all font-semibold active:scale-[0.97] disabled:opacity-70"
              >
                {isGeneratingPdf ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} className="group-hover:animate-bounce" />}
                {isGeneratingPdf ? 'Generazione...' : 'Scarica PDF'}
              </button>
            </div>
          </div>
          <div className="bg-white shadow-2xl w-full max-w-[210mm] min-h-[297mm] p-[15mm] md:p-[20mm] relative animate-fade-in rounded-sm">
            <QuotePreview data={quoteData} />
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN LAYOUT (Dashboard, Clients, History, Catalog, Analytics, Payments) ---
  return (
    <div className="min-h-screen bg-surface font-sans text-slate-900 flex">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <CloudSettings
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
        onConnect={() => { setIsCloudConnected(true); loadData(); showToast("Cloud Connesso!", 'success'); }}
      />

      {/* Sidebar - Desktop */}
      {/* Sidebar Component */}
      <Sidebar
        view={view}
        setView={setView}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        installMode={installMode}
        onLogout={handleLogout}
        userRole={teamMembers.find(m => m.email === authUser?.email)?.role}
      />

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="flex justify-between items-center px-4 h-14">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center text-white text-sm">
              <PenTool size={16} />
            </div>
            <span className="font-bold text-slate-800 text-sm">AutoQuote Pro</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <NotificationBell reminders={reminders} onQuoteClick={handleReminderClick} />
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>


      </div>

      {/* Main Content */}
      <main className="flex-1 md:h-screen md:overflow-y-auto">
        {/* Topbar with notifications (desktop) */}
        <div className="hidden md:flex items-center justify-end px-8 py-4 border-b border-slate-100 bg-white/50">
          <div className="flex items-center gap-3">
            {/* CSV Export/Import buttons */}
            <div className="flex gap-1.5 mr-2">
              <button
                onClick={handleExportClients}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
                title="Esporta CSV clienti"
              >
                <DownloadCloud size={14} /> CSV
              </button>
              <button
                onClick={handleExportQuotes}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
                title="Esporta CSV preventivi"
              >
                <DownloadCloud size={14} /> Preventivi
              </button>
            </div>
            {authUser && (
              <span className="text-xs text-slate-400 mr-1">{authUser.email}</span>
            )}
            <NotificationBell reminders={reminders} onQuoteClick={handleReminderClick} />
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20 md:pt-8 animate-fade-in">
          {view === 'dashboard' && (
            <Dashboard
              quotes={history} clientCount={savedClients.length}
              onNavigate={setView as any} onLoadQuote={loadFromHistory}
            />
          )}

          {view === 'clients' && (
            <ClientsPanel clients={savedClients} onRefresh={loadData} showToast={showToast} />
          )}

          {view === 'catalog' && (
            <CatalogPanel
              items={catalogItems}
              onSave={handleSaveCatalogItem}
              onDelete={handleDeleteCatalogItem}
              showToast={showToast}
            />
          )}

          {view === 'history' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 min-h-[500px]">
              <HistoryPanel history={history} onLoad={loadFromHistory} onDelete={deleteFromHistory} />
            </div>
          )}

          {view === 'payments' && (
            <PaymentTracker
              quotes={history}
              onUpdatePayment={handleUpdatePayment}
              onLoadQuote={loadFromHistory}
              showToast={showToast}
            />
          )}

          {view === 'analytics' && (
            <AnalyticsPanel quotes={history} />
          )}

          {view === 'history' && (
            <HistoryPanel
              history={history}
              onLoad={loadFromHistory}
              onDelete={deleteFromHistory}
            // Assuming these new props are meant to be handled by HistoryPanel
            // If not, they would need to be implemented or the component changed.
            // For now, mapping to existing handlers or providing no-ops.
            // onExportPDF={handleDownloadPDF} // This would need to be adapted for a specific quote
            // onUpdateStatus={handleUpdateQuoteStatus}
            // onUpdatePayment={handleUpdatePayment}
            />
          )}

          {view === 'pipeline' && <PipelineView />}
          {view === 'calendar' && <CalendarView />}

          {view === 'clients' && (
            <ClientsPanel
              clients={savedClients}
              onRefresh={loadData}
              showToast={showToast}
            />
          )}

          {view === 'profile' && (
            <ProfilePage
              company={quoteData.company}
              quotes={history}
              userEmail={authUser?.email}
              onUpdateCompany={handleSaveCompanySettings}
              showToast={showToast}
            />
          )}

          {view === 'team' && (
            <TeamManager
              members={teamMembers}
              currentUserRole="owner"
              onInvite={handleInviteTeamMember}
              onUpdateRole={handleUpdateMemberRole}
              onRemoveMember={handleRemoveMember}
              showToast={showToast}
            />
          )}

          {view === 'automations' && (
            <AutomationsPanel
              rules={automationRules}
              logs={automationLogs}
              onUpdateRules={handleUpdateAutomationRules}
              onClearLogs={handleClearAutomationLogs}
              showToast={showToast}
            />
          )}

          {view === 'integrations' && installMode === 'vps' && (
            <PaymentIntegrations
              configs={gatewayConfigs}
              onSaveConfigs={handleSaveGatewayConfigs}
              showToast={showToast}
            />
          )}

          {view === 'settings' && (
            <SettingsPanel
              settings={{
                companyInfo: quoteData.company,
                smtp: smtpConfig || DEFAULT_SMTP,
                quotePrefix,
                defaultExpiryDays,
                defaultNotes,
                emailTemplates,
                currency: 'EUR',
                language: 'it',
                theme: isDarkMode ? 'dark' : 'light'
              }}
              onSave={handleSaveSettings}
              onExportData={handleExportData}
              onReset={handleResetApp}
              onLogout={authUser ? handleLogout : undefined}
              userEmail={authUser?.email}
              showToast={showToast}
            />
          )}

          {view === 'domains' && (
            <VPSSettings
              installMode={installMode}
              onSwitchToVPS={handleSwitchToVPS}
              showToast={showToast}
            />
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