# 00 — VISIONE DI PRODOTTO

**Vision ID:** `ARENA-PRODUCT-VISION`  
**Versione:** `1.0.0`  
**Data:** 2026-09-06  
**Stato:** `CANONICAL_PRODUCT_DIRECTION`  
**Controparte Drive:** `ARENA-PRODUCT-00_Visione_di_prodotto_e_governo_documentazione_2026-2027` — `1s17jJCslSIJIXQfiTEzyRcD5q-Baopj6-l14aaFEWik`

---

## 1. Missione

CurManLight Arena non è un archivio di documenti sul curricolo e non è un gestionale generico. È l'ambiente professionale con cui una scuola costruisce, valida, utilizza, osserva e fa evolvere il proprio curricolo verticale mantenendo distinti:

`fonte normativa != elaborazione d'Istituto != contributo professionale != esito del gruppo != decisione istituzionale != curricolo vigente`.

La promessa di prodotto è: **ogni scelta curricolare deve poter essere ricostruita dalla fonte alla progettazione didattica e, dopo l'attuazione, dalla pratica professionale a un eventuale riesame, senza perdere provenienza, responsabilità e storia.**

---

## 2. North Star

Arena deve trasformare il curricolo da documento statico a **sistema operativo professionale della progettazione educativa e didattica**.

Un docente deve poter capire in pochi secondi:
- che cosa si applica alla propria classe, disciplina o campo di esperienza;
- che cosa deve esaminare o validare;
- quale decisione gli compete e quale non gli compete;
- come il curricolo alimenta programmazione, UDA e attività;
- come segnalare un problema emerso nella pratica senza modificare automaticamente il curricolo.

Un istituto deve poter dimostrare:
- da quali fonti deriva ogni elemento rilevante;
- quale versione è stata esaminata;
- quali esiti professionali sono stati registrati;
- quale decisione istituzionale è stata realmente assunta;
- quale versione è in uso;
- come le scelte adottate sono state tradotte nella progettazione;
- quali osservazioni dalla pratica hanno motivato eventuali revisioni successive.

---

## 3. Ciclo professionale canonico

Il processo umano visibile è:

**QUADRO APPLICABILE → VALIDAZIONE PROFESSIONALE → RIESAME VERTICALE → ITER ISTITUZIONALE → USO NELLA PROGETTAZIONE DIDATTICA → RIESAME DALLA PRATICA → eventuale nuova VALIDAZIONE PROFESSIONALE.**

Le fonti, i fingerprint, le versioni, le membership, gli audit, le ricevute e gli export sono servizi di supporto. Non sono il processo principale percepito dal docente.

Il contratto macchina che protegge questo ciclo è `.human/curriculum-lifecycle.contract.json@1.1.0`.

---

## 4. Revisione innescata da eventi futuri

Arena deve poter riaprire il ciclo in modo controllato mediante un `RevisionTrigger`.

Trigger previsti:
- **normativo esterno** — legge, decreto, Indicazioni, linee guida, nota o circolare applicabile;
- **istituzionale interno** — esigenza motivata dell'Istituto, del Collegio, di un Dipartimento o di una commissione;
- **dalla pratica didattica** — ricorrenza di problemi di prerequisiti, sequenza, carico, duplicazione, evidenze o raccordi;
- **periodico** — riesame programmato annuale o pluriennale.

Un trigger **non modifica mai il curricolo**. Prima deve essere qualificato per fonte, applicabilità, ambito e impatto; solo dopo può aprire uno o più `CurriculumReviewCase`.

Le esigenze interne restano riconoscibili come scelte d'Istituto e non vengono presentate come prescrizioni nazionali.

---

## 5. Oggetto canonico di lavoro

L'oggetto centrale è la `CurriculumUnit`, non il file e non la singola frase.

Ogni unità mantiene identità stabile e collega almeno:
- ordine / classe / coorte o fascia d'età;
- disciplina / campo / asse trasversale;
- nucleo o dominio;
- requisito nazionale o fonte specifica;
- annualizzazione d'Istituto;
- competenze o traguardi;
- obiettivi;
- conoscenze essenziali;
- evidenze osservabili;
- raccordi verticali;
- provenienza;
- versione o fingerprint;
- stato di validazione.

Da essa derivano oggetti distinti: `CurriculumReviewCase`, `ProfessionalContribution`, `TeamProfessionalOutcome`, `VerticalReviewOutcome`, `InstitutionalDecision`, `AdoptionReceipt`, `DidacticBinding`, `ImplementationObservation`, `RevisionTrigger`.

---

## 6. Autorità e responsabilità

I confini sono strutturali:

`profilo personale != ruolo verificato`  
`competenza disciplinare != autorità istituzionale`  
`contributo individuale != esito professionale del team`  
`esito del team != decisione istituzionale`  
`decisione istituzionale != adozione finché non è registrata`  
`PASS tecnico != avanzamento umano o istituzionale`

L'autorità non deriva da un ruolo scelto in un profilo, ma da identità autenticata, appartenenza valida, competenza e stato del processo.

---

## 7. Curricolo → progettazione

