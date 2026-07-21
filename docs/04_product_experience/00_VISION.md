# 00 — VISION

**CurManLight — Product Experience 2.0**
**Milestone:** CML-600

---

## Missione

CurManLight esiste per aiutare le scuole italiane a costruire, gestire e far evolvere il proprio curricolo verticale di istituto, in piena allineamento con il D.M. 221/2025 (Indicazioni per il Curricolo) e il D.M. 14/2024 (Certificazione delle Competenze).

La piattaforma nasce dall'esigenza reale dell'I.C. Calvario-Covotta "don Lorenzo Milani" di Ariano Irpino (AV) — un istituto comprensivo con scuola dell'infanzia, primaria e secondaria di primo grado, con plessi distribuiti sul territorio e una minoranza storica italo-albanese (Arbëreshë) — di avere uno strumento unico, offline, che traduca la complessità normativa in azioni concrete di programmazione e progettazione didattica.

CurManLight non è un gestionale generico. È uno strumento *di scuola*, pensato *dalla scuola*, per la scuola.

---

## Utenti

CurManLight definisce **6 ruoli utente**, ciascuno con un cruscotto, delle azioni prioritarie e un livello di accesso diverso. Il ruolo si seleziona durante l'onboarding al primo avvio e può essere modificato in qualsiasi momento dal profilo.

| Ruolo | Chi è | Cosa fa in CurManLight |
|-------|-------|------------------------|
| **Insegnante** | Docente di cattedra, singola disciplina | Consulta il curricolo verticale, compila le UDA nel Wizard a 5 passi, esporta documenti per la propria materia, registra gli esiti degli alunni in classe |
| **Dipartimento** | Coordinatore di area disciplinare (es. Dipartimento di Lettere) | Vota i gap ordinamentali tra i livelli scolastici, esamina le proposte di raccordo, esporta il file .cml dipartimentale da inviare al Referente |
| **Referente** | Referente PTOF / Curricolo d'Istituto | Unisce i file .cml dei vari dipartimenti (merger), monitora il tasso di adesione alle Linee Guida 2025, verifica la copertura delle 8 Competenze Chiave Europee |
| **Dirigente** | Dirigente Scolastico | Esamina la bozza di delibera consiliare, monitora la conformità PA (AgID, GDPR, ACN), scarica la dichiarazione di accessibilità per invio telematico |
| **Collegio** | Collegio Docenti (vista collettiva) | Simile al Dirigente con widget condivisi per la delibera d'adozione del curricolo, conformità tecnologica e avanzamento plessi |
| **Amministratore** | Responsabile IT d'Istituto / gestore tecnico | Monitora lo stato di IndexedDB e del Service Worker, gestisce i backup e i ripristini, verifica la cache PWA e gli aggiornamenti |

---

## Valori

### 1. Offline-First
I dati restano sul dispositivo. Nessuna dipendenza da server, connessione internet o servizi cloud. L'app funziona da una chiavetta USB, da un file locale, o da una rete interna. Google Workspace è l'unica eccezione, ed è opzionale.

### 2. Centrato sulla scuola italiana
Ogni funzionalità è mappata su un bisogno reale della scuola italiana: dal RAV al PTOF, dalla certificazione AgID al D.M. 14/2024, dall'infanzia alla secondaria. La terminologia è quella della scuola, non quella dello sviluppo software.

### 3. Privacy-by-Design
I dati sensibili degli studenti (nomi, diagnosi, PEI/PDP) vengono cifrati localmente con AES-GCM a 256 bit. Nessun motore IA (WikiLLM o Copilota) può leggere questi dati in chiaro. L'IA riceve unicamente token anonimi mascherati.

### 4. Memoria Istituzionale
Nulla va perduto. Il Second Brain d'Istituto conserva 19 volumi di conoscenza pedagogica e ordinamentale in formato Markdown, consultabili e interrogabili. Ogni decisione del dipartimento, ogni UDA validata, ogni delibera è preservata.

### 5. Progettazione Collaborativa
La piattaforma supporta il lavoro in team: votazioni sui gap, unione file .cml tra dipartimenti, bacheca social per il riuso di UDA, registro di classe condiviso, gruppi cooperativi.

---

## Principi UX

### 1. Zero-friction per l'uso quotidiano
L'insegnante non tecnico deve poter aprire CurManLight, trovare ciò che gli serve, e completare la propria azione in pochi clic. Nessun tutorial obbligatorio dopo l'onboarding. I percorsi più comuni (consulta curricolo, compila UDA, esporta Word) sono accessibili in massimo 2 clic dalla dashboard.

