export interface CompanyInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  vatId: string;
  logoUrl: string;
  website?: string;
  iban?: string;
}

export interface ClientInfo {
  name: string;
  company: string;
  email: string;
  address: string;
  vatId: string;
}

export interface SavedClient extends ClientInfo {
  id: string;
  created_at?: string;
}

export interface LineItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number; // Percentage, e.g., 22 for 22%
}

export interface QuoteData {
  id: string; // Unique ID for history
  number: string;
  date: string;
  expiryDate: string;
  company: CompanyInfo;
  client: ClientInfo;
  items: LineItem[];
  notes: string;
  currency: string;
}

export const CURRENCY_FORMATTER = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
});

// Declare html2pdf global for TypeScript
declare global {
  var html2pdf: any;
}