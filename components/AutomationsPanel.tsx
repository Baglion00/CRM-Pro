import React, { useState, useMemo } from 'react';
import {
    Zap, ToggleLeft, ToggleRight, Clock, Mail, Bell, ChevronDown, ChevronRight,
    Edit3, Check, X, Play, Pause, History, AlertCircle, CheckCircle2,
    XCircle, SkipForward, Users, User, Trash2, RefreshCw, Search
} from 'lucide-react';
import { AutomationRule, AutomationLog, AutomationTrigger } from '../types';
import { TRIGGER_CONFIG } from '../services/automationEngine';

interface AutomationsPanelProps {
    rules: AutomationRule[];
    logs: AutomationLog[];
    onUpdateRules: (rules: AutomationRule[]) => void;
    onClearLogs: () => void;
    showToast: (msg: string, type?: string) => void;
}

export const AutomationsPanel: React.FC<AutomationsPanelProps> = ({
    rules, logs, onUpdateRules, onClearLogs, showToast
}) => {
    const [activeTab, setActiveTab] = useState<'workflows' | 'log'>('workflows');
    const [expandedRule, setExpandedRule] = useState<string | null>(null);
    const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
    const [templateDraft, setTemplateDraft] = useState('');
    const [logFilter, setLogFilter] = useState<'all' | 'sent' | 'failed' | 'pending'>('all');

    const activeRules = rules.filter(r => r.enabled).length;

    const filteredLogs = useMemo(() => {
        const sorted = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        if (logFilter === 'all') return sorted;
        return sorted.filter(l => l.status === logFilter);
    }, [logs, logFilter]);

    const handleToggleRule = (ruleId: string) => {
        const updated = rules.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r);
        onUpdateRules(updated);
        const rule = rules.find(r => r.id === ruleId);
        showToast(`${rule?.name} ${rule?.enabled ? 'disattivato' : 'attivato'}`, 'success');
    };

    const handleUpdateDelay = (ruleId: string, days: number) => {
        const updated = rules.map(r => r.id === ruleId ? { ...r, delayDays: Math.max(0, days) } : r);
        onUpdateRules(updated);
    };

    const handleUpdateChannel = (ruleId: string, channel: 'email' | 'internal' | 'both') => {
        const updated = rules.map(r => r.id === ruleId ? { ...r, channel } : r);
        onUpdateRules(updated);
    };

    const handleSaveTemplate = (ruleId: string) => {
        const updated = rules.map(r => r.id === ruleId ? { ...r, emailTemplate: templateDraft } : r);
        onUpdateRules(updated);
        setEditingTemplate(null);
        showToast('Template salvato', 'success');
    };

    const handleUpdateAudience = (ruleId: string, audience: 'self' | 'client' | 'team') => {
        const updated = rules.map(r => r.id === ruleId ? { ...r, targetAudience: audience } : r);
        onUpdateRules(updated);
    };

    const channelLabels: Record<string, { label: string; icon: React.ReactNode }> = {
        email: { label: 'Email', icon: <Mail size={12} /> },
        internal: { label: 'Notifica', icon: <Bell size={12} /> },
        both: { label: 'Email + Notifica', icon: <Zap size={12} /> },
    };

    const audienceLabels: Record<string, { label: string; icon: React.ReactNode }> = {
        self: { label: 'A me', icon: <User size={12} /> },
        client: { label: 'Al cliente', icon: <Users size={12} /> },
        team: { label: 'Al team', icon: <Users size={12} /> },
    };

    const statusIcons: Record<string, React.ReactNode> = {
        sent: <CheckCircle2 size={14} className="text-emerald-500" />,
        failed: <XCircle size={14} className="text-red-500" />,
        pending: <Clock size={14} className="text-amber-500" />,
        skipped: <SkipForward size={14} className="text-slate-400" />,
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Zap size={24} className="text-brand-600" />
                        Automazioni
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">{activeRules} workflow attiv{activeRules === 1 ? 'o' : 'i'} su {rules.length}</p>
                </div>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-xl border border-slate-200/80 p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-600">{activeRules}</p>
                    <p className="text-xs text-slate-500">Attivi</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200/80 p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">{logs.filter(l => l.status === 'sent').length}</p>
                    <p className="text-xs text-slate-500">Eseguiti</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200/80 p-4 text-center">
                    <p className="text-2xl font-bold text-amber-600">{logs.filter(l => l.status === 'pending').length}</p>
                    <p className="text-xs text-slate-500">In Attesa</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
                {([
                    { key: 'workflows' as const, label: 'Workflow', icon: Zap, count: rules.length },
                    { key: 'log' as const, label: 'Log Esecuzione', icon: History, count: logs.length },
                ]).map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key
                            ? 'bg-white text-brand-700 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                        <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full">{tab.count}</span>
                    </button>
                ))}
            </div>

            {/* === WORKFLOWS TAB === */}
            {activeTab === 'workflows' && (
                <div className="space-y-3">
                    {rules.map(rule => {
                        const triggerInfo = TRIGGER_CONFIG[rule.trigger];
                        const isExpanded = expandedRule === rule.id;

                        return (
                            <div key={rule.id} className={`bg-white rounded-2xl shadow-sm border transition-all ${rule.enabled ? 'border-slate-200/80 hover:shadow-md' : 'border-slate-100 opacity-70'}`}>
                                {/* Rule header */}
                                <div className="flex items-center gap-4 p-5 cursor-pointer" onClick={() => setExpandedRule(isExpanded ? null : rule.id)}>
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-lg">
                                        {triggerInfo?.icon || '⚙️'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-slate-800 text-sm truncate">{rule.name}</h4>
                                            <span className={`text-[10px] font-semibold ${triggerInfo?.color || 'text-slate-500'}`}>
                                                {triggerInfo?.label}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 truncate mt-0.5">{rule.description}</p>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                                {channelLabels[rule.channel]?.icon}
                                                {channelLabels[rule.channel]?.label}
                                            </span>
                                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                                {audienceLabels[rule.targetAudience]?.icon}
                                                {audienceLabels[rule.targetAudience]?.label}
                                            </span>
                                            {rule.delayDays > 0 && (
                                                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                                    <Clock size={10} /> {rule.delayDays}gg
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={e => { e.stopPropagation(); handleToggleRule(rule.id); }}
                                        className="flex-shrink-0"
                                    >
                                        {rule.enabled ? (
                                            <ToggleRight size={28} className="text-emerald-500" />
                                        ) : (
                                            <ToggleLeft size={28} className="text-slate-300" />
                                        )}
                                    </button>
                                    <div className="text-slate-400">
                                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                    </div>
                                </div>

                                {/* Expanded config */}
                                {isExpanded && (
                                    <div className="px-5 pb-5 border-t border-slate-100 pt-4 animate-slide-down">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                            {/* Delay */}
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                                                    <Clock size={12} /> Ritardo (giorni)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={rule.delayDays}
                                                    onChange={e => handleUpdateDelay(rule.id, parseInt(e.target.value) || 0)}
                                                    min={0}
                                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 outline-none"
                                                />
                                            </div>
                                            {/* Channel */}
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-slate-500">Canale</label>
                                                <select
                                                    value={rule.channel}
                                                    onChange={e => handleUpdateChannel(rule.id, e.target.value as any)}
                                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 outline-none bg-white"
                                                >
                                                    <option value="email">Solo Email</option>
                                                    <option value="internal">Solo Notifica Interna</option>
                                                    <option value="both">Email + Notifica</option>
                                                </select>
                                            </div>
                                            {/* Audience */}
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-slate-500">Destinatario</label>
                                                <select
                                                    value={rule.targetAudience}
                                                    onChange={e => handleUpdateAudience(rule.id, e.target.value as any)}
                                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 outline-none bg-white"
                                                >
                                                    <option value="self">A me</option>
                                                    <option value="client">Al cliente</option>
                                                    <option value="team">Al team</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Email template */}
                                        {(rule.channel === 'email' || rule.channel === 'both') && (
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                                                        <Mail size={12} /> Template Email
                                                    </label>
                                                    {editingTemplate === rule.id ? (
                                                        <div className="flex gap-1">
                                                            <button onClick={() => handleSaveTemplate(rule.id)} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"><Check size={14} /></button>
                                                            <button onClick={() => setEditingTemplate(null)} className="p-1 text-slate-400 hover:bg-slate-50 rounded"><X size={14} /></button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => { setEditingTemplate(rule.id); setTemplateDraft(rule.emailTemplate || ''); }}
                                                            className="p-1 text-slate-400 hover:text-brand-600 transition-colors"
                                                        >
                                                            <Edit3 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                                {editingTemplate === rule.id ? (
                                                    <textarea
                                                        value={templateDraft}
                                                        onChange={e => setTemplateDraft(e.target.value)}
                                                        rows={6}
                                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 outline-none resize-none"
                                                    />
                                                ) : (
                                                    <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                                                        {rule.emailTemplate || 'Nessun template configurato'}
                                                    </div>
                                                )}
                                                <div className="flex flex-wrap gap-1.5">
                                                    {['{{clientName}}', '{{quoteNumber}}', '{{quoteDate}}', '{{expiryDate}}', '{{amount}}', '{{companyName}}'].map(v => (
                                                        <span key={v} className="px-2 py-0.5 bg-brand-50 text-brand-600 text-[10px] font-mono rounded-md">{v}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Run stats */}
                                        <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
                                            <span>Esecuzioni: {rule.runCount}</span>
                                            {rule.lastRun && <span>Ultimo: {new Date(rule.lastRun).toLocaleDateString('it-IT')}</span>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* === LOG TAB === */}
            {activeTab === 'log' && (
                <div className="space-y-4">
                    {/* Filters */}
                    <div className="flex items-center justify-between">
                        <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg">
                            {(['all', 'sent', 'pending', 'failed'] as const).map(f => (
                                <button
                                    key={f}
                                    onClick={() => setLogFilter(f)}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${logFilter === f ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500'}`}
                                >
                                    {f === 'all' ? 'Tutti' : f === 'sent' ? 'Inviati' : f === 'pending' ? 'In Attesa' : 'Falliti'}
                                </button>
                            ))}
                        </div>
                        {logs.length > 0 && (
                            <button
                                onClick={() => { onClearLogs(); showToast('Log cancellati'); }}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <Trash2 size={12} /> Cancella Log
                            </button>
                        )}
                    </div>

                    {/* Log entries */}
                    {filteredLogs.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
                            <History size={40} className="mx-auto text-slate-300 mb-3" />
                            <p className="text-slate-500 font-medium">Nessun log</p>
                            <p className="text-xs text-slate-400 mt-1">Le automazioni genereranno log qui quando vengono eseguite</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden divide-y divide-slate-100">
                            {filteredLogs.slice(0, 50).map(log => (
                                <div key={log.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                                    {statusIcons[log.status]}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-700 truncate">{log.action}</p>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                            <span>{log.ruleName}</span>
                                            {log.quoteNumber && <span>• {log.quoteNumber}</span>}
                                            {log.clientName && <span>• {log.clientName}</span>}
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${log.status === 'sent' ? 'bg-emerald-100 text-emerald-700' : log.status === 'failed' ? 'bg-red-100 text-red-700' : log.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {log.status === 'sent' ? 'Inviato' : log.status === 'failed' ? 'Fallito' : log.status === 'pending' ? 'In Attesa' : 'Saltato'}
                                        </span>
                                        <p className="text-[10px] text-slate-400 mt-0.5">{new Date(log.timestamp).toLocaleString('it-IT')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
