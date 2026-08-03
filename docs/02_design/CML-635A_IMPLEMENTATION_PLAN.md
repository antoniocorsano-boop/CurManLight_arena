# CML-635A — Implementation Plan

## Vincoli di esecuzione

- Branch di lavoro: `feat/cml-636b-canonical-document-preview-export`.
- Non modificare `main`, non fare push, merge, rebase, reset o amend.
- Non modificare shell, routing, layering o store architecture.
- Non creare un nuovo store: estendere il dominio institution e il
  `useCurriculumStore` esistente.
- Nessuna autenticazione, backend, sincronizzazione remota o permission role.
- Non toccare file locali esclusi (`CLAUDE.md`, `kilo.jsonc`, `.claude/`,
  `session/`, report CML-631F e documenti CML-634B-C1 esistenti).

## Sequenza incrementale

### CML-635A1 — Domain Model and Authority Bridge

**Obiettivo:** introdurre `WorkspaceIdentity` e un resolver unico senza
duplicare l’archivio.

Probabili file:

- `src/domain/institution/types.ts`
- `src/domain/institution/constructors.ts`
- `src/domain/institution/validators.ts`
- `src/domain/institution/repository.ts`
- `src/domain/institution/selectors.ts`
- `src/domain/institution/index.ts`
- nuovi test in `src/__tests__/institution-domain.test.ts` o file dedicato

Attività:

1. Aggiungere `WorkspaceOperatingMode` e `WorkspaceIdentity` con `EntityId`,
   `EntityMetadata` e refs esistenti.
2. Estendere `InstitutionalArchive` con `workspaceIdentity?` opzionale.
3. Creare costruttore neutro e costruttore da archive legacy.
4. Aggiungere `validateWorkspaceIdentity` e invarianti di owner/stato.
5. Aggiungere `resolveWorkspaceContext(archive)` come unica facade di lettura.
6. Aggiornare una singola operazione repository per sincronizzare identity,
   `activeInstituteRef` e `currentContextRef` durante la compatibilità.

Dipendenze: nessuna nuova libreria.

Rischi: doppia autorità e collisione con i refs attivi esistenti.

Test di uscita:

- archive neutro e tre modalità;
- riferimenti cross-owner rifiutati;
- fallback legacy deterministico;
- nessuna mutazione dell’input;
- role dichiarato senza capability.

Criterio di uscita: dominio compilabile e resolver unico con test verdi.

### CML-635A2 — Persistence, Serialization and Migration

**Obiettivo:** reidratare e trasferire l’identity dentro le persistenze già
esistenti.

Probabili file:

- `src/stores/useCurriculumStore.ts`
- `src/features/workspace/hooks/useSessionAutoSave.ts`
- `src/features/workspace/hooks/useWorkspaceSyncHandlers.ts` solo per il
  payload locale già esistente, non per introdurre sync
- `src/domain/institution/serialization.ts`
- `src/domain/institution/legacyAdapters.ts`
- `src/__tests__/institution-integration.test.tsx`

Attività:

1. Conservare `workspaceIdentity` nel record Zustand persistito.
2. Aggiornare validazione e restore dell’emergency backup.
3. Estendere JSON backup/import e fingerprint.
4. Implementare `READ_COMPATIBILITY` per archive senza identity.
5. Non promuovere automaticamente legacy/malformed a istituto attivo.
6. Gestire schema futuro senza mutare lo stato.

Rischi: perdita di identity nei backup o incompatibilità con `v1.4.0`.

Test di uscita: rehydration, emergency backup, round-trip, rollback e
compatibilità schema precedente/futuro.

### CML-635A3 — Current Context Resolver and Document Snapshot Contract

**Obiettivo:** separare chiaramente contesto corrente e storico documentale.

Probabili file:

- `src/domain/documents/types.ts`
- `src/domain/documents/constructors.ts`
- `src/domain/documents/repository.ts`
- `src/domain/documents/validators.ts`
- `src/domain/documents/selectors.ts`
- `src/features/documents/mappers/udaToA07Payload.ts`
- `src/domain/institution/selectors.ts`
- test documentali CML-638B/CML-636B

Attività:

