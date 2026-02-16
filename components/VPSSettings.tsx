import React, { useState, useEffect } from 'react';
import { DomainConfig, InstallMode } from '../types';
import {
    Globe, Server, Shield, Check, AlertTriangle, RefreshCw,
    Terminal, Copy, ExternalLink, HardDrive, ArrowRight
} from 'lucide-react';

interface VPSSettingsProps {
    installMode: InstallMode;
    onSwitchToVPS: () => void;
    showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const VPSSettings: React.FC<VPSSettingsProps> = ({ installMode, onSwitchToVPS, showToast }) => {
    const [domainConfig, setDomainConfig] = useState<DomainConfig>(() => {
        const saved = localStorage.getItem('autoquote_domain_config');
        return saved ? JSON.parse(saved) : {
            domain: '',
            sslEnabled: false,
            autoRenew: true
        };
    });

    const [nginxConfig, setNginxConfig] = useState('');
    const [checkingSSL, setCheckingSSL] = useState(false);

    useEffect(() => {
        localStorage.setItem('autoquote_domain_config', JSON.stringify(domainConfig));
    }, [domainConfig]);

    const handleGenerateConfig = () => {
        if (!domainConfig.domain) {
            showToast('Inserisci un dominio valido', 'error');
            return;
        }

        const config = `
server {
    listen 80;
    server_name ${domainConfig.domain} www.${domainConfig.domain};

    location / {
        root /var/www/autoquote;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API Proxy (if using backend)
    # location /api {
    #     proxy_pass http://localhost:3000;
    # }
}
`;
        setNginxConfig(config.trim());
    };

    const handleCheckSSL = async () => {
        setCheckingSSL(true);
        // Simulate check
        setTimeout(() => {
            const isSecure = Math.random() > 0.3; // Simulating success/fail
            setDomainConfig(prev => ({
                ...prev,
                sslEnabled: isSecure,
                lastCheck: new Date().toISOString(),
                sslExpiry: isSecure ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() : undefined
            }));
            setCheckingSSL(false);
            if (isSecure) showToast('Certificato SSL valido rilevato!', 'success');
            else showToast('Nessun certificato SSL valido trovato o scaduto.', 'info');
        }, 1500);
    };

    const copyConfig = () => {
        navigator.clipboard.writeText(nginxConfig);
        showToast('Configurazione copiata!', 'success');
    };

    return (
        <div className="space-y-6 animate-fade-in p-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Server className="text-brand-600" /> Configurazione VPS & Domini
                    </h1>
                    <p className="text-slate-500 mt-1">Gestisci il dominio, SSL e configurazione server.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200 text-sm font-medium text-slate-600">
                    Mode: <span className={installMode === 'vps' ? 'text-emerald-600' : 'text-amber-600'}>{installMode.toUpperCase()}</span>
                </div>
            </div>

            {installMode === 'local' ? (
                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                    <div className="relative z-10 max-w-2xl">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm border border-white/10">
                            <HardDrive size={32} className="text-indigo-300" />
                        </div>
                        <h2 className="text-2xl font-bold mb-3">Passa alla modalità Cloud VPS</h2>
                        <p className="text-indigo-200 mb-8 leading-relaxed">
                            Hai installato AutoQuote su un server remoto? Attiva la modalità VPS per sbloccare funzionalità avanzate come:
                        </p>
                        <ul className="space-y-3 mb-8 text-indigo-100">
                            <li className="flex items-center gap-2"><Check size={18} className="text-emerald-400" /> Webhook per pagamenti live (Stripe, PayPal)</li>
                            <li className="flex items-center gap-2"><Check size={18} className="text-emerald-400" /> Accesso multi-device sicuro</li>
                            <li className="flex items-center gap-2"><Check size={18} className="text-emerald-400" /> Gestione domini e SSL automatizzata</li>
                        </ul>

                        <button
                            onClick={onSwitchToVPS}
                            className="bg-white text-indigo-900 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors flex items-center gap-2 shadow-lg shadow-black/20"
                        >
                            Attiva Modalità VPS <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Domain Configuration */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Globe size={20} className="text-brand-500" /> Configurazione Dominio
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nome Dominio</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={domainConfig.domain}
                                        onChange={(e) => setDomainConfig({ ...domainConfig, domain: e.target.value })}
                                        placeholder="esempio.com"
                                        className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                                    />
                                    <button
                                        onClick={handleCheckSSL}
                                        disabled={checkingSSL || !domainConfig.domain}
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors disabled:opacity-50"
                                    >
                                        {checkingSSL ? <RefreshCw size={18} className="animate-spin" /> : 'Verifica SSL'}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-slate-600">Stato SSL</span>
                                    {domainConfig.sslEnabled ? (
                                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg flex items-center gap-1">
                                            <Shield size={12} /> PROTETTO
                                        </span>
                                    ) : (
                                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-lg flex items-center gap-1">
                                            <AlertTriangle size={12} /> NON PROTETTO
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs text-slate-500">
                                    {domainConfig.lastCheck ? `Ultimo controllo: ${new Date(domainConfig.lastCheck).toLocaleString()}` : 'Mai controllato'}
                                </div>
                                {domainConfig.sslExpiry && (
                                    <div className="text-xs text-slate-500 mt-1">
                                        Scadenza: {new Date(domainConfig.sslExpiry).toLocaleDateString()}
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <label className="flex items-center justify-between cursor-pointer">
                                    <span className="text-sm font-medium text-slate-700">Rinnovo Automatico (Certbot)</span>
                                    <input
                                        type="checkbox"
                                        checked={domainConfig.autoRenew}
                                        onChange={(e) => setDomainConfig({ ...domainConfig, autoRenew: e.target.checked })}
                                        className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Server Configuration Snippet */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Terminal size={20} className="text-slate-600" /> Nginx Config
                            </h3>
                            <button
                                onClick={handleGenerateConfig}
                                className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                            >
                                Genera
                            </button>
                        </div>

                        <div className="relative group">
                            <textarea
                                readOnly
                                value={nginxConfig || '# Inserisci un dominio e clicca Genera'}
                                className="w-full h-64 bg-slate-900 text-slate-300 font-mono text-xs p-4 rounded-xl outline-none resize-none"
                            />
                            {nginxConfig && (
                                <button
                                    onClick={copyConfig}
                                    className="absolute top-2 right-2 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors opacity-0 group-hover:opacity-100"
                                    title="Copia"
                                >
                                    <Copy size={16} />
                                </button>
                            )}
                        </div>
                        <p className="text-xs text-slate-400 mt-3">
                            Copia questa configurazione in <code>/etc/nginx/sites-available/{domainConfig.domain || 'default'}</code> sul tuo server VPS.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
