import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase/env";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Lightweight anon/publishable client (no cookie jar). Returns `null` if env is missing so callers
 * can degrade gracefully (e.g. `/api/slots` demo mode).
 */
export function createAnonClient(): SupabaseClient | null {
  const url = getSupabaseUrl();
  const key = getSupabasePublishableKey();
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
