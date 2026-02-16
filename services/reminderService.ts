import { QuoteData } from '../types';

export interface Reminder {
    id: string;
    quoteId: string;
    quoteNumber: string;
    clientName: string;
    type: 'expiring_soon' | 'expired' | 'follow_up';
    message: string;
    urgency: 'low' | 'medium' | 'high';
    date: string;
}

/**
 * Generate reminders based on quote statuses and dates.
 */
export const getReminders = (quotes: QuoteData[]): Reminder[] => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const reminders: Reminder[] = [];

    quotes.forEach(q => {
        const clientName = q.client.company || q.client.name || 'Senza nome';

        // Scaduto
        if (q.status === 'sent' && q.expiryDate && q.expiryDate < todayStr) {
            reminders.push({
                id: `exp-${q.id}`,
                quoteId: q.id,
                quoteNumber: q.number,
                clientName,
                type: 'expired',
                message: `Il preventivo ${q.number} per ${clientName} è scaduto il ${new Date(q.expiryDate).toLocaleDateString('it-IT')}.`,
                urgency: 'high',
                date: q.expiryDate,
            });
        }

        // In scadenza entro 3 giorni
        if (q.status === 'sent' && q.expiryDate) {
            const expiryDate = new Date(q.expiryDate);
            const daysUntil = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            if (daysUntil > 0 && daysUntil <= 3) {
                reminders.push({
                    id: `soon-${q.id}`,
                    quoteId: q.id,
                    quoteNumber: q.number,
                    clientName,
                    type: 'expiring_soon',
                    message: `Il preventivo ${q.number} per ${clientName} scade tra ${daysUntil} giorn${daysUntil === 1 ? 'o' : 'i'}.`,
                    urgency: 'medium',
                    date: q.expiryDate,
                });
            }
        }

        // Follow-up: sent > 7 giorni, no risposta
        if (q.status === 'sent' && q.date) {
            const sentDate = new Date(q.date);
            const daysSince = Math.floor((today.getTime() - sentDate.getTime()) / (1000 * 60 * 60 * 24));

            if (daysSince >= 7) {
                reminders.push({
                    id: `fup-${q.id}`,
                    quoteId: q.id,
                    quoteNumber: q.number,
                    clientName,
                    type: 'follow_up',
                    message: `Nessuna risposta per ${q.number} (${clientName}) da ${daysSince} giorni. Prova un follow-up.`,
                    urgency: 'low',
                    date: q.date,
                });
            }
        }
    });

    // Sort by urgency: high first
    const urgencyOrder = { high: 0, medium: 1, low: 2 };
    return reminders.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);
};
