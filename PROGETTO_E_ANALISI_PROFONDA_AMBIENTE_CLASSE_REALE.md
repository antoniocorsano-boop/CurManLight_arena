# STUDIO DI FATTIBILITÀ E CO-PROGETTAZIONE DELL'AMBIENTE CLASSE REALE
## Pipeline d'Uso, Algoritmo Calendario d'Aula e Verbalizzazione Giornaliera
**Istituto Comprensivo Calvario-Covotta "don Lorenzo Milani" - AVIC849003**
**Data di Rilevazione: 18 Luglio 2026**
**Codice Progetto: OIV-PRJ-2026-905**

---

### INTRODUZIONE ED OBIETTIVI DELL'ANALISI

La presente analisi d'uso approfondita, redatta in qualità di Organo di Valutazione Indipendente (OIV), definisce i requisiti funzionali, l'architettura d'interfaccia e i flussi d'interazione per la transizione dalla programmazione annuale astratta all'operatività quotidiana d'aula.

In classe, l'insegnante opera in condizioni di tempo limitato e alto carico d'attenzione. L'applicazione deve pertanto sradicare le pagine verticalmente ridondanti ("lunghe chilometri") in favore di un **Ambiente d'Aula Isolato, Immersivo e Focalizzato (Classroom Hub)**, strutturato su pipeline rapide che riducano a zero la latenza decisionale.

---

### PILLOLA 1: PIPELINE DI ADATTAMENTO ALLA CLASSE E DOCUMENTO FORMALE

La programmazione annuale d'Istituto non può essere applicata ciecamente, ma deve essere declinata sulle caratteristiche specifiche di ciascuna classe.

