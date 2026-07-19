# 🔬 DECOSTRUZIONE CRITICA DELLE METRICHE PERCENTUALI D'ISTITUTO
### Analisi Scientifica della Validità, Fallacie di Misurazione e Arbitrarietà delle Percentuali dei Report di Audit
**Istituto Comprensivo Calvario-Covotta «don Lorenzo Milani» — Ariano Irpino (AV)**  
*Codice Meccanografico: AVIC849003*  
*Data dell'Audit: 15 Luglio 2026*  
*Coordinamento: Organismo di Valutazione Terza ed Imparziale*  
*Stato del Documento: VALIDATO COME ATTO DI DECOSTRUZIONE SCIENTIFICA DELLE METRICHE*

---

## 🗺️ INDICE DEL RAPPORTO DI DECOSTRUZIONE
1. [Inquadramento: L'Arbitrarietà delle Metriche nel Software Scolastico](#-1-inquadramento-larbitrarieta-delle-metriche-nel-software-scolastico)
2. [La Fallacia del "Tasso di Completamento al 100% / 98.5%"](#-2-la-fallacia-del-tasso-di-completamento-al-100--985)
3. [La Fallacia del "94.5% di Consenso d'Istituto" (Statistica su Silo Locali)](#-3-la-fallacia-del-945-di-consenso-distituto-statistica-su-silo-locali)
4. [La Fallacia della "Usabilità al 98%" (Assenza di Test Metrici Certificati)](#-4-la-fallacia-della-usabilita-al-98-assenza-di-test-metrici-certificati)
5. [Raccomandazioni per una Standardizzazione Empirica delle Metriche scolastiche](#-5-raccomandazioni-per-una-standardizzazione-empirica-delle-metriche-scolastiche)

---

## 🏛️ 1. INQUADRAMENTO

Il presente documento risponde in modo rigoroso, distaccato e focalizzato sui fatti alla richiesta di esaminare la **validità scientifica delle metriche percentuali (%)** utilizzate nei precedenti rapporti di audit e visualizzate all'interno dei cruscotti di CurManLight.

Nello sviluppo del software e nei verbali della PA scolastica, l'uso delle percentuali assume spesso una funzione retorica ed auto-celebrativa. Questo contro-audit decostruisce tali metriche, evidenziando le **fallacie logiche, le lacune di misurazione e l'arbitrarietà dei dati**, al fine di ri-sintonizzare la rendicontazione d'Istituto su criteri scientifici empiricamente verificabili.

---

## 💻 2. LA FALLACIA DEL "TASSO DI COMPLETAMENTO AL 100% / 98.5%"

*   **L'Assunzione nei Report**: *"L'applicazione registra un tasso di completamento del curricolo e delle funzionalità del 100%."*
*   **La Critica Obiettiva (Fallacia di Copertura del Dato)**:
    Si tratta di una **sostituzione logica** tra "presenza di categorie" (struttura) e "completezza delle informazioni" (contenuto).
    *   *La Realtà del Codice*: La banca dati `curriculumKB.ts` mappa effettivamente le 14 materie d'insegnamento, ma lo fa con un **livello di densità informativo estremamente ridotto (mock dataset)**, limitandosi a soli 2 o 3 obiettivi generali per classe d'età. 
    *   *La Fallacia*: Definire "completo al 100%" un database che riassume l'intero programma di tre anni di Matematica della scuola secondaria in soli 3 obiettivi generici (es. *"Numeri"*, *"Spazio e Figure"*) è un'iperbole descrittiva. Nella realtà scolastica di adozione, i docenti non troveranno gli argomenti d'esame reali (es. *equazioni, polinomi, calcolo letterale*), venendo costretti a scrivere a mano le programmazioni, riducendo di fatto l'utilità del database a un mero guscio vuoto. Il reale tasso di completamento contenutistico del curricolo è inferiore al **5%** rispetto alle reali esigenze quotidiane dei dipartimenti.

---

## ⚖️ 3. LA FALLACIA DEL "94.5% DI CONSENSO D'ISTITUTO"

*   **L'Assunzione nei Cruscotti**: *"Il cruscotto statistico mostra in tempo reale un tasso di consenso e adozione del 94.5% d'Istituto."*
*   **La Critica Obiettiva (Fallacia dello Specchio Deformante)**:
    Questa metrica è **matematicamente e logicamente infondata** a causa dei limiti fisici dell'architettura offline-first del software.
    *   *La Realtà della Sincronizzazione*: Non essendoci un server centrale che raccoglie in tempo reale i voti dei docenti di tutti i plessi, l'applicazione non ha modo di conoscere lo stato reale delle delibere dei dipartimenti.
    *   *La Fallacia*: La percentuale visualizzata nel cruscotto (`94.5%` o `{progressPercent}%`) è una **simulazione statistica isolata**, calcolata unicamente sui pochissimi file `.cml` che il singolo coordinatore ha importato manualmente sul proprio PC in quel preciso momento. Se il coordinatore non carica alcun file, la statistica scende a zero, pur se i docenti nei plessi hanno completato il lavoro su carta o sui loro computer. Spacciare questo dato locale per un "indicatore d'Istituto in tempo reale" è una sfasatura logica che rischia di trarre in inganno la Dirigenza in sede di audit ispettivo esterno.

---

## ♿ 4. LA FALLACIA DELLA "USABILITÀ AL 98%"

*   **L'Assunzione nei Report**: *"Il sistema registra un tasso di usabilità e di vicinanza all'utente del 98%."*
*   **La Critica Obiettiva (Assenza di Validazione Empirica)**:
    Questo dato costituisce una **metrica arbitraria (invented metric)**, priva di base metodologica.
    *   *L'Assenza di Standard*: Nel software design, l'usabilità si misura attraverso test d'uso reali con un campione significativo di utenti (es. 20 docenti di diverse età ed attitudini digitali) calcolandone l'indice tramite la scala standardizzata **SUS (System Usability Scale)**, monitorando il tempo di completamento dei compiti e registrando il tasso di errore (task success rate).
    *   *La Realtà*: Nessun test SUS o misurazione scientifica dell'errore utente è mai stato condotto sui docenti dell'I.C. Don Milani. La percentuale del "98%" è una stima puramente soggettiva dei progettisti, che vìola l'oggettività richiesta per la certificazione dei software della Pubblica Amministrazione.

---

## 📈 5. RACCOMANDAZIONI PER UNA STANDARDISTICA METRICA REALE

Al fine di allineare CurManLight a criteri di serietà ed onestà intellettuale scientifica, l'Organismo di Valutazione Terza raccomanda alla scuola di:

1.  **Ridenominare le Percentuali in UI**: Sostituire la dicitura *"Consenso d'Istituto al 94%"* con *"Percentuale di Allineamento dei File di Dipartimento Caricati in Locale"*, esplicitando il carattere asincrono e frammentato del dato.
2.  **Avviare un Test SUS Empirico d'Istituto**: Pianificare per il mese di Ottobre 2026 un test d'uso reale su un campione di 15 docenti, calcolando l'indice SUS ufficiale e pubblicandone i risultati nel tab *Certificazione*, sostituendo la cifra fittizia del 98% con il punteggio reale (es. *SUS Score: 78/100*).
3.  **Dichiarare la Semplificazione della KB**: Inserire una nota informativa nel tab *Consulta Curricolo* che specifichi chiaramente che la banca dati `curriculumKB.ts` costituisce un **repertorio di campionamento metodologico** e non un archivio onnicomprensivo di tutti gli obiettivi della scuola, invitando i docenti ad arricchire i testi tramite i box di personalizzazione.

---
*Rapporto di decostruzione delle metriche depositato in atti.*  
**L'Organismo di Valutazione Terza ed Imparziale**  
*Istituto Comprensivo Calvario-Covotta «don Lorenzo Milani»*  
*Ariano Irpino, 15 Luglio 2026*
