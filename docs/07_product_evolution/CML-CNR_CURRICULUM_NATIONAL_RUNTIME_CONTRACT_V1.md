# CurManLight Arena — CNR Curriculum National Runtime Contract v1

Status: **FROZEN FOUNDATION**  
Scope: CurManLight Arena — Curricolo nazionale / runtime / fonti / transizione 2012→2025  
Baseline di analisi: `ebda416e75e3e9acdce4afc916228023567c60f1`

## 1. Decisione

CurManLight Arena deve usare un solo modello logico per il curricolo nazionale. La `curriculumKB` legacy resta una sorgente di compatibilità locale e non può essere trattata come rappresentazione canonica delle Indicazioni nazionali.

Il modello canonico è la catena:

```text
National source
  → canonical national structure
  → cohort / transition resolution
  → applicable requirement profile
  → source locator / element binding
  → human source verification
  → canonical source text
  → curriculum read model
  → user interface
```

La UI non può saltare nessuno dei passaggi che determinano applicabilità, provenienza e stato di verifica.

## 2. Problema consolidato

Il repository contiene già due sistemi differenti:

1. un runtime legacy basato su `curriculumKB` / `localCurriculum`;
2. un dominio nazionale evidence-first che contiene fonte D.M. 221/2025, struttura canonica, transizione per coorte, requirement profile, binding, verifica umana e audit della copertura.

La presenza simultanea dei due sistemi è ammessa soltanto durante la migrazione. Non è ammesso che la UI li presenti come semanticamente equivalenti.

Finding canonico:

`TRANSITION_CONTRACT_EXISTS_BUT_RUNTIME_DOES_NOT_CONSUME_IT`

Finding associato:

`LEGACY_RUNTIME_READ_MODEL_IS_NOT_CANONICAL_NATIONAL_CURRICULUM`

## 3. Regime 2026/2027

Per l'anno scolastico 2026/2027 Arena assume esclusivamente le regole già codificate in `transition2026.ts`:

- infanzia → `DM221_2025`;
- primaria classe 1 → `DM221_2025`;
- primaria classi 2–5 → `DM254_2012_CONTINUES`;
- secondaria di primo grado classe 1 → `DM221_2025`;
- secondaria di primo grado classi 2–3 → `DM254_2012_CONTINUES`.

Per le classi intermedie la rimodulazione collegiale si applica esclusivamente dove la scansione temporale differisce, secondo il contratto già presente.

Arena non deve inferire automaticamente le progressioni degli anni scolastici successivi finché non esiste una regola esplicita e verificata.

## 4. Invarianti

### CNR-I1 — Applicability before content

Nessun contenuto può essere presentato come Indicazioni 2025 per una classe concreta prima di avere risolto:

`academicYear + schoolOrder + classYear → CurriculumRegime`.

### CNR-I2 — Source before authority

La semplice presenza di un testo nella `curriculumKB`, nel localStorage, in un CSV o in un output generato non gli attribuisce autorità normativa.

### CNR-I3 — Binding before canonical source text

Un elemento può essere trattato come testo sorgente canonico soltanto dopo una catena verificabile:

`canonical requirement → source locator → source verification → human verification receipt`.

### CNR-I4 — Human verification is not institutional adoption

La verifica umana della fedeltà alla fonte non costituisce adozione del curricolo d'istituto e non attribuisce autorità deliberativa.

### CNR-I5 — Structure kind is semantic

Le entità devono preservare il proprio tipo canonico:

- campo di esperienza;
- disciplina del primo ciclo;
- framework trasversale;
- offerta condizionata;
- insegnamento regolato da autorità esterna.

La UI non può appiattire queste categorie in una lista unica di “materie”.

### CNR-I6 — Infanzia is not a discipline projection

I cinque campi di esperienza dell'infanzia sono entità canoniche. Le vecchie chiavi disciplinari possono essere usate come dati di migrazione, mai come modello canonico.

### CNR-I7 — Conditional and external subjects remain conditional/external

Educazione civica resta framework trasversale; LEL resta offerta condizionata; IRC resta soggetto a fonte/autorità esterna. Non possono essere promossi a disciplina universale tramite alias della UI.

### CNR-I8 — Legacy content must be labelled

Durante la migrazione ogni contenuto non verificato deve essere distinguibile almeno come uno tra:

- `LEGACY_UNVERIFIED`;
- `LOCAL_CONTENT`;
- `PROPOSAL`;
- `SOURCE_LOCATED`;
- `SOURCE_VERIFIED`.

Nessuna di queste categorie equivale automaticamente a `INSTITUTIONALLY_ADOPTED`.

### CNR-I9 — Coverage is measured after transition resolution

Gli audit di copertura nazionale devono ricevere soltanto requisiti già risolti come applicabili alla coorte corrente.

### CNR-I10 — One canonical read model

