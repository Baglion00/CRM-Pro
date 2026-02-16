import React from 'react';
import { QuoteData, CURRENCY_FORMATTER } from '../types';
import { TrendingUp, FileText, Users, DollarSign, ArrowRight } from 'lucide-react';

interface DashboardProps {
  quotes: QuoteData[];
  clientCount: number;
  onNavigate: (view: 'editor' | 'history' | 'clients') => void;
  onLoadQuote: (quote: QuoteData) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ quotes, clientCount, onNavigate, onLoadQuote }) => {
  
  // Stats Calculation
  const totalRevenue = quotes.reduce((acc, q) => {
    const total = q.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    return acc + total;
  }, 0);

  const averageValue = quotes.length > 0 ? totalRevenue / quotes.length : 0;
  
  const thisMonthQuotes = quotes.filter(q => {
    const d = new Date(q.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Panoramica</h2>
        <button 
          onClick={() => onNavigate('editor')}
          className="bg-odoo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-odoo-700 transition-colors shadow-lg shadow-odoo-600/20"
        >
          + Nuovo Preventivo
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <DollarSign size={100} className="text-odoo-500" />
          </div>
          <p className="text-slate-500 text-sm font-medium mb-1">Totale Preventivato</p>
          <h3 className="text-3xl font-bold text-slate-800">{CURRENCY_FORMATTER.format(totalRevenue)}</h3>
          <div className="mt-4 flex items-center text-xs text-green-600 font-medium bg-green-50 w-fit px-2 py-1 rounded-full">
            <TrendingUp size={12} className="mr-1" />
            Media: {CURRENCY_FORMATTER.format(averageValue)}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
           <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <FileText size={100} className="text-blue-500" />
          </div>
          <p className="text-slate-500 text-sm font-medium mb-1">Preventivi Totali</p>
          <h3 className="text-3xl font-bold text-slate-800">{quotes.length}</h3>
          <p className="text-xs text-slate-400 mt-2">
            <span className="font-bold text-slate-700">{thisMonthQuotes.length}</span> questo mese
          </p>
        </div>

        <div 
          onClick={() => onNavigate('clients')}
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group cursor-pointer hover:border-odoo-300 transition-colors"
        >
           <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users size={100} className="text-emerald-500" />
          </div>
          <p className="text-slate-500 text-sm font-medium mb-1">Clienti in Rubrica</p>
          <h3 className="text-3xl font-bold text-slate-800">{clientCount}</h3>
          <div className="mt-4 flex items-center text-xs text-odoo-600 font-medium">
             Gestisci clienti <ArrowRight size={12} className="ml-1" />
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-700">Attività Recente</h3>
          <button onClick={() => onNavigate('history')} className="text-xs text-odoo-600 font-medium hover:underline">Vedi tutti</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
              <tr>
                <th className="px-6 py-3">Numero</th>
                <th className="px-6 py-3">Cliente</th>
                <th className="px-6 py-3">Data</th>
                <th className="px-6 py-3 text-right">Totale</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quotes.slice(0, 5).map((quote) => {
                 const total = quote.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
                 return (
                  <tr key={quote.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-3 font-medium text-slate-900">{quote.number}</td>
                    <td className="px-6 py-3 text-slate-600">{quote.client.company || quote.client.name}</td>
                    <td className="px-6 py-3 text-slate-500">{new Date(quote.date).toLocaleDateString('it-IT')}</td>
                    <td className="px-6 py-3 text-right font-bold text-slate-800">{CURRENCY_FORMATTER.format(total)}</td>
                    <td className="px-6 py-3 text-right">
                      <button 
                        onClick={() => onLoadQuote(quote)}
                        className="text-odoo-600 hover:text-odoo-800 font-medium text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Apri
                      </button>
                    </td>
                  </tr>
                 );
              })}
              {quotes.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400 italic">Nessun dato recente.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};