# PRODUCT_CONVERGENCE_AND_LIFECYCLE_CLOSURE_R2

**Stato:** IN_PROGRESS  
**Data di apertura:** 2026-09-07  
**Ramo di esecuzione:** `feature/team-organizational-binding`  
**PR di riferimento:** #201  
**Baseline iniziale:** `944030389bd2a7e37c8f8deff72e938899a4c480`  
**Vincoli canonici:** `ARENA-PRODUCT-VISION@1.0.0`, `CURRICULUM_LIFECYCLE@1.2.0`, `CCO@1.5.0`, `CCO-SURFACES@1.6.1`, `CAN-CURR-MASTER-00@1.3` non vigente.

## 1. Obiettivo

Portare CurManLight Arena dalla condizione attuale di modello professionale funzionante e pilotato alla chiusura coerente del prodotto target, senza introdurre nuove superfici primarie, nuove baseline curricolari o scorciatoie di autorità.

Il programma termina quando:

1. le quattro superfici primarie `Il mio lavoro · Curricolo · Progettazione · Riesame` sono coerenti con HIM/CCO e non presentano percorsi concorrenti;
2. H3 — Riesame verticale — è realmente utilizzabile e produce un `VerticalReviewOutcome` tracciabile;
3. H4 — Iter istituzionale — è provato end-to-end con autorità verificata e ricevute, mantenendo distinta decisione da adozione/vigenza;
4. H5 usa un curricolo realmente adottato tramite `DidacticBinding`, senza copie che diventino nuove fonti di verità;
5. H6 chiude il ciclo dalla pratica fino a un nuovo riesame mirato senza dati personali degli alunni e senza baseline parallele;
6. accessibilità, componenti, recovery e residui legacy raggiungono il livello di qualità richiesto;
7. `target_ui_fully_implemented` può essere portato a `true` sulla base di prove, non per dichiarazione;
8. la PR #201 può essere valutata per `Ready for review`, ma non viene unita automaticamente.

## 2. Regole di esecuzione

- Un solo ramo e una sola PR: nessuna nuova catena di PR.
- Nessuna modifica a `CAN-CURR-MASTER-00@1.3` salvo decisione umana esplicita nel processo curricolare.
- Nessuna `InstitutionalDecision`, `AdoptionReceipt` o promozione del curricolo simulata da test tecnici.
- Ogni incremento deve chiudersi su un exact-head con gate coerenti.
- Ogni prova umana deve essere distinta dai gate automatici.
- Le superfici utente seguono L1/L2/L3: operativo semplice, spiegazione su richiesta, dettaglio tecnico subordinato.
- Lo scroll non è progressione. Le transizioni di fase devono essere reali e percettivamente stabili.
- Nessun ruolo autodichiarato può sbloccare autorità.
- Ogni persistenza condivisa deve essere riletta e verificabile dal server.

## 3. Sequenza vincolante

### R2-A — Audit e convergenza delle quattro superfici primarie

**Obiettivo:** classificare e correggere `Il mio lavoro`, `Curricolo`, `Progettazione`, `Riesame` secondo Visione, HIM e CCO-R7.

**Verifiche obbligatorie:**
- un solo compito dominante;
- linguaggio della scuola, non del dominio tecnico;
- nessuna duplicazione di avanzamento;
- nessun salto verticale come transizione;
- CTA non coperte dalla navigazione mobile;
- separazione L1/L2/L3;
- azioni istituzionali solo se ruolo e stato le rendono pertinenti;
- `Fascicolo` subordinato;
- assenza di percorsi legacy concorrenti.

**Exit gate:** matrice delle quattro superfici con stato `CONFORMANT | REWORK | MIGRATION`; nessun P0 aperto prima di R2-B.

### R2-B — H3: Riesame verticale reale

**Obiettivo:** implementare/proiettare H3 come fase distinta da H2 e da H4.

**Oggetto di uscita:** `VerticalReviewOutcome` versionato e legato allo stesso master/versione e alle unità realmente riesaminate.

**Vincoli:**
- H2 completo non apre automaticamente H3;
- H3 non produce automaticamente decisione istituzionale;
- il riesame deve evidenziare continuità, discontinuità e punti aperti della progressione 3–14;
- nessuna riscrittura retroattiva delle coorti transitorie;
- confronto verticale e decisione istituzionale restano distinti.

**Exit gate:** smoke dal codice reale + prova umana guidata + ricevuta macchina.

### R2-C — H4: readiness, decisione istituzionale e adozione

**Obiettivo:** provare il passaggio H3 → H4 senza collassare le autorità.

**Sottopassi:**
1. readiness per l'organo competente;
2. `InstitutionalDecision` con identità/versione congelata;
3. eventuale `AdoptionReceipt` separata dalla decisione;
4. stato di vigenza modificabile soltanto dalla catena istituzionale prevista.

**Vincoli:**
- `TeamProfessionalOutcome != VerticalReviewOutcome != InstitutionalDecision != AdoptionReceipt`;
- decisione append-only / ricevuta rileggibile;
- nessuna autorità da profilo locale;
- nessun master parallelo.

**Exit gate:** prova end-to-end con account/ruolo reale autorizzato. I test automatici non possono sostituire il gesto istituzionale.

### R2-D — H5: curricolo adottato → progettazione reale

