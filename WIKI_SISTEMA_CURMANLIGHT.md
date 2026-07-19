# 🧠 WIKI DI SISTEMA — CURMANLIGHT v1.5.0
### Documentazione Tecnica, Architettura e Manuale Utente per l'Istituto Comprensivo "don Lorenzo Milani"

Benvenuto nella Wiki di Sistema ufficiale del progetto **CurManLight**, la piattaforma evoluta per l'allineamento dei curricoli e la progettazione delle Unità di Apprendimento (UDA) verticali. Questo documento descrive l'architettura tecnica, le modalità di manutenzione e la guida operativa per tutti i ruoli scolastici coinvolti.

---

## 🧭 1. GUIDA OPERATIVA E GERARCHIA DEI RUOLI (GOVERNANCE)

L'applicazione supporta una gerarchia rigida di **6 ruoli scolastici**, ciascuno abilitato a specifiche azioni e visualizzazioni per garantire un processo democratico, asincrono e controllato (Human-in-the-Loop):

```
       [AMMINISTRATORE]  ──► Gestione completa, importazione/esportazione massiva
              │
         [COLLEGIO]      ──► Approvazione formale e validazione d'Istituto
              │
         [DIRIGENTE]     ──► Supervisione, firma del PTOF e decreti di attuazione
              │
        [REFERENTE]      ──► Sintesi interdisciplinare, coordinamento commissione
              │
       [DIPARTIMENTO]    ──► Votazione comparativa DM 254/2012 ➔ DM 221/2025
              │
        [INSEGNANTE]     ──► Compilazione bozze, programmazione annuale, UDA
```

### 1.1 Insegnante (Docente)
* **Azioni abilitate**: Consulta i curricoli verticali di tutte le 14 materie; effettua ricerche per testo e filtri per ordine scolastico; seleziona traguardi, obiettivi ed evidenze comportamentali per compilare bozze di Programmazione Annuale e creare nuove Unità di Apprendimento (UDA).
* **Persistenza**: Le bozze della programmazione e l'archivio UDA personale vengono salvati in tempo reale nel browser tramite `localStorage` e IndexedDB per prevenire la perdita di dati.

### 1.2 Dipartimento Disciplinare (Commissione)
* **Azioni abilitate**: Accede alla scheda "Revisione" per esaminare i gap tra i testi del DM 254/2012 e le nuove linee guida DM 221/2025. Esprime un voto collegiale: **Accetta 2025** (✅), **Mantieni 2012** (❌) o **Personalizza testo** (✏️).
* **Obiettivo**: Formulare la proposta disciplinare da sottoporre al Referente d'Istituto.

### 1.3 Referente di Plesso / Funzione Strumentale
* **Azioni abilitate**: Coordina il lavoro dei dipartimenti. Verifica lo stato dei consensi ed esamina le proposte di modifica per evitare incongruenze terminologiche o sovrapposizioni tra classi attigue.
* **Esportazione**: Abilitato a esportare i pacchetti di lavoro intermedi in formato `.cml` o `.json`.

### 1.4 Dirigente Scolastico (DS)
* **Azioni abilitate**: Supervisiona l'allineamento complessivo dell'offerta formativa. Esamina il report consolidato "📋 Finale in Verifica" e approva le variazioni strategiche dell'istituto in conformità con l'Atto di Indirizzo d'Istituto.

### 1.5 Collegio dei Docenti
* **Azioni abilitate**: Organo sovrano di validazione. Delibera l'adozione del Curricolo Verticale definitivo come allegato cardine del PTOF dell'Istituto Comprensivo "don Lorenzo Milani".

### 1.6 Amministratore di Sistema
* **Azioni abilitate**: Esegue ripristini d'emergenza, resetta la cache locale d'istituto, effettua l'importazione di backup esterni e scarica il file Word definitivo formattato per la pubblicazione su "Scuola in Chiaro" e sul Portale Unica.

---

## 🏗️ 2. ARCHITETTURA DEL SOFTWARE ED ECOSTRUTTURA

L'applicazione è stata sviluppata utilizzando un'architettura **JAMstack moderna**, concepita per essere altamente performante, reattiva a livello di contesto e completamente autonoma (offline-safe):

```
┌───────────────────────────────────────────────────────────────┐
│                       INTERFACCIA UTENTE                      │
│             React (JSX) + Tailwind CSS (Responsive)           │
└───────────────────────────────┬───────────────────────────────┘
                                ▼
┌───────────────────────────────────────────────────────────────┐
│                    ZUSTAND STATE MANAGEMENT                   │
│        Gestione reattiva di filtri, ruoli e selezioni         │
└───────────────────────────────┬───────────────────────────────┘
                                ▼
┌───────────────────────────────────────────────────────────────┐
│                     STORAGE ENGINE PERSISTENCE                │
│       Dexie.js (IndexedDB) + Fallback sicuro MemoryStore      │
└───────────────────────────────────────────────────────────────┘
```

