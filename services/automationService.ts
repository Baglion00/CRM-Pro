import { QuoteData } from '../types';

/**
 * Generate a sequential quote number: PRV-YYYY-NNN
 */
export const generateQuoteNumber = (existingQuotes: QuoteData[]): string => {
    const year = new Date().getFullYear();
    const prefix = `PRV-${year}-`;

    const maxNum = existingQuotes
        .filter(q => q.number.startsWith(prefix))
        .map(q => parseInt(q.number.replace(prefix, ''), 10))
        .filter(n => !isNaN(n))
        .reduce((max, n) => Math.max(max, n), 0);

    return `${prefix}${String(maxNum + 1).padStart(3, '0')}`;
};

/**
 * Calculate expiry date from a given date
 * @param fromDate - ISO date string
 * @param days - Number of days until expiry (default: 30)
 */
export const calculateExpiryDate = (fromDate: string, days: number = 30): string => {
    const d = new Date(fromDate);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
};

/**
 * Check quotes and mark expired ones.
 * Returns a new array with updated statuses.
 */
export const checkExpiredQuotes = (quotes: QuoteData[]): QuoteData[] => {
    const today = new Date().toISOString().split('T')[0];

    return quotes.map(q => {
        if (
            q.status === 'sent' &&
            q.expiryDate &&
            q.expiryDate < today
        ) {
            return { ...q, status: 'expired' as const };
        }
        return q;
    });
};

/**
 * Get the default expiry days from localStorage or return 30.
 */
export const getExpiryDays = (): number => {
    const stored = localStorage.getItem('autoquote_expiry_days');
    return stored ? parseInt(stored, 10) : 30;
};

export const setExpiryDays = (days: number): void => {
    localStorage.setItem('autoquote_expiry_days', String(days));
};