Il curricolo adottato alimenta la progettazione mediante `DidacticBinding`.

Programmazione annuale, UDA e attività non copiano il curricolo creando nuove fonti di verità: referenziano l'identità e la versione delle `CurriculumUnit` utilizzate.

Per Educazione civica la tracciabilità deve poter collegare:

`risultato civico → nucleo → attività/UDA → ore → responsabilità → evidenza reale`.

L'alfabetizzazione all'intelligenza artificiale conta come contributo all'Educazione civica soltanto quando esiste un risultato civico esplicito.

---

## 8. Riesame dalla pratica

Arena consente osservazioni professionali aggregate senza richiedere dati personali degli alunni.

Segnali ammessi comprendono: `ADEQUATE`, `TOO_EARLY`, `TOO_LATE`, `DUPLICATED`, `MISSING_PREREQUISITE`, `WEAK_EVIDENCE`, `UNSUSTAINABLE_LOAD`, `EFFECTIVE_VERTICAL_LINK`, `OTHER`.

Le `ImplementationObservation` possono generare un riesame mirato; non modificano automaticamente il curricolo.

---

## 9. Navigazione target

La navigazione primaria è:

**IL MIO LAVORO · CURRICOLO · PROGETTAZIONE · RIESAME**

`FASCICOLO` è una superficie subordinata per fonti, versioni, registri, ricevute, export e tracciabilità.

Le azioni istituzionali compaiono soltanto quando ruolo e stato le rendono pertinenti.

Le superfici oggi separate “Il mio contributo”, “Condivisione”, “Lavoro del team” e “Coordinamento del team” devono convergere in una sola `CurriculumWorkSession` progressiva:

**ESAMINA → CONDIVIDI → CONFRONTA → REGISTRA L'ESITO**.

---

## 10. Principi di prodotto

- lavoro prima dei documenti;
- una sola baseline curricolare canonica;
- riconoscimento prima dell'interpretazione;
- un solo oggetto dominante per contesto;
- divulgazione progressiva di fonti, motivazioni e dati tecnici;
- linguaggio della scuola, non del software;
- tracciabilità completa senza sovraccarico visivo;
- nessuna promozione automatica di decisioni;
- privacy e minimizzazione dei dati;
- IA come supporto citabile e verificabile, mai come autorità;
- nessun punteggio pedagogico automatico e nessun ranking dei docenti.

---

## 11. Misure di qualità ammesse

Arena può misurare:
- completamento della validazione professionale;
- questioni verticali irrisolte;
- copertura dei `DidacticBinding`;
- ricorrenza delle `ImplementationObservation`;
- tracciabilità di ore/evidenze di Educazione civica;
- completezza delle ricevute di fonte/versione/decisione.

Arena non deve produrre un “punteggio di qualità pedagogica” sintetico né classifiche dei docenti.

---

## 12. Non-obiettivi

Arena non sostituisce Collegio, Dipartimenti, Dirigente o altri organi; non decide il curricolo; non rende una norma automaticamente didattica; non è un registro elettronico degli alunni; non è un LMS generalista; non usa l'IA per assumere decisioni professionali o istituzionali.

---

## 13. Governo della documentazione di prodotto

La documentazione segue questa gerarchia:

1. **Visione canonica** — questo documento e la controparte Drive `ARENA-PRODUCT-00`;
2. **Architettura informativa** — `01_INFORMATION_ARCHITECTURE.md`;
3. **Navigazione** — `02_NAVIGATION_MODEL.md`;
4. **Flussi critici** — `09_USER_FLOWS.md`;
5. **Contratti** — Curriculum Lifecycle, CCO e HIM;
6. **Specifiche di implementazione** — layout, componenti e schermate, subordinate alla visione.

Ogni modifica di governance che altera ciclo, autorità, oggetti canonici, navigazione primaria, collegamento alla progettazione o modalità di riesame deve aggiornare la visione e i documenti derivati pertinenti nello stesso incremento.

Il registro macchina `docs/04_product_experience/PRODUCT_DOCS.registry.json` mantiene versione, stato e responsabilità di sincronizzazione dei documenti di prodotto. La CI deve fallire in caso di disallineamento.

---

## 14. Stato corrente

- curricolo canonico: `CAN-CURR-MASTER-00@1.3`;
- copertura documentale: completa;
- validazione professionale: aperta;
- curricolo vigente: no;
- contratto ciclo professionale: `.human/curriculum-lifecycle.contract.json@1.1.0`;
- governance `RevisionTrigger`: definita nel contratto lifecycle 1.1.0;
- UI: in convergenza verso questa visione; una preview precedente non costituisce prova di implementazione del modello target.

---

## 15. Criterio di successo

Arena raggiunge la propria visione quando:
- un docente completa il proprio compito professionale senza conoscere la struttura tecnica del fascicolo;
- un team registra un esito senza confonderlo con una decisione istituzionale;
- il curricolo adottato alimenta realmente programmazioni e UDA;
- la pratica può innescare revisioni mirate;
- una nuova norma o circolare può riaprire il ciclo senza creare baseline parallele;
- l'intera catena resta ricostruibile nel tempo.