1. Aggiungere refs opzionali e actor al `InstitutionalSnapshot`.
2. Creare un builder da `WorkspaceIdentity`/resolved read model.
3. Popolare `DocumentEntity.instituteRef` e `academicYearRef` per nuove
   creazioni quando il contesto è configurato.
4. Rendere ogni nuova `DocumentVersion` esplicita sul proprio snapshot.
5. Conservare snapshot piatti legacy senza rottura.
6. Verificare duplicazione, importazione, recupero autore e nuova versione.

Rischi: cambiare output export o riscrivere snapshot storici.

Test di uscita: documenti storici invariati dopo cambio contesto; nuova
versione con snapshot nuovo; export neutro se incompleto.

### CML-635A4 — UI Workspace Context Panel

**Obiettivo:** permettere al docente di configurare e attivare il contesto in
modo comprensibile.

Probabili file:

- `src/features/session/components/InstitutionConfigPanel.tsx`
- eventuali componenti già presenti in `src/features/workspace/components/`
- `src/pages/SettingsPage.tsx` solo se il punto d’ingresso già esistente lo
  richiede
- `src/__tests__/institution-integration.test.tsx`

Attività:

1. Presentare stato `public-consultation`, `personal-local` o
   `institutional-local`.
2. Riutilizzare i campi istituto/sede/anno/attore già presenti.
3. Separare “salva bozza” da “attiva per nuove operazioni”.
4. Mostrare conferma non retroattiva.
5. Rendere errori, focus, `aria-invalid`, `aria-describedby` e dialoghi
   coerenti con le correzioni CML-631F/CML-639.
6. Non aggiungere dashboard o amministrazione utenti.

Rischi: confondere “confermato localmente” con autenticato.

Test di uscita: happy path, contesto incompleto, cambio sede/anno, rimozione
attore, keyboard/focus e neutral mode.

### CML-635A5 — AI Boundary Regression and Local Context Safety

**Obiettivo:** dimostrare che l’introduzione dell’identity non amplia i dati
inviati a CML-634B.

Probabili file:

- `src/domain/ai/requestPreview.ts` solo se serve una regression assertion
- `src/domain/ai/executionService.ts` solo per mantenere il boundary, non per
  aggiungere context injection
- test CML-634A/B esistenti

Attività:

1. Aggiungere test che un request senza `context` resti senza context.
2. Verificare che il workspace store non sia importato dal dominio AI.
3. Verificare preview, consenso e provider remoto disabilitato.

Criterio di uscita: nessuna regressione CML-634B e nessun contesto automatico.

### CML-635A6 — Compatibility, Validation and Closure

**Obiettivo:** chiudere la fase con evidenza riproducibile.

Attività:

1. Test correlati dopo ogni file modificato.
2. `npm run typecheck`.
3. Suite institution/domain e persistence mirate.
4. `npm run test:fast`.
5. UI area con la suite già appropriata; browser happy path separato.
6. `git diff --check`.
7. Rapporto di verifica e verdetto CML-635A.

## Ordine delle verifiche

Durante lo sviluppo:

```powershell
npm run typecheck
npm run test:related -- <file-modificati>
```

Prima di ogni checkpoint:

```powershell
git diff --check
```

Prima della chiusura:

```powershell
npm run typecheck
npm run test:fast
```

Per la parte documenti/UI usare le suite CML-639 già separate; la suite
completa e Storybook restano periodiche.

## Criteri globali di accettazione

- una sola autorità locale per il contesto operativo;
- nessun nuovo store o layer;
- archive legacy leggibili senza identità fabbricata;
- contesto attivo modificabile senza riscrivere la storia;
- snapshot presenti in ogni nuova versione;
- documenti storici indipendenti dal contesto corrente;
- import/export locale compatibile;
- UI accessibile e comprensibile;
- CML-634B invariata: solo testo esplicitamente selezionato e consenso;
- TypeScript, test mirati, fast suite e diff check verdi;
- nessun file locale escluso modificato o committato.

## Sequenza Git prevista

La specifica e questo piano costituiscono il solo deliverable documentale della
fase di progettazione. L’implementazione futura dovrà essere svolta in una
fase approvata separata, con commit piccoli per A1–A6 e senza modificare
`main`.
