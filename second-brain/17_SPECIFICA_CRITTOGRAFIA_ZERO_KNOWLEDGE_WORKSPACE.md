# 📜 SPECIFICA CRITTOGRAFICA ZERO-KNOWLEDGE E ALLINEAMENTO GOOGLE WORKSPACE
### Architettura di Cifratura Client-Side per Registro Elettronico, Integrazione Classroom e Tutele Etiche dell'I.A.
**Istituto Comprensivo Calvario-Covotta «don Lorenzo Milani» — Ariano Irpino (AV)**  
*Codice Meccanografico: AVIC849003*  
*Data del Progetto: 15 Luglio 2026*  
*Coordinamento: Tavolo Congiunto per la Protezione dei Dati (DPO) e l'Innovazione Didattica d'Istituto*  
*Stato del Progetto: VALIDATO ED APPROVATO COME VOLUME 17 DEL SECOND BRAIN D'ISTITUTO*

---

## 🗺️ INDICE DEL DISCIPLINARE CRITTOGRAFICO
1. [Quadro Strategico: La Sovranità del Dato e l'Integrità dell'I.A.](#-1-quadro-strategico-la-sovranita-del-dato-e-lintegrita-dellia)
2. [Modello Zero-Knowledge d'Istituto: Cifratura Locale Simmetrica (AES-GCM)](#-2-modello-zero-knowledge-distituto-cifratura-locale-simmetrica-aes-gcm)
3. [Algoritmo di Mascheratura ed Anonimizzazione dei Dati degli Studenti](#-3-algoritmo-di-mascheratura-ed-anonimizzazione-dei-dati-degli-studenti)
4. [Integrazione Google Workspace: Autenticazione, Workspace Menu ed Avatar](#-4-integrazione-google-workspace-autenticazione-workspace-menu-ed-avatar)
5. [Raccordo Registro Elettronico (Argo / ClasseViva) a Sicurezza Assoluta](#-5-raccordo-registro-elettronico-argo--classeviva-a-sicurezza-assoluta)

---

## 🏛️ 1. QUADRO STRATEGICO: LA SOVRANITÀ DEL DATO SCOLISTICO

Nel contesto dell'adozione di sistemi di Intelligenza Artificiale nella Pubblica Amministrazione ed in particolare nella scuola statale italiana, la tutela della riservatezza dei minori rappresenta una barriera giuridica ed etica invalicabile. 

I dati degli studenti (esiti, voti, misure inclusive PEI/PDP, annotazioni comportamentali) costituiscono **categorie particolari di dati personali (Art. 9 GDPR)**.

Il presente progetto definisce le specifiche tecniche di **CurManLight v4.0** per implementare un'architettura **Zero-Knowledge (a Conoscenza Zero)**. 

La regola fondamentale del sistema stabilisce che: **l'Intelligenza Artificiale (sia il Co-pilota locale sia eventuali API esterne) non può mai e in nessun caso leggere i dati degli studenti in chiaro**. 

Qualsiasi dato degli alunni, se manipolato o memorizzato, risiede cifrato all'interno del browser; la decrittazione avviene unicamente al livello di rendering grafico visibile solo all'insegnante in servizio sul computer, mentre all'I.A. vengono inviati dati interamente mascherati ed anonimizzati.

---

## 🔐 2. MODELLO ZERO-KNOWLEDGE: CIFRATURA LOCALE (AES-GCM)

Per garantire che nessuno, ad eccezione del docente titolare, possa visionare l'elenco degli studenti o i relativi esiti d'UDA, l'applicazione implementa una **Cifratura Simmetrica AES-GCM a 256 bit** basata sulle API native **Web Crypto**:

```
[ ELENCO STUDENTI IN CHIARO ] (Mario Rossi, 10, PEI...)
              │
              ▼ (Livello di Interazione Docente)
    [ CIFRATURA AES-GCM 256 ] ◄─── Chiave Locale d'Istituto (stored in RAM/Zustand)
              │
              ├──────────────────────────────┐
              ▼                              ▼
    [ DATABASE LOCAL STORAGE ]     [ AGENTE PEDAGOGICO I.A. ]
     (Dati 100% Cifrati/Criptati)    (Riceve solo token: Studente_A, Avanzato)
```

1.  **Generazione della Chiave d'Istituto:**
    Al login o all'avvio della sessione, il browser genera una chiave crittografica simmetrica temporanea memorizzata unicamente nella memoria RAM volatile dell'applicazione (Zustand state).
2.  **Scrittura nel Database (Salvataggio Cifrato):**
    Quando l'insegnante importa l'elenco della classe o inserisce valutazioni individuali, CurManLight cifra i record tramite la chiave. Nel database IndexedDB i nomi e le diagnosi risiedono cifrati (es. `U2FsdGVkX19zB2S...`).
3.  **Visualizzazione Local-Only:**
    La decrittazione avviene al volo durante il rendering del DOM in React. I dati decifrati esistono solo nei pixel dello schermo d'aula del docente e non vengono mai scritti su file temporanei o log di sistema.

---

## 🤖 3. ALGORITMO DI MASCHERATURA ED ANONIMIZZAZIONE PER L'I.A.

Se il docente richiede l'aiuto del Co-pilota d'Istituto o del WikiLLM per adattare un'UDA ad un gruppo di studenti in difficoltà, CurManLight attiva un **filtro di mascheratura (Tokenizzazione semantica)** prima di inviare le stringhe al motore di elaborazione:

*   **Identificativi Personali:** I nomi e cognomi vengono sostituiti da token anonimi sequenziali (es. *Mario Rossi* ➔ `Studente_A`, *Luca Bianchi* ➔ `Studente_B`).
*   **Misure Inclusive e Diagnosi:** Eventuali diagnosi sensibili (es. *Sindrome di Down / Disgrafia*) vengono mappate in profili funzionali astratti conformi alla **psicologia cognitiva** (es. *Sostegno Dimensione Relazionale* ➔ `Profilo_Inclusione_Tipo_1`, *Difficoltà Morfologia Scrittura* ➔ `Profilo_Compensativo_Tipo_2`).
*   **Tracciato per l'I.A.:** All'I.A. perviene esclusivamente un testo del tipo: *"L'UDA di Matematica deve essere raccordata per Studente_A (Profilo_Inclusione_Tipo_1) e Studente_B (Profilo_Compensativo_Tipo_2) sugli obiettivi di geometria."*

*L'I.A. elabora l'adattamento didattico senza aver mai appreso l'identità reale o lo stato clinico sensibile degli alunni della scuola, in conformità con le linee guida del Garante per la Privacy.*

---

## ☁️ 4. INTERAZIONE GOOGLE WORKSPACE: AUTH, MENU ED AVATAR

Per consolidare la capability dei Learning Objects, l'applicazione integra un **Menu Standard Google Workspace d'Istituto** situato nella barra laterale (sidebar) o nell'header, raccordato alla sessione OAuth2 attiva del docente:

```
┌────────────────────────────────────────┐
│ 🧑‍🏫 PROF.SSA MARIA LETIZIA            │
│    maria.letizia@icdonmilani.edu.it    │
├────────────────────────────────────────┤
│ 🟢 Google Workspace: Connesso          │
├────────────────────────────────────────┤
│ 📂 Sincronizza Drive (Auto-Save OK)    │
│ 🏫 Condividi Lezione su Classroom      │
│ 📥 Importa Classe da Google Classroom   │
│ 🔌 Disconnetti Account                 │
└────────────────────────────────────────┘
```

1.  **Avatar Dinamico d'Istituto:**
    L'app visualizza l'avatar circolare con le iniziali del docente e un colore di contrasto coordinato al ruolo scolastico selezionato.
2.  ** short-cuts d'Istituto:**
    *   **Integrazione Classroom:** Consente al docente di inviare con un click il pacchetto SCORM `.zip` generato o la lezione HTML direttamente nello stream della propria classe virtuale di Google Classroom.
    *   **Importazione Anagrafica:** Consente di scaricare l'elenco della classe da Google Classroom; i nomi vengono istantaneamente cifrati in AES-GCM al momento del ricevimento client-side, senza mai passare in chiaro nel database locale.

---

## 📊 5. RACCORDO REGISTRO ELETTRONICO (ARGO / CLASSEVIVA)

Il raccordo dei dati d'esito e di programmazione d'Istituto con i registri elettronici commerciali avviene in totale sicurezza tramite il modulo **Copia per Registro (Copia e Incolla Intelligente)**:

*   **Mascheramento all'Esportazione:**
    Quando il docente copia il tracciato dell'UDA o degli esiti per incollarlo su Argo o Spaggiari, l'applicazione decifra i nomi per il clipboard locale dell'utente, in modo che l'operazione di inserimento a registro avvenga in modo fluido, ma esclude che le chiavi crittografiche o le informazioni sensibili d'identità vengano salvate nella cache o nella memoria del browser, azzerando i rischi di tracciamento.

---
*Specifiche crittografiche e di integrazione Workspace convalidate e depositate.*  
**L'Ufficio per la Conservazione Digitale ed il Trattamento dei Dati d'Istituto**  
**Istituto Comprensivo Calvario-Covotta «don Lorenzo Milani»**  
*Ariano Irpino, 15 Luglio 2026*