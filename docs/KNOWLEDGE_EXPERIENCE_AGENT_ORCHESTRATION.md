# Knowledge Experience — Agent Orchestration and Third-Party Refutation

Status: ACTIVE_FOR_KX_PROGRAM
Parent protocol: `docs/AGENT_ORCHESTRATION.md`

## 1. Purpose

Questo documento non sostituisce l’orchestrazione del repository. Definisce il work package specialistico KX e assegna responsabilità separate per evitare che chi progetta, chi implementa e chi valuta condividano lo stesso bias.

## 2. Agent roles

### KX_PRODUCT_UX_AGENT — specification owner

Missione:
- tradurre bisogni utente in task model;
- applicare plain language, progressive disclosure e mobile-first;
- mantenere la coerenza con GOV.UK-inspired design rules;
- non modificare codice produttivo salvo microcopy/test concordati.

Authority:
- può proporre;
- può dichiarare `SPEC_READY`;
- non può promuovere la release.

Required output:
- decision log;
- acceptance criteria;
- mapping legacy → user language.

### KX_IMPLEMENTATION_AGENT — implementation owner

Missione:
- implementare una sola tranche alla volta;
- preservare routing, authority, provenance e compatibility;
- produrre test mirati e build green.

Authority:
- può produrre `IMPLEMENTATION_READY`;
- non può auto-validare UX o promuovere G5/G6.

### KX_EVIDENCE_AUTHORITY_AGENT — evidence/provenance verifier

Missione:
- verificare che fonti, relazioni, inferenze e stati siano distinguibili;
- impedire che output generati diventino apparentemente ufficiali;
- verificare il confine proposta/decisione.

Authority:
- verifier non-promoter;
- può emettere `AUTHORITY_PASS` o `AUTHORITY_BLOCK`.

### KX_HUMAN_FACTORS_AGENT — usability/accessibility verifier

Missione:
- verificare task completion, plain language, focus order, mobile 390×844 e progressive disclosure;
- controllare che l’interfaccia non esponga gergo tecnico come task principale.

Authority:
- verifier non-promoter;
- può emettere `HUMAN_FACTORS_PASS` o `HUMAN_FACTORS_BLOCK`.

### KX_THIRD_PARTY_REFUTER — independent adversarial reviewer

Missione:
- tentare di confutare la soluzione candidata;
- non migliorare il design durante la prima lettura;
- cercare prove che la soluzione violi bisogni utente, authority, provenance, accessibilità o semplicità;
- partire dal prodotto e dalla specifica, non dall’intenzione degli implementatori.

Independence rules:
- non deve essere implementation owner;
- non usa il report dell’implementation agent come fonte primaria;
- deve leggere diff, spec e prove real-browser direttamente;
- ogni obiezione deve citare un’evidenza verificabile.

Output enum:
- `NO_BLOCKING_OBJECTION`
- `NON_BLOCKING_OBJECTION`
- `BLOCKING_OBJECTION`

Un `BLOCKING_OBJECTION` impedisce la promozione finché non viene risolta o formalmente respinta da decisione umana esplicita con motivazione.

## 3. Orchestration DAG

```text
KX_PRODUCT_UX_AGENT
        │ SPEC_READY
        ▼
KX_IMPLEMENTATION_AGENT
        │ IMPLEMENTATION_READY
        ├───────────────┐
        ▼               ▼
KX_EVIDENCE_AUTHORITY  KX_HUMAN_FACTORS
        │               │
        └──────┬────────┘
               ▼
       KX_THIRD_PARTY_REFUTER
               │
     NO_BLOCKING_OBJECTION
               ▼
        RELEASE CANDIDATE
               │
       automated same-SHA gates
               ▼
        published Beta audit
               ▼
        HUMAN G5 / G6
```

Nessun verifier e nessun refuter promuove autonomamente il prodotto.

## 4. Refutation checklist

Il refuter deve tentare almeno queste confutazioni:

### User need refutation
- La pagina parte davvero da un compito utente?
- Un docente comprende il primo passo senza conoscere WikiLLM, Graphify o Second Brain?
- La funzione principale è raggiungibile senza esplorazione tecnica?

### Plain-language refutation
- Esistono parole interne o nomi di implementazione esposti inutilmente?
- Le etichette descrivono il risultato per l’utente o la tecnologia usata?

### Evidence refutation
- Una relazione inferita può essere scambiata per fatto?
- L’origine dell’informazione è visibile?
- Il passaggio fonte → interpretazione → proposta resta distinguibile?

### Authority refutation
- Esiste un percorso implicito che trasforma analisi in decisione?
- Un badge, CTA o testo può far credere che il sistema certifichi una scelta?

### Mobile refutation
- A 390×844 il compito primario è visibile e toccabile?
- Esistono nested scroll, overflow, tab compressi o pannelli troppo lunghi?

### Graph refutation
- La mappa risponde a una domanda reale o mostra soltanto la struttura del software?
- È possibile completare il compito anche senza interpretare un grafo?
- I nodi tecnici sono confinati alla diagnostica?

## 5. Evidence pack required before merge

Ogni PR KX deve contenere o linkare:

- spec section impacted;
- diff scope;
- screenshots / browser audit quando UI;
- targeted test result;
- TypeScript/build result;
- authority verdict;
- human-factors verdict;
- third-party refutation verdict;
- unresolved objections, anche se non bloccanti.

## 6. Promotion rule

Una tranche è tecnicamente promuovibile solo se:

`SPEC_READY`
+ `IMPLEMENTATION_READY`
+ `AUTHORITY_PASS`
+ `HUMAN_FACTORS_PASS`
+ `NO_BLOCKING_OBJECTION`
+ same-SHA automated gates PASS.

La promozione tecnica non equivale a G5 o G6 umano.

## 7. First work package — KX-1

Owner: `KX_IMPLEMENTATION_AGENT`

Change budget:
- user-facing labels;
- section heading and explanatory copy;
- no domain rewrite;
- no new graph engine;
- no route changes;
- no new authority.

Verifier focus:
- technical terms no longer dominate the ordinary surface;
- no regression of current assistant → knowledge → graph deep links;
- no loss of non-verified/provenance warnings.

Refuter primary question:
> “Abbiamo davvero semplificato il compito dell’utente, oppure abbiamo soltanto rinominato un’interfaccia ancora organizzata attorno all’implementazione?”
