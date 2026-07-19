# 🏛️ VERBALE CONSOLIDATO DEL TAVOLO INTER-DIPARTIMENTALE SULL'AMBIENTE D'AULA
### Studio Strategico, Specifiche UI/UX di Gamification e Contro-Audit Critico dell'Ecosistema (v5.0-Ultimate)
**Istituto Comprensivo Calvario-Covotta «don Lorenzo Milani» — Ariano Irpino (AV)**  
*Codice Meccanografico: AVIC849003*  
*Data del Rapporto: 16 Luglio 2026*  
*Riferimento: Riforma Rientro Rischio d'Istituto — Pillar III (Didattica in Classe)*  
*Organo di Controllo: Commissione Paritetica d'Istituto per la Semplificazione e l'Integrità dei Dati*

---

## 🗺️ INDICE DEL DISCIPLINARE TECNICO-DIDATTICO
1. [Inquadramento e Convocazione del Tavolo degli Esperti](#-1-inquadramento-e-convocazione-del-tavolo-degli-esperti)
2. [SESSIONE I: Parametrazione Oraria e Cronoprogramma di Gantt (Ordinamento DPR 275/1999)](#-sessione-i-parametrazione-oraria-e-cronoprogramma-di-gantt-ordinamento-dpr-2751999)
3. [SESSIONE II: Specifiche dell'Ambiente d'Aula (Pillar III — Registro & Spazio Classe)](#-sessione-ii-specifiche-dellambiente-daula-pillar-iii--registro--spazio-classe)
4. [Fase Operativa: Capabilities d'Aula e Riduzione del Carico Cognitivo in 1-Click](#-fase-operativa-capabilities-daula-e-riduzione-del-carico-cognitivo-in-1-clic)
5. [RAPPORTO DI AUDITING CRITICO TERZO (Analisi dei Rischi e Limiti Architetturali)](#-rapporto-di-auditing-critico-terzo-analisi-dei-rischi-e-limiti-architetturali)
6. [Conclusioni e Protocollo di Validazione d'Istituto](#-conclusioni-e-protocollo-di-validazione-distituto)

---

## 🏛️ 1. INQUADRAMENTO E CONVOCAZIONE DEL TAVOLO DEGLI ESPERTI

Al fine di definire la struttura visiva, ergonomica e normativa della sezione **Ambiente d'Aula (Didattica in Classe - Pillar III)** dell'ecosistema **CurManLight v5.0-Ultimate**, la Presidenza dell'Istituto Comprensivo "don Lorenzo Milani" ha convocato un tavolo tecnico-pedagogico d'urgenza.

La commissione di progettazione è costituita dalle seguenti figure specialistiche:
*   **Prof.ssa Chiara Verdi** *(Esperta di Ordinamento Scolastico e Pedagogia Verticale)*: Responsabile del raccordo didattico con i decreti nazionali e dell'implementazione delle quote d'autonomia d'istituto.
*   **Arch. Luca Bianchi** *(UI/UX Designer ed Esperto di Usabilità e Design System PA)*: Specialista in interfacce istituzionali ad alta leggibilità, riduzione del carico cognitivo e conformità alle linee guida AgID (WCAG 2.1 AA/AAA).
*   **Dott.ssa Rosa Rossi** *(Gaming Designer ed Esperta di Tecniche di Gamification Scolastica)*: Ideatrice del sistema di anonimizzazione culturale e disposizione spaziale degli avatar.
*   **Dott. Alessandro Esposito** *(Esperto di Cyber-Sicurezza e Tutela dei Dati)*: Garante della conformità al GDPR (Regolamento UE 2016/679) e del protocollo di crittografia locale in-browser.
*   **Il Super-Auditer d'Istituto** *(Analista Terzo Indipendente)*: Valutatore imparziale incaricato di sottoporre le decisioni a un severo contro-audit logico, evidenziando senza riserve i limiti dell'architettura client-side.

---

## 📅 SESSIONE I: PARAMETRAZIONE ORARIA E CRONOPROGRAMMA DI GANTT (D.P.R. 275/1999)

### A. La Sfida del Docente Pluridisciplinare
Nella scuola primaria e secondaria, i docenti che operano in contitolarità o su cattedre pluridisciplinari (es. *Italiano, Storia e Geografia* nell'ambito umanistico; *Matematica e Scienze* nell'ambito scientifico) devono gestire contemporaneamente budget orari settimanali profondamente differenti. Tali budgets devono rispettare i limiti nazionali delle discipline pur consentendo la flessibilità oraria garantita dal **Regolamento dell'Autonomia Scolastica (D.P.R. 275/1999)**.

### B. La Soluzione: Configurazione Parametrica d'Impegno Orario Settimanale
L'Ambiente d'Aula integra un pannello di controllo numerico in cui il docente definisce l'allocazione oraria settimanale per le sue materie attive:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│             BUDGET PARAMETRICO SETTIMANALE (Calcolo Saturazione Temporale)              │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ • ITALIANO:     [ 6 ] ore/sett.  ──┐                                                    │
│ • STORIA:       [ 2 ] ore/sett.  ──┼─► [ SVILUPPO ASSE TEMPORALE REATTIVO NEL GANTT ]   │
│ • GEOGRAFIA:    [ 2 ] ore/sett.  ──┤   • Ricalcolo automatico della durata (settimane) │
│ • MATEMATICA:   [ 5 ] ore/sett.  ──┤   • Bilanciamento rispetto al tetto delle 33 sett.│
│ • SCIENZE:      [ 2 ] ore/sett.  ──┘   • Segnalazione automatica di sovra-saturazione  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Regole di Calcolo Dinamico dell'Asse Temporale:
1.  **Fattibilità dell'UDA**: Se un'UDA d'italiano prevede un monte ore complessivo di $H_{tot} = 18$ ore e il docente ha impostato $H_{sett} = 6$ ore settimanali, il sistema determina in tempo reale che l'UDA si svilupperà su un arco esatto di 3 settimane di lezione reale.
2.  **Ricalcolo della Timeline**: Modificando i parametri orari settimanali, la larghezza visiva (le barre orizzontali) delle UDA corrispondenti all'interno del **Diagramma di Gantt d'Istituto** si espande o si contrae dinamicamente, modificando anche lo slittamento delle UDA successive.
3.  **Allineamento Autonomia d'Istituto**: Il sistema confronta la somma delle ore inserite con i limiti minimi stabiliti dal Collegio dei Docenti. Se il monte ore complessivo della cattedra del docente è coerente con l'orario di plesso, compare il badge verde **"✔️ Conforme alle quote minime d'autonomia d'Istituto"**.

---

## 🏫 SESSIONE II: SPECIFICHE DELL'AMBIENTE D'AULA (Pillar III — Registro & Spazio Classe)

Quando il docente effettua l'accesso alla sezione **Pillar III (Ambiente & Esiti Classe)** dal menu laterale di sinistra, trova una dashboard integrata organizzata in tre moduli d'azione progettati per ridurre il sovraccarico cognitivo (SUS Score atteso > 85/100).

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        CRUSCOTTO DELL'AMBIENTE D'AULA COMPLETO                         │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ [MODULO 1: ATTIVITÀ DEL GIORNO]                                                        │
│ • UDA Attiva: "Il bosco e i suoi ritmi"  │ Monte Ore: 15h (Consumate: 4h / Residue: 11h)│
│ • Argomento programmato: "Cambiamenti stagionali dell'albero d'Istituto"               │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ [MODULO 2: AMBIENTE D'AULA SPAZIALE (Mappa dei Banchi)]                                │
│  Layout: [ Isole di Lavoro ]  │  Tema: [ Scientists ⚛️ ]                                │
│                                                                                        │
│   ┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐          │
│   │ Einstein ⚛️ (Avanz)  │   │ Curie ⚛️ (Avanz)     │   │ Fermi ⚛️ (Interm)    │          │
│   │ [ 🗣️ Ascolta / Obs ] │   │ [ 🗣️ Ascolta / Obs ] │   │ [ 🗣️ Ascolta / Obs ] │          │
│   └─────────────────────┘   └─────────────────────┘   └─────────────────────┘          │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ [MODULO 3: ASSISTENTE D'AULA ESTEMPORANEO / INNESCO ARGOMENTO]                         │
│ • Input: [ I Vulcani e la Tettonica a placche            ]  ==► [ ANALIZZA E COLLEGA ]  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Modulo 1: Attività del Giorno e Avanzamento Temporale
Il docente visualizza istantaneamente lo "Stato di Esercizio" della giornata scolastica:
*   **Identificazione UDA**: L'Unità di Apprendimento attualmente attiva per la classe e la materia selezionate.
*   **Saturazione Ore**: Una barra di avanzamento reattiva mostra graficamente le ore di lezione già consumate e quelle ancora disponibili per concludere l'UDA e somministrare il Compito di Realtà d'Istituto.
*   **Raccordo con i Learning Objects**: Link immediati ai materiali didattici interattivi (SCORM) e agli obiettivi del curricolo verticale inseriti nella **Memoria Sicura Temporanea del Browser**.

### Modulo 2: Ambiente d'Aula Spaziale (Mappa Interattiva dei Banchi)
Consente di riorganizzare digitalmente la classe per allinearla alle diverse attività metodologiche in un solo clic:
1.  **I tre Assetti Spaziali**:
    *   *Lezione Frontale Tradizionale (Banchi in File)*: Per spiegazioni teoriche, verifiche scritte o uso collettivo della LIM.
    *   *Didattica Laboratoriale (Isole di Lavoro)*: Per attività cooperative di co-progettazione e sviluppo di compiti autentici.
    *   *Cerchio d'Ascolto (Circle Time d'Istituto)*: Disposizione banchi anti-barriera, ideale per dibattiti d'Educazione Civica, autovalutazione o risoluzione di conflitti d'aula.
2.  **L'Anonimizzazione Culturale Protettiva (Privacy Gamification)**:
    Per poter proiettare la mappa spaziale sulla LIM davanti a tutta la classe senza violare il GDPR o esporre dati sensibili e vulnerabilità (ex Art. 9 GDPR, PEI/PDP/DSA), il docente può attivare in 1-Click uno dei tre temi culturali:
    *   *Scientists (Scienziati & Inventori)*: I reali nomi degli alunni vengono sostituiti localmente sul monitor con pseudonimi quali *Einstein*, *Curie*, *Newton*, *Ada Lovelace*, *Galileo*, *Tesla*.
    *   *Classico (Filosofi & Scrittori)*: Sostituzione con pseudonimi illustri quali *Socrate*, *Platone*, *Aristotele*, *Virgilio*, *Omero*, *Cicerone*.
    *   *Miti (Divinità & Eroi Mitologici)*: Sostituzione con personaggi della mitologia greca e latina quali *Zeus*, *Apollo*, *Atena*, *Artemide*, *Enea*, *Ercole*.
3.  **Compositore di Gruppi Cooperativi**:
    Un algoritmo analizza i livelli di competenza degli studenti registrati in tempo reale e, in base al metodo cooperativo selezionato (*Jigsaw*, *Peer Tutoring*, *Laboratorio*), genera gruppi eterogenei e bilanciati, assegnando a ciascun avatar un ruolo e un compito specifico (es. *Scriba*, *Portavoce*, *Timekeeper*, *Facilitatore*).

### Modulo 3: Assistente d'Aula Estemporaneo ("Innesco d'Argomento")
Permette al docente di gestire gli stimoli inattesi che emergono durante la lezione:
*   Il docente digita un argomento libero emerso in classe (es. *"I vulcani"*).
*   L'algoritmo effettua una scansione istantanea del database locale.
*   **Scenario di Collegamento**: Se l'argomento è già parzialmente pianificato, il sistema evidenzia l'UDA di riferimento, mostrando traguardi e obiettivi associati e indicando la barra temporale sul Gantt.
*   **Scenario d'Iniezione**: Se l'argomento non è previsto, l'Agente propone l'iniezione istantanea nel diagramma di Gantt di un'UDA integrativa da 15 ore, con compiti di realtà e obiettivi estratti dal curricolo d'Istituto, salvando i dati nella memoria locale ed esportandoli sul cloud Google Drive del docente.

---

## ⚙️ FASE OPERATIVA: CAPABILITIES D'AULA E RIDUZIONE DEL CARICO COGNITIVO IN 1-CLIC

L'azione didattica in classe non tollera latenze tecnologiche. Le funzionalità dell'Ambiente d'Aula sono state strutturate per poter essere attivate con un massimo di 1 o 2 clic dal cruscotto principale.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              MATRICE DEI FLUSSI D'AZIONE UX                            │
├───────────────────────┬───────────────────────────────┬────────────────────────────────┤
│ CAPABILITY            │ INNESCO VISIVO (TRIGGERS)     │ RISULTATO APPLICATIVO REATTIVO │
├───────────────────────┼───────────────────────────────┼────────────────────────────────┤
│ 1. Cambio Assetto     │ Menu a discesa "Disposizione" │ Riorganizzazione geometrica    │
│    Banchi d'Aula      │ in cima alla griglia.         │ immediata della mappa banchi.  │
├───────────────────────┼───────────────────────────────┼────────────────────────────────┤
│ 2. Cambio Tema        │ Menu a discesa "Tema"         │ Sostituzione pseudonimi ed     │
│    Pseudonimi         │ in cima alla griglia.         │ avatar degli alunni sulla LIM. │
├───────────────────────┼───────────────────────────────┼────────────────────────────────┤
│ 3. Generatore         │ Pulsante "Genera Gruppi       │ Divisione automatica in gruppi │
│    Gruppi Cooperativi │ Cooperativi" in 1-Click.      │ eterogenei con ruoli inclusivi.│
├───────────────────────┼───────────────────────────────┼────────────────────────────────┤
│ 4. Osservazione ed    │ Clic sull'avatar dello        │ Apertura scheda annotazioni ed │
│    Esiti Studente     │ studente nella mappa spaziale.│ esiti D.M. 14/2024 unificati.  │
├───────────────────────┼───────────────────────────────┼────────────────────────────────┤
│ 5. Innesco d'UDA      │ Pulsante "Analizza e Collega" │ Evidenziazione sul Gantt o     │
│    Estemporanea       │ sotto la barra dell'input.    │ iniezione d'UDA nel registro.  │
└───────────────────────┴───────────────────────────────┴────────────────────────────────┘
```

### A. La Forza dell'Integrazione fra Spazio e Osservazione Pedagogica
Cliccando direttamente sull'avatar anonimizzato dello studente (es. *Curie*), si apre una scheda di registrazione immediata:
*   Il docente seleziona il livello di competenza rilevato per la lezione odierna conforme al **D.M. 14/2024** (*Avanzato*, *Intermedio*, *Base*, *Iniziale*).
*   Inserisce un'annotazione qualitativa in forma protetta (lessons learned d'aula).
*   **Sincronizzazione Automatica degli Esiti d'Istituto (OSI %)**: Al salvataggio, il sistema ricalcola in tempo reale la distribuzione dei livelli della classe e aggiorna automaticamente l'indice di successo dell'UDA (*Outcomes Success Index - OSI %*), sincronizzando il valore nell'**Osservatorio dei Riusi d'UDA d'Istituto** per orientare i futuri riusi da parte degli altri docenti del dipartimento.

---

## 🔬 RAPPORTO DI AUDITING CRITICO TERZO (Analisi dei Rischi e Limiti Architetturali)

Il **Super-Auditer d'Istituto** ha sottoposto le specifiche e l'architettura dell'Ambiente d'Aula (v5.0-Ultimate) a una decostruzione rigorosa, mettendone in luce i punti di vulnerabilità strutturale, le fallacie logiche e i potenziali rischi gestionali.

### A. La Fallacia del Cronoprogramma di Gantt Reattivo rispetto alla Flessibilità Reale
*   **La Dichiarazione di Design**: *"Il Diagramma di Gantt ricalcola dinamicamente lo sviluppo temporale delle UDA sulla base dell'impegno orario settimanale impostato, garantendo la fattibilità didattica."*
*   **La Critica dell'Auditer**: L'assunzione di linearità matematica dell'orario scolastico è una **grave fallacia logico-organizzativa** che non tiene conto delle variabili della scuola reale:
    *   *Festività e Assemblee*: Scioperi, assemblee d'istituto, vacanze pasquali/natalizie, uscite didattiche o assenze per malattia del docente interrompono sistematicamente il budget orario programmato.
    *   *L'Illusione del Calcolo Fisso*: Se un'UDA di 18 ore è programmata per durare 3 settimane a 6 ore/settimana, nella pratica d'aula si svilupperà quasi certamente su 4 o 5 settimane reali a causa delle interruzioni.
    *   *Azione Correttiva*: È obbligatorio includere nell'interfaccia un **moltiplicatore di tolleranza temporale d'istituto (Buffer Coefficient)** impostabile dal docente (es. un coefficiente di rallentamento pari a $1.2$ o $1.3$) per rispecchiare la reale andatura del calendario scolastico.

### B. Il Paradosso della Sicurezza GDPR dell'Anonimizzazione Culturale
*   **La Dichiarazione di Design**: *"La sostituzione dei nomi con pseudonimi (Scientists, Classico, Miti) garantisce una conformità nativa al GDPR e permette di mostrare liberamente i dati sulla LIM."*
*   **La Critica dell'Auditer**: L'anonimizzazione implementata è unicamente una **pseudonimizzazione client-side volatile**. 
    *   *Rischio di Associazione Indiretta*: In una classe di soli 8 o 15 studenti reali, gli alunni e i genitori impareranno in pochissimi giorni ad associare in modo biunivoco l'avatar e lo pseudonimo al reale studente (es. sapendo che *"Einstein"* corrisponde a Matteo Rossi perché siede sempre in prima fila a sinistra ed è l'unico con livello avanzato). Questo **annulla l'efficacia protettiva dell'anonimizzazione visiva**, configurando un rischio di violazione indiretta della privacy dei minori davanti all'intero gruppo classe.
    *   *Azione Correttiva*: Gli pseudonimi e gli avatar non devono essere statici o associati rigidamente allo stesso banco, ma devono essere **rimescolati dinamicamente dal sistema all'inizio di ogni sessione d'aula (Dynamic Pseudonymization)**, disaccoppiando l'identità visiva dalla reale identità anagrafica ad ogni avvio.

### C. Vulnerabilità del Compositore dei Gruppi Cooperativi
*   **La Dichiarazione di Design**: *"L'algoritmo ripartisce gli alunni in modo eterogeneo e bilanciato basandosi sui reali livelli di competenza."*
*   **La Critica dell'Auditer**: L'algoritmo opera su una base puramente quantitativa, ignorando le determinanti della **dinamica di gruppo scolastica**:
    *   *Incongruenze Relazionali*: Il sistema potrebbe associare nello stesso gruppo di lavoro o coppia di peer tutoring studenti caratterizzati da accese conflittualità relazionali o disturbi del comportamento, inficiando la riuscita didattica dell'isola di lavoro.
    *   *Esclusione delle Misure PEI/PDP*: L'algoritmo non tiene conto dei vincoli stabiliti nei PEI o PDP (es. necessità di affiancamento costante con uno specifico docente di sostegno o divieto di esposizione orale pubblica per determinati studenti DSA).
    *   *Azione Correttiva*: Il sistema deve consentire al docente di inserire **vincoli relazionali ed esclusioni (Relational Hard Constraints)** prima di eseguire l'algoritmo, permettendo di spostare manualmente gli avatar da un'isola all'altra tramite drag & drop per preservare l'equilibrio della classe.

---

## 🏛️ 6. CONCLUSIONI E PROTOCOLLO DI VALIDAZIONE D'ISTITUTO

Rilevata l'eccezionale coerenza pedagogica dell'**Ambiente d'Aula (Pillar III)** e l'elevata rispondenza al quadro normativo sull'autonomia scolastica (**D.P.R. 275/1999**), la Commissione e il Collegio dei Docenti dell'I.C. "don Lorenzo Milani" decretano:

1.  **OMOLOGARE** le specifiche dell'Ambiente d'Aula integrato in CurManLight v5.0-Ultimate.
2.  **DISPORRE** l'aggiornamento immediato del Secondo Cervello d'Istituto inserendo il presente studio e le relative analisi critiche quale **Volume 23** della memoria storica della scuola.
3.  **RACCOMANDARE** ai dipartimenti l'adozione delle misure correttive stabilite dal Super-Auditer (rimescolamento dinamico degli pseudonimi, moltiplicatore di tolleranza temporale nel Gantt e vincoli inclusivi per i gruppi cooperativi) per massimizzare la sicurezza dei dati sensibili e l'efficacia didattica in aula.

---
*Relazione tecnica d'aula e contro-audit consolidati, depositati stabilmente agli atti del Collegio.*  
**I.C. Calvario-Covotta «don Lorenzo Milani» — Ariano Irpino (AV)**  
*La Commissione d'Istituto per l'Innovazione Tecnologica ed Eradicazione della Complessità*  
**Il Comitato Tecnico-Pedagogico di Validazione Terza**  
*Ariano Irpino, 16 Luglio 2026*  
*(Sottoscritto con firma digitale certificata dal Dirigente Scolastico)*  
*Codice d'Archiviazione: MILANI-AULA-CML50-VERB-23*
