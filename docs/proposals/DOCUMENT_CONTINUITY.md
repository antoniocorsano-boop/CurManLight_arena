# Document Continuity — Analisi del problema

> **Obiettivo iniziativa**: Il docente potra identificare rapidamente quali documenti ha prodotto dal suo lavoro, affermare con sicurezza qual e la versione piu recente, e recuperare senza sforzo il collegamento tra un documento scaricato e lo stato attuale del lavoro che lo ha generato.

> **Stato**: Osservazione, analisi, e mock completati. In attesa di validazione utente.

---

## 1. Contesto

CurManLight offre 15+ modalita di esportazione: Word (.doc/.docx), ODF (.odt), PDF, TXT, CML, Markdown, tabella comparativa, clipboard, SCORM, template AI, e template personalizzati. Dopo l'esportazione, il file viene scaricato sul dispositivo dell'utente e **non viene lasciata alcuna traccia** nell'applicazione: nessun registro, nessun collegamento alla fonte, nessuna indicazione di stato.

L'unica prova che un'esportazione e avvenuta e la presenza del file nella cartella Downloads del browser.

## 2. Osservazione del codice reale

### 2.1 Sistema di esportazione attuale

**File chiave osservati**:
- `src/features/documents/hooks/useDocumentExportHandlers.ts` (921 righe) — tutti i gestori di download
- `src/features/documents/components/EsportazioniTab.tsx` (417 righe) — interfaccia utente
- `src/features/progettazione/components/ProgettazioneTab.tsx` (1061 righe) — archivio UDA
- `src/store/useCurriculumStore.ts` — store Zustand con `savedUdas[]`

### 2.2 Flusso attuale dell'esportazione

```
[Docente produce lavoro] → [Apre vista Documenti] → [Sceglie formato] → [Scarica file]
                                                              ↓
                                                     Toast: "Download avviato!"
                                                              ↓
                                                     Fine. Nessuna traccia.
```

### 2.3 Dati disponibili ma scollegati

| Dati disponibili al momento dell'esportazione | Dove vengono usati | Dove finiscono |
|---|---|---|
| ID UDA, titolo, disciplina, ordine, periodo | Generano metadati nel file Word | **Scartati** dopo il download |
| Status del lavoro (bozza, in revisione, validata) | Non usato | **Mai collocato** |
| Timestamp dell'esportazione | Non usato | **Mai registrato** |
| Contesto (titoli traguardi, obiettivi) | Inseriti nel file Word come note | **Non salvati** nell'app |
| Formato scelto (DOCX, PDF, etc.) | Generano il file | **Non tracciato** |

**Problema fondamentale**: Il sistema ha tutti i dati necessari per creare un registro delle esportazioni, ma li scarta tutti dopo aver generato il file.

## 3. Definizione del problema

### In parole semplici
Un docente che ha esportato 3 UDA in 3 formati diversi in 3 giorni diversi non ha modo di sapere:
1. **Cosa ha prodotto** — "Quali documenti ho esportato?"
2. **Quale e aggiornato** — "Quale versione riflette il lavoro attuale?"
3. **Da dove viene** — "Quale UDA ha generato questo documento?"

### In termini strutturali
Manca un **collegamento persistente** tra:
- Il file scaricato sul dispositivo
- Il lavoro sorgente nell'applicazione
- Lo stato di coerenza tra le due versioni

## 4. Alternative valutate

### A. Registro locale essenziale (consigliato)
- **Cosa**: Salvare in localStorage/IndexedDB un registro delle ultime 5 esportazioni con: ID, tipo, formato, titolo, disciplina, ordine, data, stato del lavoro al momento dell'esportazione
- **Coerenza**: Confrontare `updatedAt` del lavoro con il timestamp dell'esportazione
- **Limite**: Max 5 voci (le piu recenti); le vecchie vengono eliminate automaticamente
- **Complessita**: Bassa — nessun backend, nessuna sincronizzazione

### B. Registro completo con storico
- **Cosa**: Come A, ma senza limite di voci e con possibilita di cercare e filtrare
- **Pro**: Storico completo
- **Contro**: Complessita maggiore, rischio di crescita dei dati, necessita di gestione della pulizia

### C. Log testuale
- **Cosa**: Aggiungere una sezione "Cronologia esportazioni" nel pannello Documenti
- **Pro**: Semplice
- **Contro**: Solo lettura, nessuna azione diretta, nessun collegamento al lavoro

### D. Connessione con il browser
- **Coso**: Usare API del browser per tracciare i download
- **Pro**: Automatico
- **Contro**: API limitate, problemi di sicurezza, non funziona su tutti i browser

**Raccomandazione**: Alternativa A (registro locale essenziale) per il primo rilascio. Basta per risolvere il problema reale con minima complessita tecnica.

## 5. Linguaggio proposto

| Termine attuale (evitare) | Termine proposto | Perche |
|---|---|---|
| Log / Registro esportazioni | Documenti prodotti | Orientato all'utente, non al tecnico |
| Timestamp | Data e ora dell'esportazione | Chiaro, concreto |
| Source | Fonte / Lavoro di origine | Italiano naturale |
| Stale / Outdated | Modificato dopo questa esportazione | Descrittivo, non giudicante |
| Saved | Scaricato sul dispositivo | Fisico, chiaro |
| Status | Stato del lavoro | Collegato al contesto |

## 6. Criteri di valutazione

| Criterio | Alternativa A | Alternativa B | Alternativa C | Alternativa D |
|---|---|---|---|---|
| Utente capisce cosa ha esportato | SÌ | SÌ | Parziale | SÌ |
| Utente sa se e aggiornato | SÌ | SÌ | No | SÌ |
| Utente collega documento a fonte | SÌ | SÌ | No | SÌ |
| Minima complessita tecnica | SÌ | No | SÌ | No |
| Funziona offline | SÌ | SÌ | SÌ | Parziale |
| Max 5 voci (pulizia automatica) | SÌ | No | N/A | N/A |

**Vincitore**: Alternativa A — Registro locale essenziale delle esportazioni.

## 7. Mock

Disponibile in `mocks/document-continuity/`. Include 6 stati:
1. Nessun documento prodotto
2. Esportazione appena completata
3. Registro con piu documenti (5 voci)
4. Lavoro modificato dopo esportazione
5. Documento ancora coerente
6. Stato non verificabile

## 8. Prossimi passi

1. Validazione utente del mock
2. Se approvato: implementazione come initiativa CML-605
3. Test di integrazione
4. Integrazione al rilascio successivo
