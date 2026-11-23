import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl: string = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseKey: string = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim();

export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl &&
  supabaseKey &&
  supabaseUrl.startsWith('http')
);

let clientInstance: SupabaseClient;

try {
  if (isSupabaseConfigured) {
    clientInstance = createClient(supabaseUrl, supabaseKey);
  } else {
    // Graceful placeholder client so module loading and React rendering never crash
    clientInstance = createClient('https://placeholder-careercurve.supabase.co', 'placeholder-public-anon-key');
  }
} catch (err) {
  console.warn('Failed to initialize Supabase client, using fallback dummy client:', err);
  clientInstance = createClient('https://placeholder-careercurve.supabase.co', 'placeholder-public-anon-key');
}

export const supabase: SupabaseClient = clientInstance;
