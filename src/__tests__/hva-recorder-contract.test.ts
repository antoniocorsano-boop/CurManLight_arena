import { describe, expect, it, vi } from 'vitest';
import { appendHvaRouteEvent, createHvaRecorderManifest, HVA_RECORDER_SCHEMA } from '../features/hva-recorder/contract';
import { buildPublishedReleaseManifestUrl, readPublishedReleaseIdentity } from '../features/hva-recorder/releaseIdentity';
import { encodeMonoPcm16Wav } from '../features/hva-recorder/wav';

describe('Arena HVA recorder contract', () => {
  it('creates a local-only manifest bound to the observed release', () => {
    const manifest = createHvaRecorderManifest({
      sessionId: 'session-1',
      releaseSha: 'abc123',
      startedAt: '2026-08-30T10:00:00.000Z',
      mimeType: 'audio/webm',
      userAgent: 'test-agent',
      viewport: { width: 390, height: 844 },
      initialRoute: '/curriculum',
    });

    expect(manifest.schema).toBe(HVA_RECORDER_SCHEMA);
    expect(manifest.releaseSha).toBe('abc123');
    expect(manifest.storage).toEqual({ mode: 'LOCAL_INDEXEDDB', automaticUpload: false });
    expect(manifest.timeline).toEqual([{ tMs: 0, route: '/curriculum', kind: 'route' }]);
  });

  it('records route changes without duplicating the current route', () => {
    const manifest = createHvaRecorderManifest({
      sessionId: 'session-2',
      releaseSha: null,
      startedAt: '2026-08-30T10:00:00.000Z',
      mimeType: 'audio/mp4',
      userAgent: 'test-agent',
      viewport: { width: 1280, height: 900 },
      initialRoute: '/',
    });

    const unchanged = appendHvaRouteEvent(manifest, '/', 250);
    const changed = appendHvaRouteEvent(unchanged, '/revisione', 1250.4);

    expect(unchanged).toBe(manifest);
    expect(changed.timeline).toEqual([
      { tMs: 0, route: '/', kind: 'route' },
      { tMs: 1250, route: '/revisione', kind: 'route' },
    ]);
  });

  it('resolves the published release manifest from the beta base path', () => {
    expect(buildPublishedReleaseManifestUrl('/CurManLight_arena/', 'https://example.test')).toBe(
      'https://example.test/CurManLight_arena/beta-release.json',
    );
  });

  it('accepts only an immutable published SHA for canonical recorder binding', async () => {
    const releaseSha = '50ba5a2c09b947e273ec0ab600e68ef3c8223e5d';
    const fetchImpl = vi.fn(async () => new Response(
      JSON.stringify({ releaseSha }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    )) as unknown as typeof fetch;

    const identity = await readPublishedReleaseIdentity({
      baseUrl: '/CurManLight_arena/',
      origin: 'https://example.test',
      fetchImpl,
    });

    expect(identity.releaseSha).toBe(releaseSha);
    expect(identity.manifestUrl).toBe('https://example.test/CurManLight_arena/beta-release.json');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('fails closed when the published release SHA is missing', async () => {
    const fetchImpl = vi.fn(async () => new Response(
      JSON.stringify({ releaseSha: null }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    )) as unknown as typeof fetch;

    await expect(readPublishedReleaseIdentity({
      baseUrl: '/CurManLight_arena/',
      origin: 'https://example.test',
      fetchImpl,
    })).rejects.toThrow('release manifest missing immutable SHA');
  });

  it('encodes a standard mono PCM16 WAV for compatibility export', () => {
    const wav = encodeMonoPcm16Wav([
      new Float32Array([0, 0.5, -0.5, 1, -1]),
      new Float32Array([0, 0.5, -0.5, 1, -1]),
    ], 48000);
    const view = new DataView(wav);
    const ascii = (offset: number, length: number) => String.fromCharCode(
      ...Array.from({ length }, (_, index) => view.getUint8(offset + index)),
    );

    expect(ascii(0, 4)).toBe('RIFF');
    expect(ascii(8, 4)).toBe('WAVE');
    expect(ascii(12, 4)).toBe('fmt ');
    expect(ascii(36, 4)).toBe('data');
    expect(view.getUint16(20, true)).toBe(1);
    expect(view.getUint16(22, true)).toBe(1);
    expect(view.getUint32(24, true)).toBe(48000);
    expect(view.getUint16(34, true)).toBe(16);
    expect(view.getUint32(40, true)).toBe(10);
    expect(wav.byteLength).toBe(54);
  });
});
