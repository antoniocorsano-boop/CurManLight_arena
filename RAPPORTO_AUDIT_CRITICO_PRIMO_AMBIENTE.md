# 🔍 Rapporto di Audit Critico — Primo Ambiente: Curricolo d'Istituto
**Organo di Valutazione Indipendente (OIV) — Progetto CurManLight v5.0**  
*Data di Audit: 17 Luglio 2026*

Questo documento costituisce l'esame indipendente e l'audit critico sulle scelte architetturali, sull'ergonomia cognitiva e sull'integrità del codice relative al **Primo Ambiente: Curricolo d'Istituto**, come implementate e dichiarate nella recente release.

---

## 📊 1. Valutazione Metrica e Analisi delle Scoperte

### 🟢 1.1 Elementi di Forza Accertati
1. **Integrazione del Pannello Informativo Contestuale (Context-Aware)**: L'architettura del pannello informativo in cima alla vista curricolo è tecnicamente impeccabile. Riconosce dinamicamente lo stato dell'applicazione (Materia, Ordine di Scuola, Vista Attiva) e genera stringhe di sintesi ad altissimo valore informativo, eliminando i vecchi testi didascalici statici e ridondanti.
2. **Modularità delle Sotto-Viste**: La transizione da un layout monolitico a tre sotto-ambienti ben definiti (*Vista ad Albero*, *Mappa Verticale*, *Gestione & Popolamento*) rispetta l'intento d'uso del docente e riduce il tempo di interazione complessivo.
3. **Piena Retrocompatibilità con i Test E2E d'Istituto (23/23 Green)**: Nonostante la profonda ristrutturazione visuale, l'interfaccia mantiene intatta l'accessibilità dei selettori (es. `id="curricolo-view-albero"` e la dicitura *"Popolamento"*), permettendo a tutte le asserzioni delle suite Playwright e del simulatore di agenti reali di passare al primo tentativo senza regressioni a runtime.

---

## ⚠️ 2. Rilievo Critico di Regressioni e Paradossi Usabilità (HCI)

Nell'ottica di un esame rigoroso, obiettivo e non compiacente, l'OIV evidenzia due criticità sostanziali derivanti dall'applicazione letterale dei requisiti di pulizia:

### ⚡ 2.1 Il Paradosso della Purga delle Emoji (Estetica vs. Legge di Hick)
* **La Scelta**: L'eliminazione totale di tutte le icone grafiche ed emoji per conferire un look accademico e istituzionale è stata portata a termine con successo (0 emoji rilevate nel sorgente `src/App.tsx`).
* **La Regressione HCI**: In precedenza, le icone disciplinari (es. l'icona del libro per italiano, della calcolatrice per matematica) fungevano da **ancore visive pre-attentive**. La loro totale scomparsa rende l'elenco delle 14 materie d'insegnamento un blocco di pulsanti testuali visivamente omogenei.
* **Impatto Logico**: Ai sensi della **Legge di Hick**, il tempo di selezione $T$ per rintracciare una materia in una lista omogenea aumenta, poiché il cervello del docente non può più fare affidamento sul riconoscimento cromatico/iconico immediato ma deve effettuare una scansione sequenziale di lettura del testo.

### 🔴 2.2 La Sparizione dei Simboli Strutturali (`✕` e `★`)
* **L'Errore del Filtro Standard**: Il meccanismo di pulizia automatica tramite regex ha operato in modo pervasivo sui blocchi Unicode `\u2700-\u27bf` (Dingbats e simboli grafici).
* **Il Danno Collaterale**:
  1. Il carattere speciale `✕` (moltiplicazione/chiusura), utilizzato come pulsante interattivo all'interno delle pillole d'onboarding e della ridenominazione inline delle sezioni, è stato **completamente eliminato**, lasciando i pulsanti di chiusura visualmente vuoti (sebbene ancora cliccabili a livello di coordinate DOM).
  2. Il simbolo delle stelle di merito qualitativo degli studenti (`★` - stella nera, `\u2605`) è stato anch'esso azzerato, rendendo invisibile il tracciamento del punteggio degli allievi nel registro d'aula.
* **Raccomandazione dell'OIV**: È necessario ripristinare immediatamente i caratteri di controllo strutturale (come la croce standard di chiusura `x` o caratteri SVG dedicati) per evitare danni di accessibilità visiva, mantenendo ferma la purga delle sole emoji prettamente decorative.

---

## 🧩 3. Data Gaps e Rilevazione di Fallacie Logiche

1. **La Fallacia del "Co-pilota IA Locale"**: 
   * *Asserzione precedente*: Il co-pilota semantico genera istantaneamente traguardi e obiettivi raccordati.
   * *Realtà dell'Audit*: Il co-pilota opera su un motore basato su dizionari predefiniti e pattern generativi locali in React (`src/store/curmanlight_v2_core_simulator.ts`). Sebbene questo garantisca il funzionamento offline al 100%, l'intelligenza è pre-programmata. Presentarla al Collegio Docenti come "Intelligenza Artificiale locale autonoma e illimitata" è una fallacia commerciale; si tratta di un motore di template semantici ad alta fedeltà.
2. **La Frammentazione delle Spiegazioni Lunghe**:
   * *Realtà dell'Audit*: Sebbene la vista principale `curricolo` sia stata bonificata da spiegazioni ridondanti, le aree adiacenti dello stesso macro-ambiente (come l'introduzione alla *Revisione Gap 2025* o l'introduzione alle *Fonti d'Istituto*) contengono ancora schede descrittive di oltre 3 righe che rallentano l'esperienza d'uso. Nel prossimo sprint, anche queste sezioni dovranno essere ricondotte allo standard essenziale del primo ambiente.

---

## 📋 4. Piano di Rientro Immediato (Remediation)

Per ovviare alle criticità strutturali senza alterare lo stato dei test superati, l'OIV prescrive le seguenti correzioni esecutive immediate:
1. **Ripristino Visuale della Chiusura**: Sostituire il carattere Unicode rimosso con una croce standard `x` (ASCII) o con una croce grafica esente da vincoli Unicode d'emoji.
2. **Ripristino della Valutazione Qualitativa**: Reinserire un simbolo di tracciamento standard per le valutazioni degli studenti (es. caratteri alfanumerici o un carattere stella standard ASCII come `*` o un SVG leggero di Lucide come `Star` o `X`).

---

*L'Organo di Valutazione Indipendente convalida la robustezza tecnica e la conformità normativa dell'ambiente, ma solleva formale riserva sul paradosso usabilità causato dalla rimozione indiscriminata dei caratteri di controllo.*
