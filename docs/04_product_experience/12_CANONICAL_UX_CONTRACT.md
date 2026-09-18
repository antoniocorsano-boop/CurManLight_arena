# 12 — CONTRATTO UX CANONICO DI ARENA

**Contract ID:** `ARENA_UX_CONTRACT`  
**Versione:** `1.0.0`  
**Data:** 2026-09-11  
**Stato:** `CANONICAL_UX_CONTRACT`  
**Controparte macchina:** `.human/arena-ux.contract.json`

---

## 1. Scopo

Questo contratto fissa l'esperienza utente canonica di CurManLight Arena. È subordinato alla Visione di prodotto, all'Architettura informativa, al Navigation Model e ai flussi critici; prevale sulle specifiche di layout, sui componenti storici e sugli snapshot di implementazione quando questi introducono ambiguità d'uso.

La regola generale è:

> **un ambiente = un'intenzione; un controllo = un significato; un oggetto dominante = un compito comprensibile.**

Arena deve nascondere la complessità necessaria al sistema senza nascondere il contesto professionale necessario alla persona.

---

## 2. Navigazione primaria stabile

La navigazione primaria è una sola:

**IL MIO LAVORO · CURRICOLO · PROGETTAZIONE · RIESAME**

Ogni ambiente risponde a una domanda distinta:

| Ambiente | Domanda | Intenzione |
|---|---|---|
| **Il mio lavoro** | Che cosa devo fare adesso? | Agire |
| **Curricolo** | Che cosa si applica e come è organizzato? | Comprendere |
| **Progettazione** | Come utilizzo il curricolo nella progettazione didattica? | Progettare |
| **Riesame** | Che cosa deve essere verificato, discusso o eventualmente modificato? | Riesaminare |

**Fascicolo** è secondario: conserva fonti, versioni, ricevute, verbali, documenti, export, backup e tracciabilità. Non compete con i quattro ambienti di lavoro.

---

## 3. Invarianti globali

1. **Un ambiente, una sola intenzione dominante.** Consultare, progettare e riesaminare non devono essere fusi nella stessa superficie primaria.
2. **Un controllo, un solo significato.** La stessa selezione non può significare contemporaneamente annualità consultata e annualità da portare al Riesame.
3. **Un solo oggetto dominante per contesto.** CurriculumUnit, progettazione/UDA, caso di Riesame o compito personale devono costituire il centro percettivo della superficie.
4. **Una sola azione primaria per compito.** Le azioni secondarie restano contestuali e non competono con il gesto principale.
5. **Contesto preservato nei passaggi.** Disciplina, ordine, annualità, nucleo, unità curricolare, versione e stato di autorità non devono essere ricostruiti da testi copiati.
6. **Documento subordinato.** Il documento è una proiezione editoriale del curricolo, non il paradigma della consultazione ordinaria.
7. **Tracciabilità al secondo livello.** Identificativi tecnici, fingerprint, SHA, gate e codici interni non occupano il livello 1 del docente.
8. **Autorità fail-closed.** Una funzione non autorizzata non deve apparire come disponibile né essere dedotta dalla navigazione.
9. **Indietro significa recupero del contesto precedente.** Il ritorno non deve perdere filtri, unità corrente, bozza o posizione professionale.
10. **Nessuna superficie duplicata.** Lo stesso compito professionale deve avere un solo luogo utente canonico.

---

## 4. Curricolo = consultazione

Entrare in **Curricolo** significa consultare e comprendere il curricolo. Il Riesame non determina la leggibilità del Curricolo e la Progettazione non viene ricreata dentro la consultazione.

Le tre proiezioni canoniche sono:

**Esplora · Trama · Documento**

### 4.1 Esplora

È la modalità ordinaria e predefinita.

Percorso:

`Disciplina/campo → ordine di scuola → annualità → nucleo → dettaglio CurriculumUnit`

Regole:

- discipline/campi, ordini e annualità derivano dai dati curricolari canonici;
- la destinazione target non può dipendere da numeri di sezione editoriali codificati nel componente;
- Classe I / II / III, o equivalenti, cambiano **soltanto l'annualità consultata**;
- la disponibilità o meno di un caso di Riesame non può disabilitare un'annualità del Curricolo;
- lo stato del Riesame non può preselezionare l'annualità del Curricolo;
- su mobile la consultazione ordinaria usa schede semantiche, non tabelle orizzontali come dipendenza primaria;
- comandi generici `Precedente` / `Successiva` sono vietati quando non dichiarano esplicitamente quale oggetto o relazione cambiano.

