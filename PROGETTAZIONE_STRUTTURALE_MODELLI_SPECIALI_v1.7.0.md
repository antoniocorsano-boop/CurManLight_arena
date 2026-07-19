# 🏛️ PROGETTAZIONE STRUTTURALE E SEMANTICA DEI MODELLI SPECIALI (v1.7.0)
### Verbale della Riunione Operativa per la Declinazione del PEI/Sostegno, UDA Interdisciplinari e Bilinguismo Greci
**Istituto Comprensivo Calvario-Covotta «don Lorenzo Milani» — Ariano Irpino (AV)**  
*Codice Meccanografico: AVIC849003*  
*Data della Seduta: 15 Luglio 2026, ore 17:30*  
*Verbale n. 43 / Sottocommissione per l'Inclusione e il Bilinguismo*  
*Stato dei Modelli: APPROVATI & STRUTTURATI NELLO SCHEMA DI TEMPLATE*

---

## 👥 1. MEMBRI DELLA RIUNIONE OPERATIVA SPECIALISTICA

*   **Prof.ssa Maria Letizia (Preside)**: Garante dell'integrazione del bilinguismo storico del Plesso Greci e dei protocolli di inclusione PEI.
*   **Prof. Vincenzo (Referente Inclusione & Animatore Digitale)**: Responsabile per il raccordo del PEI su base ICF e delle misure compensative/dispensative.
*   **Ing. Roberto (Software Architect & Admin)**: Responsabile per l'ingegneria dei tag di iniezione dinamica nei modelli Docxtemplater.
*   **Dr.ssa Silvia (Esperto AI & EdTech)**: Responsabile per l'allineamento semantico dell'IA Co-pilota sui traguardi personalizzati e interclasse.

---

## 📌 2. SINTESI DEI LAVORI ED INTERVENTI SUI MODELLI SPECIALI

La sottocommissione si riunisce per stabilire i **criteri di personalizzazione, i tag di iniezione ed il testo strutturato** per i tre modelli speciali ad altissimo impatto sociale e pedagogico d'Istituto:

---

## 🧠 3. MODELLO 1: TEMPLATE PIANO EDUCATIVO INDIVIDUALIZZATO (PEI/SOSTEGNO)

Il **Prof. Vincenzo** illustra le criticità del sostegno: 
> *"I docenti di sostegno necessitano di un template PEI che non sia una mera ripetizione del curricolo comune, ma che sia strutturato sulle **4 Dimensioni ICF** (Socializzazione, Comunicazione, Autonomia, Cognitiva) previste dal D.M. 182/2020. Dobbiamo definire un modello in cui l'IA aiuti a inserire obiettivi individualizzati raccordati alle misure d'aula."*

L'**Ing. Roberto** presenta i tag di iniezione per il modello Word/PDF del PEI d'Istituto:

### 3.1 Schema Strutturato dei Tag del PEI (Docxtemplater)
```html
[INTESTAZIONE MINISTERIALE D'ISTITUTO]
DOCUMENTO:          PIANO EDUCATIVO INDIVIDUALIZZATO (PEI-ICF)
ALUNNO/A (INIZIALI): {alunno_iniziali}   | CLASSE: {classe_sezione}
DOCENTE DI SOSTEGNO: {docente_sostegno}  | ANNO SCOLASTICO: {anno_scolastico}

1. QUADRO DI DIAGNOSTICA FUNZIONALE (ICF d'Istituto)
====================================================
* Dimensione della Relazione e Socializzazione:
  {dim_socializzazione_obiettivi}
* Dimensione della Comunicazione e Linguaggio:
  {dim_comunicazione_obiettivi}
* Dimensione dell'Autonomia e Orientamento:
  {dim_autonomia_obiettivi}
* Dimensione Cognitiva, Neuropsicologica e dell'Apprendimento:
  {dim_cognitiva_obiettivi}

2. TRAGUARDI ADATTATI E OBIETTIVI SPERIMENTALI
==============================================
{#obiettivi_pei}
- [Codice: {codice_obiettivo}] {descrizione_obiettivo}
  * Livello di Facilitazione d'Istituto: {livello_facilitazione}
  * Strumenti di Supporto Attivi: {strumenti_supporto}
{/obiettivi_pei}

3. MISURE INCLUSIVE RAPIDE D'ISTITUTO (GLO Convalidato)
=======================================================
* Misure Dispensative Applicate: {misure_dispensative}
* Misure Compensative Attive: {misure_compensative}
* Strategie Didattiche per l'Inclusione:
  {strategie_inclusione_testo}
```

---

## 📐 4. MODELLO 2: TEMPLATE UNITA DI APPRENDIMENTO (UDA) INTERDISCIPLINARE

Il **Prof. Vincenzo** solleva il problema della co-progettazione:
> *"Le nostre UDA sono per definizione interdisciplinari. Quando due o tre docenti (es. Matematica, Tecnologia e Arte) co-progettano l'UDA 'Il Fabl@b delle idee', il modello deve mostrare con assoluta trasparenza l'apporto di ciascuna disciplina e i nomi dei **Docenti Co-progettisti**."*

La **Dr.ssa Silvia** propone l'orchestrazione per l'IA:
> *"L'IA Co-pilota aiuterà a incrociare i traguardi. Se inseriamo Matematica e Arte, l'IA proporrà automaticamente un traguardo ponte, come 'La visualizzazione geometrica prospettica nello spazio virtuale'."*

