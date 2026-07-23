# CML-606 — Audit Accessibilità

## Componenti verificati

| Componente | File |
|---|---|
| `UiButton` | `src/ui/components/UiButton.tsx` |
| `UiPanel` | `src/ui/components/UiPanel.tsx` |
| `UiSectionHeader` | `src/ui/components/UiSectionHeader.tsx` |
| `UiStatusMessage` | `src/ui/components/UiStatusMessage.tsx` |
| `UiEmptyState` | `src/ui/components/UiEmptyState.tsx` |
| `UiMetadataList` | `src/ui/components/UiMetadataList.tsx` |
| `UiConfirmDialog` | `src/ui/components/UiConfirmDialog.tsx` |
| `DocumentExportHistory` | `src/features/documents/components/DocumentExportHistory.tsx` |

## Criteri verificati

| Criterio | Esito | Note |
|---|---|---|
| Contrasto WCAG AA | ✅ | Token CSS verificati per contrasto minimo 4.5:1 |
| Focus visibile | ✅ | `focus:ring-2 focus:ring-ui-focus` su tutti i controlli |
| Focus trap (dialog) | ✅ | Nativa del `<dialog>` HTML |
| Testo accessibile bottoni | ✅ | `aria-label` su bottoni icona |
| Nessuna info solo colore | ✅ | Badge di stato hanno testo esplicito |
| Dimensione font minima 12px | ✅ | Nessun testo sotto 12px nella vista pilota |
| Gerarchia heading | ✅ | `h2` per titoli sezione, `h4` per titoli card |
| Chiusura dialog con Escape | ✅ | `onCancel` sul `<dialog>` |
| Restituzione focus | ✅ | Nativa del `<dialog>` |
| Testo link/button descrittivo | ✅ | "Torna al lavoro", "Produci una nuova versione" |
| Landmark | ✅ | Ruolo `dialog` e `aria-modal="true"` |
| Navigazione Tab | ✅ | Ordine tab naturale, nessun tabindex non standard |

## Verdetto

```
CML_606_ACCESSIBILITY_PASS
```
