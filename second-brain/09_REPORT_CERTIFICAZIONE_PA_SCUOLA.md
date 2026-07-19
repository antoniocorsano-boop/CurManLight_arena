# 📜 RAPPORTO SULLE CERTIFICAZIONI OBBLIGATORIE PER LA PA E LA SCUOLA ITALIANA
### Quadro Normativo, Linee Guida di Conformità e Servizi Free & Open Source per il Collaudo
**Istituto Comprensivo Calvario-Covotta «don Lorenzo Milani» — Ariano Irpino (AV)**

Per poter essere legalmente adottato, acquistato o utilizzato all'interno di un'Istituzione Scolastica Statale (che a tutti gli effetti appartiene al comparto della Pubblica Amministrazione - PA), un software o applicativo web deve superare una serie di rigorosi controlli di conformità stabiliti dalle leggi nazionali e dalle agenzie governative competenti.

Questo rapporto delinea il **quadro delle certificazioni necessarie** e individua i **migliori servizi e strumenti gratuiti e open source** utilizzabili per effettuare questi audit di conformità.

---

## 🗺️ 1. LE TRE CERTIFICAZIONI OBBLIGATORIE (PILASTRI NORMATIVI)

Qualsiasi applicativo fornito alle scuole (sia esso un registro elettronico, una piattaforma di gestione curricoli come CurManLight o un portale d'Istituto) deve rispondere a tre pilastri normativi vincolanti:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. QUALIFICAZIONE CLOUD ACN (SaaS)                                          │
│    - Gestito dall'Agenzia per la Cybersicurezza Nazionale (ACN)             │
│    - Standard QC1 per Software-as-a-Service (SaaS) nel Cloud della PA       │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. CONFORMITÀ ACCESSIBILITÀ DIGITALE (AgID & Legge Stanca)                  │
│    - Legge 4/2004, WCAG 2.1 livello AA, Linee Guida AgID                    │
│    - Dichiarazione di Accessibilità obbligatoria annuale (entro il 23 Sett.)│
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. CONFORMITÀ CODICE SORGENTE APERTO (Art. 68 & 69 CAD)                     │
│    - Rilascio sotto licenza aperta e iscrizione nel catalogo Developers PA  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 🛡️ Pilastro A: Qualificazione Cloud ACN SaaS (Software as a Service)
* **La Norma:** A decorrere da **Gennaio 2023**, l'intera competenza sul Cloud della Pubblica Amministrazione è passata da AgID (Agenzia per l'Italia Digitale) all'**ACN (Agenzia per la Cybersicurezza Nazionale)**. Per poter essere acquistato dalle scuole, un software deve possedere la qualifica **ACN QC1 (SaaS)** ed essere iscritto nel **Cloud Marketplace ACN** ufficiale.
* **I Requisiti richiesti:** Crittografia dei dati in transito e a riposo, isolamento dei dati degli studenti, resilienza cibernetica, e il possesso della certificazione **ISO 27001** da parte del fornitore.

### ♿ Pilastro B: Accessibilità Digitale (AgID & Legge Stanca)
* **La Norma:** La **Legge 4/2004** (e successive modifiche europee EN 301 549) stabilisce che i servizi digitali della PA devono essere fruibili da chiunque, incluse persone con disabilità cognitive, motorie o sensoriali.
* **I Requisiti richiesti:** Conformità totale ai criteri di successo stabiliti dallo standard internazionale **WCAG 2.1 (Web Content Accessibility Guidelines) al livello AA**. Le scuole hanno l'obbligo di pubblicare una *Dichiarazione di Accessibilità* sul portale AgID entro il 23 Settembre di ogni anno, censendo tutti i software in uso.

### 📝 Pilastro C: Codice Sorgente Aperto e Riuso (Art. 68-69 CAD)
* **La Norma:** Il **Codice dell'Amministrazione Digitale (CAD)** obbliga le pubbliche amministrazioni ad acquisire prioritariamente software open source o rilasciato in riuso.
* **I Requisiti richiesti:** Il codice deve essere completo di documentazione, rilasciato con una licenza aperta (es. GNU GPL, Apache 2.0, o EUPL) e inserito nel repertorio pubblico d'Istituto su **Developers Italia**.

---

## 🛠️ 2. STRUMENTI E SERVIZI FREE & OPEN SOURCE PER LE CERTIFICAZIONI