### 4.1 Schema Strutturato dei Tag dell'UDA Interdisciplinare
```html
[INTESTAZIONE MINISTERIALE D'ISTITUTO]
MODULO FORMATIVO:   UNITA DI APPRENDIMENTO INTERDISCIPLINARE (UDA)
TITOLO DELL'UDA:    {uda_titolo}
MONTE ORE TOTALE:   {uda_ore} Ore         | PERIODO: {uda_periodo}
CLASSE/I TARGET:    {uda_classi}

CO-PROGETTAZIONE DOCENTI D'ISTITUTO:
{docente_principale} ({materia_principale})
{#co_autori}
- {co_nome} ({co_materia})
{/co_autori}

1. MAPPA DI RACCORDO COMPETENZE E DISCIPLINE
============================================
{#discipline_coinvolte}
* Disciplina: {materia_nome_tradotto}
  * Traguardi di Competenza:
    {#traguardi_materia} - {t_testo} {/traguardi_materia}
  * Obiettivi d'Apprendimento:
    {#obiettivi_materia} - {ob_testo} {/obiettivi_materia}
{/discipline_coinvolte}

2. COMPITO DI REALTA & PRODOTTO FINALE
======================================
Situazione-Problema d'Istituto:
{compito_realta_descrizione}

Evidenze Osservabili di Certificazione:
{#evidenze_osservabili}
- [Livello {e_livello}] {e_descrizione}
{/evidenze_osservabili}
```

---

## 🎨 5. MODELLO 3: TEMPLATE PRIMARIA BILINGUE (PLESSO GRECI)

La **Dirigente Maria Letizia** sottolinea l'importanza storica del Plesso Greci:
> *"Il nostro Plesso Greci ha una vocazione interculturale magnifica, salvaguardando la minoranza Arbëreshë con bilinguismo diacronico. Qualsiasi programmazione annuale o relazione per le classi del plesso Greci deve poter presentare i titoli e le sezioni chiave in **doppia lingua (Italiano/Arbëreshë)**, evidenziando le attività di raccordo linguistico."*

L'**Ing. Roberto** illustra la configurazione del template bilingue:

### 5.1 Schema Strutturato dei Tag del Report Plesso Greci
```html
[INTESTAZIONE MINISTERIALE D'ISTITUTO]
PLESSO SCOLASTICO:  PLESSO "GRECI" - BILINGUISMO DIACRONICO d'ISTITUTO
DOCUMENTO:          RELAZIONE DI INTERASSE / PROGRAMMAZIONE DISCIPLINARE
                    DREJTORIA E SHKOLLËS - GJUHA DHE KULTURA ARBËRESHE

DISCIPLINA:         {materia_italiano} / GJUHA: {materia_arbureshe}
CLASSE:             {classe_sezione}     | ANNO SCOLASTICO: {schoolYear}

1. CONSOLIDAMENTO LINGUISTICO E INTERCULTURALE
   KONSOLIDIMI GJUHËSOR DHE NDËRKULTUROR
==============================================
Il percorso scolastico ha integrato le attività di bilinguismo per promuovere
la conservazione della lingua storica minoritaria d'Istituto:
{integrazione_linguistica_testo}

2. TRAGUARDI DI COMPETENZA TRASVERSALI / SYNIMET E KOMPETENCËS
==============================================================
{#traguardi_greci}
- [IT] {t_italiano}
- [AR] {t_arbereshe} (Raccordo Glottodidattico)
{/traguardi_greci}

3. VALUTAZIONE DESCRITTIVA D'ISTITUTO / VLERËSIMI SHKRUAR
==========================================================
* Livello Avanzato / Nivel i Avancuar: {liv_avanzato_desc}
* Livello Intermedio / Nivel i Ndërmjetëm: {liv_intermedio_desc}
* Livello Base / Nivel i Bazë: {liv_base_desc}
* Livello Iniziale / Nivel Fillestar: {liv_iniziale_desc}
```

---

## 📅 6. DELIBERA E PIANO DI INSERIMENTO NEI MODELLI MADRE

Sulla base delle proposte strutturate, la Commissione delibera di:
1.  **Inserire i 3 Schemi Speciali** all'interno della directory `templates_config/` dell'applicazione come modelli standard pre-convalidati d'Istituto.
2.  **Abilitare il Rilevatore d'Istituto nel Profilo**: Se un docente imposta nel proprio profilo *"Plesso: Greci"*, l'applicazione caricherà automaticamente il *Template Bilingue* per tutte le sue programmazioni d'area. Se imposta *"Cattedra: Sostegno"*, verrà proposto di default il *Template PEI-ICF*.
3.  **Aggiornamento del Pacchetto ZIP**: Tutti gli schemi di tag e le relazioni sono stati documentati ed inseriti nell'archivio protetto **`CurManLight_Ecosystem_Completo.zip`** sul workspace, pronti per lo sviluppo.

La seduta viene sciolta alle ore 19:00.

*Letto, approvato e sottoscritto.*

**Il Segretario della Sottocommissione**  
*Prof. Vincenzo*  

**Il Presidente della Sottocommissione / Dirigente Scolastico**  
*Prof.ssa Maria Letizia*
