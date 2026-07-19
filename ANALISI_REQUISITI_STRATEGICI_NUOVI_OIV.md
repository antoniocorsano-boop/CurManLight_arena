# INDAGINE CRITICA E STUDIO DI FATTIBILITÀ SUI REQUISITI STRATEGICI DI EVOLUZIONE TECNOLOGICA
**Ecosistema CurManLight (v5.0-Ultimate Gold Edition)**
**Istituto Comprensivo Calvario-Covotta "don Lorenzo Milani" - AVIC849003**
**Data di Rilevazione: 18/07/2026**
**Codice Studio: OIV-REQ-2026-501 (Stato: Approvato in Giunta)**
**Organo di Valutazione Indipendente (OIV)**

---

### INTRODUZIONE ED INQUADRAMENTO NORMATIVO

Il presente studio di fattibilità analizza i requisiti strategici di evoluzione tecnologica proposti per l'ecosistema CurManLight. L'indagine valuta l'impatto tecnico, l'usabilità d'aula, il carico di manutenzione per la segreteria e la conformità legale ed amministrativa (con particolare riguardo al Codice dell'Amministrazione Digitale, alle direttive AgID sull'accessibilità ed al Regolamento UE 2016/679 - GDPR) delle sei nuove priorità di sviluppo d'Istituto.

---

### TABELLA SINOTTICA DI FATTIBILITÀ E COERENZA ARCHITETTURALE (OIV)

| Priorità Strategica | Complessità Tecnica | Impatto GDPR / Privacy | Sostenibilità d'Aula (HCI) | Proposta di Remediation / Soluzione Consigliata |
| :--- | :--- | :--- | :--- | :--- |
| **1. Integrazione Registro Elettronico** | **ALTA**<br>(Silos chiusi, assenza di API pubbliche standard) | **CRITICA**<br>(Trattamento dati personali minori, ex Art. 9) | **OTTIMA**<br>(Sincronizzazione immediata delle presenze) | **Bypass via Esportazione ODF/CSV**: Sviluppare un modulo d'importazione asincrono che carichi i dati anagrafici esportati in formato standard dal registro ufficiale, escludendo rischi di violazione della sicurezza. |
| **2. Connettori Editorial per Libri di Testo** | **MEDIA**<br>(Assenza di API unificate dei grandi editori) | **NULLA**<br>(Dati bibliografici e didattici non personali) | **BUONA**<br>(Suggerimento di percorsi basati sul libro adottato) | **Raccordo via Codice ISBN-13**: Il Co-pilota interroga cataloghi aperti ed archivi editoriali indicizzando i nuclei tematici in base al codice a barre del libro, raccordandoli alle UDA. |
| **3. Collaborazione & Area Discussione** | **MEDIA**<br>(Mantenimento della filosofia serverless) | **BASSA**<br>(Trattamento limitato a opinioni metodologiche) | **ECCELLENTE**<br>(Co-progettazione inter-plesso in tempo reale) | **Bacheca asincrona su Drive d'Istituto**: Scrittura e lettura di un file JSON comune ospitato sulla cartella condivisa di Google Drive d'Istituto, salvaguardando il modello a zero costi e zero server intermedi. |
| **4. Propositore di Idee d'Attualità (IA)** | **BASSA**<br>(Richiede connettività internet asincrona) | **NULLA**<br>(Dati pubblici di cronaca e ricerca scientifica) | **ECCELLENTE**<br>(Integrazione della didattica con fatti reali) | **Pipeline di Retrieval Asincrono**: Quando il tablet è connesso alla rete scolastica, l'Agente memorizza notizie storiche e scoperte reali in cache locale, mostrandole offline durante la lezione. |
| **5. KB Personale Multi-Device** | **MEDIA**<br>(Estrazione testo in-browser e RAG locale) | **BASSA**<br>(Dati ad esclusivo uso del docente sul suo Drive) | **OTTIMA**<br>(Secondo Cervello personalizzato sul proprio stile) | **RAG in-browser su Cartella Riservata**: Sincronizzazione asincrona della cartella `CurManLight_KB_Personale` di Drive. Il sistema indicizza localmente i file in IndexedDB senza trasmettere dati a server IA esterni. |

