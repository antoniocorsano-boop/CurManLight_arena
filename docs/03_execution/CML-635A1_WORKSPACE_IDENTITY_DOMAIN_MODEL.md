# CML-635A1 — Workspace Identity Domain Model

## Verdetto

```text
CML_635A1_WORKSPACE_IDENTITY_DOMAIN_MODEL_COMPLETE_LOCAL
CML_635A1_DOMAIN_INVARIANTS_VERIFIED
CML_635A1_CANONICAL_TYPES_REUSED
CML_635A1_NO_PARALLEL_STORE_INTRODUCED
CML_635A1_READY_FOR_PERSISTENCE_INTEGRATION
```

## 1. Identificazione e baseline

| Voce | Risultato |
|---|---|
| Branch | `feat/cml-636b-canonical-document-preview-export` |
| HEAD iniziale | `f147b6f693380ef2c982efb7077c447b5c1879c9` |
| HEAD remoto iniziale | `f147b6f693380ef2c982efb7077c447b5c1879c9` |
| Baseline | `f147b6f` — documenti CML-635A |
| `main` | Non modificato |
| Push | Non eseguito |

I residui locali preesistenti sono rimasti fuori dallo stage e dal lavoro.

## 2. Documenti seguiti

- `docs/02_design/CML-635A_WORKSPACE_IDENTITY_AND_INSTITUTIONAL_CONTEXT_SPEC.md`
- `docs/02_design/CML-635A_IMPLEMENTATION_PLAN.md`
- CML-633B canonical identity e metadata nel dominio esistente
- CML-633D institutional configuration nel dominio e nei test esistenti

## 3. Strutture analizzate e classificazione

| Elemento | Classificazione | Esito |
|---|---|---|
| `EntityId` | `REUSE` | Usato per l’identità workspace |
| `EntityReference`/references istituzionali | `REUSE` | Usati per istituto, sede e anno |
| `ActorReference` | `REUSE` / `ADAPT` | Limitato a `self-declared` per l’attore dichiarato |
| `InstitutionalArchive` | `REUSE` | Non modificato in A1; punto d’integrazione previsto in A2 |
| `Institute` | `REUSE` | Nessuna copia nell’identità |
| `InstituteSite` | `REUSE` | Reference opzionale |
| `AcademicYear` | `REUSE` | `AcademicYearReference` riusato |
| `EntityMetadata` | `REUSE` | Factory, validazione e `touchMetadata` riusati |
| `WorkspaceIdentity` | `MISSING` → implementato | Nuovo modello puro nel dominio institution |
| Permission role | `OUT_OF_SCOPE` | Nessuna permission/capability/policy |
| Remote workspace identity | `OUT_OF_SCOPE` | Nessuna dipendenza remota |

## 4. Modello implementato

Il modello è in `src/domain/institution/workspaceIdentity.ts` ed è esportato
dal barrel `src/domain/institution/index.ts`.

Campi:

- `id: EntityId`, distinto dai riferimenti istituzionali;
- `institutionRef: InstituteReference`, obbligatorio;
- `activeSiteRef?: InstituteSiteReference`, opzionale;
- `academicYearRef: AcademicYearReference`, obbligatorio e strutturalmente
  tipizzato;
- `declaredActor?: DeclaredActorReference`, opzionale e solo self-declared;
- `declaredRole?: DeclaredRole`, alias descrittivo dei ruoli istituzionali
  dichiarabili;
- `operatingMode: WorkspaceOperatingMode`, union chiusa;
- `metadata: EntityMetadata`, prodotto dal sistema canonico.

Le modalità chiuse sono:

- `public-consultation`;
- `personal-local`;
- `institutional-local`.

L’identità workspace è un oggetto di dominio autonomo: non contiene l’istituto
completo, non contiene permessi e non contiene credenziali.

## 5. Invarianti implementate

- identificatore e metadata canonici validi;
- istituto obbligatorio e reference di tipo `institute`;
- anno scolastico obbligatorio e reference di tipo `academic-year`;
- sede opzionale e reference di tipo `institute-site`;
- attore opzionale, con assertion `self-declared`;
- ruolo dichiarato opzionale e limitato al vocabolario esistente;
- operating mode chiusa e non arbitraria;
- proprietà autorizzative (`permissions`, `capabilities`, `grants`, `policy`,
  `accessLevel`) rifiutate;
- aggiornamenti puri, con ID e `createdAt` invariati;
- `updatedAt` aggiornato tramite `touchMetadata`;
- nessun riferimento a React, store, fetch, API, provider o backend.

La verifica di appartenenza della sede e dell’anno all’istituto richiede
accesso all’archive ed è correttamente rinviata a CML-635A3/resolver.

