# Knowledge Experience — Implementation Plan

Status: ACTIVE
Baseline spec: `docs/KNOWLEDGE_EXPERIENCE_SPEC_V1.md`

## Program objective

Trasformare la superficie legacy Second Brain / WikiLLM / Graphify in una Knowledge Experience curricolare task-first, evidence-first, mobile-first, senza modificare l’autorità istituzionale del sistema.

## Delivery model

Il programma è diviso in tranche indipendenti e verificabili. Nessuna tranche successiva può compensare un fallimento semantico della precedente.

### KX-0 — Freeze and guardrails

Deliverable:
- specifica v1;
- piano;
- orchestrazione agentica;
- test/guard di terminologia e authority.

Exit gate:
- documenti presenti nel repo;
- nessun conflitto con `AGENTS.md`, `WORKING_PROTOCOL` e navigation contract;
- third-party refutation: NO_BLOCKING_OBJECTION.

### KX-1 — Plain-language shell

Scope:
- rinomina user-facing:
  - Conoscenza locale e archivio;
  - Cerca e chiedi;
  - Relazioni;
  - Termini chiave;
  - Archivio storico locale;
- eliminazione dei nomi WikiLLM / Second Brain / Graphify dalla gerarchia primaria;
- correzione mojibake evidente nel glossario;
- mantenimento invariato degli identificatori interni quando utile alla compatibilità.

Acceptance:
- nessun cambio authority;
- nessun cambio routing primario;
- mobile 390×844 leggibile;
- Product CI PASS.

### KX-2 — Task-first knowledge landing

Scope:
- la vista Conoscenza apre con quattro compiti:
  1. Cerca nelle fonti;
  2. Fai una domanda;
  3. Esplora relazioni;
  4. Consulta archivio storico;
- progressive disclosure;
- archivio non più dominante.

Acceptance:
- primo compito comprensibile senza conoscere il prodotto;
- nessun nested scroll necessario per scegliere il compito;
- provenance state visibile.

### KX-3 — Semantic relations foundation

Scope:
- separare grafo tecnico da grafo semantico;
- introdurre read model minimo per nodi:
  `source, document, passage, concept, outcome, objective, discipline, schoolStage, proposal, decision`;
- relazioni tipizzate;
- nessuna inferenza promossa a decisione.

Acceptance:
- nessun nodo `.ts/.tsx`, store o bundle nella vista utente;
- ogni relazione mostra tipo e provenienza/stato;
- fallback leggibile in elenco.

### KX-4 — Intelligent views v1

Scope minimo:
- Elenco relazioni;
- Percorso evidence-first;
- Mappa guidata;
- prima visualizzazione intelligente: **Mappa delle evidenze**.

Mappa delle evidenze:
`Fonte → Passaggio → Interpretazione → Proposta`

Acceptance:
- utile anche senza grafo visuale;
- mappa non è unica modalità di accesso;
- su mobile selezione nodo apre dettaglio leggibile;
- nessuna simulazione di certezza.

### KX-5 — Intelligent views v2

Scope:
- Confronto 2012 / 2025;
- Percorso verticale;
- Rete interdisciplinare;
- Vista di impatto.

Ogni vista deve partire da una domanda utente e rendere visibile la base documentale.

### KX-6 — Diagnostics isolation

Scope:
- spostare mappa tecnica corrente in area diagnostica non primaria;
- preservare valore tecnico per audit/manutenzione;
- nessun accesso accidentale dalla user journey ordinaria.

### KX-7 — Human acceptance and release

Scope:
- mobile real-browser audit;
- desktop smoke;
- G5 human validation sulla nuova Knowledge Experience;
- G6 manual accessibility dove richiesto.

## Required checks per tranche

Ogni tranche applicativa richiede, sullo stesso SHA candidato:

1. targeted tests;
2. TypeScript;
3. production build;
4. Product CI;
5. Beta Release Contract se tocca la Beta;
6. browser audit post-deploy per cambi UI critici;
7. confutazione terza.

## Stop conditions

Fermare la promozione se:

- una vista tecnica riemerge come superficie utente dominante;
- provenance viene persa;
- un output inferenziale sembra ufficiale;
- una relazione priva di evidenza viene mostrata come fatto;
- mobile richiede nested scroll per il compito primario;
- il third-party refuter produce `BLOCKING_OBJECTION` non risolta;
- la validazione umana viene inferita da test automatici.

## Current execution order

1. KX-0 — in questa PR;
2. KX-1 — nella stessa PR solo se modifica circoscritta e facilmente reversibile;
3. KX-2+ — PR separate, una tranche alla volta;
4. KX-3 e KX-4 non devono essere fuse in un unico incremento se il read model semantico non è prima verificabile.
