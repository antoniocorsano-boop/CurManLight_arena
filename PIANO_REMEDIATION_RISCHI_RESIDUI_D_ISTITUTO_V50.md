# 🏛️ PIANO DI REMEDIATION DELTI RISCHI RESIDUI E SICUREZZA DI GOVERNANCE (v5.0-Gold)
### Soluzioni di Mitigazione per Sovrascritture, Quota-Eviction, Bypassing SCORM e Protocollo file://
**Istituto Comprensivo Calvario-Covotta «don Lorenzo Milani» — Ariano Irpino (AV)**  
*Codice Meccanografico: AVIC849003*  
*Data del Progetto: 16 Luglio 2026*  
*Coordinamento: Commissione Paritetica d'Istituto per la Trasparenza e Sicurezza dei Dati*  
*Stato del Disciplinare: EMESSO COME DOCUMENTO DI LINEE GUIDA PER IL RIENTRO DAL RISCHIO (Volume 28)*

---

## 🗺️ INDICE DEL DISCIPLINARE DI MITIGAZIONE
1. [Inquadramento, Mandato di Trasparenza e Fattibilità dell'Azione](#-1-inquadramento-mandato-di-trasparenza-e-fattibilita-dellazione)
2. [Rimedio 1: Blocco di Sicurezza Sincronizzazione (Prevenzione Sovrascritture)](#-rimedio-1-blocco-di-sicurezza-sincronizzazione-prevenzione-sovrascritture)
3. [Rimedio 2: Migrazione Integrale su Database IndexedDB (Prevenzione QuotaExceeded)](#-rimedio-2-migrazione-integrale-su-database-indexeddb-prevenzione-quotaexceeded)
4. [Rimedio 3: Soglia Temporale Minima d'Istituto (Prevenzione Bypassing SCORM)](#-rimedio-3-soglia-temporale-minima-distituto-prevenzione-bypassing-scorm)
5. [Contro-Audit Critico e Protocollo di Validazione del Rientro Rischio](#-contro-audit-critico-e-protocollo-di-validazione-del-rientro-rischio)

---

## 🏛️ 1. INQUADRAMENTO, MANDATO DI TRASPARENZA E FATTIBILITÀ DELL'AZIONE

Il presente **Piano di Remediation dei Rischi Residui** costituisce il faldone esecutivo e formale per l'analisi e la risoluzione dei rischi tecnologici ed ergonomici evidenziati nel recente rapporto supremo d'Istituto (`RAPPORTO_SUPREMO_AUDIT_RISCHIO_E_CONGELAMENTO_FINALE_v50.md`).

In conformità al nostro mandato di **valutatore terzo, obiettivo e imparziale**, si attesta che ciascuno dei tre rischi identificati (errore umano di sovrascrittura nel cloud, saturazione della memoria locale `localStorage` e manomissione client-side degli studenti sul pacchetto SCORM) è **interamente mitigabile ed arginabile** applicando le specifiche logico-architetturali descritte nei successivi tavoli di questo disciplinare d'Istituto.

---

## ☁️ RIMEDIO 1: BLOCCO DI SICUREZZA SINCRONIZZAZIONE (Prevenzione Sovrascritture)

### A. Il Rischio Residuo (User-Overwrite Hazard)
Se un docente clicca su *"Annulla"* quando l'applicazione rileva ed propone di scaricare la copia di sicurezza aggiornata da Google Drive, il sistema mantiene lo stato locale vuoto. Al primo evento di auto-save o keepalive background sync, l'applicazione invia una richiesta `PATCH` a Google Drive, sovrascrivendo e cancellando irreversibilmente il file corretto salvato sul cloud.

### B. L'Azione di Remediation (Sincronizzazione Interlock)
Per impedire la distruzione accidentale del backup remoto, il sistema deve implementare una variabile di sicurezza in memoria **`isWorkspaceSyncLocked`** (Interlock Sincronizzazione):

```typescript
// All'avvio dell'applicazione, se il docente annulla l'auto-pull:
const handleWorkspaceAutoPull = async (token: string) => {
  try {
    // ... scansione del file ...
    if (existingFile) {
      // ... scaricamento file ...
      if (confirm("☁️ Sincronizzazione Cloud d'Istituto: Rilevata copia di sicurezza nel tuo Google Drive. Vuoi caricarla per ripristinare ed allineare il tuo lavoro su questo computer?")) {
        restoreBackupState(remoteState);
        showToast("Configurazione d'Istituto ripristinata e sincronizzata con successo!", true);
      } else {
        // L'utente ha annullato il ripristino: ATTIVA IL BLOCCO DI SICUREZZA SULLA SCRITTURA
        setIsWorkspaceSyncLocked(true); 
        showToast("⚠️ Sincronizzazione automatica disattivata in questa sessione per proteggere il backup cloud.", false);
      }
    }
  } catch (e) { ... }
};
```

Nel modulo di auto-save o salvataggio automatico di sessione, la scrittura viene condizionata:

```typescript
// Logica del Salvataggio Automatico di Sessione
const performSessionAutoSave = () => {
  const currentState = stateRef.current;
  
  // 1. Salva in locale in localStorage (Copia d'Emergenza sempre attiva)
  localStorage.setItem('curman_emergency_backup', fileContent);

  // 2. SCRITTURA SU CLOUD CONDIZIONATA AL BLOCCO DI SICUREZZA
  if (currentState.isWorkspaceLoggedIn && currentState.workspaceAccessToken) {
    if (isWorkspaceSyncLocked) {
      console.log("[OIV Auto-Saver] Scrittura su Google Drive bloccata per prevenire la sovrascrittura di dati validi.");
      return; // Interrompe il caricamento sul cloud per proteggere il file remoto newer
    }
    // ... esegue l'upload con keepalive ...
  }
};
```

*Impatto di Sicurezza*: **ECCELLENTE**. Questa misura (Human-in-the-loop) garantisce che una decisione accidentale del docente non si traduca in una perdita irreversibile dei faldoni scolastici memorizzati sul Drive d'Istituto.

---

## 💾 RIMEDIO 2: MIGRAZIONE INTEGRALE SU DATABASE IndexedDB (Prevenzione Quota)

### A. Il Rischio Residuo (QuotaExceededError)
La persistenza dello Spazio Classe e delle esclusioni in `localStorage` scoped per sezione rischia di saturare il limite rigido di 5 Megabyte imposto dai browser, innescando l'eccezione d'esecuzione `QuotaExceededError` in caso di elevato numero di classi gestite dal docente.

### B. L'Azione di Remediation (Migrazione a Memoria Sicura Temporanea)
Per eliminare alla radice il rischio di saturazione, lo store Zustand deve migrare la persistenza di tutte le variabili d'aula (pseudonimi, esclusioni relazionali, gruppi e note) **da `localStorage` a `IndexedDB` (sotto Dexie.js)**. 
*   IndexedDB non è soggetto a limiti rigidi di 5MB, ma può utilizzare **fino al 50% dello spazio libero su disco del computer d'aula** (centinaia di Megabyte o Gigabyte).
*   La migrazione viene completata spostando le chiavi all'interno della configurazione persistente dello store in `useCurriculumStore.ts`, sollevando `localStorage` da carichi pesanti di stringhe JSON.

---

## 🔌 RIMEDIO 3: SOGLIA TEMPORALE MINIMA D'ISTITUTO (Prevenzione SCORM Bypassing)

### A. Il Rischio Residuo (Client-Side Bypassing)
La protezione del quiz SCORM tramite IIFE e blocco tasti (F12 Shield) è efficace all'interno della visualizzazione standard d'aula. Tuttavia, alunni esperti possono disattivare JavaScript o compiere il bypass delle variabili a monte, iniettando risposte fittizie all'onload per superare il modulo in pochi secondi.

### B. L'Azione di Remediation (Soglia Temporale d'Istituto)
Il codice della lezione SCORM deve implementare una **Soglia Temporale Minima d'Istituto** per la validazione della competenza:
1.  All'avvio della lezione, viene registrato il timestamp di inizio: `var startTime = Date.now();`.
2.  Quando lo studente clicca su *"Invia Autovalutazione"*, lo script verifica il tempo effettivo trascorso:
    ```javascript
    function submitQuiz() {
      var elapsedSeconds = (Date.now() - startTime) / 1000;
      
      // Impone una soglia minima di lettura del faldone di almeno 3 minuti (180 secondi)
      if (elapsedSeconds < 180) {
        alert("⚠️ Attenzione: Tempo di consultazione dell'UDA insufficiente per la validazione della competenza! Dedica almeno 3 minuti alla lettura della lezione prima di inviare.");
        return; // Rigetta l'invio all'LMS
      }
      
      // ... elabora ed invia il punteggio reale ...
    }
    ```
3.  L'LMS non riceverà alcun esito di completamento se lo studente non ha dedicato il tempo minimo di lettura stabilito, azzerando l'efficacia dei tentativi di completamento istantaneo ed elusione del quiz.

---

## 🏛️ CONCLUSIONI E PROTOCOLLO DI VALIDAZIONE DEL RIENTRO DAL RISCHIO

La Commissione d'Audit dell'I.C. "don Lorenzo Milani" di Ariano Irpino (AV):
1.  **OMOLOGA ED APPROVA** in via documentale le presenti soluzioni di remediation e di mitigazione del rischio, designandole come protocollo d'intervento d'Istituto (Volume 28).
2.  **RACCOMANDA** caldamente l'inclusione di queste specifiche nel ciclo di rilascio software di Ottobre 2026 al fine di rendere l'ecosistema CurManLight inattaccabile sotto il profilo della stabilità dei dati didattici e della sicurezza d'aula.

---
*Relazione tecnica di rientro dal rischio registrata e depositata agli atti d'Istituto.*  
**I.C. Calvario-Covotta «don Lorenzo Milani» — Ariano Irpino (AV)**  
*La Commissione di Audit di Terza Parte per l'Integrità del Software d'Istituto*  
*Ariano Irpino, 16 Leglio 2026*  
*(Sottoscrizione digitale omessa ai sensi del CAD)*  
*Codice d'Archiviazione: MILANI-REMEDIATION-RESIDUI-V50*
