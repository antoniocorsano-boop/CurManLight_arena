# 🔬 AUDIT CRITICO DI CONFORMITÀ NORMATIVA E PEDAGOGICA: UDA SOCIAL
### Analisi delle Fallacie della Like-Economy Scolastica, Rischi GDPR sui Dati Sensibili e Soluzioni Architetturali
**Istituto Comprensivo Calvario-Covotta «don Lorenzo Milani» — Ariano Irpino (AV)**  
*Codice Meccanografico: AVIC849003*  
*Data dell'Audit: 15 Luglio 2026*  
*Coordinamento: Organismo di Vigilanza Etica, Giuridica e Tecnologica d'Istituto*  
*Stato del Rapporto: VALIDATO ED EMESSO COME VOLUME 14 DEL SECOND BRAIN D'ISTITUTO*

---

## 🗺️ INDICE DEL RAPPORTO D'AUDIT
1. [Inquadramento: La Cooperazione Didattica e l'UDA Social](#-1-inquadramento-la-cooperazione-didattica-e-luda-social)
2. [Tavolo Tecnico I: I Rischi di Violazione del GDPR sui Dati degli Studenti](#-tavolo-tecnico-i-i-rischi-di-violazione-del-gdpr-sui-dati-degli-studenti)
3. [Tavolo Tecnico II: La Fallacia della Like-Economy e la Deriva della Popolarità](#-tavolo-tecnico-ii-la-fallacia-della-like-economy-e-la-deriva-della-popolarita)
4. [Tavolo Tecnico III: L'Incongruenza del "Social" offline-first e Soluzione Cloud](#-tavolo-tecnico-iii-lincongruenza-del-social-offline-first-e-soluzione-cloud)
5. [Linee Guida di Regolamentazione e Buone Pratiche d'Istituto](#-linee-guida-di-regolamentazione-e-buone-pratiche-distituto)

---

## 🏛️ 1. INQUADRAMENTO: LA COOPERAZIONE DIDATTICA E L'UDA SOCIAL

L'evoluzione della gestione delle Unità di Apprendimento (**UDA**) in senso "social" (attraverso la condivisione, il riuso immediato, l'espressione di preferiti ed annotazioni cooperative sulle lezioni apprese - *lessons learned*) risponde ad un nobile principio pedagogico: la **co-progettazione di plesso** e la dematerializzazione dello scambio di buone pratiche.

Tuttavia, agendo come un **valutatore critico, obiettivo e imparziale**, questa commissione evidenzia come l'innesto di logiche social all'interno di software gestionali scolastici comporti severi rischi legali, fallacie di misurazione della qualità didattica e conflitti strutturali che devono essere analizzati con distacco empirico e risolti sul piano tecnico-regolamentare.

---

## 👥 TAVOLO TECNICO I: RISCHI DI VIOLAZIONE DEL GDPR (Privacy e Sicurezza)

L'introduzione di una sezione "Annotazioni" per registrare le *lessons learned* (es. *"Cosa ha funzionato", "Cosa migliorare"*) genera un **punto di grave vulnerabilità sotto il profilo del GDPR (Regolamento UE 2016/679)**:

### 1.1 Il Pericolo dei Dati Sanitari e Sensibili Nascosti
I docenti, nel compilare annotazioni di riflessione didattica, tendono fisiologicamente a inserire riferimenti a casi reali di classe (es. *"L'UDA è stata difficile per l'alunno X che ha la 104"*, o *"Lo studente DSA fatica con i tempi"*). 
*   **La Gravità:** L'inserimento di nomi o riferimenti identificabili a condizioni mediche o cognitive di minori (dati particolari ex Art. 9 GDPR) all'interno di una bacheca d'area comune visibile a tutti gli insegnanti costituisce un **illecito amministrativo e penale**, esponendo l'Istituto a sanzioni pecuniarie elevate del Garante per la Privacy.
*   **La Remediation:** È obbligatorio implementare una validazione automatica o un avviso formale all'inserimento: **"Vietato inserire nomi di studenti, sigle o riferimenti indiretti a disabilità, DSA o BES. Tutte le annotazioni devono essere interamente anonime e focalizzate solo sulla metodologia."**

---

## 📈 TAVOLO TECNICO II: LA FALLACIA DELLA LIKE-ECONOMY IN DIDATTICA

L'inclusione del contatore dei preferiti ("Mi Piace" o "Likes") sulle UDA condivise introduce una fallacia logica e psicologica d'impatto sul corpo docente:

### 2.1 La Deriva della Popolarità (Vanity Metrics)
*   **La Fallacia:** Si assume implicitamente che un'UDA con 15 "likes" sia didatticamente superiore o più efficace d'aula rispetto ad una con 0 "likes".
*   **La Realtà:** Nel comportamento digitale, il "Mi Piace" premia la veste grafica (impaginazione, loghi), la popolarità del docente d'area o la semplicità dell'argomento, non la sua profondità o l'aderenza scientifica alle indicazioni nazionali. 
*   **L'Impatto:** Rischia di scoraggiare la stesura di UDA su discipline di nicchia (es. *Latino-LEL* o *Morfosintassi complessa*) a favore di tematiche popolari d'intrattenimento, innescando dinamiche di competizione e distorsione della cooperazione collegiale.
*   **La Remediation:** Il sistema deve ridenominare il pulsante in **"UDA Consigliata d'Istituto"** o **"Validata per il Riuso"**, affiancando al mero contatore di preferiti un sistema di **annotazione di peer-review metodologica formale** curato dal Coordinatore di Dipartimento.

---

## ☁️ TAVOLO TECNICO III: L'INCONGRUENZA DEL "SOCIAL" OFFLINE-FIRST

### 3.1 Il Conflitto Strutturale
Come può un'applicazione che opera al 100% in locale nel browser di un singolo computer (offline-first) disporre di una "bacheca social" dove i file vengono visualizzati, riusati e commentati in tempo reale dagli altri colleghi?

### 3.2 La Risoluzione Architetturale d'Istituto
Per non tradire la filosofia dell'offline-first ed evitare server di database esterni, il "Social scolastico" si appoggia ad un'architettura **Shared-Cloud locale**:
1.  **Shared Team Drive Folder (Cartella Condivisa):**
    Il Referente PTOF configura una cartella condivisa sul Drive della scuola denominata `CurManLight_Bacheca_Condivisa`.
2.  **Sincronizzazione in background dei file di bacheca:**
    Quando un docente clicca su *"Condividi"*, l'app esporta silenziosamente la bozza JSON nella cartella condivisa Drive. Quando un collega accede, l'app interroga in background quella cartella condivisa per scaricare e mostrare l'elenco delle UDA messe a disposizione d'Istituto, ri-utilizzandole all'istante con un click.

---

## 🏛️ LINEE GUIDA DI REGOLAMENTAZIONE PER I DOCENTI

Per l'attivazione della Bacheca Social d'Istituto a decorrere dal 1° Settembre 2026, si delibera il seguente **Regolamento d'Uso**:

1.  **Annonimato Assoluto:** Le annotazioni relative alle *lessons learned* devono fare riferimento esclusivamente a *"la classe"*, *"il gruppo"* o *"la metodologia"*, senza mai citare iniziali, cognomi o peculiarità fisiche/mediche dei singoli studenti.
2.  **Principio di Cooperazione e non Competizione:** L'espressione dei preferiti è intesa come attestato di idoneità didattica ed utilità per il riuso comune, esente da logiche di popolarità o valutazione formale del docente.
3.  **Dovere di Condivisione:** Ogni dipartimento è invitato a condividere almeno **due UDA d'eccellenza per trimestre** per alimentare l'archivio delle buone pratiche e facilitare l'allineamento dei docenti neo-immessi in ruolo d'Istituto.

---
*Rapporto di audit e regolamento della bacheca social approvato d'Istituto.*  
**L'Organismo di Vigilanza Etica, Giuridica e Tecnologica d'Istituto**  
**Istituto Comprensivo Calvario-Covotta «don Lorenzo Milani»**  
*Ariano Irpino, 15 Luglio 2026*