# Arena R7C2 — Tecnologia end-to-end

## Scopo

R7C2 usa Tecnologia come primo caso completo sul contratto operativo R7C1.

La tranche non importa la bozza dentro `CurriculumMap` e non modifica `CURRICULUM_PERSISTENCE_MODE`. Costruisce invece un pacchetto operativo verificabile che mantiene distinti:

1. elementi nazionali D.M. 221/2025 verificati da persona;
2. curricolo verticale di Tecnologia d'istituto ancora in stato di bozza;
3. progressione prima-seconda-terza;
4. artefatti operativi A-H;
5. passaggio alla progettazione mediante riferimenti stabili e snapshot leggibili.

## Fonte istituzionale del pilota

La fonte di lavoro è il documento `Curricolo verticale di Tecnologia — Bozza operativa aggiornata a Indicazioni Nazionali 2025, PTOF, RAV/PdM, framework europei e contesto territoriale`.

La fonte dichiara espressamente di essere una **bozza operativa da sottoporre al gruppo disciplinare e al Collegio**. Di conseguenza R7C2 congela:

- `authorityStatus = WORKING_DRAFT_NOT_ADOPTED`;
- nodi d'istituto `origin = imported`;
- `lifecycle = PROPOSED`;
- `authorityLevel = LOCAL_WORKING`;
- aggregato `authority.state = NON_AUTHORITATIVE`.

Nessuna frase della bozza viene trasformata in decisione collegiale.

R7C2 usa il documento curricolare a nove nuclei come fonte del pilota. Eventuali schede personali, note d'incontro o proposte alternative con articolazioni differenti non vengono riconciliate automaticamente con questa fonte.

## Nove nuclei acquisiti

1. Cultura tecnica, bisogni, oggetti e sistemi
2. Metodo progettuale e problem solving tecnologico
3. Materiali, risorse, trasformazioni e ciclo di vita
4. Disegno tecnico, rappresentazione, modellazione e comunicazione grafica
5. Energia, elettricità, macchine e sostenibilità
6. Abitare, territorio, infrastrutture e sicurezza
7. Alimentazione, filiere, produzione e consumo consapevole
8. Digitale, dati, informatica, IA e cittadinanza tecnologica
9. Tecnologia, lavoro, orientamento e professioni tecnico-scientifiche

Per ogni nucleo vengono conservati come nodi operativi distinti:

- conoscenze essenziali;
- abilità;
- competenza attesa;
- evidenze.

La progressione di classe resta una struttura esplicita separata: 9 nuclei × 3 classi = 27 voci, con 18 collegamenti di progressione prima → seconda → terza. Non viene rinominata artificialmente come “obiettivo” o “competenza”.

Le cinque finalità formative e le sei aree del profilo in uscita restano nello snapshot di contesto istituzionale, preservando la terminologia della fonte senza forzarle nei tipi nodo CML-633C esistenti.

## Fonte nazionale

L'inventario nazionale di Tecnologia contiene 61 elementi tra primaria e secondaria. R7C2 accetta nel pilota della scuola secondaria soltanto `VerifiedTechnologyElement` già promossi da un receipt umano valido.

Per ciascun elemento nazionale accettato:

- il testo viene normalizzato;
- viene calcolato SHA-256 con Web Crypto;
- il nodo operativo usa `origin = normative-source`;
- `authorityLevel = NATIONAL_PRESCRIPTIVE`;
- il binding mantiene `SOURCE_VERIFIED + verifiedByHuman + HUMAN_VERIFIED_SOURCE_TEXT`;
- il fingerprint del testo deve coincidere con quello dell'evidenza nazionale;
- il `segmentId` deve essere quello canonico di Tecnologia.

R7C2 non inventa collegamenti tra i nove nuclei d'istituto e i singoli elementi nazionali. Tale mapping appartiene a R7C3/P3-v2 semantico e richiede evidenza esplicita.

## Allegati A-H come oggetti operativi

Gli otto allegati sono rappresentati come oggetti collegati alla stessa `curriculumVersionRef`:

- A — Matrice delle variazioni;
- B — Scheda di progettazione per nucleo fondante;
- C — Formato UDA;
- D — Rubriche di valutazione;
- E — Griglie di osservazione;
- F — Autovalutazione studente e portfolio;
- G — Monitoraggio esiti, recupero, potenziamento e continuità;
- H — Verbale di dipartimento e registro delle decisioni.

A e H restano `DECISION_REQUIRED` finché non possiedono riferimenti a decisioni effettive. Gli altri allegati restano `WORKING_TEMPLATE` in questa tranche. Nessun template equivale ad adozione.

## Handoff alla progettazione

`buildTechnologyPlanningHandoff()` elimina il modello “seleziona testo e copialo”. Ogni requisito consegnato alla progettazione conserva:

- `curriculumVersionRef`;
- `segmentRef`;
- `nodeRef`;
- snapshot del testo;
- livello di autorità;
- origine;
- riferimenti alle fonti.

Se anche un solo nodo selezionato è `LOCAL_WORKING`, l'handoff è `WORKING_DRAFT_ONLY`. Un insieme composto esclusivamente da elementi nazionali verificati può essere `SOURCE_VERIFIED_REFERENCE_SET`, ma ciò non costituisce adozione del curricolo d'istituto.

## Confini intenzionali

R7C2 non:

- cambia `legacy-only`;
- modifica le viste produttive;
- riscrive `CurriculumMap`;
- modifica P3 o P7 produttivi;
- persiste automaticamente i receipt nazionali in un registro condiviso;
- adotta la bozza d'istituto;
- compila i campi degli allegati lasciati vuoti dalla fonte;
- crea mapping semantici istituto ↔ elemento nazionale non dichiarati;
- modifica l'infanzia o la PR R7B3.

## Gate

La tranche è pronta solo quando sullo stesso exact-head risultano PASS:

- test R7C2;
- fast regression;
- TypeScript;
- production build;
- Beta Release;
- Beta Identity Authority, se attivato dal diff.

Dopo R7C2 il passo previsto dall'audit è **R7C3 — P3-v2 semantico elemento-per-elemento**.
