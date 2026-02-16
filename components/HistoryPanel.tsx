import React from 'react';
import { QuoteData, CURRENCY_FORMATTER } from '../types';
import { Trash2, Edit, FileText, Calendar, Building2 } from 'lucide-react';

interface HistoryPanelProps {
  history: QuoteData[];
  onLoad: (quote: QuoteData) => void;
  onDelete: (id: string) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onLoad, onDelete }) => {
  
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevents clicking the container
    onDelete(id);
  };

  const handleEdit = (e: React.MouseEvent, quote: QuoteData) => {
    e.stopPropagation();
    onLoad(quote);
  };

  if (history.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 border-2 border-dashed border-slate-200 rounded-lg">
        <FileText size={48} className="mb-4 opacity-20" />
        <p className="font-medium text-slate-500">Nessun preventivo salvato</p>
        <p className="text-sm text-center mt-2">Compila un preventivo nell'editor e clicca "Salva Preventivo" per archiviarlo qui.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8">
      <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <FileText className="text-odoo-500" /> Archivio Preventivi
      </h2>
      
      {history.map((quote) => {
        const total = quote.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice) * (1 + item.taxRate/100), 0);
        
        return (
          <div 
            key={quote.id} 
            onClick={() => onLoad(quote)}
            className="group bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md hover:border-odoo-300 transition-all cursor-pointer relative overflow-hidden"
          >
            {/* Status stripe */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-odoo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-bold text-odoo-600 text-lg">{quote.number}</p>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(quote.date).toLocaleDateString('it-IT')}</span>
                </div>
              </div>
              <p className="font-bold text-slate-800 text-lg bg-slate-50 px-2 py-1 rounded">{CURRENCY_FORMATTER.format(total)}</p>
            </div>
            
            <div className="mb-4 pl-1">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
                <Building2 size={14} className="text-slate-400" />
                {quote.client.company || quote.client.name}
              </div>
              <p className="text-xs text-slate-400 truncate pl-6">{quote.items.length} servizi inseriti</p>
            </div>

            <div className="flex gap-2 border-t border-slate-100 pt-3 mt-2">
              <button 
                onClick={(e) => handleEdit(e, quote)}
                className="flex-1 py-2 px-3 bg-white border border-slate-200 text-slate-600 rounded-md text-sm font-medium hover:bg-odoo-50 hover:text-odoo-600 hover:border-odoo-200 flex items-center justify-center gap-2 transition-colors"
              >
                <Edit size={14} /> Modifica / Carica
              </button>
              <button 
                onClick={(e) => handleDelete(e, quote.id)}
                className="py-2 px-3 bg-white border border-slate-200 text-red-500 rounded-md text-sm font-medium hover:bg-red-50 hover:border-red-200 transition-colors"
                title="Elimina definitivamente"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};