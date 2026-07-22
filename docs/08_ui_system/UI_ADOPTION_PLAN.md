# CurManLight — Piano di Adozione del Sistema UI

## 1. Strategia

Il sistema UI viene adottato per viste, non globalmente. Ogni vista viene migrata separatamente, verificata e validata prima di passare alla successiva.

## 2. Ordine di adozione

| # | Vista | Valore | Rischio | Componenti riutilizzabili | Dipendenze | Test necessari |
|---|---|---|---|---|---|---|
| 1 | Documenti / Esportazioni | Alto | Basso | UiButton, UiPanel, UiSectionHeader, UiConfirmDialog, UiTabs | Nessuna | Test vista, test componenti |
| 2 | Dashboard | Alto | Medio | UiPanel, UiSectionHeader, UiStatusMessage, UiEmptyState | Nessuna | Test vista |
| 3 | Progetta | Medio | Medio | UiButton, UiPanel, UiMetadataList | Nessuna | Test vista |
| 4 | Curricolo | Alto | Alto | UiButton, UiPanel, UiMetadataList, UiTabs | Nessuna | Test vista, test accessibilità |
| 5 | Revisione | Medio | Medio | UiButton, UiPanel, UiStatusMessage | Nessuna | Test vista |
| 6 | Impostazioni | Basso | Basso | UiButton, UiPanel, UiConfirmDialog | Nessuna | Test vista |
| 7 | Superfici secondarie | Basso | Basso | Tutti i componenti |NESSUNA | Test spot |

## 3. Criteri di avanzamento

Una vista può essere considerata migrata solo quando:

1. Tutti i componenti UI system sono adottati
2. Nessun `font-black` rimane nel file
3. Nessun `text-[7px]`, `text-[8px]`, `text-[9px]` rimane
4. Nessun `rounded-3xl` rimane
5. Nessuna ombra colorata rimane
6. Tutti i test passano
7. La build è verde
8. La vista è funzionante su mobile
9. L'accessibilità è verificata

## 4. Componenti riutilizzabili per vista

### Documenti / Esportazioni (CML-606)
- UiButton
- UiPanel
- UiSectionHeader
- UiConfirmDialog
- UiTabs
- DocumentExportHistory (già migrato)

### Dashboard
- UiPanel
- UiSectionHeader
- UiStatusMessage
- UiEmptyState
- UiMetadataList

### Progetta
- UiButton
- UiPanel
- UiMetadataList
- UiConfirmDialog

### Curricolo
- UiButton
- UiPanel
- UiMetadataList
- UiTabs
- UiStatusMessage

### Revisione
- UiButton
- UiPanel
- UiStatusMessage

### Impostazioni
- UiButton
- UiPanel
- UiConfirmDialog

## 5. Rischi

### 5.1 Rischio di frammentazione

Se ogni vista viene migrata indipendentemente, potrebbero emergere versioni leggermente diverse dello stesso componente.

**Mitigazione:** Usare solo i componenti da `src/ui/components/`, mai crearne di nuovi inline.

### 5.2 Rischio di regressione

La migrazione visiva potrebbe rompere funzionalità esistenti.

**Mitigazione:** Test completi dopo ogni migrazione. Nessuna modifica alla logica durante la migrazione visiva.

### 5.3 Rischio di over-engineering

Il sistema UI potrebbe diventare troppo complesso per le esigenze reali.

**Mitigazione:** Mantenere il numero di componenti basso. Non creare componenti astratti privi di casi d'uso reali.

## 6. Non previsto in CML-606

- Migrazione globale
- Refactoring architetturale
- Cambio di framework
- Aggiunta di dipendenze pesanti
- Cambio del sistema di persistenza
- Modifica del routing
