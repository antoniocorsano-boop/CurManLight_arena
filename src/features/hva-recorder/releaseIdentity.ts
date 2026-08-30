export type PublishedReleaseIdentity = {
  releaseSha: string;
  manifestUrl: string;
};

export function buildPublishedReleaseManifestUrl(baseUrl: string, origin: string): string {
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return new URL(`${normalizedBase}beta-release.json`, origin).toString();
}

export function buildPageRelativeReleaseManifestUrl(pageUrl: string): string {
  const page = new URL(pageUrl);
  const pathname = page.pathname.endsWith('/') ? page.pathname : `${page.pathname}/`;
  const segments = pathname.split('/').filter(Boolean);
  const repositoryBase = segments.length > 0 ? `/${segments[0]}/` : '/';
  return new URL(`${repositoryBase}beta-release.json`, page.origin).toString();
}

function withCacheBust(manifestUrl: string): string {
  const requestUrl = new URL(manifestUrl);
  requestUrl.searchParams.set('hvaReleaseCheck', `${Date.now()}-${Math.random().toString(16).slice(2)}`);
  return requestUrl.toString();
}

async function fetchReleaseIdentity(fetchImpl: typeof fetch, manifestUrl: string): Promise<PublishedReleaseIdentity> {
  const response = await fetchImpl(withCacheBust(manifestUrl), {
    method: 'GET',
    cache: 'no-store',
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`release manifest HTTP ${response.status}`);
  }

  const data = await response.json() as { releaseSha?: unknown };
  const releaseSha = typeof data.releaseSha === 'string' ? data.releaseSha.trim() : '';
  if (!/^[0-9a-f]{40}$/i.test(releaseSha)) {
    throw new Error('release manifest missing immutable SHA');
  }

  return { releaseSha, manifestUrl };
}

export async function readPublishedReleaseIdentity(options: {
  baseUrl: string;
  origin: string;
  pageUrl?: string;
  fetchImpl?: typeof fetch;
}): Promise<PublishedReleaseIdentity> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const candidates = [
    options.pageUrl ? buildPageRelativeReleaseManifestUrl(options.pageUrl) : null,
    buildPublishedReleaseManifestUrl(options.baseUrl, options.origin),
  ].filter((candidate): candidate is string => Boolean(candidate));

  const uniqueCandidates = [...new Set(candidates)];
  let lastError: unknown = new Error('release manifest unavailable');

  for (const candidate of uniqueCandidates) {
    try {
      return await fetchReleaseIdentity(fetchImpl, candidate);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}