### 2.1 Stack Tecnologico Scelto
1. **React 18.3 & TypeScript**: Per uno sviluppo dei componenti modulare, tipizzato in modo forte ed esente da ReferenceError a runtime.
2. **Tailwind CSS v3**: Per garantire un'interfaccia responsive e bellissima, con navigazione inferiore fissa a 5 elementi su mobile e barra laterale collassabile su desktop.
3. **Zustand & Dexie.js (IndexedDB)**: Zustand gestisce lo stato di navigazione dei docenti. Dexie.js funge da wrapper per IndexedDB per memorizzare pacchetti di modifiche e archivi UDA di grandi dimensioni, superando il limite rigido di 5MB del localStorage.
4. **Vite + Vite Single File Plugin**: Compila e ottimizza l'intera applicazione (HTML, CSS e JavaScript minimizzato) in un **singolo file autonomo inlined** (`index.html`), ideale per essere caricato sulla rete Intranet scolastica, su chiavette USB dei docenti o su hosting gratuito (Netlify).

### 2.2 Gestione degli Ambienti Sandbox (Opaque Origin Fallback)
I browser moderni, quando eseguono applicazioni all'interno di iframe con attributo `sandbox` (come l'anteprima integrata di Arena.ai o la modalità di navigazione anonima di Opera e Safari), bloccano l'accesso a `localStorage` e `indexedDB` sollevando un `SecurityError`.
Per garantire il **funzionamento ininterrotto (Zero White Screens)**, il nostro store di Zustand integra un test difensivo all'avvio. Se l'accesso al database del browser viene negato, il sistema devia automaticamente la memorizzazione dei dati su un **in-memory MemoryStore temporaneo**. L'utente riceve una notifica elegante e può continuare a progettare le proprie UDA ed esportare i propri file senza alcun blocco o eccezione.

---

## 📲 3. MANUTENZIONE PWA E CACHE LIFECYCLE

L'applicazione è configurata come una **Progressive Web App (PWA)**, registrando un Service Worker (`sw.js`) per consentire ai docenti di lanciare la piattaforma anche in assenza di connessione internet (in aule sprovviste di Wi-Fi).

### 3.1 Risoluzione del Bug di PWA Deep Caching (Wipe Cache su Load)
Nelle vecchie distribuzioni, alcuni browser mobili (Chrome, Opera, Safari) tendevano a memorizzare in modo permanente una copia corrotta o obsoleta di `index.html` a livello di cache del sito, bloccando la ricezione di nuovi aggiornamenti rilasciati dall'Istituto.
Per risolvere definitivamente questo bug, abbiamo iniettato uno **script di forza e sradicamento** nel file di avvio `src/main.tsx`:
```typescript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for (let registration of registrations) {
      registration.unregister().then(() => {
        console.log('Vecchio Service Worker rimosso con successo.');
      });
    }
  });
  caches.keys().then(function(names) {
    for (let name of names) {
      caches.delete(name);
    }
  });
}
```
Ogni volta che l'applicazione viene ricaricata, pulisce le vecchie istanze di memorizzazione e si allinea alla versione più recente presente sul server statico d'Istituto.

---

## 🗄️ 4. SCHEMA DEI DATI (DATABASE SCHEMA)

Il database offline `CurManLightDB_Evoluto_v1.3` gestisce lo stato di persistenza ed è strutturato con la seguente interfaccia TypeScript:

### 4.1 Modello di Unità di Apprendimento (UdaModel)
Rappresenta l'elemento centrale delle esportazioni e dell'archivio d'istituto:
```typescript
export interface UdaModel {
  id: string;               // Identificatore univoco (es. "uda-it-12345")
  title: string;            // Titolo descrittivo personalizzato dall'utente
  discipline: string;       // Disciplina associata (es. "italiano")
  order: SchoolOrder;       // Ordine scolastico ('infanzia' | 'primaria' | 'secondaria')
  period: string;           // Trimestre o quadrimestre previsto
  hours: number;            // Monte ore preventivato per lo svolgimento
  status: 'bozza' | 'in revisione' | 'pronta per confronto' | 'validata' | 'archiviata';
  traguardi: string[];      // Array di traguardi d'istituto selezionati (memoria certa)
  obiettivi: string[];      // Array di obiettivi d'apprendimento selezionati (memoria certa)
  evidenze: string[];       // Array di evidenze comportamentali (DM 14/2024)
  realTask: string;         // Descrizione del compito autentico / prodotto atteso
  notes: string;            // Note metodologiche ed inclusive di personalizzazione
  createdAt: string;        // Data di creazione del record
}
```

### 4.2 Stato Utente e Decisioni di Voto (UserState)
Registra il profilo di navigazione e lo stato del consenso sul gap 2012 ➔ 2025:
* `role`: Ruolo scolastico attivo dell'utente.
* `decisions`: Record `Record<string, DecisionStatus>` (mappa l'ID della proposta al voto espresso: `'approved' | 'rejected' | 'custom'`).
* `customTexts`: Record `Record<string, string>` (contiene il testo personalizzato a mano dai docenti nel caso in cui abbiano votato per "Modifica/Personalizza").
* `selectedTraguardi`, `selectedObiettivi`, `selectedEvidenze`: Array di indici temporanei usati durante la compilazione dell'UDA per non perdere la selezione in caso di cambi di scheda accidentali.
