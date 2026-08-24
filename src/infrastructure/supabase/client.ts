import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSupabasePublicConfig, type SupabaseConfigResolution } from './config';

let browserClient: SupabaseClient | null = null;

export interface OptionalSupabaseClientResult {
  client: SupabaseClient | null;
  config: SupabaseConfigResolution;
}

/**
 * Creates no client in local-only mode. A partially configured environment
 * fails closed instead of silently falling back to a misleading shared mode.
 */
export const getOptionalSupabaseBrowserClient = (): OptionalSupabaseClientResult => {
  const config = getSupabasePublicConfig();

  if (config.status === 'disabled') {
    return { client: null, config };
  }

  if (config.status === 'invalid') {
    return { client: null, config };
  }

  if (!browserClient) {
    browserClient = createClient(config.config.url, config.config.publishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  return { client: browserClient, config };
};

export const resetSupabaseBrowserClientForTests = (): void => {
  browserClient = null;
};
