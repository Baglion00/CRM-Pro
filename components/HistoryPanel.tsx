import React, { useState } from 'react';
import { QuoteData, CURRENCY_FORMATTER, STATUS_CONFIG, QuoteStatus } from '../types';
import { Trash2, Edit, FileText, Calendar, Building2, Filter } from 'lucide-react';
import { ConfirmDialog } from './ui/ConfirmDialog';

interface HistoryPanelProps {
  history: QuoteData[];
  onLoad: (quote: QuoteData) => void;
  onDelete: (id: string) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onLoad, onDelete }) => {
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | 'all'>('all');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const filtered = statusFilter === 'all'
    ? history
    : history.filter(q => (q.status || 'draft') === statusFilter);

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      onDelete(deleteTarget);
      setDeleteTarget(null);
    }
  };

  const filters: { key: QuoteStatus | 'all'; label: string }[] = [
    { key: 'all', label: 'Tutti' },
    { key: 'draft', label: 'Bozze' },
    { key: 'sent', label: 'Inviati' },
    { key: 'accepted', label: 'Accettati' },
    { key: 'rejected', label: 'Rifiutati' },
  ];

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <FileText size={48} className="mb-4 opacity-20" />
        <p className="font-semibold text-slate-500">Nessun preventivo salvato</p>
        <p className="text-sm text-center mt-2 max-w-xs">Compila un preventivo nell'editor e salvalo per archiviarlo qui.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Elimina Preventivo"
        message="Vuoi eliminare definitivamente questo preventivo? L'azione non può essere annullata."
        confirmLabel="Elimina"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <FileText className="text-brand-500" size={22} /> Archivio Preventivi
          <span className="text-sm font-normal text-slate-400 ml-1">({filtered.length})</span>
        </h2>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${statusFilter === f.key
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((quote) => {
          const total = quote.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice) * (1 + item.taxRate / 100), 0);
          const statusCfg = STATUS_CONFIG[quote.status || 'draft'];

          return (
            <div
              key={quote.id}
              onClick={() => onLoad(quote)}
              className="group bg-white border border-slate-200/80 rounded-xl p-5 hover:shadow-md hover:border-brand-300 transition-all cursor-pointer relative overflow-hidden"
            >
              {/* Left accent */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${statusCfg.bg} opacity-60 group-hover:opacity-100 transition-opacity`} />

              <div className="flex justify-between items-start mb-3 pl-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="font-bold text-brand-600 text-lg">{quote.number}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold ${statusCfg.bg} ${statusCfg.color} border ${statusCfg.border}`}>
                      {statusCfg.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400 mt-1.5">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(quote.date).toLocaleDateString('it-IT')}</span>
                    <span className="flex items-center gap-1"><Building2 size={12} /> {quote.client.company || quote.client.name || '—'}</span>
                  </div>
                </div>
                <p className="font-bold text-slate-800 text-lg bg-slate-50 px-3 py-1 rounded-lg shrink-0 ml-3">
                  {CURRENCY_FORMATTER.format(total)}
                </p>
              </div>

              <div className="flex gap-2 border-t border-slate-100 pt-3 mt-2 pl-3">
                <button
                  onClick={(e) => { e.stopPropagation(); onLoad(quote); }}
                  className="flex-1 py-2 px-3 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 flex items-center justify-center gap-2 transition-colors"
                >
                  <Edit size={14} /> Modifica
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteTarget(quote.id); }}
                  className="py-2 px-3 bg-white border border-slate-200 text-red-500 rounded-lg text-sm font-medium hover:bg-red-50 hover:border-red-200 transition-colors"
                  title="Elimina"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && history.length > 0 && (
          <div className="text-center py-12 text-slate-400">
            <Filter size={32} className="mx-auto mb-2 opacity-30" />
            <p className="font-medium">Nessun preventivo con questo filtro.</p>
          </div>
        )}
      </div>
    </div>
  );
};