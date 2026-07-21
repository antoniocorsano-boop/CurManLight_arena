# Teacher Workspace Part 2 — Closure Audit

> Verifica conclusiva della Vista Stato Lavoro.

## 1. Obiettivo di prodotto

> Il docente potrà comprendere immediatamente lo stato del proprio lavoro, le informazioni essenziali e l'azione più appropriata da compiere.

## 2. Commit

| Campo | Valore |
|---|---|
| Branch | `main` |
| Commit di partenza | `d90a374` (Part 1 closure) |
| File modificati | `DashboardView.tsx`, `AppViewsLayer.tsx`, `useAutoSave.ts`, `useSessionAutoSave.ts` |
| Test aggiunti | `teacher-workspace-part2.test.tsx` (28 test) |

## 3. File modificati

| File | Responsabilità | Modifica |
|---|---|---|
| `src/features/session/components/DashboardView.tsx` | Widget insegnante | Riscritto con dati reali: stato, metriche, tempo, azioni |
| `src/features/session/components/AppViewsLayer.tsx` | Orchestrazione | Passa `wizardStep`, `progTitle`, `progStatus` a DashboardView |
| `src/hooks/useAutoSave.ts` | Auto-save emergenza | Scrive `curman_lastSaveTime` su beforeunload/visibilitychange |
| `src/features/workspace/hooks/useSessionAutoSave.ts` | Auto-save sessione | Scrive `curman_lastSaveTime` su beforeunload/visibilitychange |
| `src/__tests__/teacher-workspace-part2.test.tsx` | Test | 28 scenari di verifica |

## 4. Contratto degli stati

| Stato | Condizione | Badge | Priorità |
|---|---|---|---|
| `in_corso` | `wizardStep > 1 && wizardStep <= 5` | amber | 1 (massima) |
| `nessuna_attivita` | `savedUda.length === 0` (senza wizard attivo) | slate | 2 |
| `completo` | `progStatus === 'pronta per confronto'` | emerald | 3 |
| `bozza` | `savedUda.length > 0` (fallback) | blue | 4 (minima) |

**Regola:** Il wizard attivo ha priorità su tutto. Se il docente sta compilando un UDA (step > 1), lo stato è "In corso" indipendentemente da savedUda.

## 5. Fonti delle metriche

| Metrica | Fonte | Formato | Significato |
|---|---|---|---|
| UDA Salvati | `savedUda.length` (useCurriculumStore) | numero | Numero di UDA archiviati |
| Decisioni Pendenti | `Object.keys(decisions).length` (useCurriculumStore) | numero | Numero di decisioni registrate |
| Passo Wizard | `wizardStep` (useAppWorkflowState) | `N/5` | Passo corrente del wizard; "Prossimo Passo" se inattivo |

## 6. Contratto di `curman_lastSaveTime`

| Aspetto | Valore |
|---|---|
| Formato | Stringa di `Date.now()` (millisecondi epoch) |
| Posizione | Chiave autonoma `curman_lastSaveTime` + blob consolidato `curmanlight_stato_consolidato` |
| Scrittura | `useAutoSave.ts` e `useSessionAutoSave.ts` su `beforeunload` / `visibilitychange` |
| Lettura | `safeLocalStorageGetItem` in `DashboardView.tsx` |
| Validità | `Number.isFinite(n) && n > 0` |
| Reset generale | Rimosso (prefisso `curman_`) |
| Semantica | "Ultima volta che i dati sono stati persistiti" —包括 sia modifica esplicita che auto-save |
| Valore futuro | Mostra "adesso" (difesa) |
| Valore non valido | Non mostra "Ultimo salvataggio" |
| Valore assente | Non mostra "Ultimo salvataggio" |
| Aggiornamento live | No — il tempo relativo si aggiorna solo al re-render |

**Nota:** Entrambi gli hook di auto-save scrivono lo stesso formato. `useAutoSave` ha anche una chiamata rimossa a `setLastSaveTime` su Zustand (non persistita da `partialize`).

## 7. Matrice delle azioni

| Stato | Azione | Target | Stile |
|---|---|---|---|
| `nessuna_attivita` | Inizia dal Curricolo | `handleTabSwitch('curricolo')` | primario (indigo pieno) |
| `in_corso` | Continua UDA | `handleTabSwitch('progetta-annuale')` | primario (indigo pieno) |
| `bozza` | Consulta UDA | `handleTabSwitch('progetta-annuale')` | secondario (indigo light) |
| `completo` | Consulta UDA | `handleTabSwitch('progetta-annuale')` | secondario (indigo light) |