## 6. API di dominio

API introdotte:

- `createWorkspaceIdentity`;
- `validateWorkspaceIdentity`;
- `updateWorkspaceAcademicYear`;
- `updateWorkspaceSite`;
- `updateDeclaredActor`;
- `removeDeclaredActor`;
- `updateDeclaredRole`;
- `updateWorkspaceOperatingMode`;
- `serializeWorkspaceIdentity`;
- `deserializeWorkspaceIdentity`.

Le operazioni restituiscono nuovi oggetti e non interrogano la persistenza.
Gli errori di validazione hanno codici tipizzati e messaggi deterministici.

## 7. Academic year

Non è stato creato un nuovo modulo data. Il dominio riusa
`AcademicYearReference` e le entità `AcademicYear` già presenti. La validazione
della label e delle date dell’anno canonico resta nel dominio institution
esistente; A1 valida il riferimento strutturale corretto.

## 8. Declared role e operating mode

`DeclaredRole` è un alias del vocabolario `InstitutionalRole` esistente,
escludendo `non-dichiarato` e senza introdurre un tipo autorizzativo.
L’`ActorReference` resta una dichiarazione locale, non un account.

`WorkspaceOperatingMode` è una union chiusa dei tre valori approvati. Nessuna
modalità abilita autenticazione, permessi, sincronizzazione o provider remoto.

## 9. InstitutionalArchive

`InstitutionalArchive` non è stato modificato in A1 e non è stata introdotta
persistenza. L’integrazione prevista da CML-635A2 è:

```ts
interface InstitutionalArchive {
  // collezioni esistenti
  workspaceIdentity?: WorkspaceIdentity;
}
```

L’archive resta l’unica autorità locale; A1 fornisce il modello che potrà essere
incorporato senza nuovo store o seconda persistenza.

## 10. Compatibilità con documenti e IA

Non sono stati modificati `DocumentEntity`, `DocumentVersion`,
`InstitutionalSnapshot`, rendering, preview, export o print. Il collegamento
identity → snapshot è rinviato a CML-635A5.

Non sono stati modificati provider, registry o execution service CML-634B.
Il dominio non legge automaticamente il workspace e non inserisce contesto
istituzionale nelle richieste IA.

## 11. Test aggiunti

File: `src/__tests__/cml-635a1-workspace-identity.test.ts`

Copertura: 7 test focalizzati su creazione, modalità, riferimenti invalidi,
opzionalità, immutabilità, aggiornamenti, serializzazione e rifiuto di concetti
autorizzativi.

Il ciclo TDD ha osservato il RED iniziale: 7/7 test fallivano perché l’API non
esisteva. Dopo l’implementazione, il test focalizzato è verde 7/7.

## 12. Verifiche

| Verifica | Esito |
|---|---|
| `npm run typecheck` | PASS |
| `npm run typecheck:full` | PASS |
| Test focalizzato CML-635A1 | 7/7 PASS |
| `npm run test:fast` | 273/273 PASS |
| `npm run build` | PASS |
| `git diff --check` | Da ripetere prima dello stage |
| `npm run test:related -- src/domain/institution/workspaceIdentity.ts` | 69 PASS, 2 failure preesistenti per `localStorage is not defined` in `workspace-neutral-state.test.ts` |

Il test correlato non indica una regressione A1: i due test falliti appartengono
alla configurazione domain esistente e richiedono ambiente browser/localStorage.

## 13. File modificati

- `src/domain/institution/workspaceIdentity.ts`
- `src/domain/institution/index.ts`
- `src/__tests__/cml-635a1-workspace-identity.test.ts`
- `docs/03_execution/CML-635A1_WORKSPACE_IDENTITY_DOMAIN_MODEL.md`

Nessun file locale escluso è stato modificato, aggiunto allo stage o committato.

## 14. Limiti e lavoro rinviato

Rinviati a fasi successive:

- inserimento effettivo in `InstitutionalArchive` e persistenza: A2;
- migrazione e bridge dei refs attivi: A2;
- resolver di appartenenza e contesto corrente: A3;
- UI: A4;
- snapshot documentale: A5;
- compatibilità e chiusura complessiva: A6;
- ruoli autorizzativi: 635B;
- repository remoto/sync: 635C;
- governance IA: 635D.

## 15. Stato finale

```text
WorkspaceIdentity domain model implemented
Canonical IDs and references reused
InstitutionalArchive remains the single planned authority
No parallel store introduced
Academic year reference modeled and structurally validated
Declared actor remains optional
Declared role remains descriptive only
Operating mode is closed and typed
Domain invariants covered by tests
No UI changes
No persistence changes
No document snapshot integration
No AI provider integration
```
