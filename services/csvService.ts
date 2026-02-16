// CSV Import/Export utilities for clients and quotes

import { SavedClient, QuoteData, CURRENCY_FORMATTER } from '../types';

// --- CLIENT CSV ---

export const exportClientsCSV = (clients: SavedClient[]): string => {
    const headers = ['Nome', 'Azienda', 'Email', 'Telefono', 'Indirizzo', 'P.IVA'];
    const rows = clients.map(c => [
        escapeCsv(c.name),
        escapeCsv(c.company),
        escapeCsv(c.email),
        escapeCsv(c.phone || ''),
        escapeCsv(c.address),
        escapeCsv(c.vatId),
    ]);
    return [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
};

export const parseClientsCSV = (csv: string): Partial<SavedClient>[] => {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) return [];

    // Skip header
    return lines.slice(1).map(line => {
        const cols = parseCsvLine(line);
        return {
            name: cols[0] || '',
            company: cols[1] || '',
            email: cols[2] || '',
            phone: cols[3] || '',
            address: cols[4] || '',
            vatId: cols[5] || '',
        };
    }).filter(c => c.name || c.company);
};

// --- QUOTE CSV ---

export const exportQuotesCSV = (quotes: QuoteData[]): string => {
    const headers = ['Numero', 'Data', 'Scadenza', 'Cliente', 'Azienda Cliente', 'Stato', 'Totale', 'Pagamento'];
    const rows = quotes.map(q => {
        const total = q.items.reduce((a, i) => a + i.quantity * i.unitPrice * (1 + i.taxRate / 100), 0);
        return [
            escapeCsv(q.number),
            new Date(q.date).toLocaleDateString('it-IT'),
            new Date(q.expiryDate).toLocaleDateString('it-IT'),
            escapeCsv(q.client.name),
            escapeCsv(q.client.company),
            q.status,
            total.toFixed(2),
            q.paymentStatus || 'unpaid',
        ];
    });
    return [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
};

// --- DOWNLOAD ---

export const downloadCSV = (content: string, filename: string) => {
    // BOM for Excel compatibility with Italian characters
    const bom = '\uFEFF';
    const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
};

// --- HELPERS ---

const escapeCsv = (str: string): string => {
    if (str.includes(';') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
};

const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ';' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
};
