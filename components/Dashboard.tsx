import React from 'react';
import { QuoteData, CURRENCY_FORMATTER, STATUS_CONFIG, QuoteStatus } from '../types';
import { TrendingUp, FileText, Users, DollarSign, ArrowRight, CheckCircle, Clock, XCircle } from 'lucide-react';

interface DashboardProps {
  quotes: QuoteData[];
  clientCount: number;
  onNavigate: (view: 'editor' | 'history' | 'clients') => void;
  onLoadQuote: (quote: QuoteData) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ quotes, clientCount, onNavigate, onLoadQuote }) => {

  const totalRevenue = quotes.reduce((acc, q) => {
    return acc + q.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  }, 0);

  const averageValue = quotes.length > 0 ? totalRevenue / quotes.length : 0;

  const thisMonthQuotes = quotes.filter(q => {
    const d = new Date(q.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const acceptedCount = quotes.filter(q => q.status === 'accepted').length;
  const acceptanceRate = quotes.length > 0 ? Math.round((acceptedCount / quotes.length) * 100) : 0;

  const kpiCards = [
    {
      title: 'Totale Preventivato',
      value: CURRENCY_FORMATTER.format(totalRevenue),
      subtitle: `Media: ${CURRENCY_FORMATTER.format(averageValue)}`,
      icon: <DollarSign size={22} />,
      gradient: 'from-brand-500 to-brand-700',
      iconBg: 'bg-brand-500/10 text-brand-600',
    },
    {
      title: 'Preventivi',
      value: String(quotes.length),
      subtitle: `${thisMonthQuotes.length} questo mese`,
      icon: <FileText size={22} />,
      gradient: 'from-blue-500 to-blue-700',
      iconBg: 'bg-blue-500/10 text-blue-600',
    },
    {
      title: 'Tasso Accettazione',
      value: `${acceptanceRate}%`,
      subtitle: `${acceptedCount} su ${quotes.length} accettati`,
      icon: <CheckCircle size={22} />,
      gradient: 'from-emerald-500 to-emerald-700',
      iconBg: 'bg-emerald-500/10 text-emerald-600',
    },
    {
      title: 'Clienti in Rubrica',
      value: String(clientCount),
      subtitle: 'Gestisci clienti →',
      icon: <Users size={22} />,
      gradient: 'from-violet-500 to-violet-700',
      iconBg: 'bg-violet-500/10 text-violet-600',
      onClick: () => onNavigate('clients'),
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Panoramica</h2>
          <p className="text-slate-500 text-sm mt-1">
            {new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => onNavigate('editor')}
          className="bg-gradient-to-r from-brand-500 to-brand-700 text-white px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-brand-500/25 transition-all active:scale-[0.97]"
        >
          + Nuovo Preventivo
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiCards.map((card, i) => (
          <div
            key={i}
            onClick={card.onClick}
            className={`bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all group relative overflow-hidden ${card.onClick ? 'cursor-pointer hover:border-brand-300' : ''}`}
          >
            {/* Decorative gradient stripe */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />

            <div className="flex items-start justify-between mb-3">
              <div className={`w-11 h-11 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                {card.icon}
              </div>
              {card.onClick && <ArrowRight size={16} className="text-slate-300 group-hover:text-brand-500 transition-colors mt-1" />}
            </div>

            <h3 className="text-2xl font-bold text-slate-800 mb-1">{card.value}</h3>
            <p className="text-xs text-slate-500 font-medium">{card.title}</p>
            <p className="text-xs text-slate-400 mt-2">{card.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Attività Recente</h3>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs text-brand-600 font-semibold hover:text-brand-700 flex items-center gap-1"
          >
            Vedi tutti <ArrowRight size={12} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-3 text-xs text-slate-400 uppercase tracking-wider font-semibold">Numero</th>
                <th className="px-5 py-3 text-xs text-slate-400 uppercase tracking-wider font-semibold">Cliente</th>
                <th className="px-5 py-3 text-xs text-slate-400 uppercase tracking-wider font-semibold">Data</th>
                <th className="px-5 py-3 text-xs text-slate-400 uppercase tracking-wider font-semibold">Stato</th>
                <th className="px-5 py-3 text-xs text-slate-400 uppercase tracking-wider font-semibold text-right">Totale</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {quotes.slice(0, 5).map((quote) => {
                const total = quote.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
                const statusCfg = STATUS_CONFIG[quote.status || 'draft'];
                return (
                  <tr key={quote.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-5 py-4 font-semibold text-slate-800">{quote.number}</td>
                    <td className="px-5 py-4 text-slate-600">{quote.client.company || quote.client.name || '—'}</td>
                    <td className="px-5 py-4 text-slate-500">{new Date(quote.date).toLocaleDateString('it-IT')}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border} border`}>
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-slate-800">{CURRENCY_FORMATTER.format(total)}</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => onLoadQuote(quote)}
                        className="text-brand-600 hover:text-brand-800 font-semibold text-xs opacity-0 group-hover:opacity-100 transition-all px-3 py-1.5 rounded-lg hover:bg-brand-50"
                      >
                        Apri
                      </button>
                    </td>
                  </tr>
                );
              })}
              {quotes.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <FileText size={40} className="mx-auto text-slate-200 mb-3" />
                    <p className="text-slate-400 font-medium">Nessun preventivo ancora.</p>
                    <p className="text-sm text-slate-300 mt-1">Crea il tuo primo preventivo per iniziare.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};