**Obiettivo:** dimostrare che programmazione annuale e UDA usano una versione realmente adottata tramite `DidacticBinding`.

**Vincoli:**
- finché il master non è vigente resta `DRAFT_PLANNING_REFERENCE`;
- dopo adozione il binding deve riferire identità/versione adottata;
- testo copiato nella progettazione resta snapshot, non fonte canonica;
- copertura dei binding non diventa punteggio docente.

**Exit gate:** almeno una programmazione e una UDA rileggibili con binding valido alla versione adottata.

### R2-E — H6: riesame dalla pratica e chiusura del ciclo

**Obiettivo:** chiudere il ciclo `H5 → H6 → RevisionTrigger → H1/H2 mirato`.

**Vincoli:**
- nessun dato personale degli alunni richiesto;
- segnali aggregati o motivazione professionale esplicita;
- trigger qualificato per origine, applicabilità e ambito;
- nessuna apertura automatica del caso;
- nessuna modifica automatica del curricolo;
- nessuna baseline parallela.

**Exit gate:** prova reale/smoke che parte da una `ImplementationObservation`, produce un trigger qualificato e apre esplicitamente un nuovo caso mirato.

### R2-F — Accessibilità, componenti, recovery e legacy retirement

**Obiettivo:** consolidare qualità trasversale prima della dichiarazione di UI target completa.

**Accessibilità minima:**
- focus management e focus trap nei dialoghi;
- `aria-live` per feedback critici;
- heading hierarchy;
- `aria-expanded`, `aria-selected`, `aria-invalid` dove necessari;
- touch target adeguati;
- `prefers-reduced-motion`;
- navigazione tastiera e recupero focus;
- test mobile e desktop.

**Componenti/design system:**
- aggiornare Design System e Component Library allo stato reale;
- ridurre pattern duplicati che compromettono coerenza e accessibilità;
- nessun refactoring estetico privo di beneficio contrattuale.

**Recovery/hardening:**
- refresh durante ogni fase;
- logout/login e cambio account;
- browser diverso;
- doppia submit/idempotenza;
- dati stale e mismatch fingerprint;
- errore rete/server e recupero;
- ritorno alla fase corretta senza carry-forward improprio.

**Legacy retirement:**
- nessuna superficie primaria concorrente;
- alias legacy solo se strettamente necessari alla compatibilità;
- nessun testo tecnico nel livello L1.

**Exit gate:** audit a11y + recovery smoke + aggiornamento documentazione subordinata.

### R2-G — Accettazione finale di prodotto

**Obiettivo:** dimostrare che il sistema target definito è effettivamente realizzato.

**Prove finali:**
- HVA sulle quattro superfici primarie;
- percorso docente completo;
- percorso coordinatore completo;
- percorso istituzionale completo;
- ciclo pratica → riesame;
- browser/mobile/desktop;
- exact-head con tutti i gate;
- aggiornamento Drive e REG-CURR-00.

**Solo dopo:**
- `target_ui_fully_implemented = true`;
- documentazione subordinata promossa da snapshot/review-required a stato corrente;
- valutazione della PR #201 per `Ready for review`.

**Mai automatico:** merge, adozione del curricolo, vigenza, decisioni dell'organo collegiale.

## 4. Priorità e dipendenze

`R2-A → R2-B → R2-C → R2-D → R2-E → R2-F → R2-G`

R2-F può produrre correzioni incrementali durante le fasi precedenti, ma il suo gate complessivo si chiude dopo R2-E.

## 5. Stato iniziale

| Fase | Stato iniziale | Nota |
|---|---|---|
| R2-A | IN_PROGRESS | Riesame è già il riferimento CCO più maturo; le altre tre superfici vanno riallineate allo stesso livello. |
| R2-B | NOT_STARTED | Lifecycle definito; prova H3 completa non ancora chiusa. |
| R2-C | NOT_STARTED | Contratti/primitive istituzionali esistono; E2E istituzionale non concluso. |
| R2-D | BLOCKED_BY_R2_C | Il master 1.3 è ancora non vigente. |
| R2-E | NOT_STARTED | Primitive `ImplementationObservation` e `RevisionTrigger` esistono; ciclo completo da provare. |
| R2-F | IN_PROGRESS_TRANSVERSAL | Gap a11y e documentazione subordinata già noti. |
| R2-G | NOT_STARTED | Richiede tutte le fasi precedenti. |

## 6. Criterio di avanzamento

Ogni fase produce:
1. audit dello stato reale;
2. correzione minima necessaria;
3. test automatici;
4. prova umana se la semantica dipende dall'esperienza/autorità;
5. exact-head;
6. ricevuta in repository;
7. aggiornamento Drive/registro solo dopo il PASS.

Non si passa alla fase successiva con P0 aperti.

## 7. Primo lavoro operativo

La prima azione è `R2-A1 — PRIMARY_SURFACES_CONTRACT_AUDIT`:

- inventariare il renderer reale di ciascuna delle quattro superfici;
- confrontarlo con Visione, CCO, HIM, navigazione e flussi;
- classificare problemi in P0/P1/P2;
- identificare il minimo incremento di convergenza senza nuove route primarie;
- fissare un gate macchina che impedisca regressioni della gerarchia L1/L2/L3.
