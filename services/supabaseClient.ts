import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { QuoteData, CompanyInfo, SavedClient } from '../types';

// Read from environment variables (set in .env)
const ENV_URL = import.meta.env.VITE_SUPABASE_URL || '';
const ENV_KEY = import.meta.env.VITE_SUPABASE_KEY || '';

let supabase: SupabaseClient | null = null;

export const initSupabase = (url?: string, key?: string): boolean => {
  const finalUrl = url || localStorage.getItem('supabase_url') || ENV_URL;
  const finalKey = key || localStorage.getItem('supabase_key') || ENV_KEY;

  if (!finalUrl || !finalKey) return false;

  try {
    supabase = createClient(finalUrl, finalKey);
    localStorage.setItem('supabase_url', finalUrl);
    localStorage.setItem('supabase_key', finalKey);
    return true;
  } catch (e) {
    console.error("Supabase init error", e);
    return false;
  }
};

// Auto-init on load
const storedUrl = localStorage.getItem('supabase_url');
const storedKey = localStorage.getItem('supabase_key');

if (storedUrl && storedKey) {
  initSupabase(storedUrl, storedKey);
} else if (ENV_URL && ENV_KEY) {
  initSupabase(ENV_URL, ENV_KEY);
}

export const isSupabaseConfigured = (): boolean => !!supabase;

export const getSupabaseUrl = (): string => {
  return localStorage.getItem('supabase_url') || ENV_URL;
};

export const disconnectSupabase = (): void => {
  supabase = null;
  localStorage.removeItem('supabase_url');
  localStorage.removeItem('supabase_key');
};

// --- QUOTES ---

export const cloudSaveQuote = async (quote: QuoteData): Promise<boolean> => {
  if (!supabase) throw new Error("Cloud non connesso");
  const { error } = await supabase
    .from('quotes')
    .upsert({
      id: quote.id,
      data: quote,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });
  if (error) throw error;
  return true;
};

export const cloudGetQuotes = async (): Promise<QuoteData[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('quotes')
    .select('data')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error("Error fetching quotes", error);
    return [];
  }
  return (data || []).map((row: any) => row.data);
};

export const cloudDeleteQuote = async (id: string): Promise<void> => {
  if (!supabase) return;
  const { error } = await supabase.from('quotes').delete().eq('id', id);
  if (error) throw error;
};

// --- SETTINGS ---

export const cloudSaveCompany = async (company: CompanyInfo): Promise<void> => {
  if (!supabase) return;
  const { error } = await supabase
    .from('settings')
    .upsert({ key: 'default_company', value: company });
  if (error) throw error;
};

export const cloudGetCompany = async (): Promise<CompanyInfo | null> => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'default_company')
    .single();
  if (error || !data) return null;
  return data.value;
};

// --- CLIENTS ---

export const cloudSaveClient = async (client: Partial<SavedClient>): Promise<SavedClient> => {
  if (!supabase) throw new Error("Cloud non connesso");

  const payload = { ...client };
  if (!payload.id) delete payload.id;

  const { data, error } = await supabase
    .from('clients')
    .upsert(payload)
    .select()
    .single();

  if (error) throw error;
  return data as SavedClient;
};

export const cloudGetClients = async (): Promise<SavedClient[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error("Error fetching clients", error);
    return [];
  }
  return (data || []) as SavedClient[];
};

export const cloudDeleteClient = async (id: string): Promise<void> => {
  if (!supabase) return;
  const { error } = await supabase.from('clients').delete().eq('id', id);
  if (error) throw error;
};