La UI principale del Curricolo deve convergere verso un unico read model derivato dal dominio nazionale. `curriculumKB` non deve essere interrogata direttamente dalle nuove superfici canoniche.

## 5. Struttura logica target

```text
CURRICULUM NATIONAL DOMAIN
│
├── Source registry
│   └── D.M. 221/2025
│
├── Canonical structure
│   ├── Infanzia fields
│   ├── First-cycle disciplines
│   ├── Cross-disciplinary frameworks
│   ├── Conditional offerings
│   └── External-authority subjects
│
├── Transition resolver
│   └── academic year + order + class → regime
│
├── Requirement resolver
│   └── canonical structure filtered by applicable regime
│
├── Source binding
│   ├── LOCATOR_REQUIRED
│   ├── SOURCE_LOCATED
│   └── SOURCE_VERIFIED
│
├── Human source verification
│   └── immutable verification receipt
│
├── Coverage audit
│
└── Canonical read model
    ├── applicability
    ├── source status
    ├── content status
    ├── semantic kind
    ├── provenance
    └── authority boundary
          ↓
        UI
```

## 6. Stato delle discipline alla baseline

Tecnologia è la prima disciplina con inventario strutturale localizzato nella fonte ufficiale. La tranche esistente mantiene 61 elementi `SOURCE_LOCATED`, non ancora automaticamente `SOURCE_VERIFIED`.

Le altre discipline del primo ciclo restano nella `DM221_DISCIPLINE_SOURCE_WORK_QUEUE` come `LOCATOR_REQUIRED` e `verifiedByHuman=false` finché pagina e confini non sono verificati sulla fonte ufficiale.

La coda deve essere trattata come lavoro obbligatorio e non come lacuna da colmare con testo generato.

## 7. Programma CNR

### CNR-1 — Runtime Applicability

Collegare il contesto reale `academicYear + schoolOrder + classYear` al resolver di transizione. Nessun cambio di testo in questa tranche.

Gate: ogni superficie curricolare che rappresenta una classe concreta possiede un regime risolto oppure fallisce in modo esplicito.

### CNR-2 — Canonical Read Model

Introdurre un read model unico che separi applicabilità, provenienza, stato della fonte, stato del testo e autorità.

Gate: le nuove superfici non leggono direttamente `curriculumKB`.

### CNR-3 — Source Coverage All Disciplines

Localizzare nella fonte ufficiale le undici discipline residue, preservando `LOCATOR_REQUIRED` finché i confini non sono verificati.

Gate: nessun locator inventato e coverage audit coerente.

### CNR-4 — Human Source Verification

Generalizzare il modello già applicato a Tecnologia a tutte le discipline.

Gate: nessun testo passa a `SOURCE_VERIFIED` senza receipt umana valida.

### CNR-5 — Structure Migration

Migrare la rappresentazione dell'infanzia e rimuovere l'appiattimento di framework, offerte condizionate e authority esterne.

Gate: zero proiezioni disciplinari canoniche sull'infanzia e zero categorie speciali presentate come discipline universali.

### CNR-6 — Sources Experience

Collegare la superficie Fonti al registro effettivo delle fonti e ai locatori usati dagli elementi curricolari.

Gate: navigabilità elemento → fonte → locator → stato verifica.

### CNR-7 — Curriculum UX

Rendere leggibili regime, provenienza e stato senza introdurre rumore cognitivo.

Gate: l'utente distingue immediatamente testo nazionale verificato, testo locale, proposta e contenuto legacy.

## 8. Non-obiettivi di questa fondazione

Questa specifica non autorizza:

- la promozione automatica della `curriculumKB`;
- l'importazione automatica di testo normativo come canonico;
- l'adozione istituzionale automatica;
- la generazione AI di locator o testi sorgente;
- il redesign generale del Curricolo;
- la modifica delle regole di autorità già consolidate.

## 9. Regola di implementazione

Ogni tranche CNR deve dichiarare:

1. input autorevoli utilizzati;
2. stato di transizione richiesto;
3. stato minimo del source binding;
4. eventuale decisione umana richiesta;
5. cosa può essere letto dalla UI;
6. cosa resta esplicitamente non autorizzato.

## 10. Gate di consolidamento

Il contratto CNR v1 è rispettato soltanto se rimangono vere simultaneamente queste proprietà:

```text
COHORT_BEFORE_CONTENT = true
SOURCE_BEFORE_CANONICAL_TEXT = true
HUMAN_VERIFICATION_IS_NOT_ADOPTION = true
SEMANTIC_KIND_PRESERVED = true
LEGACY_IS_NOT_CANONICAL = true
COVERAGE_AFTER_TRANSITION = true
ONE_CANONICAL_READ_MODEL_TARGET = true
```

Qualsiasi implementazione che violi una di queste proprietà deve essere fermata prima del merge.
