import React, { useState, useMemo } from 'react';
import { QuoteData, CURRENCY_FORMATTER, STATUS_CONFIG, QuoteStatus } from '../types';
import {
    Globe, CheckCircle, XCircle, Clock, FileText, Building2, Mail,
    Phone, MapPin, Shield, PenTool, ExternalLink, X
} from 'lucide-react';

interface ClientPortalProps {
    quote: QuoteData;
    onAccept?: () => void;
    onReject?: () => void;
    onSign?: () => void;
    isEmbedded?: boolean;
}

export const ClientPortal: React.FC<ClientPortalProps> = ({
    quote, onAccept, onReject, onSign, isEmbedded = false
}) => {
    const [showRejectReason, setShowRejectReason] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    const subtotal = quote.items.reduce((a, i) => a + i.quantity * i.unitPrice, 0);
    const taxes = quote.items.reduce((a, i) => a + i.quantity * i.unitPrice * (i.taxRate / 100), 0);
    const ritenuta = quote.ritenutaRate ? subtotal * (quote.ritenutaRate / 100) : 0;
    const total = subtotal + taxes - ritenuta;

    const statusCfg = STATUS_CONFIG[quote.status || 'draft'];
    const isExpired = new Date(quote.expiryDate) < new Date();
    const canAct = quote.status === 'sent' && !isExpired;

    return (
        <div className={`${isEmbedded ? '' : 'min-h-screen bg-gradient-to-br from-slate-50 to-slate-100'}`}>
            <div className={`max-w-3xl mx-auto ${isEmbedded ? '' : 'py-8 px-4'}`}>
                {/* Header banner */}
                {!isEmbedded && (
                    <div className="bg-gradient-to-r from-brand-600 to-brand-800 rounded-t-3xl p-6 text-white">
                        <div className="flex items-center gap-3 mb-2">
                            <Globe size={24} />
                            <h1 className="text-xl font-bold">Portale Cliente</h1>
                        </div>
                        <p className="text-brand-200 text-sm">
                            Preventivo {quote.number} — da {quote.company.name}
                        </p>
                    </div>
                )}

                <div className={`bg-white ${isEmbedded ? 'rounded-2xl' : 'rounded-b-3xl'} shadow-xl overflow-hidden`}>
                    {/* Status */}
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Stato Preventivo</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border} border`}>
                                    {statusCfg.label}
                                </span>
                                {isExpired && quote.status === 'sent' && (
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200">
                                        Scaduto
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-400">Data</p>
                            <p className="font-semibold text-sm text-slate-800">{new Date(quote.date).toLocaleDateString('it-IT')}</p>
                            <p className="text-xs text-slate-400 mt-1">Scadenza</p>
                            <p className="font-semibold text-sm text-slate-800">{new Date(quote.expiryDate).toLocaleDateString('it-IT')}</p>
                        </div>
                    </div>

                    {/* Company info */}
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex items-start gap-4">
                            {quote.company.logoUrl ? (
                                <img src={quote.company.logoUrl} alt="Logo" className="h-14 object-contain" onError={e => (e.currentTarget.style.display = 'none')} />
                            ) : (
                                <div className="w-14 h-14 rounded-xl bg-brand-100 flex items-center justify-center">
                                    <Building2 size={24} className="text-brand-600" />
                                </div>
                            )}
                            <div>
                                <h3 className="font-bold text-slate-800">{quote.company.name}</h3>
                                <p className="text-xs text-slate-500 mt-0.5">{quote.company.address}</p>
                                <div className="flex gap-3 mt-1 text-xs text-slate-500">
                                    {quote.company.email && <span className="flex items-center gap-1"><Mail size={10} />{quote.company.email}</span>}
                                    {quote.company.phone && <span className="flex items-center gap-1"><Phone size={10} />{quote.company.phone}</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Line items */}
                    <div className="p-6">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <FileText size={16} /> Dettaglio Servizi
                        </h3>
                        <div className="space-y-3">
                            {quote.items.map(item => (
                                <div key={item.id} className="flex items-start justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm text-slate-800">{item.name}</p>
                                        {item.description && <p className="text-xs text-slate-500 mt-0.5 whitespace-pre-line">{item.description}</p>}
                                        <p className="text-xs text-slate-400 mt-1">
                                            {item.quantity}x {CURRENCY_FORMATTER.format(item.unitPrice)}
                                            {item.taxRate > 0 && ` + IVA ${item.taxRate}%`}
                                        </p>
                                    </div>
                                    <p className="font-bold text-slate-800 ml-4">
                                        {CURRENCY_FORMATTER.format(item.quantity * item.unitPrice)}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        <div className="mt-6 bg-slate-50 rounded-xl p-5 border border-slate-100">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Imponibile</span>
                                    <span className="font-medium text-slate-700">{CURRENCY_FORMATTER.format(subtotal)}</span>
                                </div>
                                {taxes > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">IVA</span>
                                        <span className="font-medium text-slate-700">{CURRENCY_FORMATTER.format(taxes)}</span>
                                    </div>
                                )}
                                {ritenuta > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Ritenuta d'acconto ({quote.ritenutaRate}%)</span>
                                        <span className="font-medium text-red-600">- {CURRENCY_FORMATTER.format(ritenuta)}</span>
                                    </div>
                                )}
                                <div className="border-t border-slate-200 pt-3 mt-3">
                                    <div className="flex justify-between">
                                        <span className="font-bold text-slate-800">Totale</span>
                                        <span className="text-xl font-bold text-slate-800">{CURRENCY_FORMATTER.format(total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        {quote.notes && (
                            <div className="mt-4 p-4 rounded-xl bg-amber-50/50 border border-amber-100">
                                <p className="text-xs font-semibold text-amber-700 mb-1">Note e Condizioni</p>
                                <p className="text-xs text-amber-600 whitespace-pre-line">{quote.notes}</p>
                            </div>
                        )}

                        {/* Signature */}
                        {quote.signatureData && (
                            <div className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                                <p className="text-xs font-semibold text-emerald-700 mb-2 flex items-center gap-1.5">
                                    <PenTool size={12} /> Firmato digitalmente
                                </p>
                                <img src={quote.signatureData} alt="Firma" className="h-16 object-contain" />
                                <p className="text-xs text-emerald-600 mt-1">
                                    {quote.signedBy} — {quote.signedAt && new Date(quote.signedAt).toLocaleDateString('it-IT')}
                                </p>
                            </div>
                        )}

                        {/* IBAN */}
                        {quote.company.iban && (
                            <div className="mt-4 p-4 rounded-xl bg-brand-50 border border-brand-100">
                                <p className="text-xs font-semibold text-brand-700 mb-1">Dettagli Pagamento</p>
                                <p className="text-sm text-brand-800">Intestatario: <strong>{quote.company.name}</strong></p>
                                <p className="text-sm text-brand-800 mt-0.5">
                                    IBAN: <span className="font-mono font-bold">{quote.company.iban}</span>
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Action buttons */}
                    {canAct && (
                        <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-3">
                            <p className="text-sm text-slate-600 font-medium text-center mb-4">
                                Vuoi accettare o rifiutare questo preventivo?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={onAccept}
                                    className="flex-1 py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-emerald-700 text-white hover:shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
                                >
                                    <CheckCircle size={18} /> Accetta Preventivo
                                </button>
                                <button
                                    onClick={() => setShowRejectReason(!showRejectReason)}
                                    className="flex-1 py-3.5 rounded-xl text-sm font-bold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                                >
                                    <XCircle size={18} /> Rifiuta
                                </button>
                            </div>

                            {!quote.signatureData && onSign && (
                                <button
                                    onClick={onSign}
                                    className="w-full py-3 rounded-xl text-sm font-semibold bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100 transition-colors flex items-center justify-center gap-2"
                                >
                                    <PenTool size={16} /> Firma Preventivo
                                </button>
                            )}

                            {showRejectReason && (
                                <div className="space-y-2 animate-fade-in">
                                    <textarea
                                        value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                                        placeholder="Motivo del rifiuto (opzionale)..."
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-red-400 min-h-[80px]"
                                    />
                                    <button
                                        onClick={onReject}
                                        className="w-full py-2.5 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors"
                                    >
                                        Conferma Rifiuto
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-100 text-center">
                        <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
                            <Shield size={12} /> Documento generato con AutoQuote Pro
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
