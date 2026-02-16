import React, { useState } from 'react';
import {
    CreditCard, Check, X, ExternalLink, Copy, AlertTriangle,
    ToggleLeft, ToggleRight, Globe, TestTube, Link2, Wifi, WifiOff,
    ChevronDown, ChevronRight
} from 'lucide-react';
import { PaymentGatewayConfig, PaymentProvider } from '../types';
import { PROVIDER_INFO } from '../services/paymentService';

interface PaymentIntegrationsProps {
    configs: PaymentGatewayConfig[];
    onSaveConfigs: (configs: PaymentGatewayConfig[]) => void;
    showToast: (msg: string, type?: string) => void;
}

export const PaymentIntegrations: React.FC<PaymentIntegrationsProps> = ({
    configs, onSaveConfigs, showToast
}) => {
    const [expandedProvider, setExpandedProvider] = useState<PaymentProvider | null>(null);
    const [editConfigs, setEditConfigs] = useState<PaymentGatewayConfig[]>(configs);

    const updateConfig = (provider: PaymentProvider, updates: Partial<PaymentGatewayConfig>) => {
        setEditConfigs(prev => prev.map(c => c.provider === provider ? { ...c, ...updates } : c));
    };

    const handleSave = (provider: PaymentProvider) => {
        const config = editConfigs.find(c => c.provider === provider);
        if (!config) return;
        onSaveConfigs(editConfigs);
        showToast(`${PROVIDER_INFO[provider].name} configurato!`, 'success');
    };

    const handleToggle = (provider: PaymentProvider) => {
        const config = editConfigs.find(c => c.provider === provider);
        if (!config) return;
        if (!config.enabled && !config.apiKey) {
            showToast('Inserisci prima le chiavi API', 'error');
            setExpandedProvider(provider);
            return;
        }
        const newConfigs = editConfigs.map(c =>
            c.provider === provider ? { ...c, enabled: !c.enabled, connectedAt: !c.enabled ? new Date().toISOString() : c.connectedAt } : c
        );
        setEditConfigs(newConfigs);
        onSaveConfigs(newConfigs);
        showToast(`${PROVIDER_INFO[provider].name} ${!config.enabled ? 'attivato' : 'disattivato'}`, 'success');
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <CreditCard size={24} className="text-brand-600" />
                    Integrazioni Pagamento
                </h2>
                <p className="text-sm text-slate-500 mt-1">Configura i gateway per ricevere pagamenti direttamente dai tuoi preventivi</p>
            </div>

            {/* Active count */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold">
                    <Wifi size={12} />
                    {editConfigs.filter(c => c.enabled).length} attiv{editConfigs.filter(c => c.enabled).length === 1 ? 'o' : 'i'}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-500 rounded-full text-xs font-semibold">
                    <WifiOff size={12} />
                    {editConfigs.filter(c => !c.enabled).length} disattivat{editConfigs.filter(c => !c.enabled).length === 1 ? 'o' : 'i'}
                </div>
            </div>

            {/* Provider cards */}
            <div className="space-y-4">
                {(['stripe', 'paypal', 'gocardless'] as PaymentProvider[]).map(provider => {
                    const info = PROVIDER_INFO[provider];
                    const config = editConfigs.find(c => c.provider === provider)!;
                    const isExpanded = expandedProvider === provider;

                    return (
                        <div key={provider} className={`bg-white rounded-2xl shadow-sm border transition-all ${config.enabled ? 'border-emerald-200 shadow-emerald-100/50' : 'border-slate-200/80'}`}>
                            {/* Provider header */}
                            <div
                                className="flex items-center gap-4 p-5 cursor-pointer"
                                onClick={() => setExpandedProvider(isExpanded ? null : provider)}
                            >
                                <div className={`w-14 h-14 rounded-xl ${info.bg} flex items-center justify-center shadow-sm p-2.5`}>
                                    <img src={info.logo} alt={info.name} className="w-full h-full object-contain" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className={`text-lg font-bold ${info.color}`}>{info.name}</h3>
                                        {config.enabled && (
                                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Connesso
                                            </span>
                                        )}
                                        {config.mode === 'test' && config.apiKey && (
                                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full flex items-center gap-1">
                                                <TestTube size={10} /> Test Mode
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5">{info.description}</p>
                                </div>
                                <button
                                    onClick={e => { e.stopPropagation(); handleToggle(provider); }}
                                    className="flex-shrink-0"
                                >
                                    {config.enabled ? (
                                        <ToggleRight size={32} className="text-emerald-500" />
                                    ) : (
                                        <ToggleLeft size={32} className="text-slate-300" />
                                    )}
                                </button>
                                <div className="text-slate-400">
                                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                </div>
                            </div>

                            {/* Expanded config */}
                            {isExpanded && (
                                <div className="px-5 pb-5 border-t border-slate-100 pt-4 animate-slide-down">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {info.fields.map(field => (
                                            <div key={field.key} className="space-y-1">
                                                <label className="text-xs font-semibold text-slate-500">{field.label}</label>
                                                <input
                                                    value={(config as any)[field.key] || ''}
                                                    onChange={e => updateConfig(provider, { [field.key]: e.target.value })}
                                                    placeholder={field.placeholder}
                                                    type="password"
                                                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 outline-none font-mono"
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Mode toggle */}
                                    <div className="flex items-center gap-4 mt-4">
                                        <label className="text-xs font-semibold text-slate-500">Modalità:</label>
                                        <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg">
                                            <button
                                                onClick={() => updateConfig(provider, { mode: 'test' })}
                                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${config.mode === 'test' ? 'bg-amber-100 text-amber-700 shadow-sm' : 'text-slate-500'}`}
                                            >
                                                <TestTube size={12} className="inline mr-1" />Test
                                            </button>
                                            <button
                                                onClick={() => updateConfig(provider, { mode: 'live' })}
                                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${config.mode === 'live' ? 'bg-emerald-100 text-emerald-700 shadow-sm' : 'text-slate-500'}`}
                                            >
                                                <Globe size={12} className="inline mr-1" />Live
                                            </button>
                                        </div>
                                    </div>

                                    {/* Webhook URL */}
                                    <div className="mt-4 p-3 bg-slate-50 rounded-xl">
                                        <label className="text-xs font-semibold text-slate-500 flex items-center gap-1 mb-1">
                                            <Link2 size={12} /> Webhook URL
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 text-xs text-slate-600 bg-white px-3 py-2 rounded-lg border border-slate-200 truncate">
                                                {`https://yourdomain.com/api/webhooks/${provider}`}
                                            </code>
                                            <button
                                                onClick={() => { navigator.clipboard.writeText(`https://yourdomain.com/api/webhooks/${provider}`); showToast('URL copiato!'); }}
                                                className="p-2 text-slate-400 hover:text-brand-600 transition-colors"
                                            >
                                                <Copy size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {config.mode === 'live' && (
                                        <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-3 rounded-xl">
                                            <AlertTriangle size={14} />
                                            <span>Stai usando la <strong>modalità live</strong>. I pagamenti reali verranno elaborati.</span>
                                        </div>
                                    )}

                                    {/* Save button */}
                                    <div className="flex justify-end mt-4">
                                        <button
                                            onClick={() => handleSave(provider)}
                                            className="px-5 py-2.5 bg-gradient-to-r from-brand-500 to-brand-700 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all"
                                        >
                                            <Check size={14} className="inline mr-1.5" />
                                            Salva Configurazione
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Info section */}
            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-200/60">
                <h4 className="font-bold text-blue-800 text-sm mb-2 flex items-center gap-2">
                    <ExternalLink size={16} /> Come funziona
                </h4>
                <ul className="text-xs text-blue-700 space-y-1.5">
                    <li>1. Crea un account sul provider scelto (Stripe, PayPal o GoCardless)</li>
                    <li>2. Copia le chiavi API dalla dashboard del provider</li>
                    <li>3. Inseriscile qui e attiva l'integrazione</li>
                    <li>4. Genera link di pagamento direttamente dai tuoi preventivi</li>
                    <li>5. Condividi il link con il cliente — il pagamento viene tracciato automaticamente</li>
                </ul>
            </div>
        </div>
    );
};
