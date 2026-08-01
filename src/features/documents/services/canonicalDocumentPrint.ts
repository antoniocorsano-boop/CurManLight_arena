export interface PrintResult {
  success: boolean;
  error?: 'popup-blocked' | 'render-failed';
  message: string;
}

export interface PrintOptions {
  title?: string;
  onClose?: () => void;
  targetWindow?: Window | null;
}

export function printCanonicalDocument(
  html: string,
  options?: PrintOptions,
): PrintResult {
  const win = options?.targetWindow ?? (typeof window !== 'undefined' ? window.open('', '_blank') : null);

  if (!win) {
    return {
      success: false,
      error: 'popup-blocked',
      message: "Blocco popup attivo! Consenti l'apertura dei popup per salvare in PDF.",
    };
  }

  try {
    win.document.write(`<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${options?.title ?? 'Documento CurManLight'}</title>
<style>
@page { margin: 2cm; }
body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
@media screen { body { padding: 20px; } }
</style>
</head>
<body>
${html}
</body>
</html>`);
    win.document.close();

    let printTriggered = true;
    try {
      win.print();
    } catch {
      printTriggered = false;
    }

    if (!printTriggered) {
      return {
        success: false,
        error: 'popup-blocked',
        message: "Non è possibile avviare la stampa. Consenti l'apertura dei popup per salvare in PDF.",
      };
    }

    setTimeout(() => {
      win.close();
      options?.onClose?.();
    }, 1000);

    return {
      success: true,
      message: 'Stampa avviata. Salva il documento come PDF dalla finestra di stampa.',
    };
  } catch {
    return {
      success: false,
      error: 'render-failed',
      message: 'Impossibile generare il documento di stampa.',
    };
  }
}
