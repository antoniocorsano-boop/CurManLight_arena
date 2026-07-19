# 🏛️ RAPPORTO DI AUDIT FORENSE E VERIFICA REALE DELLE INCONGRUENZE D'ISTITUTO
### Studio Critico e Indagine Imparziale sul Codice Sorgente rispetto alle Specifiche v5.0-Ultimate
**Istituto Comprensivo Calvario-Covotta «don Lorenzo Milani» — Ariano Irpino (AV)**  
*Codice Meccanografico: AVIC849003*  
*Data del Rapporto: 16 Luglio 2026*  
*Organo di Controllo: Commissione d'Audit di Terza Parte per l'Integrità del Software d'Istituto*  
*Stato del Rapporto: EMESSO COME DOCUMENTO DI DIAGNOSTICA FORENSE DELLA TRASPARENZA TECNOLOGICA*

---

## 🗺️ INDICE DEL RAPPORTO CRITICO
1. [Inquadramento, Mandato di Terza Parte e Rigore Metodologico](#-1-inquadramento-mandato-di-terza-parte-e-rigore-metodologico)
2. [TAVOLO I: Usabilità, Onboarding e De-gergonizzazione Linguistica (Verifica Reale)](#-tavolo-i-usabilita-onboarding-e-de-gergonizzazione-linguistica-verifica-reale)
3. [TAVOLO II: Allineamento Normativo e Densità del Curricolo (Verifica Reale)](#-tavolo-ii-allineamento-normativo-e-densita-del-curricolo-verifica-reale)
4. [TAVOLO III: Sicurezza d'Istituto, GDPR e l'Illusione della Crittografia RAM (Verifica Reale)](#-tavolo-iii-sicurezza-distituto-gdpr-e-lillusione-della-crittografia-ram-verifica-reale)
5. [TAVOLO IV: Gestione delle Incongruenze e Divario "Mock-to-Reality" (Matrice Forense)](#-tavolo-iv-gestione-delle-incongruenze-e-divario-mock-to-reality-matrice-forense)
6. [TAVOLO V: Verifica di Dettaglio delle Ultime Richieste Formulate (Cosa è Reale e Cosa è Mock?)](#-tavolo-v-verifica-di-dettaglio-delle-ultime-richieste-formulate-cosa-e-reale-e-cosa-e-mock)
7. [Conclusioni, Validazione e Raccomandazioni della Commissione Terza](#-conclusioni-validazione-e-raccomandazioni-della-commissione-terza)

---

## 🏛️ 1. INQUADRAMENTO, MANDATO DI TERZA PARTE E RIGORE METODOLOGICO

Il presente **Rapporto di Audit Forense e Verifica Reale** viene emesso in risposta alle direttive d'Istituto che impongono alla Commissione d'operare come un **valutatore critico, obiettivo e imparziale**. Rifiutiamo qualsiasi forma di retorica promozionale o accoglimento acritico delle dichiarazioni fornite dalle relazioni precedenti.

Il nostro mandato è scansionare il reale codice sorgente del file **`src/App.tsx`** e dello store **`src/store/useCurriculumStore.ts`** per determinare con rigore matematico e scientifico che cosa sia stato **realmente implementato in codice** rispetto alle specifiche dichiarate come "completate" e "certificate" nei verbali del Secondo Cervello d'Istituto.

---

## 🧩 TAVOLO I: USABILITÀ, ONBOARDING E DE-GERGONIZZAZIONE LINGUISTICA (Verifica Reale)

L'usabilità e la riduzione del carico cognitivo sono state verificate analizzando l'Onboarding Wizard e la de-gergonizzazione terminologica nell'interfaccia utente.

### A. La Semplificazione del Wizard d'Onboarding
*   **La Dichiarazione**: *"Il sistema salta automaticamente il Passo 3 per i docenti generalisti dell'Infanzia e i Passi 2, 3, 4 per i ruoli di supervisione (Dirigente, Collegio, Amministratore), indirizzandoli al salvataggio rapido."*
*   **La Verifica del Codice**:
    Scansionando il codice di `src/App.tsx` (all'interno del blocco `showOnboardingModal`), la logica di salto è **reale e implementata correttamente**:
    ```typescript
    // In src/App.tsx (showOnboardingModal)
    {[1, 2, 3, 4].filter(num => {
      if (onboardingRole === 'dirigente' || onboardingRole === 'collegio' || onboardingRole === 'amministratore') {
        return num === 1;
      }
      if (onboardingOrd === 'infanzia' && num === 3) return false;
      if (onboardingIsSostegno && num === 3) return false;
      return true;
    }).map((num) => ( ... ))}
    ```
    *Esito d'Usabilità*: **CONFORME**. Il flusso di configurazione per i ruoli direttivi è ridotto a un solo passaggio reale, riducendo l'affaticamento e i clic a zero passaggi burocratici inutili.

### B. La De-gergonizzazione Linguistica e Terminologica
*   **La Dichiarazione**: *"Eradicazione totale del gergo tecnico e sistemistico dall'interfaccia, sostituito da eleganti termini didattici e amministrativi della scuola italiana."*
*   **La Verifica del Codice**:
    Il file `src/App.tsx` è stato scansionato alla ricerca di stringhe di testo. Le diciture tecniche sono state rimosse e sostituite con espressioni coerenti con le direttive d'Istituto:
    *   *Backup* ➔ **Copia di Sicurezza d'Istituto** (Rilevato in `App.tsx` a riga 1056 e 1618)
    *   *Restore* ➔ **Ripristina da Copia di Sicurezza** (Rilevato in `App.tsx` a riga 1625)
    *   *Clear localStorage* ➔ **Azzera Memoria d'Istituto** (Rilevato in `App.tsx` a riga 1032 e 1632)
    *   *SCORM Package* ➔ **Lezione Interattiva d'Istituto (LIM / E-learning)** (Rilevato in `App.tsx` a riga 1403)
    *   *IndexedDB* ➔ **Memoria Sicura Temporanea del Browser** (Rilevato in `App.tsx` a riga 5334)
    *   *JSON Schema* ➔ **Modello di Programmazione d'Istituto** (Rilevato in `App.tsx` a riga 6636)
    *   *Seating Chart* ➔ **Mappa Spaziale dei Banchi** (Rilevato in `App.tsx` a riga 5543)
    
    *Esito di De-gergonizzazione*: **CONFORME**. I bottoni di ripristino spiegano chiaramente che l'operazione rimuove le bozze locali per impedire a terzi di visionare i dati di classe quando si utilizza un computer d'aula condiviso, garantendo il pieno rispetto della privacy.

---

## 📜 TAVOLO II: ALLINEAMENTO NORMATIVO E DENSITÀ DEL CURRICOLO (Verifica Reale)

L'allineamento alle riforme nazionali e la reale consistenza del database curricolare sono stati sottoposti a verifica incrociata.

### A. Lacuna di Densità del Database del Curricolo (Mock Database)
*   **La Dichiarazione**: *"Il database curricolare d'istituto (curriculumKB.ts) è completo, denso e pronto all'uso operativo."*
*   **La Verifica del Codice**:
    L'analisi forense del file `src/data/curriculumKB.ts` conferma la presenza delle 14 discipline strutturate verticalmente. Tuttavia, confermiamo la presenza di un **grave gap di densità**:
    *   Ciascuna materia per ciascun anno scolastico dispone mediamente di **soli 2 traguardi e 2 obiettivi generali**.
    *   *Esempio*: La materia *Geografia* per la classe prima dispone dell'obiettivo *"Orientarsi nello spazio"*, ma non contiene alcun obiettivo specifico trimestrale o quadrimestrale relativo a fiumi, laghi o climi.
    *   *Fallacia Rilevata*: Spacciare questo database per un *"curricolo scolastico denso e completo"* costituisce una fallacia di rappresentazione. Si tratta in realtà di un **prototipo dimostrativo (mock dataset)** che non può essere utilizzato dai docenti per la programmazione reale senza una massiccia importazione manuale.
*   **La Soluzione (Hub Ibrido)**: L'Hub Ibrido per il PTOF integrato in `src/App.tsx` (con il Metodo A di generazione assistita con IA e il Metodo B di caricamento CSV conforme allo standard RFC 4180) è **reale e funzionante**. Esso consente alle commissioni dei dipartimenti di colmare la lacuna caricando file Excel formattati, estrapolandone i dati client-side in modo asincrono.

---

## 🔒 TAVOLO III: SICUREZZA D'ISTITUTO, GDPR E L'ILLUSIONE DELLA CRITTOGRAFIA RAM (Verifica Reale)

La sicurezza e la protezione dei dati degli alunni con bisogni speciali (PEI/PDP/DSA) sono state analizzate per evidenziare i limiti di compliance.

### A. La Fallacia del "Zero-Knowledge" e la Conservazione dei Dati
*   **La Dichiarazione**: *"Un Registro Cifrato Zero-Knowledge conforme alle linee guida di massima sicurezza GDPR per escludere qualsiasi violazione dei dati scolastici su server."*
*   **La Verifica del Codice**:
    La piattaforma non implementa alcun protocollo di crittografia a conoscenza zero (ZKP) in rete, per il semplice fatto che **non esiste alcuna trasmissione a server esterni**.
    *   La crittografia simmetrica client-side (AES-GCM) e il salvataggio dei dati su IndexedDB (Dexie.js) sono **reali ed operativi**. I dati dei minori sono effettivamente memorizzati unicamente sul dispositivo del docente.
    *   *Vulnerabilità Reale (PC d'Aula Condivisi)*: Poiché i docenti utilizzano computer d'aula condivisi senza account utente dedicati, se un docente non provvede a cliccare manualmente sul pulsante **"Azzera Memoria d'Istituto"** al termine della lezione, i dati scolastici rimarranno memorizzati nella cache locale del browser. Qualsiasi utente successivo (docente o studente) che acceda a quel browser potrà visionare le annotazioni di classe e gli esiti didattici in chiaro.
    *   *Fallacia Logica*: Presentare questo meccanismo come un sistema a conoscenza zero autosufficiente è una fallacia di sicurezza che rischia di indurre i docenti a comportamenti negligenti, violando le linee guida del GDPR sul trattamento dei dati dei minori.

---

## 📊 TAVOLO IV: GESTIONE DELLE INCONGRUENZE E DIVARIO "MOCK-TO-REALITY" (Matrice Forense)

Di seguito si riporta la matrice forense di allineamento che evidenzia le incoerenze riscontrate tra i documenti di specifica ed il reale codice sorgente operante nel sistema:

| Funzionalità Dichiarata | Presenza nei Documenti | Presenza Reale nel Codice | Natura della Incongruenza | Gravità |
| :--- | :---: | :---: | :--- | :---: |
| **Bypass Wizard Ruoli Direttivi** | Sì (v1.7) | **Sì (100%)** | Nessuna. Implementato in `src/App.tsx`. | Verde (Nessuna) |
| **De-gergonizzazione Linguistica** | Sì (v1.6) | **Sì (100%)** | Nessuna. Sostituzione dei termini gergali completata. | Verde (Nessuna) |
| **SCORM LocalZipPacker** | Sì (v2.0) | **Sì (100%)** | Nessuna. Compressore ZIP nativo in `App.tsx` funzionante. | Verde (Nessuna) |
| **Crittografia RAM AES-GCM** | Sì (v4.0) | **Sì (100%)** | Nessuna. Integrazione con Dexie.js in-browser funzionante. | Verde (Nessuna) |
| **Seating Chart Layouts** | Sì (v4.0) | **Sì (100%)** | Nessuna. Layout frontale, isole e cerchio visivamente attivi. | Verde (Nessuna) |
| **Parametrazione Oraria nel Gantt** | Sì (v5.0) | **No (0%)** | **Il budget orario non influenza il diagramma di Gantt**. Le barre rimangono fisse ed i calcoli sono simulati. | **ALTA** |
| **Buffer Coefficient nel Gantt** | Sì (v5.0) | **No (0%)** | **Assente nel codice**. Nessuna variabile di tolleranza oraria per il calendario reale. | **ALTA** |
| **Rimescolamento Pseudonimi d'Aula**| Sì (v5.0) | **No (0%)** | **La mappatura dei nomi è statica**. Cliccando sull'avatar non avviene alcun rimescolamento dinamico. | **ALTA** |
| **Algoritmo Gruppi Cooperativi** | Sì (v5.0) | **No (0%)** | **I gruppi generati sono fissi ed hardcoded**. L'algoritmo combinatorio è assente. | **ALTA** |
| **Vincoli Relazionali Gruppi** | Sì (v5.0) | **No (0%)** | **Assenti nel codice**. Nessuna gestione di esclusioni o deadlock relazionali. | **ALTA** |

---

## 🔎 TAVOLO V: VERIFICA DI DETTAGLIO DELLE ULTIME RICHIESTE FORMULATE (Cosa è Reale e Cosa è Mock?)

Un'indagine forense riga per riga del file `src/App.tsx` ha permesso di mappare con precisione millimetrica l'esatto stato delle ultime richieste d'aula:

### 1. Parametrazione dell'Orario Settimanale e Cronoprogramma di Gantt
*   *La Richiesta*: I docenti pluridisciplinari devono poter definire un impegno orario settimanale e vederne lo sviluppo temporale spalmarsi reattivamente nel diagramma di Gantt.
*   *La Realtà del Codice (Riga 5345-5421)*: Gli input di ore settimanali esistono visivamente nell'interfaccia (es. `weeklyHoursItaliano`). Tuttavia, modificando tali valori, **non viene innescata alcuna operazione di ricalcolo o ridisegno delle barre del Gantt**.
*   *La Realtà del Gantt (Riga 5542-5585)*: Il Diagramma di Gantt è **100% statico e mock**:
    - Disegna una barra fissa per "🌿 Il bosco e i suoi ritmi" che occupa sempre la colonna 3 (`col-span-3`).
    - Disegna una barra fissa per le UDA estemporanee iniettate ("15 ore") che occupano sempre la colonna 3 (`col-span-3`).
    - *Nessuna UDA reale* inserita in `savedUda` viene proiettata sul diagramma di Gantt, rendendo lo strumento inutile per il monitoraggio reale delle attività d'istituto.

### 2. Tema Pseudonimi e Rimescolamento d'Aula (Dynamic Pseudonymization)
*   *La Richiesta*: Il docente deve poter associare un tema (Scientists, Classico, Miti) per anonimizzare gli studenti e rimescolarli per evitare l'associazione indiretta e tutelarne la privacy.
*   *La Realtà del Codice (Riga 5590-5614)*: La funzione `getThemedStudentName` esegue una conversione statica rigida basata su una corrispondenza fissa memorizzata in un oggetto JavaScript (`st1` ➔ *Einstein*, `st2` ➔ *Curie*). 
    - **Non esiste alcuna funzione o pulsante per rimescolare gli pseudonimi** (Dynamic Pseudonymization) o per disaccoppiare l'identità visiva ad ogni avvio della lezione. Di conseguenza, il rischio di identificazione indiretta davanti alla classe sollevato dall'auditing è **reale e irrisolto**.

### 3. Compositore di Gruppi Cooperativi con Vincoli Relazionali
*   *La Richiesta*: Un sistema che stabilisce gruppi a seconda del tipo di lavoro, gestendo vincoli relazionali di esclusione ed evitando deadlock algoritmici.
*   *La Realtà del Codice (Riga 5615-5655)*: La funzione `handleGenerateCooperativeGroups` **non esegue alcun calcolo dinamico**. Essa si limita ad assegnare gruppi pre-compilati e statici scritti nel codice (hardcoded) per ciascun metodo cooperativo (Jigsaw, Peer Tutoring, Laboratorio):
    - I membri del *Gruppo Saggi A* e *Gruppo Saggi B* sono sempre gli stessi identificativi di default.
    - Non esiste alcuna variabile, interfaccia o algoritmo per inserire vincoli relazionali di esclusione o per risolvere deadlock algoritmici.

---

## 🏛️ CONCLUSIONI, VALIDAZIONE E RACCOMANDAZIONI DELLA COMMISSIONE TERZA

In qualità di **valutatore critico, obiettivo e imparziale**, questa Commissione attesta che l'ecosistema CurManLight v5.0-Ultimate presenta una **grave discrepanza tra la documentazione strategica ed il reale codice sorgente del software**:

1.  **Copertura Formale Elevata**: I verbali d'onboarding, le guide utente, i verbali d'audit, la de-gergonizzazione terminologica ed i layout visivi dell'Ambiente d'Aula sono implementati al 100% delle aspettative, garantendo un'ottima esperienza d'uso iniziale.
2.  **Incompletezza Funzionale d'Aula**: Le logiche di ricalcolo del Gantt tramite orario parametrico, l'algoritmo di composizione dei gruppi, i vincoli relazionali ed il rimescolamento dinamico degli pseudonimi sono **interamente simulati (mocked)** nel codice React reale, non offrendo alcuna capability operativa reale d'aula.

### Dispositivo di Raccomandazione Obbligatoria (Azione Correttiva)
Al fine di colmare questo divario "Mock-to-Reality" prima del roll-out generale del 1 Settembre 2026, la Commissione **impone al team di sviluppo di sostituire le logiche simulate in `src/App.tsx` con calcoli algoritmici reali**. Le ore settimanali e i coefficienti di tolleranza devono influenzare visivamente e matematicamente la larghezza del diagramma di Gantt, e i gruppi cooperativi devono essere generati mediante funzioni combinatorie reali che tengano conto delle esclusioni e del rimescolamento dinamico degli pseudonimi.

---
*Rapporto di audit forense e verifica reale delle incongruenze d'Istituto convalidato e registrato.*  
**I.C. Calvario-Covotta «don Lorenzo Milani» — Ariano Irpino (AV)**  
*La Commissione di Audit di Terza Parte per l'Integrità del Software d'Istituto*  
*Ariano Irpino, 16 Luglio 2026*  
*(Sottoscritto con firma digitale certificata dal Presidente della Commissione d'Audit)*  
*Codice di Registrazione: MILANI-AUDIT-FORENSE-V50*
