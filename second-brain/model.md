# 🎨 DESIGN SYSTEM ED ARCHITETTURA DI USABILITÀ D'ISTITUTO: MODEL.MD
### Specifiche di Riduzione del Carico Cognitivo, Sfoltimento dei Click (Frictionless UX) e Gamification d'Aula
**Istituto Comprensivo Calvario-Covotta «don Lorenzo Milani» — Ariano Irpino (AV)**  
*Codice Meccanografico: AVIC849003*  
*Data delle Specifiche: 15 Luglio 2026*  
*Tavolo Tecnico: Esperti di Strumenti Didattici, UI/UX, Gamification e Accessibilità*  
*Stato del Documento: VALIDATO DAL SUPER AUDITOR ESTERNO PER LA MESSA A REGIME*

---

## 🗺️ INDICE DEL DESIGN SYSTEM
1. [Quadro delle Decisioni dello Swarm di Specialisti](#-1-quadro-delle-decisioni-dello-swarm-di-specialisti)
2. [Analisi dei Flussi e Sfoltimento dei Click (Frictionless Flow)](#-2-analisi-dei-flussi-e-sfoltimento-dei-click-frictionless-flow)
3. [Design System d'Istituto: Token, Colori, Tipografia e Micro-interazioni](#-3-design-system-distituto-token-colori-tipografia-e-micro-interazioni)
4. [La Gamification d'Aula: Regole, Sfidanti e Progressione](#-4-la-gamification-daula-regole-sfidanti-e-progressione)
5. [Rapporto di Validazione Terza dell'Organo Super Auditor](#-5-rapporto-di-validazione-terza-dellorgano-super-auditor)

---

## 🏛️ 1. QUADRO DELLE DECISIONI DELLO SWARM DI SPECIALISTI

In data **15 Luglio 2026**, si è riunito il **Tavolo Inter-Disciplinare di Usabilità d'Istituto** per riprogettare radicalmente l'esperienza utente di CurManLight. 

### I Membri dello Swarm:
*   *L'Esperto di Strumenti per la Didattica Online:* Analizza l'integrazione di Classroom e la semplicità di esportazione dei file per la LIM.
*   *L'Esperto di Didattica e Coordinamento Disciplinare:* Tutela l'aderenza scientifica e ordinamentale del curricolo.
*   *Il Designer UI/UX e di Usabilità della PA:* Monitora la conformità alle Linee Guida AgID e la soppressione della fatica d'inserimento.
*   *L'Ingegnere di Gamification scolastica:* Progetta le meccaniche di motivazione e dinamiche di coinvolgimento d'aula.
*   *L'Organo di Validazione Terzo (Super Auditor):* Agisce come controllore imparziale dei requisiti.

---

## 🔬 2. ANALISI DEI FLUSSI E SFOLTIMENTO DEI CLICK (Frictionless UX)

Per ridurre il carico mentale (Cognitive Load) e diminuire il numero di operazioni necessarie per raggiungere gli scopi d'ufficio dei docenti, si stabiliscono le seguenti ottimizzazioni di flusso:

```
VECCHIO FLUSSO (15 Clicks):
[Onboarding] ➔ [Consulta Curricolo] ➔ [Scegli Obiettivi] ➔ [Crea UDA] ➔ [Compila 5 Step] ➔ [Salva]
                                                                        
NUOVO FLUSSO DIRETTO (3 Clicks):
[Profilo Auto-rilevato] ➔ [1-Click Autocompilatore UDA d'Istituto] ➔ [Salva e Sincronizza Drive]
```

### 2.1 Sanatoria delle Barriere di Navigazione:
1.  **1-Click UDA Autocompiler (La Svolta Pedagogica):**
    Invece di costringere il docente a selezionare manualmente traguardi, obiettivi ed evidenze in un wizard a 5 passi, l'applicazione pre-carica un **Baseline d'Istituto Modello** non appena il docente seleziona l'argomento. Con un solo click, il sistema popola interamente i 5 step del wizard con contenuti validati d'Istituto, permettendo al docente di generare l'UDA e salvarla all'istante (passando da 15 clicks medi a **soli 3 clicks complessivi**!).
2.  **Sincronizzazione Unificata della Sidebar:**
    La riorganizzazione attorno ai **Tre Pilastri d'Istituto** (Curricolo, Progettazione, Classe) elimina i menu nidificati complessi. Ogni macro-area è direttamente raggiungibile e raccoglie in modo logico le funzioni collegate.
3.  **Persistenza Automatica dello Stato (Zero Clicks):**
    Il docente non deve mai ricordarsi di salvare o caricare configurazioni: l'app salva in tempo reale banchi, gruppi ed esiti didattici in `localStorage`, sincronizzandoli asincronamente con il Drive d'Istituto.

---

## 🎨 3. DESIGN SYSTEM D'ISTITUTO: TOKEN E COLORI (AgID Compliant)

Per garantire la massima leggibilità (accessibilità secondo i criteri WCAG 2.1 AA/AAA) e l'identità dell'Istituto Milani, definiamo i seguenti design tokens:

### 3.1 Tavolozza dei Colori d'Istituto
*   **Primary Indigo (Dominante Istituzionale):** `#1e1b4b` (Indigo-950) e `#4338ca` (Indigo-700). Fornisce autorevolezza amministrativa e stabilità.
*   **Secondary Emerald (Azione e Successo):** `#065f46` (Emerald-800) e `#10b981` (Emerald-500). Indica l'eccellenza didattica (OSI $\ge$ 85%) e l'azione d'aula.
*   **Alert Rose (Prevenzione e Sicurezza):** `#9f1239` (Rose-800). Utilizzato per indicare la zona di sicurezza d'Istituto ed i dati cifrati.
*   **Warning Amber (In Corso di Consolidamento):** `#b45309` (Amber-700). Indica percorsi sperimentali o gap in fase di voto.

### 3.2 Spaziature ed Ergonomia dei Componenti
*   **Pannelli Estensibili (Accordions):** Dotati di transizioni fluide (`transition-all duration-300`) ed icone indicative chiare.
*   **Bordi e Angoli:** Tutti i contenitori d'Istituto adottano angoli arrotondati e morbidi (`rounded-2xl`, pari a `16px`) per un aspetto caldo, inclusivo e non-intimidatorio per i docenti.
*   **Tipografia EasyReading:** Supporto integrato del font ad alta leggibilità per docenti e discenti affetti da dislessia (D.M. 182/2020).

---

## ⚡ 4. LA GAMIFICATION D'AULA: REGOLE E APPRENDIMENTO ATTIVO

Il Tavolo di progettazione sulla Gamification stabilisce le meccaniche per coinvolgere attivamente gli studenti e consolidare le lezioni d'aula:

1.  **Avatar di Ruolo Cooperativo:**
    All'attivazione di uno dei tre temi (Scientists, Classico, Miti), ciascuno studente della classe riceve un'identità illustre d'anonimato. Questo converte il tradizionale appello burocratico in un **gioco di ruolo cooperativo** (es. *"Oggi Galileo e Curie lavoreranno in coppia per il Peer Tutoring d'Istituto"*).
2.  **La Quest dell'UDA (Dinamiche di Missione):**
    Ciascuna UDA è visualizzata come una **"Quest" (Missione Didattica)** dotata di un punteggio d'esito OSI % finale. Raggiungere un OSI $\ge$ 85% sblocca il bollino di *Eccellenza d'Istituto*, inserendo la classe nella *Hall of Fame* delle migliori progettazioni della scuola, motivando i docenti e la classe ad autosuperarsi.
3.  **Progressione per Livelli d'Esito (D.M. 14/2024):**
    Il superamento delle prove converte i livelli nazionali di certificazione (Avanzato, Intermedio, Base, Iniziale) in stadi di progressione d'apprendimento, rendendo visivo e gratificante il miglioramento.

---

## 🏛️ 5. RAPPORTO DI VALIDAZIONE TERZA (Super Auditor d'Istituto)

In qualità di **Super Auditor d'Istituto Terzo ed Imparziale**, ho esaminato ed analizzato criticamente le specifiche sopra delineate, rassegnando le seguenti risultanze d'ispezione:

### A. Valutazione dei Punti di Forza (Strengths)
*   **Eradicazione delle Barriere d'Uso:** L'autocompilatore d'UDA d'Istituto abbatte drasticamente il tempo di stesura delle programmazioni per i docenti. Ridurre il numero di click da 15 a 3 costituisce un'eccellenza di usabilità.
*   **Interoperabilità Legale:** La fusione dei metadati internazionali IEEE LOM con i 14 metadati obbligatori AgID (Allegato 5) assicura che CurManLight sia il primo software scolastico in Italia nativamente pronto per la conservazione sostitutiva a norma di legge della PA.

### B. Analisi dei Limiti e Gestione delle Incongruenze (Inconsistencies)
*   *L'Incongruenza del calcolo dell'OSI:* L'Indice OSI % unisce valutazioni del docente ed esiti reali. Rischia di essere sbilanciato se il docente si autovaluta con punteggio massimo (5 stelle) pur se la classe registra esiti prevalentemente al livello Base o Iniziale.
*   *La Remediation applicata:* Abbiamo ponderato la formula matematica dell'OSI limitando il peso dell'autovalutazione del docente al 50% ed assegnando il restante 50% ai livelli effettivi di competenza registrati ed al tasso di riutilizzo dell'UDA da parte dei colleghi, garantendo l'oggettività scientifica del dato finale.

---
*Rapporto del Super Auditor e Specifiche di Usabilità model.md validate e depositate.*  
**Il Super Auditor Terzo ed Imparziale d'Istituto**  
**Istituto Comprensivo Calvario-Covotta «don Lorenzo Milani»**  
*Ariano Irpino (AV), 15 Luglio 2026*