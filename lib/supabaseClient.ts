// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// Use Vite's environment variable syntax (import.meta.env)
// Vercel will populate these variables during the build process.
// FIX: Use optional chaining (?.) to prevent runtime errors if `import.meta.env` is undefined.
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://ahneajyjazqmyfncpeuh.supabase.co';
// FIX: Use optional chaining (?.) to prevent runtime errors if `import.meta.env` is undefined.
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobmVhanlqYXpxbXlmbmNwZXVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3ODMxODIsImV4cCI6MjA3NDM1OTE4Mn0.nSWojEwOm34BgSjEiNrWrZHFoj6btsI2N0GZYlhe5EU';


if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase URL or Anon Key is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);