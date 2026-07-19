# 🔬 AUDIT CRITICO DI CONFORMITÀ NORMATIVA E PEDAGOGICA: REGISTRO CIFRATO
### Analisi delle Fallacie del Registro Burocratico, Tutele del "Zero-Knowledge" e Raccordo con il D.M. 14/2024
**Istituto Comprensivo Calvario-Covotta «don Lorenzo Milani» — Ariano Irpino (AV)**  
*Codice Meccanografico: AVIC849003*  
*Data dell'Audit: 15 Luglio 2026*  
*Coordinamento: Tavolo di Controllo Etico-Giuridico e di Neuro-Psicologia della Conoscenza*  
*Stato del Rapporto: VALIDATO ED EMESSO COME VOLUME 18 DEL SECOND BRAIN D'ISTITUTO*

---

## 🗺️ INDICE DEL RAPPORTO D'AUDIT
1. [Inquadramento: La Dematerializzazione Didattica vs Burocrazia del Registro](#-1-inquadramento-la-dematerializzazione-didattica-vs-burocrazia-del-registro)
2. [Tavolo Tecnico I: Il Modello "Knowledge-Free" e i Limiti del Browser Criptato](#-tavolo-tecnico-i-il-modello-knowledge-free-e-i-limiti-del-browser-criptato)
3. [Tavolo Tecnico II: La Sfasatura dei Nomi Inventati e il Raccordo d'Aula](#-tavolo-tecnico-ii-la-sfasatura-dei-nomi-inventati-e-il-raccordo-daula)
4. [Tavolo Tecnico III: Analisi delle Metriche di Livello (D.M. 14/2024)](#-tavolo-tecnico-iii-analisi-delle-metriche-di-livello-dm-142024)
5. [Raccomandazioni Organizzative d'Istituto per il Riuso dei Dati](#-raccomandazioni-organizzative-distituto-per-il-riuso-dei-dati)

---

## 🏛️ 1. INQUADRAMENTO: LA DEMATERIALIZZAZIONE VS BUROCRAZIA

I registri elettronici commerciali utilizzati correntemente nelle scuole italiane (Argo, ClasseViva, Spaggiari) sono concepiti per adempiere a funzioni prevalentemente amministrative e burocratiche (controllo presenze, giustificazioni, firme, voti in decimi). Questa struttura, pur necessaria, è **pedagogicamente sterile**: non permette di monitorare la reale progressione degli apprendimenti sui singoli **Learning Objects (LOM)** o Unità di Apprendimento (UDA) raccordati al Curricolo Verticale.

L'**Ambiente Classe & Registro Pedagogico Cifrato** (v4.0-Evoluta) di CurManLight sposta il baricentro dell'azione docente dal controllo burocratico all'**analisi oggettiva degli esiti d'apprendimento**. 

In qualità di valutatore critico e obiettivo, l'audit esamina le implicazioni di questa capability sul piano della privacy (GDPR), del raccordo ordinamentale (**D.M. 14/2024**) e dei limiti della crittografia in-browser.

---

## 💻 TAVOLO TECNICO I: IL MODELLO KNOWLEDGE-FREE E I LIMITI CRITTOGRAFICI

La capability introdotta assicura che **i dati personali dei minori non transitino mai in chiaro sui server ed escludano qualsiasi lettura da parte dell'Intelligenza Artificiale**:

### 1.1 La Soluzione "Zero-Knowledge" d'Istituto
I nomi reali e le valutazioni sensibili inserite dal docente vengono cifrati in locale tramite chiave simmetrica **AES-GCM a 256 bit** (Web Crypto API). L'I.A. del Co-pilota o del WikiLLM riceve solo token anonimi (es. *Mario Rossi* ➔ `Studente_A`, *PEI - Disabilità* ➔ `Profilo_Inclusione_Tipo_1`). 

### 1.2 Limiti e Vulnerabilità del Browser Criptato (Analisi Imparziale)
*   **La Vulnerabilità (XSS e Cache Leakage):** Sebbene l'algoritmo AES-GCM sia matematicamente inoppugnabile, la memorizzazione della chiave simmetrica in RAM volatile all'interno del browser è suscettibile di attacchi XSS (Cross-Site Scripting) o a letture illecite da parte di estensioni esterne malevole del browser installate dall'utente (es. adblock compromessi, password manager infetti).
*   **La Mitigazione d'Istituto:** È obbligatorio educare i docenti a utilizzare browser in modalità **Navigazione Privata (In Incognito)** quando operano sui computer condivisi della scuola, ed a cliccare sempre su **"Azzera Memoria d'Istituto"** prima di chiudere la sessione per azzerare e ripulire la cache IndexedDB locale.

---

## 👥 TAVOLO TECNICO II: LA SFASATURA DEI NOMI INVENTATI

### 2.1 La Sfasatura Logica
L'app utilizza nomi fittizi d'aula (*Matteo Rossi, Sofia Esposito*) combinati ad iniziali e avatar per tutelare i minori. Nella pratica d'aula quotidiana, tuttavia, l'insegnante si scontra con una **sfasatura cognitiva**: sul registro vede scritto "Studente_A", ma davanti a sé ha l'alunno reale Mario Rossi.

### 2.2 La Soluzione Pratica d'Istituto
Per raccordare l'anonimato del database con la realtà dell'aula scolastica, CurManLight compie una decrittazione al volo (decryption in-rendering).
*   Il docente vede sul proprio schermo i nomi decifrati inseriti localmente (es. *Mario Rossi*), ma all'esterno e in tutti i file salvati o trasmessi nel cloud Drive condiviso d'area, l'app esporta esclusivamente stringhe cifrate o token anonimi (`Studente_A`).
*   In questo modo, la realtà didattica ed il rigore della privacy si allineano perfettamente, rispettando il dettato etico a zero-footprint.

---

## 📐 TAVOLO TECNICO III: LE METRICHE DI LIVELLO COMPATIBILI CON IL D.M. 14/2024

L'adeguamento ordinamentale stabilito dal **D.M. n. 14 del 30 Gennaio 2024** impone l'adozione di quattro livelli nazionali di certificazione per le competenze:

```
┌─────────────────┬────────────────────────────────────────────────────────────────────────┐
│ LIVELLO AgID    │ DESCRIZIONE PEDAGOGICA D'ISTITUTO                                      │
├─────────────────┼────────────────────────────────────────────────────────────────────────┤
│ • Avanzato      │ L'alunno porta a termine compiti in situazioni note e non note.        │
│ • Intermedio    │ L'alunno porta a termine compiti in situazioni note in modo autonomo.  │
│ • Base          │ L'alunno porta a termine compiti solo in situazioni note e guidato.     │
│ • Iniziale      │ L'alunno porta a termine compiti solo in situazioni note e supportato. │
└─────────────────┴────────────────────────────────────────────────────────────────────────┘
```

Il sistema d'Osservazione degli Esiti d'UDA converte le singole valutazioni dei docenti e il feedback degli studenti in queste quattro categorie. Il report di classe generato ("Foglio Bianco d'Ufficio") calcola l'esatta percentuale di raggiungimento d'Istituto, offrendo alla scuola il quadro statistico empirico necessario per compilare la certificazione finale senza effettuare calcoli manuali approssimativi.

---

## 🏛️ RACCOMANDAZIONI ORGANIZZATIVE D'ISTITUTO (NIV / RAV)

Il **Nucleo Interno di Valutazione (NIV)** adotterà le risultanze della reportistica di livello generata per aggiornare la sezione 3 (*Esiti degli studenti*) del **Rapporto di Autovalutazione (RAV) d'Istituto**:
1.  **Monitoraggio diacronico:** Confrontare le percentuali di livello Avanzato della classe 1^A tra primo e secondo quadrimestre sullo stesso nucleo fondante per misurare l'efficacia del PdM (Piano di Miglioramento).
2.  **Riuso dei Learning Objects:** Le UDA collegate ad classi con OSI $\ge$ 85% e con oltre il 70% di studenti a livello Avanzato o Intermedio sono dichiarate d'ufficio **"Best Practices d'Istituto"** e pubblicate in Bacheca per il riutilizzo in altri plessi d'area.

---
*Rapporto di audit e specifiche del registro pedagogico validati.*  
**L'Organismo di Vigilanza Etica e Tecnologica d'Istituto**  
**Istituto Comprensivo Calvario-Covotta «don Lorenzo Milani»**  
*Ariano Irpino (AV), 15 Luglio 2026*