**Nota su "Consulta UDA" vs "Continua UDA":** Bozza e Completo mostrano "Consulta UDA" perché il wizard non è attivo (step === 1). La Part 3 collegherà l'azione alla navigazione wizard per lo stato "Bozza".

## 8. Regole di visibilità

| Ruolo | Widget visibile | Contenuto |
|---|---|---|
| `insegnante` | SI | Stato reale del lavoro |
| `dipartimento` | NO | Widget dedicato (hardcoded) |
| `referente` | NO | Widget dedicato (hardcoded) |
| `dirigente`/`collegio` | NO | Widget dedicato (hardcoded) |
| `amministratore` | NO | Widget dedicato (hardcoded) |

Cambio ruolo durante sessione: il widget scompare/imparisce immediatamente (nessun dato residuo).

## 9. Test eseguiti

| Categoria | Test | Risultato |
|---|---|---|
| Stati | 4 (nessuna attività, in corso, bozza, completo) | PASS |
| Timestamp | 4 (assente, valido, non valido, futuro) | PASS |
| Metriche | 4 (UDA zero, UDA multipli, decisioni zero, decisioni multiple) | PASS |
| Wizard step | 4 (valido, step 1, label con titolo, label senza titolo) | PASS |
| Azioni | 3 (Continua, Consulta, Inizia) | PASS |
| Visibilità | 3 (docente, dipartimento, cambio ruolo) | PASS |
| Reset | 1 (curman_lastSaveTime rimosso) | PASS |
| Compatibilità | 1 (savedUda con campi extra) | PASS |
| Sync blob | 1 (curman_lastSaveTime nel blob consolidato) | PASS |
| Extra | 3 (Prossimo Passo label, wizard detail hidden, no detail step 1) | PASS |
| **Totale** | **28** | **PASS** |

Suite completa: **114/114** — Build: **783 KB** — TS: **nessun nuovo errore**

## 10. Verifica manuale

### Scenario A — Primo accesso
- `savedUda = []`, `wizardStep = 1`, `decisions = {}`
- Badge: "Nessuna attività"
- Metriche: 0 UDA, 0 decisioni, "Prossimo Passo: 1/5"
- Azione: "Inizia dal Curricolo" → `curricolo`

### Scenario B — Lavoro interrotto
- `savedUda = []`, `wizardStep = 3`, `progTitle = "UDA Italiano"`
- Badge: "In corso"
- Dettaglio: "Wizard: UDA Italiano"
- Azione: "Continua UDA" → `progetta-annuale`

### Scenario C — Lavoro completo
- `savedUda = [{id: '1'}]`, `wizardStep = 1`, `progStatus = 'pronta per confronto'`
- Badge: "Completo"
- Metriche: 1 UDA, "Prossimo Passo: —"
- Azione: "Consulta UDA" → `progetta-annuale`

### Scenario D — Dati incoerenti
- `wizardStep = 3`, `savedUda = []`, `progTitle = ''`
- Badge: "In corso" (wizard ha priorità)
- Dettaglio: "Passo 3: Evidenze e Valutazione" (label di default)
- Nessun errore

## 11. Rischi residui

| Rischio | Impatto | Mitigazione |
|---|---|---|
| "Ultimo salvataggio" si aggiorna su tab switch anche senza modifica | Basso | Semantically accettabile: i dati vengono effettivamente persistiti |
| "Consulta UDA" e "Continua UDA" portano alla stessa vista | Basso | Part 3 aggiungerà navigazione differenziata |
| Tempo relativo non si aggiorna live | Basso | Il re-render avviene al cambio di tab/ruolo |

## 12. Conferma perimetro

| Area | Modifiche |
|---|---|
| Shell (`App.tsx`) | NESSUNA |
| Routing (`routes/index.tsx`) | NESSUNA |
| Navigazione (`AppSidebar`, `AppHeader`) | NESSUNA |
| Stores Zustand | NESSUNA |
| Persistenza architettura | NESSUNA |
| Dipendenze (`package.json`) | NESSUNA |
| Export/Backup | NESSUNA |
| Dati curricolari | NESSUNA |

## 13. Verdetto

**TEACHER_WORKSPACE_PART_2_VERIFIED_READY_FOR_INTEGRATION**

- Stati derivati da segnali reali ✅
- Timestamp semanticamente corretto ✅
- Azioni contestuali coerenti ✅
- Visibilità per ruolo verificata ✅
- Test e build superati (114/114, 783 KB) ✅
- Shell e routing invariati ✅
