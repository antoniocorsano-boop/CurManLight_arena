# 📊 RAPPORTO DI AUDIT DI EVOLUZIONE, GAP ANALYSIS E SVILUPPO FUTURO (v1.5.4+)
### Analisi Predittiva di Potenziamento Tecnologico e Pedagogico d'Istituto
**Istituto Comprensivo Calvario-Covotta «don Lorenzo Milani» — Ariano Irpino (AV)**  
*Codice Meccanografico: AVIC849003*  
*Data dell'Audit: 14 Luglio 2026*  
*Stato del Sistema: STRATEGICO & EVOLUTIVO (PRONTO PER PROGETTAZIONE SUCCESSIVA)*

---

## 🗺️ INDICE DEL RAPPORTO DI AUDIT EVOLUTIVO
1. [Sintesi dell'Audit ed Analisi dei Limiti Attuali](#-1-sintesi-dellaudit-ed-analisi-dei-limiti-attuali)
2. [Audit Area 1: Profilazione ed Onboarding (Insegnanti di Sostegno)](#-2-audit-area-1-profilazione-ed-onboarding-insegnanti-di-sostegno)
3. [Audit Area 2: Progettazione UDA (Co-Progettazione Interdisciplinare)](#-3-audit-area-2-progettazione-uda-co-progettazione-interdisciplinare)
4. [Audit Area 3: Sdoppiamento ed Aggregazione dei Voti dei Gap d'Istituto](#-4-audit-area-3-sdoppiamento-ed-aggregazione-dei-voti-dei-gap-distituto)
5. [Audit Area 4: Esportazione ed Interoperabilità (SCORM/Argo/ClasseViva)](#-5-audit-area-4-esportazione-ed-interoperabilità-scormargoclasseviva)
6. [Audit Area 5: Sviluppo Second Brain (FileReader Drag &amp; Drop)](#-6-audit-area-5-sviluppo-second-brain-filereader-drag--drop)
7. [Audit Area 6: Accessibilità Estrema (Web Speech API AAA Offline)](#-7-audit-area-6-accessibilità-estrema-web-speech-api-aaa-offline)
8. [Roadmap di Sviluppo Consolidata (v1.5.4 - v1.6.0)](#-8-roadmap-di-sviluppo-consolidata-v154---v160)

---

## 🏛️ 1. SINTESI DELL'AUDIT ED ANALISI DEI LIMITI ATTUALI

L'applicazione **CurManLight v1.5.3** ha raggiunto la piena stabilità operativa, risolvendo tutti i rilievi emersi dai test con utenti reali. Tuttavia, per garantire che il software mantenga il primato tecnologico e metodologico nel panorama nazionale dell'EdTech italiano (e continui ad evolversi di pari passo con le esigenze future dell'I.C. Don Milani), è stato condotto questo **Audit Evolutivo Multi-Area**.

L'audit analizza i limiti attuali derivanti dall'architettura client-side ed individua **sei vettori strategici di espansione** a costo zero, pronti per essere implementati nella successiva versione **v1.5.4+** per potenziare l'inclusione, la cooperazione interdipartimentale e la ricchezza della Knowledge Base.

---

## 👥 2. AUDIT AREA 1: PROFILAZIONE ED ONBOARDING (INSEGNANTI DI SOSTEGNO)

### 2.1 Limiti Rilevati (v1.5.3)
La profilazione iniziale adotta una logica concepita prevalentemente per i docenti curricolari d'area (Comuni o Specialisti). Gli **insegnanti di sostegno** d'Istituto, che non hanno una singola disciplina e sono assegnati contemporaneamente a più classi e studenti con PEI differenti, incontrano difficoltà di profilazione, dovendo forzare la scelta di una materia curricolare fittizia.

### 2.2 Proposta di Potenziamento (v1.5.4)
* **Onboarding Adattivo per il Sostegno**: Aggiungere nello Step 1 (Ruolo) un'opzione specifica per *"Docente di Sostegno d'Istituto"*.
* **Scelta Multi-Materia e Classe**: Se selezionata, l'app disattiva la scelta obbligatoria della materia e sblocca un pannello per selezionare più classi target e plessi contemporaneamente.
* **UDA Sostegno-Orientate**: Il Progettatore UDA si adatterà mostrando in primo piano i traguardi inclusivi trasversali d'Istituto, facilitando la redazione di percorsi individualizzati.

---

## 🗺️ 3. AUDIT AREA 2: PROGETTAZIONE UDA (CO-PROGETTAZIONE INTERDISCIPLINARE)

### 3.1 Limiti Rilevati (v1.5.3)
La progettazione UDA avviene attualmente su base "monodisciplinare" (un docente compila l'UDA per la propria materia). Nella scuola reale, tuttavia, le Unità di Apprendimento sono quasi sempre **interdisciplinari** e redatte in compresenza da più docenti appartenenti a diversi dipartimenti (es. Matematica + Scienze + Tecnologia).

### 3.2 Proposta di Potenziamento (v1.5.4)
* **Pannello Co-Docenti**: Aggiungere nel Wizard UDA Step 1 un campo a inserimento dinamico per indicare i nomi e le discipline dei **Docenti Co-Progettisti d'Istituto**.
* **Filtro Traguardi Incrociato**: Consentire la selezione di traguardi ed obiettivi appartenenti a più discipline contemporaneamente (es. poter selezionare traguardi di Italiano e Storia sulla stessa schermata), fondendo le competenze in un faldone interdisciplinare unico e stampabile in ODF/PDF.

---

## 📊 4. AUDIT AREA 3: SDOPPIAMENTO ED AGGREGAZIONE DEI VOTI DEI GAP D'ISTITUTO

### 4.1 Limiti Rilevati (v1.5.3)
Il voto espresso nel tab "Revisione" (Accetta 2025, Mantieni 2012, Personalizza) è memorizzato unicamente sul dispositivo del singolo utente. Non esiste un flusso nativo ed offline per raccogliere i voti di tutti i docenti dello stesso dipartimento e calcolare la maggioranza statistica d'Istituto.

### 4.2 Proposta di Potenziamento (v1.5.4)
* **Esportazione Voto Dipartimento**: Aggiungere un pulsante *"Esporta Voti Dipartimentali (.json)"* nel pannello delle revisioni.
* **Aggregatore Consenso del Referente**: Quando il Referente o il Dirigente Scolastico carica i file dei docenti nella propria piattaforma, CurManLight effettuerà una **fusione e calcolo statistico automatico** (es. *"La proposta LEL-1 è stata approvata dall'85% dei docenti"*), mostrando un grafico a torta del consenso d'Istituto per ciascun gap ordinamentale.

---

## 🔌 5. AUDIT AREA 4: ESPORTAZIONE ED INTEROPERABILITÀ (SCORM/ARGO/CLASSEVIVA)

### 5.1 Limiti Rilevati (v1.5.3)
Le esportazioni correnti sono formati di lettura editoriali (.doc, .docx, .odt, .pdf, .txt). Non supportano l'importazione strutturata e l'integrazione automatica nei registri elettronici più diffusi (Argo DidUp, Spaggiari ClasseViva) o nelle piattaforme e-learning (Moodle, Google Classroom).

### 5.2 Proposta di Potenziamento (v1.5.4)
* **SCORM Packaging**: Generazione nativa di pacchetti **SCORM 1.2 / SCORM 2004** compressi in formato `.zip`. Questo permetterà di caricare l'intera UDA strutturata in Moodle o altre piattaforme di e-learning scolastiche come un corso interattivo pre-formattato.
* **Formato interoperabile JSON-Argo**: Esportazione di un tracciato dati standardizzato pre-compilato, pronto per essere importato nel campo programmazioni dei registri d'Istituto via clipboard strutturata.

---

## 📂 6. AUDIT AREA 5: SVILUPPO SECOND BRAIN (FILEREADER DRAG & DROP)

### 6.1 Limiti Rilevati (v1.5.3)
Il potenziamento dinamico della KB inserito nella versione v1.5.3 permette di incollare a mano i testi all'interno di un'area di testo. Sebbene estremamente utile, se un docente possiede un file `.md` o `.txt` già pronto (come l'Atto d'Indirizzo d'Istituto completo di 10 pagine), la selezione, copia ed incolla manuale può risultare scomoda.

### 6.2 Proposta di Potenziamento (v1.5.4)
* **File Upload & Drag & Drop**: Integrare l'API HTML5 **`FileReader`** all'interno dell'Add Custom Doc Modal.
* **Lettura Istantanea**: Il Dirigente potrà trascinare il file `.md` o `.txt` direttamente nel riquadro: l'applicazione leggerà ed estrarrà istantaneamente il testo in modo 100% offline, pre-compilando il titolo ed il contenuto ed inserendolo nella KB in un secondo.

---

## 🗣️ 7. AUDIT AREA 6: ACCESSIBILITÀ ESTREMA (WEB SPEECH API AAA OFFLINE)

### 7.1 Limiti Rilevati (v1.5.3)
Nonostante il punteggio di accessibilità AgID sia eccellente (98%), non supporta in modo nativo la lettura audio dei testi per docenti non vedenti o ipovedenti, costringendoli a poggiare su software screen reader esterni che potrebbero non essere configurati sui PC d'aula della scuola.

### 7.2 Proposta di Potenziamento (v1.5.4)
* **Sintesi Vocale Offline Integrata**: Sfruttare l'API nativa del browser **`window.speechSynthesis`** (Web Speech API).
* **Ascolta Volume**: All'interno del *Wiki Reader Panel*, aggiungere il bottone: **`🗣️ Ascolta Documento`**.
* **Inclusione Estrema (Livello AAA)**: Al clic, l'applicazione leggerà ad alta voce il testo del volume selezionato utilizzando la sintesi vocale di sistema del computer, permettendo l'ascolto offline ed autonomo della normativa d'Istituto senza installare alcun programma aggiuntivo.

---

## 📅 8. ROADMAP DI SVILUPPO CONSOLIDATA (v1.5.4 - v1.6.0)

Per strutturare i prossimi rilasci incrementali d'Istituto, si delinea il seguente cronoprogramma di sviluppo evolutivo a costo zero:

```
     [v1.5.4] ──► Drag & Drop FileReader per file .md/.txt in KB
        │
     [v1.5.5] ──► Sintesi Vocale offline "Ascolta Documento" (Web Speech API)
        │
     [v1.5.6] ──► Onboarding Sostegno, aggregatore statistico consensi d'area
        │
     [v1.6.0] ──► Co-progettazione interdisciplinare e pacchettizzazione SCORM
```

---
*Rapporto di audit evolutivo redatto per la Commissione Innovazione Tecnologica d'Istituto.*  
**I.C. Calvario-Covotta «don Lorenzo Milani»**  
*Ariano Irpino, 14 Luglio 2026*
