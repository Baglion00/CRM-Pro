import React, { useState, useRef, useEffect } from 'react';
import { Reminder } from '../../services/reminderService';
import { Bell, AlertTriangle, Clock, MessageCircle, X } from 'lucide-react';

interface NotificationBellProps {
    reminders: Reminder[];
    onQuoteClick: (quoteId: string) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ reminders, onQuoteClick }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const iconMap = {
        expired: <AlertTriangle size={14} className="text-red-500" />,
        expiring_soon: <Clock size={14} className="text-amber-500" />,
        follow_up: <MessageCircle size={14} className="text-blue-500" />,
    };

    const bgMap = {
        expired: 'bg-red-50 border-red-100',
        expiring_soon: 'bg-amber-50 border-amber-100',
        follow_up: 'bg-blue-50 border-blue-100',
    };

    const labelMap = {
        expired: 'Scaduto',
        expiring_soon: 'In Scadenza',
        follow_up: 'Follow-up',
    };

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-xl hover:bg-white/10 transition-colors"
            >
                <Bell size={20} className="text-slate-500" />
                {reminders.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-scale-in shadow-lg">
                        {reminders.length > 9 ? '9+' : reminders.length}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 animate-slide-down overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 text-sm">Notifiche</h3>
                        <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                            <X size={14} />
                        </button>
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                        {reminders.length === 0 ? (
                            <div className="p-6 text-center">
                                <Bell size={32} className="mx-auto text-slate-200 mb-2" />
                                <p className="text-sm text-slate-400">Nessuna notifica</p>
                            </div>
                        ) : (
                            reminders.map(r => (
                                <button
                                    key={r.id}
                                    onClick={() => { onQuoteClick(r.quoteId); setIsOpen(false); }}
                                    className={`w-full text-left p-4 hover:bg-slate-50 transition-colors`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`w-8 h-8 rounded-lg ${bgMap[r.type]} border flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                            {iconMap[r.type]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-xs font-semibold text-slate-600">{r.quoteNumber}</span>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${bgMap[r.type]}`}>{labelMap[r.type]}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 leading-relaxed">{r.message}</p>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