Ogni dettaglio può offrire azioni contestuali con significato univoco:

- **Vedi nella Trama** — resta nel Curricolo e cambia proiezione;
- **Usa in Progettazione** — passa a Progettazione preservando il contesto;
- **Segnala per il Riesame** — passa intenzionalmente a Riesame;
- **Vedi fonte** — apre il Fascicolo o la tracciabilità dell'oggetto;
- **Apri Documento** — apre la resa editoriale.

### 4.2 Trama

Trama è una proiezione relazionale del curricolo. Non è un editor e non è un motore libero di inferenza.

Deve rispondere a domande professionali quali:

- che cosa viene prima;
- che cosa viene dopo;
- quali prerequisiti sono richiesti;
- dove esistono raccordi, salti o duplicazioni;
- quali altri elementi sono realmente collegati.

Regole:

- ogni relazione è tipizzata e tracciabile;
- una relazione non disponibile o non validata **non viene mostrata**;
- la V1 può usare `same-nucleus-exact-only`;
- relazioni future come `PRECEDES`, `DEVELOPS`, `REQUIRES`, `DUPLICATES`, `CROSS_DISCIPLINE`, `SUPPORTED_BY_SOURCE` o `USED_IN_PLANNING` richiedono evidenza registrata o validazione umana;
- su telefono la Trama deve degradare in una sequenza verticale comprensibile;
- pan e zoom non possono essere obbligatori per comprendere la progressione.

### 4.3 Documento

Documento è la proiezione editoriale, istituzionale e stampabile.

Può conservare:

- premessa e sezioni editoriali;
- matrici complete;
- tabelle;
- struttura sequenziale;
- resa per stampa/esportazione.

Le tabelle possono scorrere orizzontalmente su telefono, ma il Documento non è necessario per la consultazione ordinaria e non è una seconda fonte di verità.

---

## 5. Progettazione = uso del curricolo

Da una CurriculumUnit, **Usa in Progettazione** deve trasferire almeno:

- disciplina/campo;
- ordine;
- annualità;
- nucleo;
- identità della CurriculumUnit o chiave stabile equivalente;
- master e versione;
- stato di autorità.

Il sistema realizza il collegamento mediante `DidacticBinding`, ma il docente vede **Collegamento al curricolo**.

Quando il master non è vigente, il livello 1 usa **Riferimento di lavoro**. Non deve essere presentato come curricolo adottato.

La Progettazione decide poi il target operativo: programmazione annuale, UDA o attività.

---

## 6. Riesame = verifica e possibile evoluzione

Riesame è separato dalla consultazione.

Il Curricolo può offrire soltanto un handoff esplicito e contestuale: **Segnala per il Riesame** o, se esiste già un caso pertinente, **Apri il lavoro assegnato**.

Dentro Riesame la sessione professionale usa una sola progressione:

`ESAMINA → CONDIVIDI → CONFRONTA → REGISTRA L'ESITO`

Regole:

- una sola fase domina lo schermo;
- i controlli delle fasi future restano nascosti finché non sono pertinenti;
- la disponibilità del Riesame non cambia la leggibilità del Curricolo;
- nessuna azione istituzionale deriva dal semplice accesso alla superficie;
- una transizione di fase richiede stato verificabile, non scroll o dichiarazioni cosmetiche.

---

## 7. Il mio lavoro = ingresso operativo

Ogni card deve contenere soltanto:

1. **oggetto**;
2. **stato comprensibile**;
3. **prossima azione reale**.

Non deve esporre l'intero ciclo, codici interni o fasi future non pertinenti.

Esempio:

> **Tecnologia · Classe I**  
> Hai completato l'esame personale. Il contributo non è ancora condiviso.  
> **Continua**

---

## 8. Fascicolo = tracciabilità e documentazione

Fascicolo è sempre raggiungibile ma secondario.

Può contenere:

- fonti normative e istituzionali;
- versioni e ricevute;
- verbali e decisioni;
- matrici di conformità;
- export e backup;
- identificativi tecnici;
- archivi precedenti.

