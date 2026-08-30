export const HVA_RECORDER_SCHEMA = 'CML_ARENA_HVA_AUDIO_SESSION_V1' as const;

export type HvaRouteEvent = {
  tMs: number;
  route: string;
  kind: 'route';
};

export type HvaRecorderManifest = {
  schema: typeof HVA_RECORDER_SCHEMA;
  sessionId: string;
  releaseSha: string | null;
  startedAt: string;
  stoppedAt: string | null;
  mimeType: string;
  device: {
    userAgent: string;
    viewport: { width: number; height: number };
  };
  timeline: HvaRouteEvent[];
  storage: {
    mode: 'LOCAL_INDEXEDDB';
    automaticUpload: false;
  };
};

export function createHvaRecorderManifest(input: {
  sessionId: string;
  releaseSha: string | null;
  startedAt: string;
  mimeType: string;
  userAgent: string;
  viewport: { width: number; height: number };
  initialRoute: string;
}): HvaRecorderManifest {
  return {
    schema: HVA_RECORDER_SCHEMA,
    sessionId: input.sessionId,
    releaseSha: input.releaseSha,
    startedAt: input.startedAt,
    stoppedAt: null,
    mimeType: input.mimeType,
    device: {
      userAgent: input.userAgent,
      viewport: input.viewport,
    },
    timeline: [{ tMs: 0, route: input.initialRoute, kind: 'route' }],
    storage: {
      mode: 'LOCAL_INDEXEDDB',
      automaticUpload: false,
    },
  };
}

export function appendHvaRouteEvent(
  manifest: HvaRecorderManifest,
  route: string,
  tMs: number,
): HvaRecorderManifest {
  const last = manifest.timeline.at(-1);
  if (last?.route === route) return manifest;
  return {
    ...manifest,
    timeline: [...manifest.timeline, { tMs: Math.max(0, Math.round(tMs)), route, kind: 'route' }],
  };
}
