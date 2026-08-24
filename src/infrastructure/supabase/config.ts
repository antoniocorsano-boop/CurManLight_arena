export interface SupabasePublicEnv {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_PUBLISHABLE_KEY?: string;
}

export interface SupabasePublicConfig {
  url: string;
  publishableKey: string;
}

export type SupabaseConfigResolution =
  | { status: 'disabled' }
  | { status: 'configured'; config: SupabasePublicConfig }
  | { status: 'invalid'; reason: string };

const normalized = (value: string | undefined): string => value?.trim() ?? '';

export const resolveSupabasePublicConfig = (
  env: SupabasePublicEnv
): SupabaseConfigResolution => {
  const url = normalized(env.VITE_SUPABASE_URL);
  const publishableKey = normalized(env.VITE_SUPABASE_PUBLISHABLE_KEY);

  if (!url && !publishableKey) {
    return { status: 'disabled' };
  }

  if (!url || !publishableKey) {
    return {
      status: 'invalid',
      reason: 'La configurazione Supabase pubblica è incompleta: URL e publishable key devono essere presenti insieme.',
    };
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') {
      return {
        status: 'invalid',
        reason: 'VITE_SUPABASE_URL deve usare HTTPS.',
      };
    }
  } catch {
    return {
      status: 'invalid',
      reason: 'VITE_SUPABASE_URL non è un URL valido.',
    };
  }

  return {
    status: 'configured',
    config: { url, publishableKey },
  };
};

export const getSupabasePublicConfig = (): SupabaseConfigResolution =>
  resolveSupabasePublicConfig(import.meta.env);
