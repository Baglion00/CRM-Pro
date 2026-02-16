import React, { useState } from 'react';
import { AppSettings, CompanyInfo, SmtpConfig } from '../types';
import {
    Building2, Mail, Server, Save, Loader2, Check, Eye, EyeOff,
    Zap, Shield, Palette, FileText, Globe, CreditCard, LogOut, Trash2, ChevronDown, ChevronUp
} from 'lucide-react';
import { EmailTemplateEditor } from './EmailTemplateEditor';

interface SettingsPanelProps {
    settings: AppSettings;
    onSave: (settings: AppSettings) => void;
    onExportData?: () => void;
    onReset?: () => void;
    onLogout?: () => void;
    userEmail?: string;
    showToast: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
    settings, onSave, onExportData, onReset, onLogout, userEmail, showToast
}) => {
    const [editSettings, setEditSettings] = useState<AppSettings>(settings);
    const [showSmtpPassword, setShowSmtpPassword] = useState(false);
    const [savingSection, setSavingSection] = useState<string | null>(null);
    const [testingSmtp, setTestingSmtp] = useState(false);
    const [smtpTestResult, setSmtpTestResult] = useState<'idle' | 'success' | 'error'>('idle');
    const [openSection, setOpenSection] = useState<string>('company');

    const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 outline-none text-sm bg-white transition-colors";
    const labelClass = "block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5";

    const handleSaveSection = async (section: string) => {
        setSavingSection(section);
        await new Promise(r => setTimeout(r, 300));

        // In a real app we might save only partial data, but here we just pass the whole object
        // The parent determines what to persist based on what changed, or just saves all.
        onSave(editSettings);

        setSavingSection(null);
        showToast('Impostazioni salvate!', 'success');
    };

    const handleTestSmtp = async () => {
        setTestingSmtp(true);
        setSmtpTestResult('idle');
        await new Promise(r => setTimeout(r, 2000));
        setSmtpTestResult(editSettings.smtp.host ? 'success' : 'error');
        setTestingSmtp(false);
    };

    const toggleSection = (section: string) => {
        setOpenSection(openSection === section ? '' : section);
    };

    const SectionHeader = ({ id, icon, title, subtitle }: { id: string; icon: React.ReactNode; title: string; subtitle: string }) => (
        <button
            onClick={() => toggleSection(id)}
            className="w-full flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors"
        >
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                    {icon}
                </div>
                <div className="text-left">
                    <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
                    <p className="text-xs text-slate-400">{subtitle}</p>
                </div>
            </div>
            {openSection === id ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
        </button>
    );

    const SaveButton = ({ section }: { section: string }) => (
        <button
            onClick={() => handleSaveSection(section)}
            disabled={savingSection === section}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-500 to-brand-700 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-brand-500/25 transition-all active:scale-[0.97] disabled:opacity-50"
        >
            {savingSection === section ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Salva
        </button>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Impostazioni</h1>
                <p className="text-slate-500 text-sm mt-1">Gestisci il profilo, le configurazioni email e le preferenze dell'app.</p>
            </div>

            {/* Account Card */}
            {userEmail && (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-sm shadow-md">
                            {userEmail[0].toUpperCase()}
                        </div>
                        <div>
                            <p className="font-semibold text-sm text-slate-800">{userEmail}</p>
                            <p className="text-xs text-slate-400">Account autenticato</p>
                        </div>
                    </div>
                    {onLogout && (
                        <button
                            onClick={onLogout}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
                        >
                            <LogOut size={16} /> Esci
                        </button>
                    )}
                </div>
            )}

            {/* Company Section */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <SectionHeader id="company" icon={<Building2 size={20} />} title="Profilo Azienda" subtitle="Dati che appaiono sui preventivi" />
                {openSection === 'company' && (
                    <div className="px-5 pb-5 border-t border-slate-100 pt-5 space-y-4 animate-fade-in">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className={labelClass}>Nome Azienda</label>
                                <input className={inputClass} value={editSettings.companyInfo.name}
                                    onChange={e => setEditSettings({ ...editSettings, companyInfo: { ...editSettings.companyInfo, name: e.target.value } })} />
                            </div>
                            <div>
                                <label className={labelClass}>P.IVA</label>
                                <input className={inputClass} value={editSettings.companyInfo.vatId}
                                    onChange={e => setEditSettings({ ...editSettings, companyInfo: { ...editSettings.companyInfo, vatId: e.target.value } })} />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Indirizzo</label>
                            <input className={inputClass} value={editSettings.companyInfo.address}
                                onChange={e => setEditSettings({ ...editSettings, companyInfo: { ...editSettings.companyInfo, address: e.target.value } })} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className={labelClass}>Email</label>
                                <input className={inputClass} type="email" value={editSettings.companyInfo.email}
                                    onChange={e => setEditSettings({ ...editSettings, companyInfo: { ...editSettings.companyInfo, email: e.target.value } })} />
                            </div>
                            <div>
                                <label className={labelClass}>Telefono</label>
                                <input className={inputClass} value={editSettings.companyInfo.phone}
                                    onChange={e => setEditSettings({ ...editSettings, companyInfo: { ...editSettings.companyInfo, phone: e.target.value } })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className={labelClass}>Sito Web</label>
                                <input className={inputClass} value={editSettings.companyInfo.website || ''}
                                    onChange={e => setEditSettings({ ...editSettings, companyInfo: { ...editSettings.companyInfo, website: e.target.value } })} />
                            </div>
                            <div>
                                <label className={labelClass}>IBAN</label>
                                <input className={inputClass} value={editSettings.companyInfo.iban || ''}
                                    onChange={e => setEditSettings({ ...editSettings, companyInfo: { ...editSettings.companyInfo, iban: e.target.value } })} />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>URL Logo</label>
                            <input className={inputClass} value={editSettings.companyInfo.logoUrl}
                                onChange={e => setEditSettings({ ...editSettings, companyInfo: { ...editSettings.companyInfo, logoUrl: e.target.value } })} />
                        </div>
                        <div className="flex justify-end pt-2">
                            <SaveButton section="company" />
                        </div>
                    </div>
                )}
            </div>

            {/* SMTP Section */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <SectionHeader id="smtp" icon={<Mail size={20} />} title="Configurazione SMTP" subtitle="Per inviare email direttamente dall'app" />
                {openSection === 'smtp' && (
                    <div className="px-5 pb-5 border-t border-slate-100 pt-5 space-y-4 animate-fade-in">
                        <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-2">
                                <label className={labelClass}>Server SMTP</label>
                                <input className={inputClass} value={editSettings.smtp.host}
                                    onChange={e => setEditSettings({ ...editSettings, smtp: { ...editSettings.smtp, host: e.target.value } })} placeholder="smtp.gmail.com" />
                            </div>
                            <div>
                                <label className={labelClass}>Porta</label>
                                <input className={inputClass} type="number" value={editSettings.smtp.port}
                                    onChange={e => setEditSettings({ ...editSettings, smtp: { ...editSettings.smtp, port: parseInt(e.target.value) || 587 } })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className={labelClass}>Utente</label>
                                <input className={inputClass} value={editSettings.smtp.user}
                                    onChange={e => setEditSettings({ ...editSettings, smtp: { ...editSettings.smtp, user: e.target.value } })} placeholder="user@gmail.com" />
                            </div>
                            <div>
                                <label className={labelClass}>Password</label>
                                <div className="relative">
                                    <input className={inputClass} type={showSmtpPassword ? 'text' : 'password'} value={editSettings.smtp.password}
                                        onChange={e => setEditSettings({ ...editSettings, smtp: { ...editSettings.smtp, password: e.target.value } })} placeholder="••••••••" />
                                    <button type="button" onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600">
                                        {showSmtpPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className={labelClass}>Nome Mittente</label>
                                <input className={inputClass} value={editSettings.smtp.fromName}
                                    onChange={e => setEditSettings({ ...editSettings, smtp: { ...editSettings.smtp, fromName: e.target.value } })} placeholder="La Tua Azienda" />
                            </div>
                            <div>
                                <label className={labelClass}>Email Mittente</label>
                                <input className={inputClass} value={editSettings.smtp.fromEmail}
                                    onChange={e => setEditSettings({ ...editSettings, smtp: { ...editSettings.smtp, fromEmail: e.target.value } })} placeholder="noreply@azienda.it" />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={editSettings.smtp.secure} onChange={e => setEditSettings({ ...editSettings, smtp: { ...editSettings.smtp, secure: e.target.checked } })}
                                    className="sr-only peer" />
                                <div className="w-9 h-5 bg-slate-200 peer-focus:ring-2 peer-focus:ring-brand-500/20 rounded-full peer peer-checked:bg-brand-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                            </label>
                            <span className="text-sm font-medium text-slate-700">TLS/SSL</span>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <button
                                onClick={handleTestSmtp}
                                disabled={testingSmtp || !editSettings.smtp.host}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${smtpTestResult === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                    : smtpTestResult === 'error' ? 'bg-red-50 text-red-600 border border-red-200'
                                        : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                                    } disabled:opacity-50`}
                            >
                                {testingSmtp ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                                {testingSmtp ? 'Test...' : smtpTestResult === 'success' ? 'OK!' : smtpTestResult === 'error' ? 'Fallito' : 'Testa'}
                            </button>
                            <SaveButton section="smtp" />
                        </div>
                    </div>
                )}
            </div>



            {/* Email Templates Section */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <SectionHeader id="templates" icon={<Mail size={20} />} title="Modelli Email" subtitle="Personalizza i testi delle email" />
                {openSection === 'templates' && (
                    <div className="px-5 pb-5 border-t border-slate-100 pt-5 animate-fade-in">
                        <EmailTemplateEditor
                            templates={editSettings.emailTemplates || []}
                            onSave={(newTemplates) => {
                                const newSettings = { ...editSettings, emailTemplates: newTemplates };
                                setEditSettings(newSettings);
                                // Auto-save when templates change
                                onSave(newSettings);
                            }}
                            showToast={showToast}
                        />
                    </div>
                )}
            </div>

            {/* Quote Preferences */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <SectionHeader id="preferences" icon={<FileText size={20} />} title="Preferenze Preventivi" subtitle="Prefisso, scadenza e note predefinite" />
                {openSection === 'preferences' && (
                    <div className="px-5 pb-5 border-t border-slate-100 pt-5 space-y-4 animate-fade-in">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className={labelClass}>Prefisso Numerazione</label>
                                <input className={inputClass} value={editSettings.quotePrefix}
                                    onChange={e => setEditSettings({ ...editSettings, quotePrefix: e.target.value })} placeholder="PRV" />
                                <p className="text-xs text-slate-400 mt-1">Es: {editSettings.quotePrefix}-2026-001</p>
                            </div>
                            <div>
                                <label className={labelClass}>Giorni Scadenza Default</label>
                                <input className={inputClass} type="number" value={editSettings.defaultExpiryDays}
                                    onChange={e => setEditSettings({ ...editSettings, defaultExpiryDays: parseInt(e.target.value) || 30 })} min={1} max={365} />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Note Predefinite</label>
                            <textarea className={`${inputClass} min-h-[120px]`} value={editSettings.defaultNotes}
                                onChange={e => setEditSettings({ ...editSettings, defaultNotes: e.target.value })} />
                        </div>
                        <div className="flex justify-end pt-2">
                            <SaveButton section="preferences" />
                        </div>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <SectionHeader id="info" icon={<Shield size={20} />} title="Informazioni App" subtitle="Versione e dati" />
                {openSection === 'info' && (
                    <div className="px-5 pb-5 border-t border-slate-100 pt-5 space-y-3 animate-fade-in">
                        <div className="flex justify-between text-sm py-2 border-b border-slate-50">
                            <span className="text-slate-500">Versione</span>
                            <span className="font-semibold text-slate-700">2.0.0</span>
                        </div>
                        <div className="flex justify-between text-sm py-2 border-b border-slate-50">
                            <span className="text-slate-500">Autore</span>
                            <span className="font-semibold text-slate-700">Andrea Baglioni</span>
                        </div>
                        <div className="flex justify-between text-sm py-2 border-b border-slate-50">
                            <span className="text-slate-500">Storage</span>
                            <span className="font-semibold text-slate-700">Supabase + LocalStorage</span>
                        </div>
                        <div className="flex justify-between text-sm py-2">
                            <span className="text-slate-500">Repository</span>
                            <a href="https://github.com/Baglion00/CRM-Pro" target="_blank" rel="noreferrer"
                                className="font-semibold text-brand-600 hover:text-brand-800 transition-colors">
                                GitHub →
                            </a>
                        </div>
                    </div>
                )}
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50/50 rounded-2xl border border-red-100 shadow-sm overflow-hidden">
                <SectionHeader id="danger" icon={<Trash2 size={20} className="text-red-500" />} title="Gestione Dati" subtitle="Esporta backup o resetta" />
                {openSection === 'danger' && (
                    <div className="px-5 pb-5 border-t border-red-100 pt-5 space-y-4 animate-fade-in">
                        <p className="text-sm text-red-600/80">
                            Attenzione: le azioni in questa sezione possono causare la perdita di dati se non si dispone di un backup.
                        </p>
                        <div className="flex gap-3">
                            {onExportData && (
                                <button
                                    onClick={onExportData}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50"
                                >
                                    <Globe size={16} /> Esporta Dati
                                </button>
                            )}
                            {onReset && (
                                <button
                                    onClick={onReset}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50"
                                >
                                    <Trash2 size={16} /> Reset Totale
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};
