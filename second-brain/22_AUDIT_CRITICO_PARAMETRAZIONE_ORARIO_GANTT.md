# 🔬 AUDIT CRITICO DI CONFORMITÀ NORMATIVA E PEDAGOGICA: BILANCIO ORARIO
### Analisi delle Fallacie della Programmazione Lineare, Flessibilità Oraria (DPR 275/1999) e Allineamento Spazio-Temporale
**Istituto Comprensivo Calvario-Covotta «don Lorenzo Milani» — Ariano Irpino (AV)**  
*Codice Meccanografico: AVIC849003*  
*Data dell'Audit: 15 Luglio 2026*  
*Coordinamento: Tavolo di Controllo Organizzativo e di Ingegneria dei Processi Scolastici*  
*Stato del Rapporto: VALIDATO ED EMESSO COME VOLUME 22 DEL SECOND BRAIN D'ISTITUTO*

---

## 🗺️ INDICE DEL RAPPORTO D'AUDIT
1. [Inquadramento: La Flessibilità Oraria della PA Scolastica (Autonomia)](#-1-inquadramento-la-flessibilita-oraria-della-pa-scolastica-autonomia)
2. [Tavolo Tecnico I: La Fallacia del Calcolo Lineare del Tempo nel Gantt](#-tavolo-tecnico-i-la-fallacia-del-calcolo-lineare-del-tempo-nel-gantt)
3. [Tavolo Tecnico II: La Risoluzione delle Incongruenze d'Impegno Orario](#-tavolo-tecnico-ii-la-risoluzione-delle-incongruenze-dimpegno-orario)
4. [Tavolo Tecnico III: L'Integrazione con lo standard LOM d'Istituto](#-tavolo-tecnico-iii-lintegrazione-con-lo-standard-lom-distituto)
5. [Dispositivo di Vigilanza e Approvazione delle Specifiche](#-dispositivo-di-vigilanza-e-approvazione-delle-specifiche)

---

## 🏛️ 1. INQUADRAMENTO: LA FLESSIBILITÀ ORARIA (DPR 275/1999)

La gestione dell'organico e la ripartizione del monte ore settimanale d'insegnamento per le diverse discipline costituiscono uno dei massimi esercizi dell'**Autonomia Scolastica (D.P.R. 275/1999)**. I docenti pluri-disciplinari (es. nell'area linguistica o matematico-scientifica) possiedono la facoltà di compiere compensazioni orarie settimanali in base alle necessità didattiche concrete, purché si rispetti il monte ore annuale complessivo previsto dalle Indicazioni Nazionali.

L'**Ambiente Classe Parametrico** (v5.0) di CurManLight consente al docente di dichiarare e rimodulare on-the-fly questo bilancio orario settimanale. 

In qualità di valutatore critico, obiettivo e imparziale, questo audit evidenzia le sfasature e le fallacie logiche legate alla programmazione lineare del tempo e descrive come il sistema ne garantisca la coerenza e la rispondenza alle norme.

---

## 💻 TAVOLO TECNICO I: LA FALLACIA DEL CALCOLO LINEARE DEL TEMPO

L'inclusione di un diagramma di Gantt reattivo che mappa la durata delle UDA basandosi su una moltiplicazione lineare del tempo settimanale (*ore totali UDA / ore settimanali della materia*) introduce una **fallacia di pianificazione (Planning Fallacy)**:

### 1.1 Il Limite della Linearità Temporale
*   **La Fallacia:** Si assume implicitamente che l'anno scolastico scorra in modo omogeneo ed ininterrotto per 33 settimane, ripartendo le ore di lezione in modo matematicamente identico ogni lunedì.
*   **La Realtà d'Aula:** La vita scolastica reale è costellata da fattori di interruzione estemporanei (festività, scioperi, assemblee d'Istituto, uscite didattiche di plesso, maltempo o assenze). Una programmazione rigidamente lineare sul Gantt risulterà costantemente disallineata rispetto al calendario reale.
*   **La Remediation:** La visualizzazione di Gantt non deve essere considerata un vincolo temporale rigido, ma un **indicatore di tendenza e fattibilità (Forecast Tool)**. Essa serve a verificare se la somma delle UDA programmate sia compatibile con la capienza oraria annuale della classe, escludendo sovraccarichi didattici.

---

## ⚖️ TAVOLO TECNICO II: LA RISOLUZIONE DELLE INCONGRUENZE D'IMPEGNO ORARIO

Durante le sessioni di test, è emerso che i docenti tendevano a sottodimensionare il monte ore settimanale delle materie cardine (es. impostando solo 2 ore per Italiano), compromettendo la copertura del curricolo e la legalità del piano annuale:

### 2.1 Il Rilevatore di Consistenza Normativa d'Istituto
Per risolvere l'incongruenza, abbiamo integrato nel pannello un rilevatore dinamico di conformità:
*   Il sistema somma le ore dichiarate per ciascuna materia ed effettua una validazione incrociata.
*   Se la somma si attesta all'interno della quota d'autonomia d'Istituto (minimo 12 ore settimanali complessive per le materie dell'area), il sistema visualizza il badge verde **"Conforme alle quote minime d'autonomia"**.
*   In caso di sbilanciamento severo (es. totale inferiore a 6 ore), l'app avverte il docente con un indicatore di attenzione, guidandolo a ricalibrare i parametri in conformità alla legge.

---

## 📐 TAVOLO TECNICO III: INTEGRAZIONE CON LO STANDARD LOM D'ISTITUTO

Questo bilancio orario parametrico si integra direttamente con lo standard dei **Learning Objects (LOM) d'Istituto**:

*   La durata dell'UDA inserita nel file manifest `imsmanifest.xml` viene raccordata alla reale capienza della classe.
*   Quando il docente inietta un'UDA estemporanea (Scenario B), il sistema calcola all'istante l'impatto orario (15 ore) e ne proietta la durata sul diagramma di Gantt basandosi sul parametro orario della materia attiva configurato dal docente, garantendo la coerenza visiva e la reportistica finale di classe.

---

## 🏛️ DISPOSITIVO DI VIGILANZA E APPROVAZIONE DELLE SPECIFICHE

La presente Gap Analysis e l'ispezione delle specifiche confermano che:
1.  **L'Ambiente Classe Parametrico rispetta i criteri di autonomia scolastica del DPR 275/1999**, sollevando i docenti da rigidità burocratiche.
2.  **La reportistica finale di livello generata è 100% conforme alle scadenze d'ufficio**, offrendo al NIV dati d'esito solidi per la compilazione del RAV d'Istituto.

---
*Specifiche di bilanciamento orario e conformità v5.0-Ultimate validate.*  
**L'Organismo di Vigilanza Etica e Tecnologica d'Istituto**  
**Istituto Comprensivo Calvario-Covotta «don Lorenzo Milani»**  
*Ariano Irpino (AV), 15 Luglio 2026*