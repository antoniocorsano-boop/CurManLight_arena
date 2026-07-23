import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { UiButton } from './UiButton';

type UiConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
};

export function UiConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Conferma',
  cancelLabel = 'Annulla',
  variant = 'danger',
  onConfirm,
  onCancel,
}: UiConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      try { dialog.showModal(); } catch { /* jsdom fallback */ }
      confirmButtonRef.current?.focus();
    } else {
      try { dialog.close(); } catch { /* jsdom fallback */ }
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="rounded-ui-dialog shadow-ui-dialog border border-ui-border bg-ui-surface p-0 max-w-[480px] w-full backdrop:bg-black/40"
      onCancel={onCancel}
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h2 className="text-[16px] font-semibold text-ui-text">{title}</h2>
          <button
            onClick={onCancel}
            className="p-1 rounded-ui-control text-ui-text-muted hover:text-ui-text hover:bg-ui-surface-subtle transition-colors"
            aria-label="Chiudi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[14px] text-ui-text-secondary leading-relaxed">{message}</p>
      </div>
      <div className="flex justify-end gap-2 px-6 pb-6">
        <UiButton variant="secondary" size="small" onClick={onCancel}>
          {cancelLabel}
        </UiButton>
        <UiButton ref={confirmButtonRef} variant={variant} size="small" onClick={onConfirm}>
          {confirmLabel}
        </UiButton>
      </div>
    </dialog>
  );
}
