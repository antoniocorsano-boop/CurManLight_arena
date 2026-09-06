# 02 — NAVIGATION MODEL

**Product vision:** `ARENA-PRODUCT-VISION@1.0.0`  
**Lifecycle:** `CURRICULUM_LIFECYCLE@1.1.0`  
**Stato:** `CANONICAL_TARGET_NAVIGATION`  
**Data:** 2026-09-06

---

## 1. Principio

La navigazione non deve riprodurre l'architettura tecnica dell'app. Deve seguire il lavoro reale del docente e proiettare soltanto le azioni pertinenti al ruolo e allo stato.

La navigazione primaria target è:

**IL MIO LAVORO · CURRICOLO · PROGETTAZIONE · RIESAME**

La navigazione secondaria è:

**FASCICOLO**

Le funzioni istituzionali non sono una voce universale: compaiono contestualmente quando identità, membership, competenza e stato lo consentono.

---

## 2. Il mio lavoro

È il punto di ingresso ordinario.

Deve rispondere a tre domande:
1. Che cosa devo fare adesso?
2. Qual è lo stato del mio lavoro?
3. Qual è la prossima azione reale?

Non deve mostrare l'intero ciclo, le fasi future o metadati tecnici come contenuto principale.

Esempi di card:
- annualizzazione da esaminare;
- contributo da completare;
- confronto del gruppo disponibile;
- riesame verticale richiesto;
- progettazione da collegare al curricolo;
- caso di riesame aperto.

---

## 3. Curricolo

La voce `CURRICOLO` apre il master canonico e il contesto applicabile.

Azioni principali:
- consultare la progressione;
- filtrare per ordine, classe/coorte, disciplina/campo/asse;
- vedere annualizzazione d'Istituto e benchmark/fonte distinti;
- aprire una `CurriculumWorkSession` quando esiste un caso pertinente;
- vedere raccordi verticali;
- aprire la fonte o la tracciabilità su richiesta.

La vecchia KB locale non è la rappresentazione corrente del curricolo e rimane subordinata nel Fascicolo come archivio legacy quando necessario.

---

## 4. CurriculumWorkSession

Dentro il lavoro curricolare la navigazione è verticale e progressiva:

**ESAMINA → CONDIVIDI → CONFRONTA → REGISTRA L'ESITO**

Regole:
- una sola fase domina la superficie;
- le fasi future non competono con quella corrente;
- uno stadio completato diventa un riepilogo compatto;
- lo scroll non cambia fase;
- il docente termina il proprio compito a `CONDIVIDI` se non ha ulteriori responsabilità;
- `CONFRONTA` compare quando esistono contributi sufficienti e un ruolo pertinente;
- `REGISTRA L'ESITO` compare soltanto a chi possiede l'autorità richiesta e dopo la copertura necessaria.

La navigazione non deve creare voci distinte per contributo, condivisione, team e coordinamento.

---

## 5. Progettazione

`PROGETTAZIONE` raccoglie programmazione annuale, UDA e attività.

Il punto di ingresso mostra il curricolo pertinente e consente di creare `DidacticBinding`.

La navigazione interna deve privilegiare:
- cosa del curricolo è già collegato;
- cosa manca ancora nella progettazione;
- quali collegamenti sono trasversali;
- quali ore/evidenze di Educazione civica sono realmente sostenute da attività.

Non deve trasformare la “copertura” in un punteggio di prestazione del docente.

---

## 6. Riesame

`RIESAME` è la porta per il ritorno dalla pratica o per l'apertura di nuove revisioni.

Contiene:
- `ImplementationObservation` aggregate;
- `RevisionTrigger` normativi;
- trigger per esigenze d'Istituto;
- trigger periodici;
- casi di riesame aperti;
- questioni verticali irrisolte.

Azione primaria: qualificare o aprire un riesame mirato, non modificare direttamente il master.

---

## 7. Fascicolo

`FASCICOLO` è secondario ma sempre raggiungibile.

Contiene:
- master e relative versioni;
- repertorio fonti;
- fonti normative/istituzionali;
- matrici di conformità;
- registri e ricevute;
- decisioni e verbali collegati;
- export/backup;
- storico tecnico e archivi legacy.

Il Fascicolo usa divulgazione progressiva. Drive ID, fingerprint, stati tecnici e dettagli di verifica non occupano il livello 1.

---

## 8. Azioni istituzionali proiettate

Esempi di azioni non universali:
- avvia confronto del gruppo;
- registra esito professionale;
- chiudi riesame verticale;
- verifica readiness per l'iter istituzionale;
- registra decisione istituzionale;
- registra adozione.

Queste azioni appaiono nel contesto dell'oggetto pertinente e non in una sezione “amministrazione” sempre visibile.

---

## 9. Desktop

Target:
- navigazione primaria persistente e compatta;
- un solo titolo di contesto;
- un solo oggetto dominante;
- comandi secondari nel contesto o in overflow;
- Fascicolo separato dalla navigazione primaria;
- nessuna sidebar con decine di sotto-voci che espongano l'intera architettura interna.

---

## 10. Mobile

La bottom navigation target contiene le quattro aree primarie:

`Il mio lavoro · Curricolo · Progettazione · Riesame`

`Fascicolo` è raggiungibile dal menu secondario/overflow.

Regole mobile:
- nessuna duplicazione tra bottom nav e una seconda rail di avanzamento;
- la fase corrente della `CurriculumWorkSession` domina lo schermo;
- azioni conseguenti restano vicine all'oggetto;
- fonti e dati tecnici si aprono su richiesta;
- il ritorno al contesto precedente deve essere esplicito e recuperabile.

---

## 11. Navigazione indietro e recupero

Ogni sessione deve conservare:
- CurriculumUnit o caso corrente;
- fase attiva;
- bozza personale non ancora registrata;
- filtri contestuali essenziali.

La navigazione indietro non deve trasformare una bozza in decisione né perdere il lavoro non registrato senza avviso.

---

## 12. Migrazione dalle voci precedenti

| Precedente | Target |
|---|---|
| Home / Dashboard | Il mio lavoro |
| Consulta / Albero / Mappa | Curricolo |
| Revisione | CurriculumWorkSession |
| Condivisione | CurriculumWorkSession |
| Lavoro del team | CurriculumWorkSession |
| Coordinamento | azione proiettata nella CurriculumWorkSession |
| Fonti | Fascicolo |
| Processo / Delibera | azione istituzionale proiettata |
| Progettazione UDA | Progettazione |
| feedback sparso | Riesame |

Le vecchie chiavi di routing/tab possono restare temporaneamente per compatibilità tecnica, ma non definiscono la nomenclatura o la gerarchia di prodotto.

---

## 13. Vincoli di accettazione

- massimo una gerarchia di navigazione primaria;
- massimo una progressione visibile per un'attività multistadio;
- nessuna voce `Fonti` come fase primaria;
- nessuna voce `Decisione istituzionale` universale;
- nessun ID tecnico al livello 1 del docente;
- stato e prossima azione riconoscibili senza testo formativo persistente;
- l'interfaccia deve rimanere utilizzabile anche rimuovendo la copy didattica non essenziale;
- tutte le azioni conseguenti devono rispettare i confini di autorità.
