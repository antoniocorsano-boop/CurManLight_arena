# Document Continuity — Piano di validazione

> **Obiettivo**: Validare l'alternativa A (registro locale essenziale delle esportazioni) con un docente reale usando il mock interattivo.

---

## 1. Setup

### 1.1 Ambiente
- Mock in `mocks/document-continuity/index.html` — aprire in Chrome o Firefox
- Nessuna installazione necessaria, il mock e standalone
- Funziona anche su tablet/mobile (viewport responsive)

### 1.2 Profilo utente target
- Docente di scuola primaria o secondaria
- Ha usato CurManLight per produrre almeno 3-5 UDA
- Ha esportato almeno un documento in un formato diverso (Word, PDF, etc.)
- Ha almeno un caso in cui ha modificato il lavoro dopo averlo esportato

### 1.3 Durata
- 15-20 minuti per la sessione di validazione

---

## 2. Scenario di test

### 2.1 Apertura iniziale (2 min)
**Azione**: Aprire il mock nello stato "Nessun documento".
**Domande**:
1. Guarda questa schermata. Cosa ti aspetteresti di vedere qui?
2. Il messaggio "Non hai ancora prodotto documenti" ti sembra chiaro?
3. Cosa succederebbe secondo te se avessi gia esportato qualcosa?

### 2.2 Prima esportazione (3 min)
**Azione**: Passare allo stato "Appena esportato".
**Domande**:
1. Cosa hai appena prodotto? Da cosa lo capisci?
2. Il messaggio di conferma ti dice abbastanza?
3. Cosa significherebbe per te "Torna al lavoro"?
4. Il contesto ("Deriva da: UDA X, Q2") ti e utile?

### 2.3 Registro con piu documenti (5 min)
**Azione**: Passare allo stato "Piu documenti".
**Domande**:
1. Quanti documenti hai prodotto? Da cosa lo capisci?
2. Riesci a capire quale e aggiornato e quale no?
3. I filtri (Tutti, UDA, Programmazioni, Relazioni) ti sembrano utili?
4. Cosa significa per te "Coerente" vs "Modificato" vs "Da verificare"?
5. Quale documento apriresti per primo? Perche?

### 2.4 Lavoro modificato (3 min)
**Azione**: Passare allo stato "Lavoro modificato".
**Domande**:
1. Cosa ti dice il messaggio giallo?
2. Capisci cosa e cambiato?
3. Cosa faresti: "Torna al lavoro" o "Produci una nuova versione"?
4. Ti fideresti di questa informazione?

### 2.5 Stato non verificabile (2 min)
**Azione**: Passare allo stato "Stato non verificabile".
**Domande**:
1. Cosa significa "Da verificare"?
2. Capisci perche non e possibile verificare?
3. Ti sembra una risposta onesta?

### 2.6 Chiusura (3 min)
**Domande generali**:
1. In una frase, cosa fa questa funzione?
2. Ti sembra utile nella tua pratica quotidiana?
3. Cosa mancherebbe perche sia davvero utile?
4. La metteresti nella sidebar o in Documenti?
5. Scala 1-5: quanto ti fiderebbe di queste informazioni?

---

## 3. Metriche di successo

| Metrica | Soglia minima | Misura |
|---|---|---|
| Comprensione dello scopo | 4/5 docenti danno una risposta corretta | Domanda 1 (chiusura) |
| Utilita percepita | 3/5 docenti danno voto >= 4 | Domanda 2 (chiusura) |
| Fiducia nelle informazioni | 3/5 docenti danno voto >= 3 | Domanda 5 (chiusura) |
| Capacita di distinguere stati | 4/5 docenti interpretano correttamente "Modificato" | Domanda 3 (registro multipli) |

---

## 4. Raccolta dati

### 4.1 Formato
- Note testuali libere per ogni domanda
- Voti su scala 1-5 dove richiesto
- Osservazioni aggiuntive del docente

### 4.2 Template di tracciamento

| Domanda | Risposta | Note |
|---|---|---|
| 1.1 Aspettativa iniziale | | |
| 1.2 Chiarezza messaggio | | |
| 1.3 Aspettativa registro | | |
| 2.1 Comprensione contenuto | | |
| 2.2 Completezza conferma | | |
| 2.3 Significato "Torna" | | |
| 2.4 Utilita contesto | | |
| 3.1 Conteggio documenti | | |
| 3.2 Identificazione stato | | |
| 3.3 Utilita filtri | | |
| 3.4 Comprensione coerenza | | |
| 3.5 Priorita apertura | | |
| 4.1 Comprensione warning | | |
| 4.2 Comprensione modifiche | | |
| 4.3 Scelta azione | | |
| 4.4 Fiducia | | |
| 5.1 Significato "verificare" | | |
| 5.2 Comprensione limite | | |
| 5.3 Onesta informazione | | |
| 6.1 Descrizione funzione | | |
| 6.2 Utilita quotidiana | | |
| 6.3 Mancante | | |
| 6.4 Posizionamento | | |
| 6.5 Fiducia (1-5) | | |

---

## 5. Criteri di passaggio

| Criterio | Esito |
|---|---|
| La maggioranza dei docenti capisce lo scopo | PASS / FAIL |
| La maggioranza dei docenti trova il registro utile | PASS / FAIL |
| I termini italiani sono comprensibili | PASS / FAIL |
| Gli stati (coerente/modificato/da verificare) sono interpretabili | PASS / FAIL |
| Il docente sa cosa fare dopo aver visto un warning | PASS / FAIL |

**Tutti i criteri devono essere PASS per procedere all'implementazione.**

---

## 6. Dopo la validazione

- Se tutti PASS: procedere con CML-605
- Se almeno 1 FAIL: rivedere il mock e ripetere la validazione
- Documentare i risultati in `docs/proposals/DOCUMENT_CONTINUITY_VALIDATION_RESULTS.md`
