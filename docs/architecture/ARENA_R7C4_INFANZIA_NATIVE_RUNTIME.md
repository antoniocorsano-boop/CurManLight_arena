# Arena R7C4 — Infanzia nativa nel runtime

## Obiettivo

R7C4 rimuove dal percorso primario dell'app la falsa equivalenza tra **discipline** e **campi di esperienza** nella scuola dell'infanzia.

Il D.M. 221/2025 è già rappresentato nel registro nazionale con cinque identità native:

1. `IL_SE_E_L_ALTRO` — Il sé e l'altro;
2. `IL_CORPO_E_IL_MOVIMENTO` — Il corpo e il movimento;
3. `IMMAGINI_SUONI_COLORI` — Immagini, suoni e colori;
4. `I_DISCORSI_E_LE_PAROLE` — I discorsi e le parole;
5. `LA_CONOSCENZA_DEL_MONDO` — La conoscenza del mondo.

R7C4 usa queste identità direttamente nel runtime.

## Problema legacy corretto

Il vecchio `CurriculumTab` rendeva i cinque nomi corretti ma leggeva il contenuto da chiavi disciplinari, per esempio:

- `italiano` → I discorsi e le parole;
- `matematica` → La conoscenza del mondo;
- `arteImmagine` → Immagini, suoni e colori;
- `educazioneFisica` → Il corpo e il movimento;
- `educazioneCivica` → Il sé e l'altro.

Altre discipline legacy venivano inoltre usate come sotto-proiezioni degli stessi campi. Questa organizzazione può essere utile per individuare materiale storico, ma non costituisce una struttura canonica dell'infanzia.

## Nuovo runtime

`buildInfanziaNativeRuntimeView()` produce sempre cinque campi con:

- `fieldId` nativo;
- `segmentId` D.M. 221/2025;
- etichetta canonica;
- ordine `infanzia`;
- stato del contenuto d'istituto;
- elenco separato dei candidati legacy eventualmente popolati.

I candidati legacy conservano soltanto metadati e conteggi. R7C4 non copia, unisce o promuove i loro testi nei campi canonici.

Ogni candidato è:

`BLOCKED_PENDING_HUMAN_SEMANTIC_MIGRATION`

con:

`authorityEffect = NONE`.

## Routing primario

Nel router produttivo, `/curriculum` usa `CurriculumPage` e `/planning` usa `PlanningPage`.

Da R7C4:

- se `order !== infanzia`, il comportamento esistente resta invariato;
- se `order === infanzia`, `CurriculumPage` usa `InfanziaNativeCurriculumPanel` e non entra nel `CurriculumTab` legacy;
- se `order === infanzia`, `PlanningPage` usa `InfanziaNativePlanningBoundary` e non entra nel progettista disciplinare legacy.

Il vecchio codice non viene cancellato in questa tranche perché resta una sorgente di migrazione. Non è però più il percorso primario per l'infanzia.

## Progettazione fail-closed

R7C4 non inventa un curricolo d'istituto dell'infanzia. Poiché non sono ancora materializzati nodi d'istituto nativi per i cinque campi, la generazione di UDA/programmazioni tramite il vecchio percorso disciplinare viene bloccata.

La progettazione dell'infanzia potrà essere riaperta solo quando esisteranno:

1. segmenti d'istituto nativi per i cinque campi;
2. nodi curricolari d'istituto collegati a quei segmenti;
3. provenienza e versione;
4. migrazione semantica umana dei contenuti legacy eventualmente riusabili;
5. validazione umana rappresentativa;
6. handoff alla progettazione basato su `curriculumVersionRef + segmentRef + nodeRef`.

## Relazione con R7B3 / PR #174

R7C4 non duplica l'inventario elemento-per-elemento dell'infanzia preparato in R7B3. Usa la struttura dei cinque campi già presente nel registro nazionale condiviso.

La PR #174 resta la tranche di acquisizione dettagliata della fonte: finalità, indicazioni metodologiche, competenze attese, obiettivi specifici e profilo di transizione. La sua eventuale integrazione dovrà rispettare lo stesso confine di autorità e non è necessaria per correggere l'identità runtime.

## Confini intenzionali

R7C4 non:

- modifica `CURRICULUM_PERSISTENCE_MODE = legacy-only`;
- cancella `CurriculumMap`;
- promuove contenuti legacy;
- adotta un curricolo d'istituto;
- estende il vecchio P3 all'infanzia;
- crea mapping automatici tra discipline e campi;
- modifica P7 o la materializzazione istituzionale;
- abilita UDA dell'infanzia prima della disponibilità di nodi nativi.

## Exit gate

R7C4 è tecnicamente conclusa quando sullo stesso exact-head passano:

- regressioni rapide, incluso il gate R7C4;
- governance umana;
- KX;
- TypeScript;
- build produttiva;
- Beta Release;
- Beta Identity Authority.

Il passo successivo previsto dall'audit resta **R7C5 — acquisizione IN2025 completa**, mantenendo le strutture native delle singole discipline e dell'infanzia.
