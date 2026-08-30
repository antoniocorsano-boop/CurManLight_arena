import { describe, expect, it } from 'vitest';
import { appendHvaRouteEvent, createHvaRecorderManifest, HVA_RECORDER_SCHEMA } from '../features/hva-recorder/contract';

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
});
