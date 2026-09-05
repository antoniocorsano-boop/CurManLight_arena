import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSupabasePublicConfig, type SupabaseConfigResolution } from './config';

let browserClient: SupabaseClient | null = null;

export interface OptionalSupabaseClientResult {
  client: SupabaseClient | null;
  config: SupabaseConfigResolution;
}

const resolveBetaEmailRedirectUrl = (): string | null => {
  if (typeof window === 'undefined' || import.meta.env.MODE !== 'beta') return null;

  const baseUrl = import.meta.env.BASE_URL || '/';
  const trimmedBase = baseUrl.replace(/^\/+|\/+$/g, '');
  const pathname = trimmedBase ? `/${trimmedBase}/beta-identity` : '/beta-identity';

  return new URL(pathname, window.location.origin).toString();
};

const createRedirectAwareFetch = (supabaseUrl: string): typeof fetch => {
  const nativeFetch = globalThis.fetch.bind(globalThis);
  const supabaseOrigin = new URL(supabaseUrl).origin;

  return (input, init) => {
    if (typeof input === 'string' || input instanceof URL) {
      const requestUrl = new URL(input.toString());
      const isEmailAuthRequest = requestUrl.origin === supabaseOrigin
        && (requestUrl.pathname.endsWith('/auth/v1/signup') || requestUrl.pathname.endsWith('/auth/v1/resend'));
      const redirectTo = resolveBetaEmailRedirectUrl();

      if (isEmailAuthRequest && redirectTo && !requestUrl.searchParams.has('redirect_to')) {
        requestUrl.searchParams.set('redirect_to', redirectTo);
        return nativeFetch(requestUrl, init);
      }
    }

    return nativeFetch(input, init);
  };
};

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
      global: {
        fetch: createRedirectAwareFetch(config.config.url),
      },
    });
  }

  return { client: browserClient, config };
};

export const resetSupabaseBrowserClientForTests = (): void => {
  browserClient = null;
};
