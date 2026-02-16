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

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid';

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
  // Payment tracking
  paymentStatus?: PaymentStatus;
  paidAmount?: number;
  paidDate?: string;
  // Digital signature
  signatureData?: string; // base64
  signedAt?: string;
  signedBy?: string;
  // Sharing
  shareToken?: string;
  // Recurring
  isRecurring?: boolean;
  recurringInterval?: 'monthly' | 'quarterly' | 'yearly';
  recurringEndDate?: string;
  parentQuoteId?: string;
  // Ritenuta d'acconto
  ritenutaRate?: number; // e.g. 20
  // Template
  templateAccent?: string;
}

// --- User Management ---
export type UserRole = 'owner' | 'admin' | 'editor' | 'viewer';
export type InstallMode = 'local' | 'vps';

export interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: 'active' | 'invited' | 'disabled';
  invitedBy?: string;
  joinedAt?: string;
  lastActive?: string;
  avatarUrl?: string;
}

export const ROLE_PERMISSIONS: Record<UserRole, { label: string; color: string; bg: string; permissions: string[] }> = {
  owner: { label: 'Proprietario', color: 'text-purple-700', bg: 'bg-purple-100', permissions: ['read', 'write', 'delete', 'manage_team', 'manage_settings', 'manage_billing'] },
  admin: { label: 'Amministratore', color: 'text-blue-700', bg: 'bg-blue-100', permissions: ['read', 'write', 'delete', 'manage_team', 'manage_settings'] },
  editor: { label: 'Editor', color: 'text-emerald-700', bg: 'bg-emerald-100', permissions: ['read', 'write'] },
  viewer: { label: 'Visualizzatore', color: 'text-slate-700', bg: 'bg-slate-100', permissions: ['read'] },
};

// --- Payment Gateways ---
export type PaymentProvider = 'stripe' | 'paypal' | 'gocardless';

export interface PaymentGatewayConfig {
  provider: PaymentProvider;
  enabled: boolean;
  apiKey: string;
  secretKey: string;
  mode: 'test' | 'live';
  webhookUrl?: string;
  connectedAt?: string;
}

export interface PaymentLink {
  id: string;
  quoteId: string;
  provider: PaymentProvider;
  url: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'expired';
  createdAt: string;
  paidAt?: string;
}

// --- Automations ---
export type AutomationTrigger = 'quote_expiring' | 'quote_expired' | 'quote_sent' | 'quote_accepted' | 'payment_overdue' | 'payment_received' | 'follow_up' | 'recurring_due' | 'weekly_report';

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: AutomationTrigger;
  enabled: boolean;
  delayDays: number; // days after trigger
  channel: 'email' | 'internal' | 'both';
  emailTemplate?: string;
  lastRun?: string;
  runCount: number;
  targetAudience: 'self' | 'client' | 'team';
}

export interface AutomationLog {
  id: string;
  ruleId: string;
  ruleName: string;
  quoteId?: string;
  quoteNumber?: string;
  clientName?: string;
  action: string;
  status: 'sent' | 'failed' | 'pending' | 'skipped';
  timestamp: string;
  channel: 'email' | 'internal';
  error?: string;
}

export interface CatalogItem {
  id: string;
  name: string;
  description: string;
  unitPrice: number;
  taxRate: number;
  category: string;
  created_at?: string;
}

export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  fromName: string;
  fromEmail: string;
  secure: boolean;
}

export interface DomainConfig {
  domain: string;
  sslEnabled: boolean;
  sslExpiry?: string;
  autoRenew: boolean;
  lastCheck?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[]; // List of variables used
}

export interface AppSettings {
  companyInfo: CompanyInfo;
  smtp: SmtpConfig;
  emailTemplates?: EmailTemplate[]; // New field
  quotePrefix: string;
  defaultExpiryDays: number;
  defaultNotes: string;
  currency: string;
  language: string;
  theme: 'light' | 'dark' | 'auto';
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
  expired: { label: 'Scaduto', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
};

export const PAYMENT_CONFIG: Record<PaymentStatus, { label: string; color: string; bg: string; icon: string }> = {
  unpaid: { label: 'Non pagato', color: 'text-red-600', bg: 'bg-red-50', icon: '⏳' },
  partial: { label: 'Acconto', color: 'text-amber-600', bg: 'bg-amber-50', icon: '💰' },
  paid: { label: 'Pagato', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: '✅' },
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