Gli archivi precedenti non devono competere con il curricolo corrente. Drive ID, fingerprint e identificativi tecnici sono ammessi solo sotto divulgazione progressiva.

---

## 9. Regole mobile

Mobile è un'esperienza dedicata, non desktop compresso.

Vincoli:

- orientamento portrait come scenario primario;
- bottom navigation: **Il mio lavoro · Curricolo · Progettazione · Riesame**;
- nessuna seconda rail primaria concorrente;
- target touch minimo 44 px;
- nessun overflow orizzontale a livello pagina;
- Esplora usa schede semantiche;
- Trama è comprensibile senza pan/zoom obbligatorio;
- le tabelle complete sono ammesse nella proiezione Documento e devono essere realmente scrollabili.

---

## 10. Linguaggio canonico

Il livello 1 usa il linguaggio della scuola, non del software.

| Evitare come copy primaria | Usare |
|---|---|
| baseline corrente | **Versione di lavoro** oppure **Curricolo vigente**, secondo lo stato reale |
| master canonico | **Curricolo d'Istituto** |
| H2 | **Validazione professionale** |
| H3 | **Riesame verticale** |
| H4 | **Iter istituzionale** |
| superficie materializzata | **Funzione disponibile / non ancora disponibile** |
| fingerprint | **Versione** |
| DidacticBinding | **Collegamento al curricolo** |
| RevisionTrigger | **Motivo del riesame** |
| gate / PASS | **Verifica / stato da completare / verificato** |
| legacy | **Archivio precedente**, solo quando serve realmente |

I termini tecnici restano disponibili in **Tracciabilità**.

---

## 11. Quattro prove canoniche di usabilità

L'esperienza non è accettabile finché un docente non riesce, senza formazione specifica, a completare queste quattro prove:

### UX-CURR-01 — Trova Tecnologia · Classe II

Successo: raggiunge la classe II senza percorrere le sezioni editoriali e senza entrare nel Riesame.

### UX-CURR-02 — Comprendi cosa viene prima e dopo un nucleo

Successo: Trama mostra relazioni reali e comprensibili senza pan/zoom obbligatorio su telefono.

### UX-CURR-03 — Usa un nucleo in una UDA o programmazione

Successo: il passaggio a Progettazione conserva contesto e versione mediante collegamento persistito al curricolo.

### UX-CURR-04 — Segnala un prerequisito mancante

Successo: entra intenzionalmente nel Riesame senza modificare il curricolo e senza perdere il contesto della CurriculumUnit.

---

## 12. Divieti di implementazione

Sono non conformi:

- usare `targetClass` o stato del Riesame per scegliere l'annualità mostrata nel Curricolo;
- disabilitare un'annualità del Curricolo perché il Riesame corrispondente non è disponibile;
- codificare l'architettura target mediante numeri di sezione editoriale fissi;
- usare la sequenza documentale come navigazione predefinita del Curricolo;
- esporre H2/H3/H4, fingerprint, SHA o gate come copy primaria del docente;
- generare archi della Trama senza relazione registrata o validata;
- duplicare i controlli di Riesame dentro la consultazione Curricolo;
- trasformare un PASS tecnico in accettazione umana.

---

## 13. Relazione con la PR Esplora + Trama

La PR che implementa Esplora + Trama è subordinata a questo contratto.

In particolare, prima dell'accettazione umana deve verificare che:

- i selettori di consultazione siano indipendenti dallo stato del Riesame;
- le discipline/campi derivino dai dati canonici e non da una mappa rigida di sezioni editoriali;
- Classe I / II / III abbiano esclusivamente semantica di consultazione;
- l'handoff verso Progettazione e Riesame sia esplicito e distinto;
- la Trama resti fail-closed sulle relazioni;
- Documento rimanga disponibile come proiezione editoriale, non come percorso ordinario.

---

## 14. Criterio di accettazione

Una modifica UX è conforme soltanto se:

1. non viola le invarianti globali;
2. preserva i confini di autorità del lifecycle;
3. mantiene una sola semantica per ogni controllo;
4. non richiede linguaggio tecnico per completare il compito;
5. passa le prove automatiche pertinenti;
6. quando modifica un percorso umano critico, riceve nuovo riscontro umano reale prima di qualsiasi claim di accettazione.
