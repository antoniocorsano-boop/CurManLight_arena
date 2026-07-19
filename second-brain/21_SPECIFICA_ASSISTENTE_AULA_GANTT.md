# 📊 SPECIFICA TECNICA E PEDAGOGICA: ASSISTENTE ESTEMPORANEO E GANTT D'AULA
### Architettura dell'Agente Didattico d'Aula, Analisi dei Raccordi in Tempo Reale e Cronoprogramma di Gantt Reattivo
**Istituto Comprensivo Calvario-Covotta «don Lorenzo Milani» — Ariano Irpino (AV)**  
*Codice Meccanografico: AVIC849003*  
*Data del Progetto: 15 Luglio 2026*  
*Coordinamento: Tavolo di Sviluppo Ingegneristico per l'Azione Didattica in Aula (Pillar III)*  
*Stato del Progetto: APPROVATO ED INTEGRATO COME VOLUME 21 DEL SECOND BRAIN D'ISTITUTO*

---

## 🗺️ INDICE DEL DISCIPLINARE TECNICO
1. [Quadro Strategico: L'Azione Didattica Estemporanea e l'Allineamento Continuo](#-1-quadro-strategico-lazione-didattica-estemporanea-e-lallineamento-continuo)
2. [L'Algoritmo di Raccordo d'Argomento (AI Link & Mapping Engine)](#-2-lalgoritmo-di-raccordo-dargomento-ai-link--mapping-engine)
3. [Il Diagramma di Gantt d'Istituto: Visualizzazione Spazio-Temporale delle UDA](#-3-il-diagramma-di-gantt-distituto-visualizzazione-spazio-temporale-delle-uda)
4. [Specifiche di Flusso ed Esperienza Utente (UX d'Aula)](#-4-specifiche-di-flusso-ed-esperienza-utente-ux-daula)
5. [Integrazione con lo standard LOM ed Esiti per Livelli (D.M. 14/2024)](#-5-integrazione-con-lo-standard-lom-ed-esiti-per-livelli-dm-142024)

---

## 🏛️ 1. QUADRO STRATEGICO: L'AZIONE DIDATTICA ESTEMPORANEA

Nella realtà quotidiana dell'aula scolastica, l'insegnamento non segue mai un percorso rigidamente lineare. Il docente ha la necessità di cogliere gli stimoli estemporanei degli alunni, i fatti d'attualità o le necessità di recupero affrontando argomenti non preventivamente pianificati (didattica estemporanea).

Tuttavia, per non frammentare la coerenza programmatoria d'istituto, qualsiasi argomento trattato sul momento deve essere **raccordato, motivato ed allineato** con l'offerta formativa triennale (PTOF) e con le Unità di Apprendimento (**UDA**) deliberate dai dipartimenti.

L'**Assistente Estemporaneo d'Argomento e Gantt d'Aula** (v5.0) è lo strumento d'aula concepito per risolvere questo trade-off. Quando il docente in classe sceglie di affrontare un argomento estemporaneo, il sistema determina in background se e come legarlo alle UDA già programmate per quella classe; in assenza di legami, propone una nuova progettazione d'UDA iniettandola istantaneamente nel piano di lavoro e nel diagramma di Gantt reattivo d'Istituto.

---

## 🔍 2. L'ALGORITMO DI RACCORDO D'ARGOMENTO (Link Engine)

L'algoritmo opera secondo un flusso logico deterministico e semantico strutturato su due scenari d'aula:

```
                  [ ARGOMENTO INSERITO DAL DOCENTE ]
                                 │
                                 ▼
                     [ SCANSIONE DATABASE UDA ]
                    (Filtro su Classe Attiva e Materia)
                                 │
            ┌────────────────────┴────────────────────┐
            ▼ (Raccordo Trovato)                      ▼ (Nessun Raccordo)
   [ SCENARIO A: COLLEGAMENTO ]             [ SCENARIO B: INIEZIONE ]
• Evidenzia l'UDA che lo contiene.       • Crea una nuova UDA ad hoc.
• Mostra obiettivi e compiti.            • Genera compiti e ore (15h).
• Evidenzia la barra nel Gantt.          • Inietta la nuova barra nel Gantt.
```

### 2.1 Scenario A: Collegamento ad UDA Programmata
Se l'argomento inserito (es. *"frazioni"*) è semanticamente correlato ad un'UDA già pianificata per quella classe (es. *"Equazioni e proporzioni"*), il sistema:
1.  Evidenzia il legame curricolare d'Istituto.
2.  Mostra gli obiettivi, i traguardi e le evidenze d'esito D.M. 14/2024 già approvati per quell'UDA, invitando il docente ad ancorare la lezione estemporanea a tale cornice.
3.  Evidenzia la barra corrispondente all'UDA all'interno del Diagramma di Gantt.

### 2.2 Scenario B: Creazione ed Iniezione Automatica (Auto-Proposal)
Se nessun legame viene rilevato (es. l'argomento è *"L'Intelligenza Artificiale etica"* e la classe non ha UDA di tecnologia attive), lo Swarm di esperti d'Istituto genera all'istante un **modello di proposta d'UDA da 15 ore**, definendo:
1.  Un nuovo titolo formale d'UDA d'Istituto.
2.  I traguardi e gli obiettivi del curricolo adatti.
3.  Un compito di realtà autentico ed inclusivo.
4.  La collocazione temporale suggerita all'interno del Diagramma di Gantt d'Istituto.

*Il docente può approvare ed iniettare l'UDA nel proprio piano di lavoro con 1 solo click, aggiornando reattivamente il database ed il diagramma di Gantt d'Istituto.*

---

## 📊 3. IL DIAGRAMMA DI GANTT D'ISTITUTO: CRONOPROGRAMMA REATTIVO

Il **Diagramma di Gantt d'Istituto** è un asse temporale orizzontale suddiviso nei mesi dell'anno scolastico (da Settembre a Giugno) che illustra la durata e la sequenza delle attività d'apprendimento programmate:

*   **Reattività Totale:** La larghezza e la posizione delle barre orizzontali variano dinamicamente in base alle ore complessive pianificate per ciascuna UDA.
*   **Identità d'Area:** Le barre adottano i colori dei design tokens d'Istituto del Pilastro corrispondente (es. *Azzurro* per Scienze, *Viola* per Matematica, *Verde* per Italiano).
*   **Aggiornamento in Background:** L'approvazione di un'UDA estemporanea (Scenario B) aggiunge all'istante una nuova barra temporale al diagramma di Gantt, offrendo una visione olistica ed usabile del piano di lavoro.

---

## 💻 4. SPECIFICHE DI FLUSSO ED ESPERIENZA UTENTE (UX D'AULA)

Per consentire l'uso del sistema sulla LIM davanti alla classe senza ritardi o distrazioni, l'interfaccia utente in `src/App.tsx` implementa:

1.  **Stato di Input Rapido:** Un box di inserimento testuale diretto *"Cosa spieghiamo oggi?"* posizionato in cima alla pagina del registro classe.
2.  **Sincronizzazione in tempo reale con l'Archivio:** I dati delle UDA create d'impulso o collegate vengono memorizzati all'istante in Zustand/IndexedDB e salvati sul cloud Workspace del docente.
3.  **Leggenda ed Evidenze Visive:** Uso di icone, badges ed evidenziatori di stato per raccordare l'azione didattica reale con i criteri della **didattica orientativa** d'Istituto.

---
*Specifiche dell'Assistente Didattico e del Gantt d'Istituto convalidate e depositate.*  
**Il Comitato di Progettazione per la Didattica Attiva e Spaziale d'Istituto**  
**Istituto Comprensivo Calvario-Covotta «don Lorenzo Milani»**  
*Ariano Irpino (AV), 15 Luglio 2026*