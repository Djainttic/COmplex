// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Replace these with your actual Supabase project URL and anon key.
// It's highly recommended to use environment variables for this.
const supabaseUrl = process.env.SUPABASE_URL || 'https://ahneajyjazqmyfncpeuh.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobmVhanlqYXpxbXlmbmNwZXVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3ODMxODIsImV4cCI6MjA3NDM1OTE4Mn0.nSWojEwOm34BgSjEiNrWrZHFoj6btsI2N0GZYlhe5EU';

if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
    console.warn("Supabase URL or Anon Key is not configured. Please add them to your environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);