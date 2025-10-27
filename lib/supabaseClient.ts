import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Avoid throwing at import time in SSR; components can handle missing config gracefully

export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "");

export const supabaseConfigured: boolean = Boolean(supabaseUrl && supabaseAnonKey);



