import { createClient } from '@supabase/supabase-js';
import { QuoteData, CompanyInfo, SavedClient } from '../types';

// CREDENZIALI SUPABASE DEFAULT
export const DEFAULT_URL = "https://gxibuhtjnvlxinbmqges.supabase.co";
export const DEFAULT_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4aWJ1aHRqbnZseGluYm1xZ2VzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNzAzNTcsImV4cCI6MjA4Njg0NjM1N30.uyfpzKyrtFmQTFf8v7DVyPVa4LAHnYcKsLn2SXWmxns";

let supabase: any = null;

export const initSupabase = (url: string = DEFAULT_URL, key: string = DEFAULT_KEY) => {
  if (!url || !key) return false;
  try {
    supabase = createClient(url, key);
    localStorage.setItem('supabase_url', url);
    localStorage.setItem('supabase_key', key);
    return true;
  } catch (e) {
    console.error("Supabase init error", e);
    return false;
  }
};

const storedUrl = localStorage.getItem('supabase_url');
const storedKey = localStorage.getItem('supabase_key');

if (storedUrl && storedKey) {
  initSupabase(storedUrl, storedKey);
} else {
  initSupabase(DEFAULT_URL, DEFAULT_KEY);
}

export const isSupabaseConfigured = () => !!supabase;

export const disconnectSupabase = () => {
  supabase = null;
  localStorage.removeItem('supabase_url');
  localStorage.removeItem('supabase_key');
};

// --- QUOTES Methods ---

export const cloudSaveQuote = async (quote: QuoteData) => {
  if (!supabase) throw new Error("Cloud non connesso");
  const { error } = await supabase
    .from('quotes')
    .upsert({ 
      id: quote.id, 
      data: quote,
      updated_at: new Date()
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
  return data.map((row: any) => row.data);
};

export const cloudDeleteQuote = async (id: string) => {
  if (!supabase) return;
  const { error } = await supabase.from('quotes').delete().eq('id', id);
  if (error) throw error;
};

// --- SETTINGS Methods ---

export const cloudSaveCompany = async (company: CompanyInfo) => {
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

// --- CLIENTS Methods ---

export const cloudSaveClient = async (client: Partial<SavedClient>) => {
  if (!supabase) throw new Error("Cloud non connesso");
  
  // Remove ID if empty string to allow auto-generation
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
  return data as SavedClient[];
};

export const cloudDeleteClient = async (id: string) => {
  if (!supabase) return;
  const { error } = await supabase.from('clients').delete().eq('id', id);
  if (error) throw error;
};