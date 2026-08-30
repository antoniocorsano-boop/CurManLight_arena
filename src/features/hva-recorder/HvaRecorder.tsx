import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Mic, Pause, Play, Square, Trash2, Download, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { appendHvaRouteEvent, createHvaRecorderManifest, type HvaRecorderManifest } from './contract';
import { deleteHvaSession, saveHvaSession } from './storage';
import { encodeMonoPcm16Wav } from './wav';
import { readPublishedReleaseIdentity } from './releaseIdentity';

const ACTIVATION_KEY = 'cml:hva-recorder:enabled';

type RecorderStatus = 'idle' | 'requesting' | 'recording' | 'paused' | 'stopped' | 'error';
type ReleaseStatus = 'checking' | 'ready' | 'error';

function resolveExplicitActivation(): boolean {
  const params = new URLSearchParams(window.location.search);
  const requested = params.get('hvaRecorder');
  if (requested === '1') window.sessionStorage.setItem(ACTIVATION_KEY, '1');
  if (requested === '0') window.sessionStorage.removeItem(ACTIVATION_KEY);
  return requested === '1' || window.sessionStorage.getItem(ACTIVATION_KEY) === '1';
}

function createSessionId(): string {
  return typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `hva-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function selectMimeType(): string {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
  return candidates.find((candidate) => MediaRecorder.isTypeSupported(candidate)) ?? '';
}

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

async function convertAudioBlobToWav(blob: Blob): Promise<Blob> {
  const AudioContextCtor = window.AudioContext
    ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) throw new Error('AudioContext unavailable');
  const context = new AudioContextCtor();
  try {
    const source = await blob.arrayBuffer();
    const decoded = await context.decodeAudioData(source.slice(0));
    const channels = Array.from(
      { length: decoded.numberOfChannels },
      (_, index) => decoded.getChannelData(index),
    );
    return new Blob([encodeMonoPcm16Wav(channels, decoded.sampleRate)], { type: 'audio/wav' });
  } finally {
    await context.close().catch(() => undefined);
  }
}

export default function HvaRecorder() {
  const location = useLocation();
  const [enabled] = useState(resolveExplicitActivation);
  const [status, setStatus] = useState<RecorderStatus>('idle');
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState('');
  const [releaseStatus, setReleaseStatus] = useState<ReleaseStatus>('checking');
  const [releaseSha, setReleaseSha] = useState<string | null>(null);
  const [manifest, setManifest] = useState<HvaRecorderManifest | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [wavExporting, setWavExporting] = useState(false);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const manifestRef = useRef<HvaRecorderManifest | null>(null);
  const startPerfRef = useRef<number | null>(null);

  const currentRoute = `${location.pathname}${location.search}${location.hash}`;
  const audioUrl = useMemo(() => audioBlob ? URL.createObjectURL(audioBlob) : null, [audioBlob]);

  const refreshReleaseIdentity = async () => {
    setReleaseStatus('checking');
    setReleaseSha(null);
    try {
      const identity = await readPublishedReleaseIdentity({
        baseUrl: import.meta.env.BASE_URL,
        origin: window.location.origin,
        pageUrl: window.location.href,
      });
      setReleaseSha(identity.releaseSha);
      setReleaseStatus('ready');
      setError('');
    } catch (releaseError) {
      console.warn('[Arena HVA Recorder] Release identity unavailable:', releaseError);
      setReleaseStatus('error');
      setError('Identità Beta non disponibile. Apri HVA e usa Riprova.');
    }
  };

  useEffect(() => {
    if (!enabled) return;
    void refreshReleaseIdentity();
    // Release identity is intentionally checked once on activation and explicitly on retry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  useEffect(() => () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
  }, [audioUrl]);

  useEffect(() => {
    if (!enabled || !manifestRef.current || startPerfRef.current === null) return;
    if (status !== 'recording' && status !== 'paused') return;
    const next = appendHvaRouteEvent(
      manifestRef.current,
      currentRoute,
      performance.now() - startPerfRef.current,
    );
    if (next === manifestRef.current) return;
    manifestRef.current = next;
    setManifest(next);
  }, [currentRoute, enabled, status]);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  if (!enabled) return null;

  const finishLocalSession = async (blob: Blob) => {
    const current = manifestRef.current;
    if (!current) return;
    const completed: HvaRecorderManifest = { ...current, stoppedAt: new Date().toISOString() };
    manifestRef.current = completed;
    setManifest(completed);
    setAudioBlob(blob);
    try {
      await saveHvaSession({ sessionId: completed.sessionId, manifest: completed, audio: blob });
    } catch (storageError) {
      console.warn('[Arena HVA Recorder] Local persistence failed:', storageError);
      setError('Registrazione acquisita, ma il salvataggio locale permanente non è riuscito. Scaricala prima di chiudere la pagina.');
    } finally {
      setStatus('stopped');
    }
  };

  const startRecording = async () => {
    if (releaseStatus !== 'ready' || !releaseSha) {
      setError('Prima di registrare devo verificare lo SHA della Beta pubblicata.');
      setExpanded(true);
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Questo browser non supporta la registrazione audio locale richiesta dal collaudo HVA.');
      setStatus('error');
      return;
    }

    setError('');
    setStatus('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = selectMimeType();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      const initialManifest = createHvaRecorderManifest({
        sessionId: createSessionId(),
        releaseSha,
        startedAt: new Date().toISOString(),
        mimeType: recorder.mimeType || mimeType || 'audio/unknown',
        userAgent: navigator.userAgent,
        viewport: { width: window.innerWidth, height: window.innerHeight },
        initialRoute: currentRoute,
      });

      chunksRef.current = [];
      streamRef.current = stream;
      recorderRef.current = recorder;
      manifestRef.current = initialManifest;
      startPerfRef.current = performance.now();
      setManifest(initialManifest);
      setAudioBlob(null);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onerror = () => {
        setError('La registrazione audio si è interrotta per un errore del browser.');
        setStatus('error');
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || mimeType || 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        void finishLocalSession(blob);
      };

      recorder.start(1000);
      setStatus('recording');
      setExpanded(false);
    } catch (permissionError) {
      console.warn('[Arena HVA Recorder] Microphone unavailable:', permissionError);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setError('Microfono non disponibile o permesso negato. Nessuna registrazione è stata avviata.');
      setStatus('error');
      setExpanded(true);
    }
  };

  const pauseRecording = () => {
    if (recorderRef.current?.state !== 'recording') return;
    recorderRef.current.pause();
    setStatus('paused');
  };

  const resumeRecording = () => {
    if (recorderRef.current?.state !== 'paused') return;
    recorderRef.current.resume();
    setStatus('recording');
    setExpanded(false);
  };

  const stopRecording = () => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === 'inactive') return;
    recorder.stop();
    setExpanded(true);
  };

  const exportAudio = () => {
    if (!audioBlob || !manifest) return;
    const extension = manifest.mimeType.includes('mp4') ? 'm4a' : 'webm';
    downloadBlob(audioBlob, `arena-hva-${manifest.sessionId}.${extension}`);
  };

  const exportWav = async () => {
    if (!audioBlob || !manifest || wavExporting) return;
    setWavExporting(true);
    setError('');
    try {
      downloadBlob(await convertAudioBlobToWav(audioBlob), `arena-hva-${manifest.sessionId}.wav`);
    } catch (wavError) {
      console.warn('[Arena HVA Recorder] WAV export failed:', wavError);
      setError('Il browser non riesce a convertire questa registrazione in WAV. Il file audio originale resta disponibile.');
    } finally {
      setWavExporting(false);
    }
  };

  const exportManifest = () => {
    if (!manifest) return;
    downloadBlob(
      new Blob([`${JSON.stringify(manifest, null, 2)}\n`], { type: 'application/json' }),
      `arena-hva-${manifest.sessionId}.json`,
    );
  };

  const deleteLocal = async () => {
    if (manifest?.sessionId) {
      try {
        await deleteHvaSession(manifest.sessionId);
      } catch (deleteError) {
        console.warn('[Arena HVA Recorder] Local delete failed:', deleteError);
      }
    }
    setAudioBlob(null);
    setManifest(null);
    manifestRef.current = null;
    chunksRef.current = [];
    startPerfRef.current = null;
    setError('');
    setStatus('idle');
    setExpanded(false);
  };

  const isActive = status === 'recording' || status === 'paused';
  const releaseReady = releaseStatus === 'ready' && Boolean(releaseSha);

  if (!expanded) {
    return (
      <div className="fixed top-20 right-1 z-[300]" data-hva-recorder data-recording={isActive ? 'true' : 'false'}>
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex h-8 min-w-8 items-center justify-center gap-1 rounded-full border border-slate-300 bg-white/95 px-2 text-[9px] font-bold text-slate-800 shadow-md backdrop-blur"
          aria-label="Apri controlli registratore HVA"
        >
          <span aria-hidden="true" className={isActive ? 'text-rose-600' : releaseReady ? 'text-emerald-600' : 'text-amber-600'}>●</span>
          <span>{status === 'paused' ? 'PAUSA' : isActive ? 'REC' : 'HVA'}</span>
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>
    );
  }

  return (
    <aside
      className="fixed top-20 right-1 z-[300] w-[min(13rem,calc(100vw-0.5rem))] rounded-lg border border-slate-300 bg-white/98 p-2 shadow-xl backdrop-blur"
      data-hva-recorder
      data-recording={isActive ? 'true' : 'false'}
      aria-label="Arena HVA Recorder"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-900">
            <Mic className="h-3 w-3" /> HVA Recorder
          </div>
          <p className="mt-0.5 text-[9px] leading-3 text-slate-600">Locale · nessun upload.</p>
          <p className="mt-1 text-[9px] leading-3 text-slate-700">
            Release: <span className="font-mono font-semibold">{releaseReady ? releaseSha?.slice(0, 10) : releaseStatus === 'checking' ? 'verifica…' : 'non disponibile'}</span>
          </p>
        </div>
        <button type="button" onClick={() => setExpanded(false)} className="rounded p-1 text-slate-500 hover:bg-slate-100" aria-label="Riduci registratore HVA">
          <ChevronUp className="h-3 w-3" />
        </button>
      </div>

      {releaseStatus === 'error' && (
        <button type="button" onClick={() => void refreshReleaseIdentity()} className="mt-1.5 inline-flex items-center gap-1 rounded-md border border-amber-300 px-2 py-1 text-[9px] font-semibold text-amber-900">
          <RefreshCw className="h-3 w-3" /> Riprova release
        </button>
      )}

      <div className="mt-1.5 flex flex-wrap gap-1" role="status" aria-live="polite">
        {(status === 'idle' || status === 'error') && (
          <button
            type="button"
            onClick={() => void startRecording()}
            disabled={!releaseReady}
            className="inline-flex items-center gap-1 rounded-md bg-slate-950 px-2 py-1 text-[10px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Mic className="h-3 w-3" /> Registra
          </button>
        )}
        {status === 'requesting' && <span className="text-[10px] font-semibold text-slate-700">Microfono…</span>}
        {status === 'recording' && (
          <>
            <button type="button" onClick={pauseRecording} className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-[10px] font-semibold text-slate-800"><Pause className="h-3 w-3" /> Pausa</button>
            <button type="button" onClick={stopRecording} className="inline-flex items-center gap-1 rounded-md bg-slate-950 px-2 py-1 text-[10px] font-semibold text-white"><Square className="h-3 w-3" /> Termina</button>
          </>
        )}
        {status === 'paused' && (
          <>
            <button type="button" onClick={resumeRecording} className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-[10px] font-semibold text-slate-800"><Play className="h-3 w-3" /> Riprendi</button>
            <button type="button" onClick={stopRecording} className="inline-flex items-center gap-1 rounded-md bg-slate-950 px-2 py-1 text-[10px] font-semibold text-white"><Square className="h-3 w-3" /> Termina</button>
          </>
        )}
      </div>

      {error && expanded && <p className="mt-1.5 rounded-md bg-amber-50 p-1.5 text-[9px] leading-3 text-amber-900">{error}</p>}

      {status === 'stopped' && manifest && audioBlob && (
        <div className="mt-1.5 space-y-1.5 border-t border-slate-200 pt-1.5">
          {audioUrl && <audio className="h-7 w-full" controls src={audioUrl} preload="metadata" />}
          <div className="text-[9px] leading-3 text-slate-600">
            <div>SHA: <span className="font-mono">{manifest.releaseSha?.slice(0, 10) ?? 'non rilevato'}</span></div>
            <div>{manifest.timeline.length} route · IndexedDB</div>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <button type="button" onClick={() => void exportWav()} disabled={wavExporting} className="inline-flex items-center justify-center gap-1 rounded-md border border-slate-300 px-1.5 py-1 text-[9px] font-semibold text-slate-800 disabled:opacity-60"><Download className="h-3 w-3" /> {wavExporting ? 'WAV…' : 'WAV'}</button>
            <button type="button" onClick={exportManifest} className="inline-flex items-center justify-center gap-1 rounded-md border border-slate-300 px-1.5 py-1 text-[9px] font-semibold text-slate-800"><Download className="h-3 w-3" /> Manifest</button>
            <button type="button" onClick={exportAudio} className="inline-flex items-center justify-center gap-1 rounded-md border border-slate-300 px-1.5 py-1 text-[9px] font-semibold text-slate-700"><Download className="h-3 w-3" /> Originale</button>
            <button type="button" onClick={() => void deleteLocal()} className="inline-flex items-center justify-center gap-1 rounded-md border border-slate-300 px-1.5 py-1 text-[9px] font-semibold text-slate-700"><Trash2 className="h-3 w-3" /> Elimina</button>
          </div>
        </div>
      )}
    </aside>
  );
}
