# ARENA_REGISTRO_PLANNING_CONTEXT_V1 — Arena → Registro Docente

## Scopo

Questo contratto espone a Registro Docente un contesto di pianificazione **sola lettura**. Arena resta l’**autorità curricolare**: Registro Docente può mostrare, confrontare e usare il contesto per preparare una programmazione, ma non può promuovere, approvare o riscrivere il curricolo d’istituto.

Il contratto downstream v1 già esistente destinato a un altro prodotto resta invariato. Questo profilo è dedicato a Registro Docente e non ne altera significato o destinazione.

## Politica downstream

I quattro vincoli sono invarianti:

- `targetProduct = REGISTRO_DOCENTE`;
- `importMode = PREVIEW_ONLY`;
- `acceptanceRequired = true`;
- `automaticWriteAllowed = false`.

La ricezione del file non equivale ad adozione. Il docente deve vedere il contesto, verificarne l’applicabilità e accettarlo esplicitamente prima che Registro Docente possa associarlo a un profilo di programmazione.

## Autorità e vigenza

`authorityState` e `vigencyStatus` sono stati distinti e devono essere mostrati separatamente.

- `PROVISIONAL_COMPLETE` implica sempre `NON_VIGENTE`.
- `VIGENTE` è ammissibile soltanto con `APPROVED` e con evidenza di autorità disponibile.
- Registro Docente non può trasformare `PROVISIONAL_COMPLETE` in `APPROVED` né `NON_VIGENTE` in `VIGENTE`.

La fixture canonica della classe prima di Tecnologia 2026/27 riflette lo stato reale del master Arena 1.3: `PROVISIONAL_COMPLETE / NON_VIGENTE`.

## Applicabilità per coorte

Il contesto espone anno scolastico, ordine, disciplina, classe, regime e stato di applicabilità. Per la fixture corrente:

- secondaria di primo grado;
- Tecnologia;
- classe I;
- a.s. 2026/27;
- `Regime 2025`;
- `APPLICABLE`.

`cohortRef` è una chiave di applicabilità **derivata** da anno scolastico, ordine e annualità (`cohortRefKind = DERIVED_APPLICABILITY_KEY`). Non viene presentata come identificatore canonico preesistente di Arena. Gli identificatori canonici del contenuto restano quelli materializzati nel master, ad esempio `secondaria-di-primo-grado-tecnologia-classe-i`.

## Provenienza

Ogni handoff deve mantenere la provenienza verificabile: repository, exact source commit, documento Drive/revisione del master, sezione sorgente degli elementi e fingerprint strutturale del master. Il fingerprint `b355be71` della fixture è esplicitamente di scope `MASTER`; non è un fingerprint inventato per la singola annualità.

Il testo della fixture deriva dall’annualità Tecnologia · Classe I materializzata nella sezione `7.3.8` del master corrente.

## Fail-closed

Il consumer deve operare **fail-closed**. Deve rifiutare almeno:

- contratto o prodotto destinatario diversi;
- `importMode`, `acceptanceRequired` o `automaticWriteAllowed` non conformi;
- mismatch tra anno scolastico, disciplina, classe, coorte o regime rispetto al profilo docente;
- `PROVISIONAL_COMPLETE` dichiarato come `VIGENTE`;
- `VIGENTE` senza `APPROVED` e senza evidenza di autorità;
- provenienza o fingerprint del master mancanti;
- `curricoloItems` vuoti o privi di identificatore, sezione o testo.

Un errore non deve produrre fallback permissivi, inferenze di altre classi o riuso di identificatori di annualità diverse.

## Confine di modifica

Questo contratto è informativo e non modifica:

- il master Arena;
- lo stato di autorità;
- la vigenza;
- le decisioni di validazione professionale;
- una programmazione già approvata nel Registro Docente.

Un eventuale cambio di contesto Arena è una nuova proposta di associazione e richiede una nuova decisione del docente.
