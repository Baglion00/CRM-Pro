import React from 'react';
import { QuoteData, CURRENCY_FORMATTER, STATUS_CONFIG } from '../types';

interface QuotePreviewProps {
  data: QuoteData;
}

export const QuotePreview: React.FC<QuotePreviewProps> = ({ data }) => {
  const subtotal = data.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const taxes = data.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice * (item.taxRate / 100)), 0);
  const ritenuta = data.ritenutaRate ? subtotal * (data.ritenutaRate / 100) : 0;
  const total = subtotal + taxes - ritenuta;
  const statusCfg = STATUS_CONFIG[data.status || 'draft'];

  return (
    <div id="quote-preview-content" className="w-full h-full text-sm text-black leading-relaxed font-sans bg-white">

      {/* Header */}
      <div className="flex justify-between items-start mb-10">
        <div className="w-1/2">
          {data.company.logoUrl ? (
            <img
              src={data.company.logoUrl} alt="Logo"
              className="h-16 object-contain mb-4"
              onError={(e) => (e.currentTarget.style.display = 'none')}
              crossOrigin="anonymous"
            />
          ) : (
            <h1 className="text-2xl font-bold mb-4" style={{ color: '#4a3043' }}>{data.company.name || 'Nome Azienda'}</h1>
          )}
          <div className="text-xs space-y-0.5" style={{ color: '#374151' }}>
            {data.company.name && data.company.logoUrl && <p className="font-bold">{data.company.name}</p>}
            <p>{data.company.address}</p>
            {data.company.vatId && <p>P.IVA: {data.company.vatId}</p>}
            <p>{[data.company.phone, data.company.email].filter(Boolean).join(' | ')}</p>
            {data.company.website && <p>{data.company.website}</p>}
          </div>
        </div>

        <div className="w-1/2 text-right">
          <h2 className="text-3xl font-light mb-1" style={{ color: '#1e293b' }}>Preventivo</h2>
          <p className="text-lg font-bold" style={{ color: '#4a3043' }}>{data.number}</p>

          {/* Status Badge */}
          <div className="mt-2 inline-block">
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border"
              style={{
                backgroundColor: statusCfg.bg.replace('bg-', ''),
                color: statusCfg.color.replace('text-', ''),
              }}
            >
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>
                {statusCfg.label}
              </span>
            </span>
          </div>

          <div className="mt-3 text-sm" style={{ color: '#374151' }}>
            <p>Data: <span className="font-bold">{new Date(data.date).toLocaleDateString('it-IT')}</span></p>
            <p>Scadenza: <span className="font-bold">{new Date(data.expiryDate).toLocaleDateString('it-IT')}</span></p>
          </div>
        </div>
      </div>

      {/* Separator */}
      <div className="h-0.5 w-full mb-8" style={{ background: 'linear-gradient(to right, #4a3043, #714b67, transparent)' }} />

      {/* Client */}
      <div className="flex mb-12">
        <div className="w-1/2" />
        <div className="w-1/2 pl-8">
          <p className="text-xs uppercase tracking-widest mb-2 font-bold" style={{ color: '#6b7280' }}>Destinatario</p>
          <div className="text-base" style={{ color: '#1e293b' }}>
            <p className="font-bold text-lg">{data.client.company || data.client.name}</p>
            {data.client.company && data.client.name && <p>{data.client.name}</p>}
            <p className="whitespace-pre-line mt-1">{data.client.address}</p>
            {data.client.vatId && <p className="mt-1 font-medium">P.IVA: {data.client.vatId}</p>}
            {data.client.email && <p className="text-sm mt-0.5">{data.client.email}</p>}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mb-8">
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ borderBottom: '2px solid #1e293b' }}>
              <th className="py-2.5 font-bold text-left w-1/2" style={{ color: '#1e293b' }}>Descrizione</th>
              <th className="py-2.5 font-bold text-right" style={{ color: '#1e293b' }}>Q.tà</th>
              <th className="py-2.5 font-bold text-right" style={{ color: '#1e293b' }}>Prezzo Unit.</th>
              <th className="py-2.5 font-bold text-right" style={{ color: '#1e293b' }}>IVA</th>
              <th className="py-2.5 font-bold text-right" style={{ color: '#1e293b' }}>Totale</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td className="py-4 pr-4 align-top">
                  <p className="font-bold text-base" style={{ color: '#1e293b' }}>{item.name}</p>
                  {item.description && <p className="text-sm mt-1 whitespace-pre-line" style={{ color: '#475569' }}>{item.description}</p>}
                </td>
                <td className="py-4 text-right align-top font-medium" style={{ color: '#374151' }}>{item.quantity}</td>
                <td className="py-4 text-right align-top font-medium" style={{ color: '#374151' }}>{CURRENCY_FORMATTER.format(item.unitPrice)}</td>
                <td className="py-4 text-right align-top font-medium" style={{ color: '#374151' }}>{item.taxRate}%</td>
                <td className="py-4 text-right font-bold align-top" style={{ color: '#1e293b' }}>
                  {CURRENCY_FORMATTER.format(item.quantity * item.unitPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.items.length === 0 && (
          <div className="py-8 text-center italic" style={{ color: '#94a3b8', borderBottom: '1px solid #e2e8f0' }}>
            Nessun articolo inserito.
          </div>
        )}
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-10">
        <div className="w-5/12 space-y-2 pt-4">
          <div className="flex justify-between font-medium pb-2" style={{ color: '#374151', borderBottom: '1px solid #f1f5f9' }}>
            <span>Imponibile</span>
            <span>{CURRENCY_FORMATTER.format(subtotal)}</span>
          </div>
          {taxes > 0 && (
            <div className="flex justify-between font-medium pb-2" style={{ color: '#374151', borderBottom: '1px solid #f1f5f9' }}>
              <span>Totale IVA</span>
              <span>{CURRENCY_FORMATTER.format(taxes)}</span>
            </div>
          )}
          {ritenuta > 0 && (
            <div className="flex justify-between font-medium pb-2" style={{ color: '#dc2626', borderBottom: '1px solid #f1f5f9' }}>
              <span>Ritenuta d'acconto ({data.ritenutaRate}%)</span>
              <span>- {CURRENCY_FORMATTER.format(ritenuta)}</span>
            </div>
          )}
          <div className="flex justify-between text-xl font-bold pt-2 mt-2" style={{ color: '#1e293b', borderTop: '2px solid #1e293b' }}>
            <span>Totale</span>
            <span>{CURRENCY_FORMATTER.format(total)}</span>
          </div>
          {ritenuta > 0 && (
            <div className="flex justify-between text-xs font-medium pt-1" style={{ color: '#6b7280' }}>
              <span>Netto a pagare</span>
              <span>{CURRENCY_FORMATTER.format(total)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto">
        <div className="grid grid-cols-2 gap-8 pt-6" style={{ borderTop: '2px solid #4a3043' }}>
          <div>
            <h4 className="font-bold mb-2" style={{ color: '#1e293b' }}>Termini e Condizioni</h4>
            <p className="text-xs whitespace-pre-line leading-relaxed" style={{ color: '#475569' }}>
              {data.notes || "Nessuna nota specifica."}
            </p>
          </div>

          {data.company.iban && (
            <div>
              <h4 className="font-bold mb-2" style={{ color: '#1e293b' }}>Dettagli Pagamento</h4>
              <div className="text-sm" style={{ color: '#374151' }}>
                <p className="mb-1">Intestatario: <strong>{data.company.name}</strong></p>
                <p>IBAN: <span className="font-mono font-bold px-2 py-0.5 rounded" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>{data.company.iban}</span></p>
              </div>
            </div>
          )}
        </div>

        {/* Digital Signature */}
        {data.signatureData && (
          <div className="mt-8 pt-6" style={{ borderTop: '1px solid #e2e8f0' }}>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>Firma digitale</p>
                <img src={data.signatureData} alt="Firma" className="h-16 object-contain" />
                <p className="text-xs font-bold mt-1" style={{ color: '#1e293b' }}>{data.signedBy}</p>
                {data.signedAt && (
                  <p className="text-[10px]" style={{ color: '#94a3b8' }}>
                    Firmato il {new Date(data.signedAt).toLocaleDateString('it-IT')} alle {new Date(data.signedAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs" style={{ color: '#6b7280' }}>Per accettazione</p>
                <div className="w-40 h-px mt-8" style={{ backgroundColor: '#1e293b' }} />
              </div>
            </div>
          </div>
        )}

        {/* Acceptance line if no signature */}
        {!data.signatureData && (
          <div className="mt-8 pt-6 flex justify-end" style={{ borderTop: '1px solid #e2e8f0' }}>
            <div className="text-right">
              <p className="text-xs mb-1" style={{ color: '#6b7280' }}>Per accettazione (timbro e firma)</p>
              <div className="w-48 h-px mt-12" style={{ backgroundColor: '#1e293b' }} />
            </div>
          </div>
        )}

        <div className="mt-10 text-center text-xs font-medium" style={{ color: '#94a3b8' }}>
          <p>Grazie per la fiducia accordataci.</p>
        </div>
      </div>
    </div>
  );
};