#### 1. Inserimento dei Parametri di Struttura (Impostazioni)
Per abilitare l'algoritmo di calcolo automatico, il Centro di Configurazione d'Istituto acquisisce tre variabili essenziali (salvate in modo asincrono nello *Spazio di Memorizzazione d'Aula*):
*   **Divisione Periodica dell'Anno Scolastico**: Selezione del modello di ripartizione temporale della scuola (Trimestri, Quadrimestri, o Pentamestri).
*   **Budget Orario Settimanale della Disciplina**: Le ore effettive assegnate alla materia nella classe target (es. 5 ore settimanali per Italiano alla Primaria, ai sensi del DPR 275/1999).
*   **Calendario Scolastico d'Istituto**: Le date esatte di inizio e termine delle lezioni d'area, comprensive dei giorni di festività e sospensione deliberati dal Consiglio d'Istituto.

#### 2. Generazione del Documento Formale di Programmazione d'Aula
Tramite l'unione dei parametri sopra descritti e delle UDA caricate, l'applicazione compila il **Documento Formale di Programmazione di Classe**, esportabile nei formati d'ufficio standard (.docx e PDF). Questo documento non è statico, ma integra:
*   **Soglie Periodiche di Controllo**: Le date limite (milestones) corrispondenti al termine di ciascun periodo (es. fine del Primo Quadrimestre al 31 Gennaio).
*   **Percentuale di Avanzamento Attesa**: La soglia teorica di obiettivi del curricolo che la classe dovrebbe aver acquisito in quel momento (es. 40% entro il primo trimestre).

---

### PILLOLA 2: L'ALGORITMO CALENDARIO D'AULA E SCALETTA DELLE UDA

Una volta approvato il documento formale, il docente ha bisogno di un assistente di navigazione temporale che traduca le scadenze astratte in una pianificazione quotidiana.

#### 1. Funzionamento dell'Algoritmo Calendario
L'algoritmo incrocia il monte ore totale dell'UDA con il budget orario settimanale e le date reali delle lezioni. 
*   *Esempio*: Se un'UDA di Italiano ha un monte ore stimato di 20 ore e la disciplina ha un budget di 5 ore settimanali, l'algoritmo distribuisce automaticamente il piano delle lezioni su un arco di **4 settimane reali**, escludendo dal conteggio i giorni festivi memorizzati nel calendario d'Istituto.
*   **Tolleranza Calendario (Buffer)**: Per prevenire la "regressivizzazione" del piano a causa di eventi imprevisti (es. assemblee, scioperi, malattie), il docente può impostare una percentuale di tolleranza (es. 10% di ore cuscinetto). L'algoritmo ri-allinea automaticamente le lezioni successive dilazionandole in modo non bloccante.

#### 2. Visualizzazione della Scaletta Temporale (Lezioni Sequenziali)
L'insegnante non visualizza una griglia caotica, ma un **Diagramma di Gantt Semplificato d'Aula** che mostra la successione lineare delle lezioni raggruppate per UDA attiva, evidenziando graficamente:
*   La lezione del giorno corrente (Lezione Attiva).
*   Il progresso rispetto al monte ore dell'UDA (es. "Lezione 3 di 10 - 30% completato").
*   La vicinanza alla soglia periodica del quadrimestre.

---

### PILLOLA 3: L'AMBIENTE CLASSE ISOLATO ED IMMERSIVO

Quando l'insegnante varca la soglia dell'aula ed accede al tablet d'aula, il sistema deve entrare in modalità **Ambiente Classe Dedicato (Classroom Hub)**. Questo è un sotto-ambiente interamente isolato dal resto dell'applicazione.

#### 1. Architettura dell'Interfaccia d'Aula (Focalizzazione UX)
L'Ambiente Classe si presenta come una schermata ad alto contrasto (ottimale per la proiezione su lavagne interattive o per l'uso sotto la luce solare d'aula), strutturata in tre soli pannelli raggiungibili in un clic:

```text
+-----------------------------------------------------------------------------+
|                          AMBIENTE CLASSE ISOLATO                            |
+-----------------------------------------------------------------------------+
|  PANNELLO A: SCALETTA             |  PANNELLO B: PROIEZIONE E RISORSE       |
|  - Lezione del giorno attiva      |  - Visualizza obiettivi per la LIM      |
|  - Traguardo curricolare associato|  - Avvia il timer della lezione         |
|  - Compito di realtà corrente     |  - Pulsante rapido "PTOF Hub"           |
+-----------------------------------|-----------------------------------------+
|                          PANNELLO C: COMPOSITORE                            |
|  - Visualizzazione banchi (Scientists/Classico) e gruppi cooperativi Jigsaw |
+-----------------------------------------------------------------------------+
```

*   **Pannello A: La Scaletta Quotidiana**: Mostra gli argomenti esatti da trattare oggi, i concetti chiave del curricolo associati e l'attività specifica dell'UDA corrente.
*   **Pannello B: Strumenti di Supporto LIM**: Un solo pulsante consente di proiettare sulla Lavagna Interattiva d'Istituto gli obiettivi della lezione in caratteri ad alta leggibilità, oppure di avviare il timer d'attività per i lavori di gruppo.
*   **Pannello C: Composizione Spaziale**: Mostra la mappa dei banchi (Isole, Circle o Frontale) e permette di attivare il raggruppamento cooperativo Jigsaw o il rimescolamento degli pseudonimi d'aula in totale conformità al GDPR d'Istituto.

---

### PILLOLA 4: PIPELINE DI VERBALIZZAZIONE E REPORT GIORNALIERI

A fine giornata, o negli ultimi 5 minuti della lezione, l'insegnante deve poter registrare l'andamento delle attività. La pipeline di verbalizzazione è progettata per completarsi in **tre soli passaggi (3-Click Flow)**:

```text
  +------------------+      +------------------+      +------------------+
  |  1. STATO UDA    | ---> |  2. OSSERVAZIONI | ---> |  3. CONFERMA     |
  |  (Seleziona ore  |      |  (Filtro GDPR    |      |  (Salvataggio    |
  |  svolte oggi)    |      |  Sintetizzatore) |      |  Banca Dati)     |
  +------------------+      +------------------+      +------------------+
```

*   **Passaggio 1: Consuntivazione delle Ore (Stato UDA)**:
    Il docente conferma con un clic se le ore programmate per oggi sono state svolte o se sono state rimandate (aggiornando automaticamente l'algoritmo del calendario per le settimane successive).
*   **Passaggio 2: Osservazione Didattica Qualitativa (Sostegno/BES)**:
    Il docente registra l'andamento del lavoro cooperativo e gli esiti degli alunni. Per supportare la compilazione, il sistema mette a disposizione la **Gemma del Co-pilota d'Istituto**, che suggerisce un descrittore qualitativo conforme al D.M. 14/2024 e protetto dal filtro di mascheramento GDPR (GDPR Shield).
*   **Passaggio 3: Salvataggio e Allineamento Asincrono**:
    Con il clic finale, il verbale giornaliero viene memorizzato nel *Database Locale Protetto del Browser* (Spazio di Memorizzazione d'Aula). Se è presente la rete, il connettore invia asincronamente la copia di sicurezza sul cloud Google Drive (scolastico o personale, con fallback automatico); altrimenti, accoda la richiesta per eseguirla in background non appena il dispositivo si ricollegherà alla LAN della scuola.

---

### VALUTAZIONE DI COMPATIBILITÀ E CONCLUSIONI (OIV)

Questa architettura d'uso per l'Ambiente Classe e la Verbalizzazione Giornaliera risponde perfettamente alla filosofia di **CurManLight v5.0**:
1.  **È semplice e non invasiva**: Non costringe il docente a leggere manuali o a perdersi in configurazioni complesse; l'applicazione si adatta al contesto d'aula in tempo reale.
2.  **È focalizzata e compatta**: Evita pagine lunghe chilometri tramite l'uso di pannelli a scheda isolati e flussi verticali guidati a tre passaggi.
3.  **È resiliente**: Sfrutta la stabilità offline-first dei database locali e l'automazione dei connettori cloud per garantire che nessun dato didattico d'aula vada mai perduto.

Il presente studio costituisce la linea d'indirizzo tecnica ufficiale d'Istituto per lo sviluppo e l'omologazione delle prossime sotto-aree della plancia di classe d'aula.