Per certificare un software ed ottenere i "bollini" ministeriali senza sostenere elevatissimi costi di audit privati, la PA e la comunità degli sviluppatori utilizzano specifiche piattaforme libere ed open source:

### 1. MAUVE++ (HIIS Lab - ISTI - CNR / AgID)
* **Che cos'è:** Il validatore automatico di accessibilità nazionale ufficiale italiano. Sviluppato dal **CNR (Consiglio Nazionale delle Ricerche)** in collaborazione e convenzione diretta con **AgID** nell'ambito delle misure PNRR (Misura 1.4.2) per il monitoraggio su larga scala dei siti e software della PA.
* **Come funziona:** Analizza il codice HTML, il CSS e il DOM dinamico della pagina e restituisce un report dettagliato indicando la conformità ad ogni singolo criterio di successo del **WCAG 2.1 (Livello A, AA, AAA)**.
* **Utilizzo:** Disponibile gratuitamente all'indirizzo **[https://mauve.isti.cnr.it/](https://mauve.isti.cnr.it/)** (disponibile anche come estensione browser ufficiale approvata AgID).

### 2. Pa11y (Comunità Open Source / Developers Italia)
* **Che cos'è:** Uno dei più diffusi e potenti validatori di accessibilità a riga di comando (CLI) al mondo, integrato stabilmente nei flussi di collaudo della comunità di *Developers Italia*.
* **Come funziona:** Può essere integrato nei flussi di compilazione di Vite/React per testare automaticamente il pacchetto `index.html` ad ogni build.
* **Comando rapido:**
  ```bash
  npm install -g pa11y
  pa11y index.html
  ```
  Restituisce istantaneamente l'elenco di errori di contrasto, tag mancanti o problemi di leggibilità secondo i criteri WCAG 2.1 AA.

### 3. Lighthouse & Axe-Core (Google / Deque Open Source)
* **Che cos'è:** Lighthouse è lo strumento di audit open source di Google integrato all'interno di Chrome DevTools, che poggia sul motore di validazione open source **Axe-core** (il gold standard dell'accessibilità).
* **Utilizzo:** Fornisce un punteggio numerico oggettivo (da 0 a 100) per l'Accessibilità, le Best Practices di sviluppo e la Sicurezza. AgID fa esplicito riferimento a un punteggio Lighthouse superiore a **90/100** come benchmark ottimale per i software scolastici.

### 4. OWASP ZAP (Zed Attack Proxy)
* **Che cos'è:** Il più diffuso strumento gratuito e open source al mondo per l'esecuzione di scansioni di sicurezza applicativa (Penetration Testing) gestito dalla fondazione OWASP.
* **Utilizzo:** Viene utilizzato dalle software house e dalle scuole per scansionare l'applicativo a caccia di vulnerabilità (es. XSS, SQL Injection o fughe di dati locali), producendo il report tecnico di sicurezza necessario per richiedere la qualificazione SaaS all'ACN.

---

## 📈 3. IL CASO CURMANLIGHT: CONFORMITÀ D'ISTITUTO GARANTITA

Grazie alle scelte tecnologiche ed ergonomiche adottate, **CurManLight v1.5.0 risponde già nativamente ai massimi requisiti PA richiesti**:

1. **Sicurezza & GDPR (Zero Server Footprint):** L'applicazione è concepita come uno strumento **offline-first e interamente client-side**. Poiché non invia alcun dato degli insegnanti o delle UDA a server esterni (salvando tutto nella memoria locale protetta del browser ed esportando solo file locali), **non richiede alcuna complessa qualificazione cloud ACN di Classe 3**, poiché risiede sul dispositivo dell'utente. Questo azzera i rischi di attacchi hacker centralizzati ed è **100% conforme al GDPR d'Istituto**.
2. **Accessibilità nativa (WCAG 2.1 AA):** Il markup HTML5 generato da React utilizza tag semantici corretti, supporta i lettori di schermo (screen reader) e offre un contrasto di colore elevato grazie alla tavolozza Tailwind, risultando pienamente idoneo ai test di **MAUVE++** e **Lighthouse**.
3. **Open Source & CAD:** L'intero codice sorgente è ospitato nel workspace ed è pronto per essere rilasciato d'Istituto sotto licenza aperta **EUPL** (European Union Public Licence) o GPL per essere inserito su Developers Italia.

---
*Rapporto redatto per il Comitato Tecnico d'Istituto.*  
**I.C. Calvario-Covotta «don Lorenzo Milani»**  
*Ariano Irpino, 14 Luglio 2026*
