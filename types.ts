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
  phone?: string;
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
  taxRate: number;
}

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected';

export interface QuoteData {
  id: string;
  number: string;
  date: string;
  expiryDate: string;
  company: CompanyInfo;
  client: ClientInfo;
  items: LineItem[];
  notes: string;
  currency: string;
  status: QuoteStatus;
}

export const CURRENCY_FORMATTER = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
});

export const STATUS_CONFIG: Record<QuoteStatus, { label: string; color: string; bg: string; border: string }> = {
  draft: { label: 'Bozza', color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' },
  sent: { label: 'Inviato', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  accepted: { label: 'Accettato', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  rejected: { label: 'Rifiutato', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
};

// Declare html2pdf global for TypeScript
declare global {
  var html2pdf: any;
}

// Vite env types
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_KEY: string;
  readonly VITE_AI_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}