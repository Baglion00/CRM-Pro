import React, { useState, useMemo } from 'react';
import { QuoteData, CURRENCY_FORMATTER, PAYMENT_CONFIG, PaymentStatus } from '../types';
import {
    CreditCard, DollarSign, CheckCircle2, Clock, AlertCircle,
    TrendingUp, Filter, Search, ChevronDown, Receipt
} from 'lucide-react';

interface PaymentTrackerProps {
    quotes: QuoteData[];
    onUpdatePayment: (quoteId: string, status: PaymentStatus, amount?: number) => void;
    onLoadQuote: (quote: QuoteData) => void;
    showToast: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export const PaymentTracker: React.FC<PaymentTrackerProps> = ({
    quotes, onUpdatePayment, onLoadQuote, showToast
}) => {
    const [filter, setFilter] = useState<'all' | PaymentStatus>('all');
    const [search, setSearch] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editAmount, setEditAmount] = useState('');

    const acceptedQuotes = useMemo(() =>
        quotes.filter(q => q.status === 'accepted' || q.status === 'sent' || q.paymentStatus),
        [quotes]
    );

    const filtered = useMemo(() => {
        let result = acceptedQuotes;
        if (filter !== 'all') result = result.filter(q => (q.paymentStatus || 'unpaid') === filter);
        if (search) {
            const s = search.toLowerCase();
            result = result.filter(q =>
                q.number.toLowerCase().includes(s) ||
                q.client.name.toLowerCase().includes(s) ||
                q.client.company.toLowerCase().includes(s)
            );
        }
        return result;
    }, [acceptedQuotes, filter, search]);

    const getTotal = (q: QuoteData) =>
        q.items.reduce((a, i) => a + i.quantity * i.unitPrice * (1 + i.taxRate / 100), 0);

    const stats = useMemo(() => {
        const totalRevenue = acceptedQuotes.reduce((a, q) => a + getTotal(q), 0);
        const totalPaid = acceptedQuotes.filter(q => q.paymentStatus === 'paid').reduce((a, q) => a + getTotal(q), 0);
        const totalPartial = acceptedQuotes.filter(q => q.paymentStatus === 'partial').reduce((a, q) => a + (q.paidAmount || 0), 0);
        const totalUnpaid = totalRevenue - totalPaid - totalPartial;
        return { totalRevenue, totalPaid, totalPartial, totalUnpaid };
    }, [acceptedQuotes]);

    const handleSaveAmount = (q: QuoteData) => {
        const amount = parseFloat(editAmount);
        if (isNaN(amount) || amount <= 0) {
            showToast('Inserisci un importo valido', 'error');
            return;
        }
        const total = getTotal(q);
        if (amount >= total) {
            onUpdatePayment(q.id, 'paid', total);
        } else {
            onUpdatePayment(q.id, 'partial', amount);
        }
        setEditingId(null);
        setEditAmount('');
        showToast('Pagamento aggiornato', 'success');
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Pagamenti</h1>
                <p className="text-slate-500 text-sm mt-1">Monitora lo stato dei pagamenti dei preventivi accettati.</p>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Totale Fatturato', value: stats.totalRevenue, icon: <TrendingUp size={18} />, color: 'text-brand-600 bg-brand-50' },
                    { label: 'Incassato', value: stats.totalPaid, icon: <CheckCircle2 size={18} />, color: 'text-emerald-600 bg-emerald-50' },
                    { label: 'Acconti', value: stats.totalPartial, icon: <DollarSign size={18} />, color: 'text-amber-600 bg-amber-50' },
                    { label: 'Da incassare', value: stats.totalUnpaid, icon: <Clock size={18} />, color: 'text-red-600 bg-red-50' },
                ].map((s, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                            {s.icon}
                        </div>
                        <p className="text-xs text-slate-500 font-medium">{s.label}</p>
                        <p className="text-lg font-bold text-slate-800 mt-0.5">{CURRENCY_FORMATTER.format(s.value)}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Cerca per numero o cliente..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 outline-none"
                    />
                </div>
                {(['all', 'unpaid', 'partial', 'paid'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${filter === f
                                ? 'bg-brand-500 text-white shadow-sm'
                                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                            }`}
                    >
                        {f === 'all' ? 'Tutti' : PAYMENT_CONFIG[f].label}
                    </button>
                ))}
            </div>

            {/* Quote list */}
            <div className="space-y-3">
                {filtered.length === 0 && (
                    <div className="text-center py-16 text-slate-400">
                        <Receipt size={40} className="mx-auto mb-3 opacity-40" />
                        <p className="font-medium">Nessun preventivo da tracciare</p>
                        <p className="text-xs mt-1">I preventivi accettati appariranno qui</p>
                    </div>
                )}
                {filtered.map(q => {
                    const total = getTotal(q);
                    const ps = q.paymentStatus || 'unpaid';
                    const cfg = PAYMENT_CONFIG[ps];
                    const paidPct = ps === 'paid' ? 100 : ps === 'partial' ? Math.round(((q.paidAmount || 0) / total) * 100) : 0;

                    return (
                        <div key={q.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3 cursor-pointer" onClick={() => onLoadQuote(q)}>
                                    <span className="text-2xl">{cfg.icon}</span>
                                    <div>
                                        <p className="font-bold text-sm text-slate-800">{q.number}</p>
                                        <p className="text-xs text-slate-400">{q.client.company || q.client.name}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-slate-800">{CURRENCY_FORMATTER.format(total)}</p>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                                        {cfg.label}
                                    </span>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                                <div
                                    className={`h-full rounded-full transition-all ${ps === 'paid' ? 'bg-emerald-500' : ps === 'partial' ? 'bg-amber-400' : 'bg-slate-200'
                                        }`}
                                    style={{ width: `${paidPct}%` }}
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                {ps !== 'paid' && (
                                    <>
                                        {editingId === q.id ? (
                                            <div className="flex gap-2 flex-1">
                                                <input
                                                    type="number" value={editAmount}
                                                    onChange={e => setEditAmount(e.target.value)}
                                                    placeholder="Importo €"
                                                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-brand-400"
                                                    autoFocus
                                                />
                                                <button onClick={() => handleSaveAmount(q)}
                                                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-brand-500 text-white hover:bg-brand-600 transition-colors">
                                                    Salva
                                                </button>
                                                <button onClick={() => setEditingId(null)}
                                                    className="px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200">
                                                    ✕
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => { setEditingId(q.id); setEditAmount(''); }}
                                                    className="flex-1 py-2 rounded-xl text-xs font-semibold bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors flex items-center justify-center gap-1.5"
                                                >
                                                    <DollarSign size={14} /> Registra Acconto
                                                </button>
                                                <button
                                                    onClick={() => { onUpdatePayment(q.id, 'paid', total); showToast('Segnato come pagato!', 'success'); }}
                                                    className="flex-1 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5"
                                                >
                                                    <CheckCircle2 size={14} /> Pagato Tutto
                                                </button>
                                            </>
                                        )}
                                    </>
                                )}
                                {ps === 'paid' && (
                                    <button
                                        onClick={() => { onUpdatePayment(q.id, 'unpaid', 0); }}
                                        className="flex-1 py-2 rounded-xl text-xs font-semibold bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors"
                                    >
                                        Segna come non pagato
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