---

### ANALISI METODOLOGICA E DISGIUNZIONE DEI REQUISITI

#### AREA 1: Interazione con il Registro Elettronico Ufficiale (Argo, Axios, ClasseViva, Nuvola)
*   *Valutazione dei Fatti*: I software gestionali autorizzati dal Ministero dell'Istruzione e del Merito operano in reti protette e non espongono interfacce di programmazione (API) aperte a terzi. Un'integrazione diretta e sincrona richiederebbe accreditamenti formali onerosi presso l'Agenzia per l'Italia Digitale (AgID) e lo sviluppo di connettori personalizzati per ciascun fornitore commerciale.
*   *Analisi di Sicurezza (GDPR)*: Il registro elettronico custodisce valutazioni docimologiche formali, dati anagrafici completi e informazioni sanitarie sensibili (es. assenze per malattia o terapie speciali). Un connettore diretto aumenterebbe la superficie d'attacco informatico.
*   *Soluzione Consigliata d'Istituto*: Mantenere la filosofia client-to-cloud senza server intermediari di CurManLight. Abilitare una pipeline di importazione locale: il docente scarica l'elenco studenti in formato aperto ODF o CSV dal proprio registro elettronico ufficiale (Axios/Argo) e lo carica con un singolo tocco su CurManLight. Il sistema popola all'istante la mappa dei banchi dell'Immersive Classroom Hub in forma interamente anonimizzata ed offline nel *Database Locale Protetto del Browser*, eliminando adempimenti burocratici e rischi di sanzioni da parte del Garante per la Privacy.

#### AREA 2: Associazione dei Libri di Testo e Connettori Editoriali
*   *Valutazione dei Fatti*: Le piattaforme dei grandi editori scolastici italiani (Zanichelli, Mondadori Education, Sanoma, Loescher) non condividono protocolli aperti di interscambio per ragioni di concorrenza commerciale.
*   *Analisi Pedagogica*: L'associazione automatica dei libri di testo consente di superare l'astrattezza della programmazione, ancorando le tappe delle UDA ai capitoli e alle risorse digitali realmente in possesso degli alunni.
*   *Soluzione Consigliata d'Istituto*: Implementare un lettore di codici ISBN-13. Il docente inserisce il codice del libro o lo inquadra con la fotocamera del tablet d'aula. Il Co-pilota interroga le banche dati bibliografiche pubbliche (es. Catalogo AIE o database OPAC SBN) per estrarre l'indice e i nuclei tematici. Successivamente, il sistema suggerisce in automatico al docente in quale lezione dell'UDA inserire le letture, gli esperimenti e gli esercizi digitali proposti dall'editore, ottimizzando la pianificazione didattica settimanale.

#### AREA 3: Collaborazione tra Docenti, Area di Discussione ed UDA Condivise
*   *Valutazione dei Fatti*: La condivisione cooperativa è la chiave per l'efficacia del curricolo verticale. Tuttavia, l'aggiunta di una chat centralizzata o di un sistema di notifiche push in tempo reale spezzerebbe la natura offline-first e serverless dell'applicazione, introducendo costi di hosting significativi e rischi informatici legati alla gestione di credenziali online.
*   *Analisi HCI (Carico Cognitivo)*: I docenti sono già sovraccarichi di canali di comunicazione informali (es. gruppi WhatsApp o messaggistica personale), che generano distrazione e frammentazione del lavoro.
*   *Soluzione Consigliata d'Istituto*: Sfruttare lo spazio di archiviazione sicuro ed asincrono di Google Drive d'Istituto (@icdonmilani.edu.it). 
    *   **Area Discussione asincrona**: Il sistema scrive i commenti metodologici ed i suggerimenti d'aula all'interno di un faldone condiviso d'Istituto denominato `curmanlight_bacheca_discussione.json`. All'avvio dell'app, il connettore esegue un allineamento automatico in background, mostrando un badge visivo discreto (★ Nuova UDA Proposta) nel menù laterale del docente.
    *   **Proposta di UDA su Tema**: Un docente può comporre una bozza di UDA partendo da un semplice argomento (es. "La Dieta Mediterranea e lo Sviluppo Sostenibile") elaborato dal Co-pilota d'Istituto. Con il pulsante "Invia Proposta ai Colleghi d'Area", il faldone dell'UDA viene depositato nella cartella Drive condivisa del dipartimento disciplinare, consentendo agli altri docenti di importarlo, integrarlo ed approvarlo in asincrono.

