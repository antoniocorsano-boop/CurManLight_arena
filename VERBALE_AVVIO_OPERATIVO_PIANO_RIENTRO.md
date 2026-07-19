# 🏛️ VERBALE DI AVVIO OPERATIVO E DIRETTIVE DI KICKOFF (v1.8.0)
### Piano di Avvio Pratico e Cronoprogramma di Fase A per l'Anno Scolastico 2026/2027
**Istituto Comprensivo Calvario-Covotta «don Lorenzo Milani» — Ariano Irpino (AV)**  
*Codice Meccanografico: AVIC849003*  
*Data del Verbale: 15 Luglio 2026*  
*Coordinamento: Sottocommissione per l'Attuazione Esecutiva d'Istituto*  
*Stato del Documento: VALIDATO, SALVATO NEL WORKSPACE & IMMEDIATAMENTE ESECUTIVO*

---

## 🗺️ INDICE DELLE DIRETTIVE DI AVVIO
1. [Inquadramento: Come iniziare secondo il Piano di Rientro](#-1-inquadramento-come-iniziare-secondo-il-piano-di-rientro)
2. [Fase A - Settimana 1: Consegna dell'Infrastruttura Offline e Logistica](#-2-fase-a---settimana-1-consegna-dellinfrastruttura-offline-e-logistica)
3. [Fase A - Settimana 2: Costituzione del Comitato Arbëreshë (Plesso Greci)](#-3-fase-a---settimana-2-costituzione-del-comitato-arbereshe-plesso-greci)
4. [Fase A - Settimana 3: Campagna Pre-Test SUS e Formazione Coordinatori](#-4-fase-a---settimana-3-campagna-pre-test-sus-e-formazione-coordinatori)
5. [Tabella delle Responsabilità ed Indicatori Settimanali](#-5-tabella-delle-responsabilita-ed-indicatori-settimanali)
6. [Dispositivo di Avvio Esecutivo d'Istituto](#-6-dispositivo-di-avvio-esecutivo-distituto)

---

## 🏛️ 1. INQUADRAMENTO: COME INIZIARE SECONDO IL PIANO

In aderenza alle risultanze emerse dai rapporti di audit critico e conformemente alle linee guida del **Piano di Allineamento e Rientro dal Rischio (v1.8.0)**, l'avvio operativo del sistema non deve essere lasciato all'improvvisazione. 

Per garantire la massima stabilità e l'assenza di backlog futuri, i lavori inizieranno ufficialmente il **1° Settembre 2026** in coincidenza con l'apertura del nuovo anno scolastico. Di seguito vengono dettagliate le azioni esecutive da intraprendere settimana per settimana durante la **FASE A (Settembre 2026)**, mirata all'asciugatura linguistica (Plain Language) e alla conformità bilingue del Plesso Greci.

---

## 💻 2. FASE A - SETTIMANA 1: CONSEGNA DELL'INFRASTRUTTURA OFFLINE

La prima settimana è interamente dedicata alla **distribuzione logistica ed all'allestimento tecnico della continuità dei dati**:

*   **Attività 1.1 (Distribuzione del File Offline)**:
    L'Amministratore di Sistema copia il file statico monolitico **`index.html`** (756.61 KB) sui desktop di tutti i computer presenti nelle aule della scuola (Covotta, Greci, Calvario). Questo garantisce ai docenti l'accesso immediato anche in aule con scarsa o assente copertura Wi-Fi.
*   **Attività 1.2 (Predisposizione Staging NAS d'Istituto)**:
    L'Amministratore configura una cartella condivisa di rete protetta all'interno del server/NAS d'Istituto (IP statico es. `192.168.1.100`), abilitando i permessi di lettura/scrittura per la futura sincronizzazione automatica in background del database IndexedDB dei docenti, neutralizzando il rischio di perdite dati locali.

---

## 🎨 3. FASE A - SETTIMANA 2: COSTITUZIONE DEL COMITATO ARBËRESHË

La seconda settimana si focalizza sulla **rettifica filologica e linguistica d'area**:

*   **Attività 2.1 (Convocazione del Tavolo dei Saggi)**:
    La Dirigenza Scolastica emana un decreto di costituzione del *Comitato Linguistico d'Istituto*, convocando i docenti storici del Plesso Greci, esperti della lingua Arbëreshë irpina e rappresentanti anziani della comunità.
*   **Attività 2.2 (Bonifica delle Traduzioni in Database)**:
    Il comitato esamina i placeholder attuali in `curriculumKB.ts` e valida i termini glottodidattici Arbëreshë reali da visualizzare nel report di programmazione bilingue, escludendo albanismi standard (Shqip) non aderenti all'enclave. L'Amministratore inietta le stringhe convalidate nel database d'Istituto.

---

## 👥 4. FASE A - SETTIMANA 3: CAMPAGNA PRE-TEST SUS E FORMAZIONE

La terza settimana mira ad avviare la **validazione empirica dell'usabilità e la formazione delle figure chiave**:

*   **Attività 3.1 (Formazione Coordinatori di Dipartimento)**:
    L'Animatore Digitale (Prof. Vincenzo) organizza una sessione di 2 ore per illustrare il funzionamento del tab *Esportazione File* e l'unione dei file `.cml`. Distribuisce inoltre la guida di una pagina *"Modelli Facili"* per la personalizzazione tramite l'Assistente dei template con IA.
*   **Attività 3.2 (Avvio della Campagna SUS Pre-Test)**:
    Per eliminare l'arbitrarietà delle metriche, l'Animatore Digitale seleziona un campione rappresentativo di 15 docenti di diverse fasce d'età d'Istituto per condurre un pre-test d'usabilità. Ciascun docente compila un questionario standardizzato **SUS (System Usability Scale)** dopo aver completato l'onboarding e la progettazione di un'UDA di prova. I punteggi reali ottenuti verranno registrati per stabilire la baseline empirica d'Istituto.

---

## 📈 5. TABELLA DELLE RESPONSABILITÀ ED INDICATORI SETTIMANALI

Per monitorare oggettivamente l'avanzamento, la commissione definisce il seguente quadro di controllo:

| Periodo Operativo | Attività d'Istituto | Responsabile | Deliverable Atteso | Indicatore di Successo (Semaforo Verde) |
| :--- | :--- | :--- | :--- | :--- |
| **Settimana 1** | Copia file offline e staging NAS. | Admin (Ing. Roberto) | `index.html` copiato sui desktop dei plessi; cartella condivisa NAS attiva. | 100% dei computer d'aula provvisti di accesso offline. |
| **Settimana 2** | Tavolo Arbëreshë e bonifica database. | Dirigente (Maria Letizia) / GLO | Verbale delle traduzioni Arbëreshë; file `curriculumKB.ts` aggiornato. | Parere favorevole firmato dai rappresentanti di Greci. |
| **Settimana 3** | Formazione coordinatori e pre-test SUS. | Animatore Digitale (Vincenzo) | Registro presenze formazione; calcolo del SUS Score reale baseline. | Consegnata la guida "Modelli Facili" ad almeno il 90% dei docenti. |

---

## 🏛️ 6. DISPOSITIVO DI AVVIO ESECUTIVO D'ISTITUTO

Visto il superamento di tutti i collaudi tecnici ed in conformità con il piano di allineamento e rientro dal rischio v1.8.0, la Presidenza d'I.C. "don Lorenzo Milani" **dispone l'avvio esecutivo ed obbligatorio di tutte le attività descritte nel presente verbale a partire dal 1° Settembre 2026**.

*Il presente verbale di avvio è registrato, sottoscritto e reso esecutivo d'ufficio.*

**Il Segretario Verbalizzante**  
*Prof. Vincenzo*  

**Il Presidente della Commissione / Dirigente Scolastico**  
*Prof.ssa Maria Letizia*
