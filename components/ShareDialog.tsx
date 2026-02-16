import React, { useState, useEffect, useRef } from 'react';
import { QuoteData, CURRENCY_FORMATTER } from '../types';
import QRCode from 'qrcode';
import { Share2, MessageCircle, Mail, Copy, Check, Link, Download, X, Smartphone } from 'lucide-react';

interface ShareDialogProps {
    quote: QuoteData;
    isOpen: boolean;
    onClose: () => void;
    showToast: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void;
    onGeneratePdf?: () => Promise<Blob | null>;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({ quote, isOpen, onClose, showToast, onGeneratePdf }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [copied, setCopied] = useState(false);
    const [tab, setTab] = useState<'whatsapp' | 'email' | 'link'>('whatsapp');

    const subtotal = quote.items.reduce((a, i) => a + i.quantity * i.unitPrice, 0);
    const taxes = quote.items.reduce((a, i) => a + i.quantity * i.unitPrice * (i.taxRate / 100), 0);
    const total = subtotal + taxes;

    // WhatsApp message
    const whatsappMessage = `📋 *Preventivo ${quote.number}*\n\nDa: ${quote.company.name}\nPer: ${quote.client.company || quote.client.name}\nData: ${new Date(quote.date).toLocaleDateString('it-IT')}\nScadenza: ${new Date(quote.expiryDate).toLocaleDateString('it-IT')}\n\n*Totale: ${CURRENCY_FORMATTER.format(total)}*\n\nArticoli:\n${quote.items.map(i => `• ${i.name} — ${CURRENCY_FORMATTER.format(i.quantity * i.unitPrice)}`).join('\n')}\n\n${quote.notes ? `Note: ${quote.notes.substring(0, 100)}...` : ''}`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;
    const whatsappWebUrl = `https://web.whatsapp.com/send?text=${encodeURIComponent(whatsappMessage)}`;

    // Email
    const emailSubject = `Preventivo ${quote.number} — ${quote.company.name}`;
    const emailBody = `Gentile ${quote.client.name || quote.client.company},\n\nle invio il preventivo N. ${quote.number} del ${new Date(quote.date).toLocaleDateString('it-IT')}.\n\nImporto totale: ${CURRENCY_FORMATTER.format(total)}\nScadenza: ${new Date(quote.expiryDate).toLocaleDateString('it-IT')}\n\nDettaglio:\n${quote.items.map(i => `- ${i.name}: ${i.quantity}x ${CURRENCY_FORMATTER.format(i.unitPrice)} = ${CURRENCY_FORMATTER.format(i.quantity * i.unitPrice)}`).join('\n')}\n\nResto a disposizione per qualsiasi chiarimento.\n\nDistinti saluti,\n${quote.company.name}\n${quote.company.phone || ''}\n${quote.company.email || ''}`;
    const mailtoUrl = `mailto:${quote.client.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    useEffect(() => {
        if (isOpen) {
            QRCode.toDataURL(whatsappUrl, {
                width: 256,
                margin: 2,
                color: { dark: '#1e293b', light: '#ffffff' },
            }).then(setQrCodeUrl).catch(console.error);
        }
    }, [isOpen, whatsappUrl]);

    if (!isOpen) return null;

    const handleCopyText = async () => {
        try {
            await navigator.clipboard.writeText(whatsappMessage);
            setCopied(true);
            showToast('Testo copiato!', 'success');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            showToast('Errore nella copia', 'error');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
                            <Share2 size={20} />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800">Condividi Preventivo</h2>
                            <p className="text-xs text-slate-400">{quote.number} — {CURRENCY_FORMATTER.format(total)}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                        <X size={18} className="text-slate-400" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-100">
                    {[
                        { key: 'whatsapp' as const, icon: <MessageCircle size={16} />, label: 'WhatsApp' },
                        { key: 'email' as const, icon: <Mail size={16} />, label: 'Email' },
                        { key: 'link' as const, icon: <Link size={16} />, label: 'Copia' },
                    ].map(t => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all border-b-2 ${tab === t.key
                                    ? 'border-brand-500 text-brand-600 bg-brand-50/50'
                                    : 'border-transparent text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            {t.icon} {t.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="p-6">
                    {tab === 'whatsapp' && (
                        <div className="space-y-5 text-center">
                            <p className="text-sm text-slate-500">Scansiona il QR Code con il tuo telefono per inviare il preventivo via WhatsApp</p>
                            {qrCodeUrl && (
                                <div className="flex justify-center">
                                    <div className="p-4 bg-white rounded-2xl shadow-lg border border-slate-100 inline-block">
                                        <img src={qrCodeUrl} alt="WhatsApp QR Code" className="w-48 h-48" />
                                    </div>
                                </div>
                            )}
                            <div className="flex gap-2">
                                <a
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 py-3 rounded-xl font-semibold text-sm bg-[#25D366] text-white hover:bg-[#20bd5a] transition-colors flex items-center justify-center gap-2"
                                >
                                    <Smartphone size={16} /> Apri WhatsApp
                                </a>
                                <a
                                    href={whatsappWebUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 py-3 rounded-xl font-semibold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                                >
                                    <MessageCircle size={16} /> WhatsApp Web
                                </a>
                            </div>
                        </div>
                    )}

                    {tab === 'email' && (
                        <div className="space-y-4">
                            <p className="text-sm text-slate-500">Invia il preventivo via email al cliente</p>
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                <p className="text-xs font-semibold text-slate-500 mb-1">Destinatario</p>
                                <p className="font-medium text-sm text-slate-800">{quote.client.email || 'Email non impostata'}</p>
                                <p className="text-xs font-semibold text-slate-500 mt-3 mb-1">Oggetto</p>
                                <p className="text-sm text-slate-700">{emailSubject}</p>
                            </div>
                            <a
                                href={mailtoUrl}
                                className="w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-brand-500 to-brand-700 text-white hover:shadow-lg hover:shadow-brand-500/25 transition-all flex items-center justify-center gap-2 block text-center"
                            >
                                <Mail size={16} /> Apri Client Email
                            </a>
                        </div>
                    )}

                    {tab === 'link' && (
                        <div className="space-y-4">
                            <p className="text-sm text-slate-500">Copia il testo del preventivo per incollarlo dove vuoi</p>
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 max-h-48 overflow-y-auto">
                                <pre className="text-xs text-slate-600 whitespace-pre-wrap font-sans">{whatsappMessage}</pre>
                            </div>
                            <button
                                onClick={handleCopyText}
                                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${copied
                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                            >
                                {copied ? <><Check size={16} /> Copiato!</> : <><Copy size={16} /> Copia Testo</>}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
