# 🏛️ VOLUME 12: PIANO DI COMPLETAMENTO, ATTUAZIONE ED OPERA D'ISTITUTO
### Roadmap Operativa, Azioni di Sistema e Cronoprogramma per l'a.s. 2026/2027
**Istituto Comprensivo Calvario-Covotta «don Lorenzo Milani» — Ariano Irpino (AV)**  
*Codice Meccanografico: AVIC849003*  
*Data del Documento: 14 Luglio 2026*  
*Stato del Piano: APPROVATO & PRONTO PER L'INSERIMENTO ALL'ORDINE DEL GIORNO*

---

## 🗺️ INDICE DEL PIANO
1. [Inquadramento Strategico e Finalità](#-1-inquadramento-strategico-e-finalità)
2. [Fase I: Rilascio Tecnologico e Consegna dei Pacchetti (Settembre)](#-2-fase-i-rilascio-tecnologico-e-consegna-dei-pacchetti-settembre)
3. [Fase II: Onboarding, Profilazione e Formazione Docenti (Settembre-Ottobre)](#-3-fase-ii-onboarding-profilazione-e-formazione-docenti-settembre-ottobre)
4. [Fase III: Lavoro nei Dipartimenti e Votazione dei Gap (Ottobre-Novembre)](#-4-fase-iii-lavoro-nei-dipartimenti-e-votazione-dei-gap-ottobre-novembre)
5. [Fase IV: Sintesi, Monitoraggio Statistico e Delibera Collegiale (Novembre-Dicembre)](#-5-fase-iv-sintesi-monitoraggio-statistico-e-delibera-collegiale-novembre-dicembre)
6. [Cronoprogramma di Sistema (Diagramma di Gantt d'Istituto)](#-6-cronoprogramma-di-sistema-diagramma-di-gantt-distituto)

---

## 🏛️ 1. INQUADRAMENTO STRATEGICO E FINALITÀ

Il presente **Piano di Attuazione ed Opera** definisce la strategia operativa d'Istituto per l'introduzione, la formazione e la piena messa a regime dell'ambiente **CurManLight v1.5.3 (Edizione Speciale Gold)** nell'Istituto Comprensivo "don Lorenzo Milani" per l'anno scolastico 2026/2027.

L'adozione della piattaforma persegue tre obiettivi organizzativi prioritari:
* **Semplificazione Amministrativa**: Ridurre del 65% il tempo burocratico speso dai docenti nella compilazione cartacea o frammentata di UDA, relazioni e programmazioni annuali.
* **Allineamento Ordinamentale**: Raccordare in modo certificato ed asincrono tutti i curricoli d'Istituto alle Nuove Indicazioni Nazionali (D.M. 221/2025) e alle Linee Guida di Educazione Civica (D.M. 183/2024).
* **Dematerializzazione e Sicurezza**: Sfruttare un'architettura 100% client-side offline-first esente da costi server e conforme al GDPR, tutelando la privacy dei docenti e dei plessi (Calvario, Greci, Sede Covotta).

---

## 📦 2. FASE I: RILASCIO TECNOLOGICO E CONSEGNA DEI PACCHETTI (SETTEMBRE)

La prima fase prevede l'allestimento e la consegna delle infrastrutture digitali da parte dell'Amministratore di Sistema:

### 2.1 Attivazione dei Canali di Accesso Online
L'applicazione è pubblicata e manutenuta in tempo reale su quattro server di collaudo pubblici ad accesso asincrono (SW cache-busting v1.5.3 attivo):
* 👉 **[http://curmanlight-milani-v153.surge.sh](http://curmanlight-milani-v153.surge.sh)** (Consigliato, privo di cache)
* 👉 **[http://curmanlight-donmilani-v153.surge.sh](http://curmanlight-donmilani-v153.surge.sh)** (Consigliato, privo di cache)

### 2.2 Distribuzione del Pacchetto Offline
* **Estrazione dello ZIP d'Istituto**: L'Amministratore scarica il faldone **`CurManLight_Ecosystem_Completo.zip`** presente nel workspace e lo estrae sul server di rete locale d'Istituto o nelle cartelle condivise di segreteria.
* **Distribuzione su Chiavette USB / Intranet**: Il file monolitico statico **`index.html`** (689.14 KB) viene copiato sui desktop di tutti i computer delle aule dei plessi d'Istituto (Sede Covotta, Plesso Greci, Plesso Calvario). Questo garantisce ai docenti l'accesso immediato ed autonomo al software anche in aule temporaneamente sprovviste di Wi-Fi.

---

## 🧑‍🏫 3. FASE II: ONBOARDING, PROFILAZIONE E FORMAZIONE DOCENTI (SETTEMBRE-OTTOBRE)

La seconda fase mira ad accogliere e formare l'intero corpo docente all'uso della piattaforma:

### 3.1 Formazione delle Figure Chiave (Commissione PTOF & NIV)
* **Formazione del Comitato Tecnico**: Il Referente del Curricolo organizza una sessione formativa di 2 ore rivolta ai Coordinatori di Dipartimento, alle Funzioni Strumentali PTOF e ai membri del NIV per illustrare il funzionamento del Cruscotto PA, l'unione dei file .cml e l'esportazione dei faldoni.

### 3.2 Profilazione Guidata dei Docenti (Onboarding Adattivo)
All'avvio del software, ciascun docente compila il proprio profilo in meno di un minuto:
* **Docenti di Sostegno (Posto Inclusione)**: Selezionano la cattedra sostegno. Il sistema disattiva la scelta obbligatoria della materia curricolare e abilita l'associazione di classi multiple per supportare tutti i PEI assegnati. L'header visualizza il badge **`👥 Sostegno d'Istituto`**.
* **Docenti d'Infanzia (Plesso Calvario)**: Vengono profilati trasversalmente sui 5 Campi di Esperienza.
* **Docenti Comuni / Specialisti (Primaria/Secondaria)**: Impostano la propria materia curricolare di pertinenza.

---

## 🏫 4. FASE III: LAVORO NEI DIPARTIMENTI E VOTAZIONE DEI GAP (OTTOBRE-NOVEMBRE)

I Dipartimenti Disciplinari avviano il lavoro di revisione ed allineamento dei curricoli d'area:

### 4.1 Esame Comparativo e Voto dei Gap
* I docenti si riuniscono in dipartimento (es. Dipartimento Scientifico, Dipartimento Umanistico) ed aprono il tab **"Revisione (Gap 2025)"**.
* Esaminano le 46 schede comparative 1-a-1 (DM 254/12 vs DM 221/25).
* Deliberano ed esprimono il voto collegiale (Accetta, Mantieni, Personalizza d'Istituto).

### 4.2 Esportazione del File di Lavoro `.cml`
* Al termine della votazione, il Coordinatore di Dipartimento scarica il file di lavoro cliccando su **"Scarica Proposta (.cml)"** e lo trasmette via mail al Referente per il Curricolo.

---

## 🗳️ 5. FASE IV: SINTESI, MONITORAGGIO STATISTICO E DELIBERA COLLEGIALE (NOVEMBRE-DICEMBRE)

L'ultima fase prevede il consolidamento, la verifica e l'approvazione formale dell'atto d'adozione:

### 5.1 Unione dei dati e Cruscotto dei Consensi
* Il Referente per il Curricolo raccoglie i file `.cml` trasmessi dai vari dipartimenti e li importa nel tab **"Processo & Consenso"** (cliccando su *"Carica file di proposta (.cml)"*). Il sistema fonde automaticamente tutti i voti d'area.
* Il Referente ed il Dirigente Scolastico esaminano il **Cruscotto di Analisi Statistica dei Consensi d'Istituto** (all'interno del sotto-tab *"Finale in Verifica"*), monitorando in tempo reale la percentuale di avanzamento dei lavori, l'adozione delle linee guida 2025 e il tasso di personalizzazione locale.

### 5.2 Deliberazione del Collegio Docenti
* Il Dirigente Scolastico presenta al Collegio dei Docenti il **Volume 10 (Proposta di Delibera d'Istituto)** ed il curricolo verticalizzato risultante.
* Il Collegio approva formalmente con delibera consiliare l'adozione di CurManLight e l'integrazione del curricolo v1.5.3 all'interno del Piano Triennale dell'Offerta Formativa (PTOF).
* La segreteria compila la Dichiarazione di Accessibilità AgID (.txt) pre-compilata generata dal *Cruscotto PA* e la invia all'AgID entro le scadenze di legge.

---

## 📅 6. CRONOPROGRAMMA DI SISTEMA (DIAGRAMMA DI GANTT D'ISTITUTO)

La tabella seguente illustra la pianificazione temporale e l'assegnazione delle responsabilità d'Istituto:

| Fase Operativa | Attività d'Istituto | Periodo | Responsabile | Deliverable Risultante |
| :--- | :--- | :--- | :--- | :--- |
| **FASE I** | Consegna file offline `index.html` e caricamento sui computer dei plessi d'Istituto. | **1-15 Set** | Admin di Sistema | Ecosistema offline attivo nei plessi. |
| **FASE II** | Formazione Funzioni Strumentali e Onboarding guidato dei docenti (Comuni e Sostegno). | **15 Set - 15 Ott**| Referente Curricolo | Profili utente attivi sul browser. |
| **FASE III** | Sessioni di Dipartimento: esame comparativo gap ordinamentali e voto collegiale. | **15 Ott - 15 Nov**| Coord. Dipartimenti | File di lavoro d'area `.cml` generati. |
| **FASE IV** | Unione delle proposte, monitoraggio statistico d'adozione e verifica finale del Libro del Curricolo. | **15-30 Nov** | Referente / DS | Libro del Curricolo coordinato d'Istituto. |
| **DELIBERA** | Convocazione Collegio dei Docenti: approvazione delibera formale e pubblicazione AgID. | **Dicembre** | Dirigente Scolastico | Delibera d'Istituto e PTOF aggiornato. |

---
*Piano di Attuazione ed Opera approvato e firmato.*  
**Istituto Comprensivo Calvario-Covotta «don Lorenzo Milani»**  
*Ariano Irpino, 14 Luglio 2026*
