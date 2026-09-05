import { useMemo, useState } from 'react';
import { CheckCircle2, CloudUpload, ShieldCheck } from 'lucide-react';
import { safeLocalStorageGetItem } from '../../../lib/consolidatedStorage';
import { GoogleDriveBackupSink } from '../../../infrastructure/googleDrive/googleDriveBackupSink';
import {
  createGoogleDriveBackupAccessTokenProvider,
  resolveGoogleDriveBackupClientConfig,
} from '../../../infrastructure/googleDrive/googleIdentityAccessToken';
import { backupLocalSourceRegistry } from '../lib/localSourceRegistryBackup';

export interface SourceRegistryDriveBackupActionProps {
  sourceCount: number;
  showToast: (message: string, success: boolean) => void;
}

type BackupUiState = 'idle' | 'working' | 'success' | 'error';

type LastBackupReceipt = {
  exportedAt: string;
  contentHash: string;
  remoteObjectId?: string;
};

function shortHash(hash: string): string {
  return hash.length > 18 ? `${hash.slice(0, 18)}…` : hash;
}

function backupErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes('TOKEN_INTERACTION_FAILED')) return 'Autorizzazione Google annullata o non disponibile.';
  if (message.includes('TOKEN_FAILED')) return 'Google non ha autorizzato l’accesso temporaneo a Drive.';
  if (message.includes('SCRIPT_LOAD_FAILED') || message.includes('API_UNAVAILABLE')) return 'Il servizio di autorizzazione Google non è raggiungibile.';
  if (message.includes('DRIVE_BACKUP_INIT_FAILED') || message.includes('DRIVE_BACKUP_UPLOAD_FAILED')) return 'Google Drive non ha completato il caricamento del backup.';
  if (message.includes('BACKUP_CONTENT_HASH_MISMATCH')) return 'Il controllo di integrità del backup non è riuscito. Nessun file è stato inviato.';
  return 'Backup non completato. Nessuno stato canonico di Arena è stato modificato.';
}

export function SourceRegistryDriveBackupAction({
  sourceCount,
  showToast,
}: SourceRegistryDriveBackupActionProps) {
  const clientConfig = useMemo(() => {
    const existingArenaClientId = safeLocalStorageGetItem('curman_workspaceClientId', '');
    return resolveGoogleDriveBackupClientConfig(import.meta.env as Record<string, unknown>, existingArenaClientId);
  }, []);
  const [state, setState] = useState<BackupUiState>('idle');
  const [lastBackup, setLastBackup] = useState<LastBackupReceipt | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const configured = clientConfig.status === 'available';
  const canBackup = configured && sourceCount > 0 && state !== 'working';

  const runBackup = async () => {
    if (!configured || state === 'working') return;
    if (sourceCount === 0) {
      showToast('Non ci sono fonti personali da includere nel backup.', false);
      return;
    }

    setState('working');
    setErrorMessage(null);
    try {
      const accessTokenProvider = createGoogleDriveBackupAccessTokenProvider({
        clientId: clientConfig.clientId,
      });
      const sink = new GoogleDriveBackupSink({ accessTokenProvider });
      const { receipt } = await backupLocalSourceRegistry(sink);
      setLastBackup({
        exportedAt: receipt.exportedAt,
        contentHash: receipt.contentHash,
        remoteObjectId: receipt.remoteObjectId,
      });
      setState('success');
      showToast('Backup delle fonti personali completato su Google Drive. Drive non acquisisce alcuna autorità sui dati.', true);
    } catch (error) {
      console.warn('[CML-DRIVE-01] Explicit Google Drive backup failed:', error);
      const humanMessage = backupErrorMessage(error);
      setErrorMessage(humanMessage);
      setState('error');
      showToast(humanMessage, false);
    }
  };

  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"
      aria-labelledby="source-registry-drive-backup-title"
      data-human-task="source-registry-drive-backup"
      data-backup-direction="outbound-only"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <div className="flex items-start gap-3">
            <CloudUpload className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" aria-hidden="true" />
            <div>
              <h2 id="source-registry-drive-backup-title" className="text-base font-black text-slate-900">Backup delle fonti personali</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Salva su Google Drive uno snapshot delle fonti caricate da te e della loro governance locale. Il backup non rende una fonte istituzionale o normativa e non sincronizza Drive con Arena.
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
            <p>
              L’accesso a Drive viene richiesto solo quando premi il pulsante, con scope <strong>drive.file</strong>. Il token resta in memoria per la sola operazione e non viene salvato nel backup o nel browser. Arena può riusare l’ID client Google OAuth pubblico già configurato per il collegamento cloud.
            </p>
          </div>
          {!configured && (
            <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900" role="status">
              Backup Drive non configurato. Inserisci un ID client Google OAuth nella configurazione cloud di Arena oppure configurane uno nella release. Arena continua a funzionare normalmente senza Google Drive.
            </p>
          )}
          {configured && sourceCount === 0 && (
            <p className="mt-3 text-sm text-slate-500">Aggiungi almeno una fonte personale prima di creare il backup.</p>
          )}
          {errorMessage && (
            <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-800" role="alert">{errorMessage}</p>
          )}
          {lastBackup && state === 'success' && (
            <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900" role="status">
              <div className="flex items-center gap-2 font-bold"><CheckCircle2 className="h-4 w-4" aria-hidden="true" />Backup completato</div>
              <p className="mt-1 text-xs leading-5">Ricevuta locale: {lastBackup.exportedAt} · hash {shortHash(lastBackup.contentHash)}{lastBackup.remoteObjectId ? ` · oggetto Drive ${lastBackup.remoteObjectId}` : ''}</p>
            </div>
          )}
        </div>

        <button
          type="button"
          disabled={!canBackup}
          onClick={() => void runBackup()}
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-700 px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <CloudUpload className="h-4 w-4" aria-hidden="true" />
          {state === 'working' ? 'Autorizzazione e backup…' : 'Backup su Google Drive'}
        </button>
      </div>
    </section>
  );
}
