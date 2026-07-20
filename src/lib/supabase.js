import { createClient } from "@supabase/supabase-js";

/*
 * Supabase client.
 *
 * The URL and publishable ("anon") key are safe to ship in a static
 * front-end: the key only grants the access allowed by Row-Level
 * Security policies on the database. They are read from Vite env vars
 * (see .env.example); the fallbacks keep the deployed demo working.
 */
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "https://ufkltwxysujwwilzpwdd.supabase.co";
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_ROGRTMp0ZYc5GkMHjm44HQ_R9OT_rOc";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
