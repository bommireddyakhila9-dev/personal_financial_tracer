import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const usesPlaceholderValues =
  supabaseUrl?.includes("YOUR_PROJECT_REF") || supabaseAnonKey?.includes("YOUR_SUPABASE_ANON_KEY");

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && !usesPlaceholderValues);
export const isUsingLocalData = !isSupabaseConfigured;
export const supabaseConfigMessage =
  "Running in local demo mode. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in frontend/.env to use Supabase.";

export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;
