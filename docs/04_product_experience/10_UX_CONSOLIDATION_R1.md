# 10 — UX_CONSOLIDATION_R1 — LAYERING_AND_VIEWPORT_STABILITY

**Data:** 2026-09-07  
**Visione:** `ARENA-PRODUCT-VISION@1.0.0`  
**CCO:** `1.4.1`  
**Lifecycle:** `CURRICULUM_LIFECYCLE@1.2.0`  
**Stato:** implementazione di consolidamento; nessuna nuova superficie primaria

## 1. Scopo

Questo incremento consolida l'esperienza del Riesame senza modificare dominio, autorità, persistenza, baseline curricolare o lifecycle.

La regola applicata è:

**strato utente semplice e intuitivo → strato comunicativo su richiesta → strato tecnico di verifica su richiesta**.

Il pilot multi-attore già concluso resta valido. `human_end_to_end_pilot_complete = true` non viene riaperto; `target_ui_fully_implemented = false` resta invariato.

## 2. Livello 1 — orientamento e azione

Durante un caso mirato l'utente vede stabilmente:

- `Riesame mirato`;
- la fase corrente (`Esamina`, `Condividi`, `Confronta`, `Registra l’esito`);
- `Passo n di 4`;
- numero di schede del caso;
- ruolo verificato espresso in linguaggio professionale;
- azione pertinente al compito corrente;
- uscita esplicita dal caso.

Nel livello 1 non devono competere identificativi del caso, fingerprint, codici di gruppo, account completo, nomi RPC o spiegazioni della governance.

## 3. Livello 2 — comunicazione

Le spiegazioni persistenti vengono ridotte. Restano raggiungibili tramite divulgazione progressiva:

- perché il caso è stato aperto;
- quale perimetro è interessato;
- cosa significa assegnare o condividere;
- quali effetti non vengono prodotti automaticamente.

Questo livello non è necessario per completare il compito ordinario.

## 4. Livello 3 — verifica e tracciabilità

Sono disponibili su richiesta:

- ID del `CurriculumReviewCase`;
- master/versione;
- account autenticato;
- fase interna;
- anno/gruppo/discipline operative;
- numero di assegnatari.

La tracciabilità resta completa ma non occupa lo spazio percettivo del lavoro.

## 5. Stabilità del viewport

Il caso case-scoped usa un unico `workframe` persistente. Su smartphone il contenuto dei quattro stadi cambia dentro lo stesso frame invece di allungare e ricomporre l'intera pagina.

Quando una vera transizione di stato cambia il compito attivo, lo scroll interno del workframe viene riportato all'inizio. Questo reset non costituisce progressione: la progressione resta determinata esclusivamente dallo stato della `CurriculumWorkSession`.

Il frame usa:

- altezza mobile controllata rispetto a `100dvh`;
- `overflow-y: auto` soltanto per testo che non entra nel viewport;
- `overscroll-behavior: contain`;
- `scrollbar-gutter: stable`;
- bottom dock con spazio già riservato.

L'obiettivo è evitare salti di pagina e mantenere fase, oggetto e azione nella stessa zona percettiva.

## 6. Navigazione mobile

La bottom navigation viene riallineata al target canonico:

**Il mio lavoro · Curricolo · Progettazione · Riesame**.

Documenti/Fascicolo restano servizi secondari raggiungibili dal menu dell'header. Non viene creata alcuna nuova route.

## 7. CCO surface coverage

Il registro delle superfici include ora esplicitamente:

- `case-scoped-experience-shell`;
- `shared-review-case-inbox`;
- `mobile-primary-navigation`.

Il validator `validate-case-work-session.mjs` presidia layering L1/L2/L3, workframe stabile e navigazione mobile canonica, così un PASS HIM non può più ignorare queste parti della superficie realmente attraversata dal pilot.

## 8. Acceptance mobile

Viewport di riferimento: **390 × 844 CSS px**.

L'incremento è accettabile quando:

1. il livello 1 del caso non mostra ID tecnici o fingerprint;
2. il cambio `Esamina → Condividi → Confronta → Esito` avviene nel medesimo workframe;
3. il nuovo stadio parte dall'inizio del workframe e non da un offset ereditato;
4. la CTA resta sopra il dock mobile e raggiungibile senza salto di pagina;
5. spiegazioni e tracciabilità sono chiuse di default ma raggiungibili;
6. la bottom navigation contiene le quattro destinazioni canoniche;
7. nessuna modifica UX altera `ProfessionalContribution`, `TeamProfessionalOutcome`, `InstitutionalDecision`, `AdoptionReceipt` o master.

## 9. Confini invariati

Restano vincolanti:

`RevisionTrigger != CurriculumReviewCase != CurriculumWorkSession != ProfessionalContribution != TeamProfessionalOutcome != InstitutionalDecision`.

`TeamProfessionalOutcome != InstitutionalDecision`.

Nessuna modifica di questo incremento rende il curricolo vigente, apre H3, registra un'adozione o crea baseline parallele.