#### AREA 4: Il Propositore di Idee d'Attualità dal Web (IA)
*   *Valutazione dei Fatti*: Un assistente IA che naviga la rete in tempo reale durante la lezione può causare distrazioni al docente o introdurre allucinazioni semantiche qualora attinga da fonti web non verificate o di dubbia autorevolezza scientifica.
*   *Analisi Pedagogica*: Collegare i concetti teorici del curricolo verticale a eventi di cronaca reale o scoperte scientifiche recenti aumenta drasticamente l'interesse degli studenti ed agevola lo svolgimento del compito di realtà quotidiano.
*   *Soluzione Consigliata d'Istituto*: Realizzare un modulo di "Retrieval-Augmented Generation" (RAG) temporale asincrono. Durante i periodi di connettività stabile alla rete d'Istituto, il Co-pilota interroga canali scientifici ed informativi accreditati (es. Wikipedia API, feed ANSA o archivi del CNR) in base alle parole chiave dell'UDA attiva nella classe. L'Agente scarica localmente nella *Banca Dati* della PWA un micro-archivio di notizie ed eventi di rilievo. Durante la lezione del giorno, anche in totale assenza di connessione internet, il Co-pilota consiglia in modo proattivo al docente spunti reali per il dibattito d'aula ("Sapevi che oggi ricorre la scoperta di...").

#### AREA 5: KB Personale Multi-Device Sincronizzata con Google Drive
*   *Valutazione dei Fatti*: Ciascun docente possiede un patrimonio di documenti personali (slide, relazioni, programmazioni in PDF o Word) che desidera utilizzare come base di conoscenza per l'elaborazione delle proprie UDA d'Istituto, ma l'inserimento manuale del testo è ostacolato dai limiti fisici dei tablet scolastici.
*   *Analisi di Sicurezza (GDPR)*: Il caricamento di documenti personali su server IA esterni di terze parti viola le linee guida d'Istituto sulla sovranità dei dati scolastici.
*   *Soluzione Consigliata d'Istituto*: Sfruttare la cartella riservata Google Drive denominata `CurManLight_KB_Personale`. Il docente deposita i propri materiali didattici all'interno di questa cartella direttamente dal proprio PC di casa o dal cellulare. All'accesso sul tablet d'aula, il connettore estrae il testo dai file in formato PDF/DOCX (tramite librerie di parsing JavaScript integrate nella PWA) e indicizza le informazioni all'interno del *Database Locale Protetto del Browser* (IndexedDB) del dispositivo in uso. In questo modo si realizza un Secondo Cervello personale e sincronizzato su tutti i dispositivi personali del docente, a costo zero e con la garanzia del 100% di conformità al GDPR d'Istituto (trattamento locale esente da server intermediari).

---

### CONCLUSIONI E LINEE GUIDA PER LO SVILUPPO FUTURO

L'Organo di Valutazione Indipendente (OIV) esprime **parere favorevole all'adozione delle sei nuove priorità strategiche**, a condizione che vengano implementate secondo le soluzioni di remediation consigliate in questo studio. L'approccio client-to-cloud serverless si conferma la scelta architetturale d'eccellenza per garantire la sostenibilità economica, l'accessibilità formale d'Istituto e la totale sicurezza dei dati personali dei minori.

*Firmato,*
**L'Organo di Valutazione Indipendente d'Istituto**
*I.C. don Lorenzo Milani - Ariano Irpino*
