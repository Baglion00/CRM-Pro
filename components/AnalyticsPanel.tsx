import React, { useMemo, useState } from 'react';
import { QuoteData, CURRENCY_FORMATTER } from '../types';
import { BarChart3, TrendingUp, Users, Package } from 'lucide-react';

interface AnalyticsPanelProps {
    quotes: QuoteData[];
}

type Period = 'month' | 'quarter' | 'year' | 'all';

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ quotes }) => {
    const [period, setPeriod] = useState<Period>('year');

    const filteredQuotes = useMemo(() => {
        const now = new Date();
        return quotes.filter(q => {
            if (period === 'all') return true;
            const d = new Date(q.date);
            if (period === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            if (period === 'quarter') {
                const qQuarter = Math.floor(d.getMonth() / 3);
                const nowQuarter = Math.floor(now.getMonth() / 3);
                return qQuarter === nowQuarter && d.getFullYear() === now.getFullYear();
            }
            return d.getFullYear() === now.getFullYear();
        });
    }, [quotes, period]);

    // Top services by revenue
    const topServices = useMemo(() => {
        const map: Record<string, { name: string; revenue: number; count: number }> = {};
        filteredQuotes.forEach(q => {
            q.items.forEach(item => {
                const key = item.name.toLowerCase().trim();
                if (!map[key]) map[key] = { name: item.name, revenue: 0, count: 0 };
                map[key].revenue += item.quantity * item.unitPrice;
                map[key].count += 1;
            });
        });
        return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    }, [filteredQuotes]);

    const maxServiceRevenue = Math.max(...topServices.map(s => s.revenue), 1);

    // Revenue by client
    const topClients = useMemo(() => {
        const map: Record<string, { name: string; revenue: number; count: number }> = {};
        filteredQuotes.forEach(q => {
            const key = (q.client.company || q.client.name || 'Sconosciuto').toLowerCase().trim();
            const name = q.client.company || q.client.name || 'Sconosciuto';
            if (!map[key]) map[key] = { name, revenue: 0, count: 0 };
            map[key].revenue += q.items.reduce((s, item) => s + (item.quantity * item.unitPrice), 0);
            map[key].count += 1;
        });
        return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    }, [filteredQuotes]);

    const maxClientRevenue = Math.max(...topClients.map(c => c.revenue), 1);

    // Status breakdown
    const statusBreakdown = useMemo(() => {
        const counts = { draft: 0, sent: 0, accepted: 0, rejected: 0, expired: 0 };
        filteredQuotes.forEach(q => { counts[q.status || 'draft']++; });
        return counts;
    }, [filteredQuotes]);

    const totalQuotes = filteredQuotes.length;
    const totalRevenue = filteredQuotes.reduce((s, q) => s + q.items.reduce((a, i) => a + i.quantity * i.unitPrice, 0), 0);

    const periods: { key: Period; label: string }[] = [
        { key: 'month', label: 'Mese' },
        { key: 'quarter', label: 'Trimestre' },
        { key: 'year', label: 'Anno' },
        { key: 'all', label: 'Tutto' },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Analytics</h2>
                    <p className="text-slate-500 text-sm mt-1">
                        {totalQuotes} preventivi · {CURRENCY_FORMATTER.format(totalRevenue)} totale
                    </p>
                </div>
                <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1">
                    {periods.map(p => (
                        <button
                            key={p.key}
                            onClick={() => setPeriod(p.key)}
                            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${period === p.key
                                    ? 'bg-brand-500 text-white shadow-sm'
                                    : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Status Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {Object.entries(statusBreakdown).map(([status, count]) => {
                    const colors: Record<string, string> = {
                        draft: 'bg-slate-50 text-slate-600 border-slate-200',
                        sent: 'bg-blue-50 text-blue-600 border-blue-200',
                        accepted: 'bg-emerald-50 text-emerald-600 border-emerald-200',
                        rejected: 'bg-red-50 text-red-600 border-red-200',
                        expired: 'bg-amber-50 text-amber-600 border-amber-200',
                    };
                    const labels: Record<string, string> = {
                        draft: 'Bozze', sent: 'Inviati', accepted: 'Accettati', rejected: 'Rifiutati', expired: 'Scaduti',
                    };
                    return (
                        <div key={status} className={`p-4 rounded-xl border ${colors[status]} text-center`}>
                            <p className="text-2xl font-bold">{count}</p>
                            <p className="text-xs font-semibold mt-1">{labels[status]}</p>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Services */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-5">
                        <Package size={18} className="text-violet-600" />
                        <h3 className="font-bold text-slate-800">Top 5 Servizi per Fatturato</h3>
                    </div>
                    {topServices.length > 0 ? (
                        <div className="space-y-3">
                            {topServices.map((s, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-semibold text-slate-700 truncate max-w-[60%]">{s.name}</span>
                                        <span className="text-slate-500">{CURRENCY_FORMATTER.format(s.revenue)} ({s.count}x)</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                        <div
                                            style={{ width: `${(s.revenue / maxServiceRevenue) * 100}%` }}
                                            className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-700"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400 text-center py-6">Nessun dato per questo periodo.</p>
                    )}
                </div>

                {/* Top Clients */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-5">
                        <Users size={18} className="text-brand-600" />
                        <h3 className="font-bold text-slate-800">Top 5 Clienti per Fatturato</h3>
                    </div>
                    {topClients.length > 0 ? (
                        <div className="space-y-3">
                            {topClients.map((c, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-semibold text-slate-700 truncate max-w-[60%]">{c.name}</span>
                                        <span className="text-slate-500">{CURRENCY_FORMATTER.format(c.revenue)} ({c.count} prev.)</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                        <div
                                            style={{ width: `${(c.revenue / maxClientRevenue) * 100}%` }}
                                            className="h-full bg-gradient-to-r from-brand-500 to-brand-700 rounded-full transition-all duration-700"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400 text-center py-6">Nessun dato per questo periodo.</p>
                    )}
                </div>
            </div>
        </div>
    );
};
