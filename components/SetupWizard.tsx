import React, { useState } from 'react';
import { CompanyInfo, SmtpConfig, InstallMode } from '../types';
import {
    Building2, Mail, Server, ChevronRight, ChevronLeft, Check,
    Loader2, Rocket, Shield, Zap
} from 'lucide-react';

interface SetupWizardProps {
    initialCompany: CompanyInfo;
    onComplete: (company: CompanyInfo, smtp: SmtpConfig, mode: InstallMode) => void;
    onSkip: () => void;
}

const DEFAULT_SMTP: SmtpConfig = {
    host: '',
    port: 587,
    user: '',
    password: '',
    fromName: '',
    fromEmail: '',
    secure: true,
};

const STEPS = [
    { key: 'welcome', label: 'Benvenuto', icon: <Rocket size={20} /> },
    { key: 'mode', label: 'Ambiente', icon: <Server size={20} /> },
    { key: 'company', label: 'Azienda', icon: <Building2 size={20} /> },
    { key: 'smtp', label: 'Email SMTP', icon: <Mail size={20} /> },
    { key: 'done', label: 'Pronto!', icon: <Check size={20} /> },
];

export const SetupWizard: React.FC<SetupWizardProps> = ({ initialCompany, onComplete, onSkip }) => {
    const [step, setStep] = useState(0);
    const [company, setCompany] = useState<CompanyInfo>(initialCompany);
    const [installMode, setInstallMode] = useState<InstallMode>('local');
    const [smtp, setSmtp] = useState<SmtpConfig>(DEFAULT_SMTP);
    const [testingSmtp, setTestingSmtp] = useState(false);
    const [smtpStatus, setSmtpStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 outline-none text-sm bg-white";
    const labelClass = "block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5";

    const handleTestSmtp = async () => {
        setTestingSmtp(true);
        // Simulate SMTP test - in production this would call a backend API
        await new Promise(r => setTimeout(r, 2000));
        setSmtpStatus(smtp.host ? 'success' : 'error');
        setTestingSmtp(false);
    };

    const handleCompanyChange = (field: keyof CompanyInfo, value: string) => {
        setCompany(prev => ({ ...prev, [field]: value }));
    };

    const handleSmtpChange = (field: keyof SmtpConfig, value: string | number | boolean) => {
        setSmtp(prev => ({ ...prev, [field]: value }));
    };

    const nextStep = () => {
        if (step < STEPS.length - 1) setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 0) setStep(step - 1);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-violet-500/8 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-lg relative z-10 animate-scale-in">
                {/* Progress bar */}
                <div className="flex items-center justify-between mb-8 px-4">
                    {STEPS.map((s, i) => (
                        <React.Fragment key={s.key}>
                            <div className="flex flex-col items-center gap-1.5">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${i <= step
                                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                                    : 'bg-white/10 text-white/30'
                                    }`}>
                                    {i < step ? <Check size={18} /> : s.icon}
                                </div>
                                <span className={`text-[10px] font-medium ${i <= step ? 'text-white' : 'text-white/30'}`}>
                                    {s.label}
                                </span>
                            </div>
                            {i < STEPS.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-2 mb-5 rounded-full transition-colors ${i < step ? 'bg-brand-500' : 'bg-white/10'
                                    }`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Card */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    {/* Step 0 — Welcome */}
                    {step === 0 && (
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-brand-400 to-brand-600 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-xl shadow-brand-500/20">
                                🚀
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">
                                Benvenuto in AutoQuote Pro!
                            </h2>
                            <p className="text-slate-500 text-sm mb-8 max-w-sm mx-auto">
                                Configuriamo il tuo account in pochi passi. Potrai modificare tutto nelle Impostazioni in qualsiasi momento.
                            </p>

                            <div className="grid grid-cols-3 gap-3 mb-8">
                                {[
                                    { icon: <Building2 size={20} />, label: 'Profilo Azienda' },
                                    { icon: <Mail size={20} />, label: 'Config SMTP' },
                                    { icon: <Shield size={20} />, label: 'Pronto!' },
                                ].map((item, i) => (
                                    <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                        <div className="text-brand-500 mb-1.5 flex justify-center">{item.icon}</div>
                                        <span className="text-xs font-medium text-slate-600">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 1 — Install Mode */}
                    {step === 1 && (
                        <div className="p-8">
                            <h2 className="text-xl font-bold text-slate-800 mb-2">Dove stai installando?</h2>
                            <p className="text-slate-500 text-sm mb-6">Scegli l'ambiente per configurare le funzionalità corrette.</p>

                            <div className="grid gap-4">
                                <div
                                    onClick={() => setInstallMode('local')}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-4 ${installMode === 'local' ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-brand-200'}`}
                                >
                                    <div className={`mt-1 p-2 rounded-lg ${installMode === 'local' ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-500'}`}>
                                        <Building2 size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className={`font-bold ${installMode === 'local' ? 'text-brand-700' : 'text-slate-700'}`}>Locale / PC Personale</h3>
                                            {installMode === 'local' && <Check size={18} className="text-brand-500" />}
                                        </div>
                                        <p className="text-sm text-slate-500 mt-1">Uso personale sul tuo computer. Le funzioni server (webhook pagamenti) saranno nascoste.</p>
                                    </div>
                                </div>

                                <div
                                    onClick={() => setInstallMode('vps')}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-4 ${installMode === 'vps' ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-brand-200'}`}
                                >
                                    <div className={`mt-1 p-2 rounded-lg ${installMode === 'vps' ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-500'}`}>
                                        <Server size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className={`font-bold ${installMode === 'vps' ? 'text-brand-700' : 'text-slate-700'}`}>VPS / Cloud Server</h3>
                                            {installMode === 'vps' && <Check size={18} className="text-brand-500" />}
                                        </div>
                                        <p className="text-sm text-slate-500 mt-1">Installazione su server remoto accessibile dal web. Tutte le funzioni incluse.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2 — Company Info */}
                    {step === 2 && (
                        <div className="p-8">
                            <h2 className="text-xl font-bold text-slate-800 mb-1">Profilo Azienda</h2>
                            <p className="text-slate-400 text-sm mb-6">Questi dati appariranno sui tuoi preventivi.</p>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={labelClass}>Nome Azienda</label>
                                        <input className={inputClass} value={company.name}
                                            onChange={e => handleCompanyChange('name', e.target.value)} placeholder="La Tua Azienda" />
                                    </div>
                                    <div>
                                        <label className={labelClass}>P.IVA</label>
                                        <input className={inputClass} value={company.vatId}
                                            onChange={e => handleCompanyChange('vatId', e.target.value)} placeholder="IT12345678901" />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Indirizzo</label>
                                    <input className={inputClass} value={company.address}
                                        onChange={e => handleCompanyChange('address', e.target.value)} placeholder="Via Roma 1, 00100 Roma" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={labelClass}>Email</label>
                                        <input className={inputClass} type="email" value={company.email}
                                            onChange={e => handleCompanyChange('email', e.target.value)} placeholder="info@azienda.it" />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Telefono</label>
                                        <input className={inputClass} value={company.phone}
                                            onChange={e => handleCompanyChange('phone', e.target.value)} placeholder="+39 333 1234567" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={labelClass}>Sito Web</label>
                                        <input className={inputClass} value={company.website || ''}
                                            onChange={e => handleCompanyChange('website', e.target.value)} placeholder="https://azienda.it" />
                                    </div>
                                    <div>
                                        <label className={labelClass}>IBAN</label>
                                        <input className={inputClass} value={company.iban || ''}
                                            onChange={e => handleCompanyChange('iban', e.target.value)} placeholder="IT60X054..." />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>URL Logo</label>
                                    <input className={inputClass} value={company.logoUrl}
                                        onChange={e => handleCompanyChange('logoUrl', e.target.value)} placeholder="https://..." />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3 — SMTP */}
                    {step === 3 && (
                        <div className="p-8">
                            <h2 className="text-xl font-bold text-slate-800 mb-1">Configurazione SMTP</h2>
                            <p className="text-slate-400 text-sm mb-6">Per inviare preventivi via email direttamente dall'app. <span className="text-brand-500 font-medium">Opzionale.</span></p>

                            <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="col-span-2">
                                        <label className={labelClass}>Server SMTP</label>
                                        <input className={inputClass} value={smtp.host}
                                            onChange={e => handleSmtpChange('host', e.target.value)} placeholder="smtp.gmail.com" />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Porta</label>
                                        <input className={inputClass} type="number" value={smtp.port}
                                            onChange={e => handleSmtpChange('port', parseInt(e.target.value) || 587)} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={labelClass}>Utente SMTP</label>
                                        <input className={inputClass} value={smtp.user}
                                            onChange={e => handleSmtpChange('user', e.target.value)} placeholder="user@gmail.com" />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Password SMTP</label>
                                        <input className={inputClass} type="password" value={smtp.password}
                                            onChange={e => handleSmtpChange('password', e.target.value)} placeholder="••••••••" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={labelClass}>Nome Mittente</label>
                                        <input className={inputClass} value={smtp.fromName}
                                            onChange={e => handleSmtpChange('fromName', e.target.value)} placeholder="La Tua Azienda" />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Email Mittente</label>
                                        <input className={inputClass} value={smtp.fromEmail}
                                            onChange={e => handleSmtpChange('fromEmail', e.target.value)} placeholder="noreply@azienda.it" />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={smtp.secure} onChange={e => handleSmtpChange('secure', e.target.checked)}
                                            className="sr-only peer" />
                                        <div className="w-9 h-5 bg-slate-200 peer-focus:ring-2 peer-focus:ring-brand-500/20 rounded-full peer peer-checked:bg-brand-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                                    </label>
                                    <div>
                                        <span className="text-sm font-medium text-slate-700">Connessione sicura (TLS/SSL)</span>
                                        <p className="text-xs text-slate-400">Raccomandato per la maggior parte dei provider</p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleTestSmtp}
                                    disabled={testingSmtp || !smtp.host}
                                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${smtpStatus === 'success'
                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                        : smtpStatus === 'error'
                                            ? 'bg-red-50 text-red-600 border border-red-200'
                                            : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                                        } disabled:opacity-50`}
                                >
                                    {testingSmtp ? (
                                        <><Loader2 size={16} className="animate-spin" /> Test in corso...</>
                                    ) : smtpStatus === 'success' ? (
                                        <><Check size={16} /> Connessione riuscita!</>
                                    ) : smtpStatus === 'error' ? (
                                        <><Server size={16} /> Test fallito — controlla i dati</>
                                    ) : (
                                        <><Zap size={16} /> Testa Connessione SMTP</>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 4 — Done */}
                    {step === 4 && (
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-xl shadow-emerald-500/20">
                                🎉
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Tutto pronto!</h2>
                            <p className="text-slate-500 text-sm mb-8 max-w-sm mx-auto">
                                La configurazione è completa. Puoi modificare queste impostazioni in qualsiasi momento dalla pagina Impostazioni.
                            </p>

                            <div className="space-y-2 text-left bg-slate-50 rounded-2xl p-5 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Ambiente</span>
                                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                                        {installMode === 'local' ? <Building2 size={14} /> : <Server size={14} />}
                                        {installMode === 'local' ? 'Locale' : 'VPS Server'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Azienda</span>
                                    <span className="font-semibold text-slate-700">{company.name || '—'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">P.IVA</span>
                                    <span className="font-semibold text-slate-700">{company.vatId || '—'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">SMTP</span>
                                    <span className="font-semibold text-slate-700">{smtp.host || 'Non configurato'}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                        {step > 0 ? (
                            <button onClick={prevStep}
                                className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors">
                                <ChevronLeft size={16} /> Indietro
                            </button>
                        ) : (
                            <button onClick={onSkip}
                                className="text-xs text-slate-400 hover:text-slate-600 transition-colors font-medium">
                                Salta configurazione
                            </button>
                        )}

                        {step < STEPS.length - 1 ? (
                            <button onClick={nextStep}
                                className="flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-brand-500 to-brand-700 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-brand-500/25 transition-all active:scale-[0.97]">
                                Avanti <ChevronRight size={16} />
                            </button>
                        ) : (
                            <button onClick={() => onComplete(company, smtp, installMode)}
                                className="flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all active:scale-[0.97]">
                                Inizia! <Rocket size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
