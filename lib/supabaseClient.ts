// lib/supabaseClient.ts
import { createClient } from 'https://aistudiocdn.com/@supabase/supabase-js@^2.44.4';

// The development environment does not support environment variables (import.meta.env).
// To ensure the application can connect, we are hardcoding the keys directly.
// This is safe for Supabase public keys and resolves the startup error.
const supabaseUrl = 'https://ahneajyjazqmyfncpeuh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobmVhanlqYXpxbXlmbmNwZXVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3ODMxODIsImV4cCI6MjA3NDM1OTE4Mn0.nSWojEwOm34BgSjEiNrWrZHFoj6btsI2N0GZYlhe5EU';

if (!supabaseUrl || !supabaseAnonKey) {
    // This check is kept as a safeguard, but should not be triggered with hardcoded values.
    throw new Error("Supabase URL or Anon Key is missing.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);