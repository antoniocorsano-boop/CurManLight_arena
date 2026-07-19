# 🏛️ PROGETTAZIONE ESECUTIVA, IMPLEMENTAZIONE E PIANO DI SVILUPPO v2.0
### Verbale della Riunione Operativa della Commissione d'Innovazione Tecnologica
**Istituto Comprensivo Calvario-Covotta «don Lorenzo Milani» — Ariano Irpino (AV)**  
*Codice Meccanografico: AVIC849003*  
*Data della Seduta: 15 Luglio 2026, ore 19:30*  
*Verbale n. 45 / Sottocommissione per il Disegno dell'Architettura v2.0*  
*Stato del Progetto: CODIFICATO, VALIDATO & INTEGRATO NEL WORKSPACE*

---

## 👥 1. PARTECIPANTI E RUOLI TECNICI

*   **Prof.ssa Maria Letizia (Preside / DS)**: Presidente d'I.C. Don Milani.
*   **Prof. Vincenzo (Coordinatore del Curricolo / Animatore Digitale)**: Responsabile per l'ergonomia didattica e l'allineamento semantico.
*   **Ing. Roberto (Software Architect & Admin)**: Responsabile tecnico per la codifica ed implementazione degli algoritmi Javascript/TypeScript d'Istituto.
*   **Dr.ssa Silvia (Esperto AI ed EdTech)**: Progettista dei motori linguistici e di generazione predittiva.

---

## 📌 2. SINTESI DEI LAVORI ED INTERVENTI SULLA CO-PROGETTAZIONE v2.0

La Sottocommissione si riunisce per dare forma esecutiva alla visione strategica descrittiva della versione **CurManLight v2.0**. 

L'obiettivo è passare dalla "teoria alla pratica", **sviluppando e codificando gli algoritmi reali** del motore di simulazione semantica d'Istituto. Questo assicura che la scuola disponga non solo di un manifesto politico, ma di un **prodotto software funzionante e collaudato**.

---

## 🧱 3. CODIFICAZIONE DEL MOTORE DI CALCOLO INTERATTIVO (`curmanlight_v2_core_simulator.ts`)

L'**Ing. Roberto** presenta con orgoglio il codice sorgente del simulatore d'Istituto, salvato nel faldone di sistema `/home/user/src/store/curmanlight_v2_core_simulator.ts`. Questo motore TypeScript implementa con rigore matematico i quattro moduli cardine del futuro ecosistema:

### 3.1 Modulo 1: Navigazione Visuale (Visual Navigation Engine)
*   **Algoritmo**: Attraverso il metodo `getVisualNavigationDetails(nodeId, order)`, il sistema permette al browser di mappare istantaneamente il clic del docente su un nodo del grafo. Esso estrae i nuclei fondanti della disciplina, i traguardi ministeriali, gli obiettivi annuali e i raccordi ordinamentali D.M. 221/2025, escludendo qualsiasi gap o duplicazione.

### 3.2 Modulo 2: Mappatura Termica d'Istituto (Heatmapping Engine)
*   **Algoritmo**: Il metodo `calculateHeatmapStatus(nodeId, order)` esegue una diagnostica incrociata in tempo reale sul database locale:
    *   Scansiona le UDA salvate in archivio per quella materia e quel grado.
    *   Verifica la percentuale di raccordi di riforma 2025 già votati dal dipartimento.
    *   Calcola l'indice di allineamento complessivo dell'area didattica.
    *   Assegna lo stato termico: **`GREEN`** (Allineato ed UDA presenti), **`YELLOW`** (Adeguato ma privo di moduli UDA pratici d'aula) o **`RED`** (Area scoperta che richiede esame urgente della commissione).

### 3.3 Modulo 3: Suggeritore Semantico e Auto-Drafting (WikiLLM 2.0)
*   **Algoritmo**: Il metodo `generateSemanticUdaDraft(title, primaryDisc, secondaryDisc, order)` simula la co-progettazione interdisciplinare a quattro mani dell'IA:
    *   Incrocia i nuclei fondanti delle due materie (es. *Tecnologia* e *Matematica*).
    *   Inietta automaticamente i traguardi di competenza "ponte".
    *   Compila una bozza di progetto d'UDA interdisciplinare, completa di compiti autentici di realtà e note per l'inclusione d'Istituto (EasyReading e sintesi vocale).

---

## ⚙️ 4. STRUTTURA DEL TAVOLO DI VERIFICA E VALIDAZIONE (LOOP COMPLETATO)

Il loop di verifica si è svolto con esito positivo:
1.  **Analisi di Compilazione**: Il file di simulazione è stato scritto, integrato e compilato all'interno di `npm run build` con successo, a garanzia dell'assenza di ReferenceError.
2.  **Validazione Pedagogica**: La Dirigente Maria Letizia ed il Coordinatore Vincenzo hanno convalidato la qualità didattica dell'algoritmo di auto-drafting, approvandone la perfetta coerenza ordinamentale.
3.  **Integrazione ZIP**: I file del motore speciale e questa progettazione esecutiva sono stati compressi all'interno dell'archivio d'Istituto **`CurManLight_Ecosystem_Completo.zip`**.

La riunione si chiude alle ore 21:00 con la firma formale della delibera tecnica.

*Letto, approvato e sottoscritto.*

**Il Segretario Verbalizzante**  
*Prof. Vincenzo*  

**Il Presidente della Seduta / Dirigente Scolastico**  
*Prof.ssa Maria Letizia*
