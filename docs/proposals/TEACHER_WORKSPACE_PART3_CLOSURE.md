# Teacher Workspace Part 3 — Closure Audit

> Integrazione delle azioni contestuali con la navigazione esistente.

## 1. Obiettivo di prodotto

> Il docente potrà usare l'azione proposta nella Dashboard per raggiungere direttamente il punto corretto del proprio lavoro.

## 2. Baseline

| Campo | Valore |
|---|---|
| Branch | `feature/teacher-workspace-part3` |
| Commit di partenza | `d1a700d` (Part 2 closure) |
| Test precedenti | 114/114 |

## 3. Mappa della navigazione esistente

| Azione | Origine | Gestore | Destinazione | `activeProgTab` | Stato preservato |
|---|---|---|---|---|---|
| Inizia dal Curricolo | Dashboard teacher widget | `handleTabSwitch('curricolo')` | CurriculumTab | — | SI (no dati UDA) |
| Continua UDA | Dashboard teacher widget | `handleTabSwitch('progetta-annuale')` + `setActiveProgTab('annuale')` | ProgettazioneTab (wizard) | `'annuale'` | SI (wizardStep persisted) |
| Consulta UDA | Dashboard teacher widget | `handleTabSwitch('progetta-annuale')` + `setActiveProgTab('uda')` | ProgettazioneTab (archive) | `'uda'` | SI |

## 4. Matrice azione-destinazione

| Stato | Azione | `handleTabSwitch` | `setActiveProgTab` | Vista |
|---|---|---|---|---|
| `nessuna_attivita` | Inizia dal Curricolo | `'curricolo'` | — | CurriculumTab |
| `in_corso` | Continua UDA | `'progetta-annuale'` | `'annuale'` | ProgettazioneTab → Wizard |
| `bozza` | Consulta UDA | `'progetta-annuale'` | `'uda'` | ProgettazioneTab → Archivio |
| `completo` | Consulta UDA | `'progetta-annuale'` | `'uda'` | ProgettazioneTab → Archivio |

## 5. Decisione su Consulta UDA

**Opzione A: Destinazione già esistente e semanticamente corretta.**

La vista archivio UDA (`activeProgTab = 'uda'`) esiste già in ProgettazioneTab. Mostra la lista delle UDA salvate con titolo, stato, periodo, ore. È la destinazione corretta per consultare il lavoro completo o salvato.

Nessuna nuova vista introdotta.

## 6. Decisione su Bozza salvata

**L'executive design conferma: "Consulta UDA" per bozza.**

> `savedUda.length > 0` && nessun wizard attivo → "Consulta UDA"

La matrice del prompt dice "Continua UDA" per bozza, ma non ha senso semantico: con `wizardStep = 1` non c'è wizard attivo da continuare. La vista archivio (`activeProgTab = 'uda'`) mostra le bozze salvate correttamente.

## 7. File modificati

| File | Modifica |
|---|---|
| `src/features/session/components/DashboardView.tsx` | Button handlers: aggiunto `setActiveProgTab` |
| `src/__tests__/teacher-workspace-part2.test.tsx` | Test 16-17 aggiornati con `setActiveProgTab` |
| `src/__tests__/teacher-workspace-part3.test.tsx` | 14 nuovi test di integrazione navigazione |

## 8. Test eseguiti

| Categoria | Test | Risultato |
|---|---|---|
| Part 1 (persistenza) | 14 | PASS |
| Part 2 (stato lavoro) | 28 | PASS |
| Part 3 (navigazione) | 14 | PASS |
| Navigation (CML-604D) | 8 | PASS |
| Altri | 64 | PASS |
| **Totale** | **128** | **PASS** |

Build: **783 KB** — TS: **nessun nuovo errore**

## 9. Verifica manuale

### Scenario A — Nessuna attività
- Badge: "Nessuna attività"
- Click "Inizia dal Curricolo" → CurriculumTab
- Nessun wizard avviato

### Scenario B — UDA in corso
- Badge: "In corso"
- Click "Continua UDA" → ProgettazioneTab con wizard attivo
- WizardStep preservato (es. step 3/5)
- Dati form preservati

### Scenario C — Bozza salvata
- Badge: "Bozza salvata"
- Click "Consulta UDA" → ProgettazioneTab archivio
- Lista UDA salvate visibili
- Nessuna modifica automatica

### Scenario D — UDA completa
- Badge: "Completo"
- Click "Consulta UDA" → ProgettazioneTab archivio
- UDA completa visibile nella lista

## 10. Conferma perimetro

| Area | Modifiche |
|---|---|
| Shell (`App.tsx`) | NESSUNA |
| Routing (`routes/index.tsx`) | NESSUNA |
| Navigazione (`AppSidebar`, `AppHeader`) | NESSUNA |
| Nuove rotte | NESSUNE |
| Nuove viste | NESSUNE |
| Nuove chiavi localStorage | NESSUNE |
| Dipendenze | NESSUNE |
| Stati definiti nella Part 2 | INMODIFICATI |
| Contratto wizardStep | INMODIFICATO |

## 11. Rischi residui

| Rischio | Impatto | Mitigazione |
|---|---|---|
| `setActiveProgTab` ha tipo `(value: string) => void` | Basso | AppViewsLayer wrap con `isActiveProgTab` check |
| "Consulta UDA" mostra archivio, non dettaglio singolo UDA | Basso | L'archivio è la vista esistente più coerente |

## 12. Verdetto

**TEACHER_WORKSPACE_PART_3_VERIFIED_READY_FOR_INTEGRATION**

- Ogni azione raggiunge la destinazione corretta ✅
- wizardStep e dati persistiti restano invariati ✅
- Nessuna nuova rotta introdotta ✅
- Shell e navigazione congelate ✅
- Test e build superati (128/128, 783 KB) ✅
- Etichetta "Consulta UDA" corrisponde alla destinazione reale (archivio UDA) ✅
