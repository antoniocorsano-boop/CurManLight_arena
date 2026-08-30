export type PublishedReleaseIdentity = {
  releaseSha: string;
  manifestUrl: string;
};

export function buildPublishedReleaseManifestUrl(baseUrl: string, origin: string): string {
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return new URL(`${normalizedBase}beta-release.json`, origin).toString();
}

export async function readPublishedReleaseIdentity(options: {
  baseUrl: string;
  origin: string;
  fetchImpl?: typeof fetch;
}): Promise<PublishedReleaseIdentity> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const manifestUrl = buildPublishedReleaseManifestUrl(options.baseUrl, options.origin);
  const requestUrl = new URL(manifestUrl);
  requestUrl.searchParams.set('hvaReleaseCheck', String(Date.now()));

  const response = await fetchImpl(requestUrl.toString(), {
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