### 2. Offline-First (funziona sempre)
L'app deve funzionare da una chiavetta USB, in una rete locale senza internet, oppure connessa al cloud. Il Service Worker gestisce la cache degli asset. L'utente non deve mai pensare alla connessione.

### 3. Memoria Istituzionale (nulla si perde)
Ogni azione dell'utente è preservata. Le decisioni dei dipartimenti sono salvate localmente e non si sovrascrivono. Il sistema di backup JSON permette di ripristinare lo stato completo dell'istituto in qualsiasi momento.

### 4. Disclosure Progressivo
La superficie è semplice: una sidebar con 5 aree principali e una dashboard. Ma sotto ogni area ci sono sotto-aree, filtri, opzioni avanzate e strumenti IA. L'utente sceglie quanto approfondire. Il Wizard UDA a 5 passi è l'esempio perfetto: si può completare un'UDA in modo guidato, oppure personalizzare ogni singolo campo.

### 5. Accessibilità (WCAG 2.1 Livello A minimo)
L'app è testata con MAUVE++ (CNR/AgID) e deve conformarsi alle linee guida WCAG 2.1 AA. Supporto semantico HTML5, contrasto sufficiente, navigazione da tastiera, lettori di schermo. L'obiettivo è il 98% di accessibilità come attualmente misurato.

---

## Linguaggio

CurManLight parla la lingua della scuola. Non la lingua della tecnologia.

| Si dice | Non si dice |
|---------|-------------|
| Curricolo | Database |
| Progettazione | Workflow |
| Consiglio | Team meeting |
| UDA | Record |
| Traguardi | Target |
| Obiettivi di apprendimento | Goals |
| Esiti | Risultati |
| Gap ordinamentali | Differenze strutturali |
| Delibera | Approvazione formale |
| Registro d'Aula | Student management |
| PTOF | Piano strategico |
| Second Brain | Knowledge base |
| Copilota | Chatbot |
| Popolamento PTOF | Data entry |

---

## Obiettivi

### 1. Ridurre del 60% il tempo di produzione dei documenti curricolari
Prima di CurManLight, la compilazione manuale del curricolo verticale per 14 discipline su 3 ordini scolastici richiedeva settimane di lavoro distribuito. L'obiettivo è portare questo processo a poche ore di lavoro concentato, grazie al Wizard UDA, al sistema di popolamento IA e all'esportazione automatica nei formati d'ufficio.

### 2. Abilitare la revisione collaborativa in tempo reale durante le riunioni di dipartimento
Durante le riunioni, i docenti devono poter votare i raccordi, commentare le proposte, e esportare il risultato condiviso. Il file .cml dipartimentale è il prodotto intermedio che il Referente unisce per costruire la proposta finale al Collegio.

### 3. Garantire che il 100% della conoscenza istituzionale sia catturata e interrogabile
Il Second Brain d'Istituto raccoglie 19 volumi di documentazione (dal RAV al Piano di Miglioramento, dalla normativa alla relazione della scuola in chiaro). Il Copilota WikiLLM risponde a domande pedagogiche citando le fonti d'Istituto, senza allucinazioni.

---

## Vincoli

### 1. Singolo file HTML (nessun server richiesto)
Il bundle finale è un unico file `index.html` generato da Vite 5. Non richiede installazione, configurazione server, o dipendenze runtime. Si apre con un doppio clic nel browser.

### 2. Funziona sui Chromebook assegnati alle scuole (specifiche basse)
L'app deve funzionare fluidamente su Chromebook con 4 GB di RAM e processore dual-core. Nessun framework pesante, nessuna animazione complessa, nessuna dipendenza non essenziale.

### 3. Deve funzionare completamente offline
Nessuna funzionalità deve essere compromessa dalla mancanza di connessione. Google Workspace è l'unica eccezione: la sync cloud è un'opzione, non un requisito.

### 4. Conforme GDPR (i dati restano locali se non si sceglie la sync)
I dati personali degli studenti non lasciano mai il dispositivo. La sincronizzazione con Google Drive è esplicitamente opt-in e avviene solo con il consenso dell'utente. La chiave di cifratura AES-GCM resta locale.

### 5. Nessuna chiamata API esterna tranne Google Workspace (opzionale)
L'unica connessione HTTP attiva è verso le API Google (Drive, userinfo) durante la sincronizzazione cloud. Nessun analytics, nessun tracker, nessuna telemetria esterna. Il Service Worker gestisce la cache localmente.
