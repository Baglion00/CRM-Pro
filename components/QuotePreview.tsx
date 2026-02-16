import React from 'react';
import { QuoteData, CURRENCY_FORMATTER } from '../types';

interface QuotePreviewProps {
  data: QuoteData;
}

export const QuotePreview: React.FC<QuotePreviewProps> = ({ data }) => {
  // Calculations
  const subtotal = data.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const taxes = data.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice * (item.taxRate / 100)), 0);
  const total = subtotal + taxes;

  return (
    <div id="quote-preview-content" className="w-full h-full text-sm text-black leading-relaxed font-sans bg-white">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-12">
        <div className="w-1/2">
           {data.company.logoUrl ? (
            <img 
              src={data.company.logoUrl} 
              alt="Logo" 
              className="h-16 object-contain mb-4"
              onError={(e) => (e.currentTarget.style.display = 'none')} 
              crossOrigin="anonymous" 
            />
           ) : (
            <h1 className="text-3xl font-bold text-odoo-700 mb-4">{data.company.name || 'Nome Azienda'}</h1>
           )}
           <div className="text-black text-xs space-y-1 font-medium">
             <p className="font-bold">{data.company.address}</p>
             <p>{data.company.vatId ? `P.IVA: ${data.company.vatId}` : ''}</p>
             <p>{data.company.phone} | {data.company.email}</p>
             {data.company.website && <p>{data.company.website}</p>}
           </div>
        </div>

        <div className="w-1/2 text-right">
           <h2 className="text-4xl font-light text-black mb-2">Preventivo</h2>
           <p className="text-lg font-bold text-black">{data.number}</p>
           <div className="mt-4 text-sm text-black">
             <p>Data: <span className="font-bold">{new Date(data.date).toLocaleDateString('it-IT')}</span></p>
             <p>Scadenza: <span className="font-bold">{new Date(data.expiryDate).toLocaleDateString('it-IT')}</span></p>
           </div>
        </div>
      </div>

      {/* Client Address */}
      <div className="flex mb-16">
        <div className="w-1/2"></div> {/* Spacer */}
        <div className="w-1/2 pl-8">
          <p className="text-xs text-black uppercase tracking-wider mb-1 font-bold">Destinatario</p>
          <div className="text-base text-black">
            <p className="font-bold text-lg">{data.client.company || data.client.name}</p>
            {data.client.company && <p className="text-black">{data.client.name}</p>}
            <p className="whitespace-pre-line">{data.client.address}</p>
            {data.client.vatId && <p className="mt-1 font-medium">P.IVA: {data.client.vatId}</p>}
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="mb-8">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-black text-left">
              <th className="py-2 font-bold text-black w-1/2">Descrizione</th>
              <th className="py-2 font-bold text-black text-right">Q.tà</th>
              <th className="py-2 font-bold text-black text-right">Prezzo Unit.</th>
              <th className="py-2 font-bold text-black text-right">IVA</th>
              <th className="py-2 font-bold text-black text-right">Totale</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300">
            {data.items.map((item) => (
              <tr key={item.id} className="group">
                <td className="py-4 pr-4 align-top">
                  <p className="font-bold text-black text-base">{item.name}</p>
                  <p className="text-black text-sm mt-1 whitespace-pre-line">{item.description}</p>
                </td>
                <td className="py-4 text-right align-top text-black font-medium">{item.quantity}</td>
                <td className="py-4 text-right align-top text-black font-medium">{CURRENCY_FORMATTER.format(item.unitPrice)}</td>
                <td className="py-4 text-right align-top text-black font-medium">{item.taxRate}%</td>
                <td className="py-4 text-right font-bold align-top text-black">
                  {CURRENCY_FORMATTER.format(item.quantity * item.unitPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.items.length === 0 && (
          <div className="py-8 text-center text-black italic border-b border-gray-300">
            Nessun articolo inserito.
          </div>
        )}
      </div>

      {/* Totals Section */}
      <div className="flex justify-end mb-12">
        <div className="w-5/12 space-y-2 pt-4">
          <div className="flex justify-between text-black font-medium border-b border-gray-200 pb-2">
            <span>Imponibile</span>
            <span>{CURRENCY_FORMATTER.format(subtotal)}</span>
          </div>
          <div className="flex justify-between text-black font-medium border-b border-gray-200 pb-2">
            <span>Totale IVA</span>
            <span>{CURRENCY_FORMATTER.format(taxes)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-black pt-2 mt-2 border-t-2 border-black">
            <span>Totale</span>
            <span>{CURRENCY_FORMATTER.format(total)}</span>
          </div>
        </div>
      </div>

      {/* Footer / Notes */}
      <div className="mt-auto">
        <div className="grid grid-cols-2 gap-8 border-t-2 border-black pt-6">
          <div>
            <h4 className="font-bold text-black mb-2">Termini e Condizioni</h4>
            <p className="text-xs text-black whitespace-pre-line leading-relaxed font-medium">
              {data.notes || "Nessuna nota specifica."}
            </p>
          </div>
          
          {data.company.iban && (
             <div>
              <h4 className="font-bold text-black mb-2">Dettagli Pagamento</h4>
              <p className="text-sm text-black">
                Banca: {data.company.name}<br/>
                IBAN: <span className="font-mono font-bold text-black bg-gray-100 p-1 rounded border border-gray-300">{data.company.iban}</span>
              </p>
            </div>
          )}
        </div>
        
        <div className="mt-12 text-center text-xs text-black font-medium opacity-70">
          <p>Grazie per la fiducia accordataci.</p>
        </div>
      </div>

    </div>
  );
};