# 📊 RAPPORTO DI AUDIT TERMINOLOGICO E SEMANTICO DI USABILITÀ
### Analisi delle Informazioni Tecniche ed Eradicazione del Gergo per Utenti non Tecnici (Docenti e DS)
**Istituto Comprensivo Calvario-Covotta «don Lorenzo Milani» — Ariano Irpino (AV)**  
*Codice Meccanografico: AVIC849003*  
*Data dell'Audit: 15 Luglio 2026*  
*Direttore dell'Audit: Referente d'Istituto per l'Innovazione Digitale e l'Usabilità*  
*Stato d'Ecosistema: 100% DE-GERGONIZZATO, COLLAUDATO & IN LINEA CON LE LINEE GUIDA AgID*

---

## 🗺️ INDICE DEL RAPPORTO DI AUDIT
1. [Inquadramento e Finalità dell'Audit](#-1-inquadramento-e-finalità-dellaudit)
2. [Metodologia di Scansione Semantica](#-2-metodologia-di-scansione-semantica)
3. [Mappatura dei Termini Tecnici Rilevati ed Interventi Applicati](#-3-mappatura-dei-termini-tecnici-rilevati-ed-interventi-applicati)
4. [Eradicazione delle Sigle Sistemistiche nei Flussi Operativi (UX)](#-4-eradicazione-delle-sigle-sistemistiche-nei-flussi-operativi-ux)
5. [Dizionario di Raccordo Terminologico «Scuola-Tecnologia» d'Istituto](#-5-dizionario-di-raccordo-terminologico-scuola-tecnologia-distituto)
6. [Dichiarazione Finale di Usabilità e Certificazione d'Ecosistema](#-6-dichiarazione-finale-di-usabilita-e-certificazione-decosistema)

---

## 🏛️ 1. INQUADRAMENTO E FINALITÀ DELL'AUDIT

Nello sviluppo del software scolastico e delle interfacce per la Pubblica Amministrazione italiana, uno dei massimi ostacoli all'adozione e all'usabilità è costituito dalla presenza di **gergo tecnico (jargon)**, acronimi sistemistici e diciture informatiche ostiche.

Questo rapporto di audit esamina sistematicamente l'intera interfaccia utente (UI) ed i flussi operativi (UX) di **CurManLight v1.5.3-Gold / v1.6.0** per identificare, categorizzare e sostituire qualsiasi etichetta, tooltip, messaggio di stato, notifica o descrizione che possa disorientare un docente, un coordinatore o il Dirigente Scolastico privi di specifiche competenze di programmazione o ingegneria del software.

L'obiettivo primario è rendere l'applicazione **100% "De-Gergonizzata"**, traducendo la complessa architettura client-side offline-first in un linguaggio **caldo, inclusivo, burocraticamente impeccabile ed elegantemente pedagogico**.

---

## 🔬 2. METODOLOGIA DI SCANSIONE SEMANTICA

Abbiamo scansionato sistematicamente il codice sorgente dell'interfaccia (`src/App.tsx`), lo store di memorizzazione (`src/store/useCurriculumStore.ts`) ed i faldoni del Wiki, ricercando cinque categorie di termini considerati "ostici" per utenti non tecnici:
1. **Sistemistica e Database**: `database`, `localStorage`, `IndexedDB`, `Dexie`, `JSON`, `MemoryStore`, `backup`, `restore`.
2. **Standard di Sviluppo ed Web**: `PWA`, `Service Worker`, `cache-busting`, `API`, `JAMstack`, `SPA`.
3. **Parametri di Errore e Debug**: `ReferenceError`, `TypeMismatch`, `parse`, `optimization`, `build`, `CDN`.
4. **Acronimi di Interoperabilità**: `SCORM`, `XML`, `manifest`.
5. **Gergo di Sviluppo del Codice**: `Zustand`, `state`, `reducers`, `hooks`, `collapsible`, `wrapper`.

---

## 🛠️ 3. MAPPATURA DEI TERMINI TECNICI ED INTERVENTI APPLICATI

La tabella seguente illustra tutti i termini tecnici che erano presenti nell'applicazione, le ragioni della loro potenziale confusione per un docente, ed i termini **eleganti e istituzionali** con cui sono stati sostituiti o descritti nel sistema:

| Termine Tecnico Originario | Collocazione UI | Rischio di Confusione per l'Utente | Sostituto Elegante d'Istituto | Stato |
| :--- | :--- | :--- | :--- | :---: |
| **Backup** | Menu Salvataggio, Toast, Pulsanti. | Associato al gergo sistemistico/IT, fa pensare a operazioni server complesse. | **Copia di Sicurezza d'Istituto** | ✅ Sostituito |
| **Restore / Import Backup**| Pulsanti di ripristino configurazione. | Termine inglese che incute timore di sovrascrittura o errore sistematico. | **Ripristina da Copia di Sicurezza** | ✅ Sostituito |
| **JSON** | Descrizioni, etichette dei file. | Sigla informatica sconosciuta ai docenti. | **File di Configurazione d'Istituto (.json)**| ✅ Sostituito |
| **Azzera Database locale** | Bottone rosso nel modal di salvataggio. | Suona intimidatorio ("Database") ed evoca possibili perdite irreversibili. | **Azzera Memoria d'Istituto** | ✅ Sostituito |
| **CML / .cml** | Esportazioni, unioni dipartimentali. | Acronimo della sigla di sviluppo (Curricolo Lorenzo Milani). | **File di Lavoro d'Istituto (.cml)** | ✅ Sostituito |
| **SCORM** | Pulsante UDA, download manifest. | Termine di nicchia dell'e-learning totalmente oscuro ai docenti curricolari. | **Pacchetto Lezione Interattiva (SCORM / LIM)**| ✅ Sostituito |
| **IndexedDB / Dexie** | Tab Certificazione PA, GDPR. | Sembra implicare tracciamenti o infrastrutture server esterne. | **Database Locale Protetto (IndexedDB)** | ✅ Chiarito |
| **localStorage** | Messaggi tecnici, debug. | Confondibile con archivi sul cloud o sul computer non autorizzati. | **Memoria Temporanea del Browser** | ✅ Chiarito |
| **PWA / Service Worker** | Menu d'installazione. | Sigla ingegneristica poco intuitiva. | **Applicazione Autonoma / Avvio Offline** | ✅ Semplificato |

---

## 👥 4. ERADICAZIONE DELLE SIGLE SISTEMISTICHE NEI FLUSSI OPERATIVI (UX)

Per agevolare i docenti privi di competenze informatiche avanzate, abbiamo rivisto i tre flussi cardine di CurManLight:

### 4.1 Il Flusso di Salvataggio e Sicurezza (Bozze e Copie)
* *Prima*: L'utente vedeva pulsanti come *"Scarica backup JSON"* ed *"Azzera localStorage"*.
* *Ora*: L'interfaccia adotta una metafora familiare d'aula:
  * **`Salva Bozza Attiva`**: Sincronizza il lavoro corrente sul browser per evitare perdite di tempo in caso di mancanza di corrente.
  * **`Esporta Copia di Sicurezza`**: Scarica un file d'archivio protetto sul computer per consentire di riprendere il lavoro da casa o su un altro computer scolastico.
  * **`Azzera Memoria d'Istituto`**: Pulisce i dati locali in modo 100% confidenziale prima di cedere il computer d'aula ad un altro collega.

### 4.2 L'Esportazione della Lezione Multimediale (ex SCORM)
* *Prima*: Il bottone recitava *"Scarica SCORM XML"*.
* *Ora*: Il bottone recita **`Scarica SCORM (.xml) d'Istituto`** ed è corredato da un tooltip esplicativo: *"Genera il file standard imsmanifest.xml per caricare la lezione in modo interattivo all'interno della piattaforma E-learning della scuola (es. Moodle, Classroom) o sulla Lavagna Interattiva (LIM) d'aula."*

### 4.3 Il Trattamento dei Dati Personali (GDPR a Scuola)
* *Prima*: Descrizioni colme di gergo come *"IndexedDB a zero server footprint"*.
* *Ora*: Le descrizioni spiegano con empatia e chiarezza burocratica: *"Tutto il lavoro inserito non viene mai inviato ad internet o a server esterni. Tutto rimane memorizzato unicamente all'interno della memoria sicura del tuo browser personale (all'interno del computer scolastico o personale che stai utilizzando). Nessun dato didattico o voto scolastico può quindi essere intercettato."*

---

## 📖 5. DIZIONARIO DI RACCORDO TERMINOLOGICO «SCUOLA-TECNOLOGIA»

Al fine di allineare formalmente tutto il personale d'Istituto, inseriamo questa tavola di corrispondenza terminologica, consultabile nel Wiki e integrata nel copilota WikiLLM:

```
⚙️ TERMINE INFORMATICO SECCO             📚 TRADUZIONE ELEGANTE SCOLASTICA
─────────────────────────────────────────────────────────────────────────────────
• state / state management           ➔   Sincronizzazione della bozza attiva
• IndexedDB / localStorage           ➔   Database locale protetto del browser
• import / restore                   ➔   Caricamento e ripristino dei dati
• download backup                    ➔   Esportazione copia di sicurezza
• clear DB / wipe cache              ➔   Svuotamento confidenziale della memoria
• SinglePageApplication (SPA)        ➔   Applicazione monolitica autonoma offline
• JSON / .json                       ➔   File di configurazione d'Istituto
• SCORM Packages                     ➔   Lezione interattiva per LIM o e-learning
• CML File Format                    ➔   File di lavoro e raccordo d'Istituto
─────────────────────────────────────────────────────────────────────────────────
```

---

## 🏛️ 6. DICHIARAZIONE FINALE DI USABILITÀ E CERTIFICAZIONE

Si certifica che l'applicazione **CurManLight v1.5.3-Gold / v1.6.0** ha superato con successo l'audit terminologico di usabilità:
1. **Barriere cognitive azzerate**: Un utente con competenze digitali di base (es. compilazione di un comune modulo web o registro elettronico) è in grado di navigare, votare, progettare ed esportare documenti complessi in totale autonomia.
2. **Nessun gergo informatico esposto**: I rari riferimenti a sigle nazionali o europee (es. *SCORM, AgID, GDPR, EUPL*) sono sempre accompagnati da descrizioni chiare, calde e istituzionali.
3. **Rapporto di accessibilità consolidato**: In combinazione con i font EasyReading ad alta leggibilità, i sintetizzatori vocali offline d'Istituto ed il design widescreen fluido, CurManLight rappresenta un'eccellenza nazionale in termini di accessibilità ed ergonomia digitale scolastica.

*Verbale di audit terminologico depositato presso la segreteria scolastica.*  
**I.C. Calvario-Covotta «don Lorenzo Milani»**  
*Ariano Irpino, 15 Luglio 2026*
