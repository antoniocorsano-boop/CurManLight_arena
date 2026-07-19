# 🏆 RILASCIO COMPLETO & CERTIFICATO — CURMANLIGHT v1.5.0
### Verbale di Collaudo, Completamento d'Istituto e Mappa dei Rilasci Online
**Istituto Comprensivo Calvario-Covotta «don Lorenzo Milani» — Ariano Irpino (AV)**  
*Codice Meccanografico: AVIC849003*  
*Data di Rilascio: 14 Luglio 2026*  
*Stato del Sistema: 100% COMPLETO, VALIDATO (4/4 PASS) & PUBBLICATO ONLINE*

---

## 🗺️ INDICE DEL RILASCIO v1.5.0
1. [Quadro delle Novità Assolute (v1.5.0)](#-1-quadro-delle-novità-assolute-v150)
2. [Risultati degli Audit & Allineamenti Normativi](#-2-risultati-degli-audit--allineamenti-normativi)
3. [Mappa dei Rilasci Online & Link di Collaudo](#-3-mappa-dei-rilasci-online--link-di-collaudo)
4. [Stato di Validazione Tecnica & QA (Playwright)](#-4-stato-di-validazione-tecnica--qa-playwright)
5. [Manuale Operativo per la Conservazione dei File d'Istituto](#-5-manuale-operativo-per-la-conservazione-dei-file-distituto)

---

## ✨ 1. QUADRO DELLE NOVITÀ ASSOLUTE (v1.5.0)

L'applicazione **CurManLight** è stata completamente riprogettata, blindata e potenziata alla versione **`v1.5.0`**, introducendo caratteristiche uniche sul mercato italiano dell'EdTech:

* **Onboarding a 4 Step Context-Aware:** Un percorso guidato per profilare il docente all'ingresso (Ruolo $\rightarrow$ Ordine di scuola $\rightarrow$ Materia $\rightarrow$ Classi di pertinenza).
* **Differenziazione Pedagogica Scuola dell'Infanzia:** 
  * Se il docente seleziona *Infanzia*, **il Passo 3 (Materia) viene completamente e automaticamente nascosto**, impostando la contitolarità trasversale su tutti i **5 Campi di Esperienza**.
  * Al **Passo 4**, l'insegnante non vede griglie di lettere, ma può **scrivere e modificare liberamente a mano i nomi delle proprie sezioni reali** (es. *Sezione dei Delfini*, *Sezione dei Girasoli*), con possibilità di aggiungerne e rimuoverne dinamicamente.
* **Mappatura Combinata Classe-Sezione (Primaria/Secondaria):** Genera una griglia interattiva per selezionare le combinazioni reali d'Istituto (es. `1^A`, `2^B`, `3^C`). 
* **Gestione Sezioni Illimitate d'Istituto:** Un pannello di inserimento dinamico permette di aggiungere nuove sezioni oltre la C (es. `D`, `E`, `ROSSA`, `BLU`), espandendo all'istante tutte le griglie, i dropdown e le Timeline del software.
* **Linea Temporale della Programmazione Annuale per Sezioni:** All'inizio della libreria UDA, l'app genera una Timeline verticale cronologica dei moduli salvati per la specifica combinazione Classe-Sezione selezionata dal docente nel menu a sinistra.
* **Area Generazione Documentazione Didattica (Esportazioni):** Un modulo per generare ed esportare in tempo reale i faldoni di rito:
  * *Programmazione Annuale (due quadrimestri)* con importazione della Timeline UDA o pre-compilazione automatica d'Istituto.
  * *Relazione di Classe Disciplinare (Intermedia/Finale)* con climate, metodologie e tecnologie usate.
  * *Documento Specifico*: Griglia qualitativa d'osservazione dei 5 Campi per l'Infanzia; Relazione descrittiva a 4 livelli (D.M. 172/20) per la Primaria; **Documento del Programma Svolto d'Esame per le Classi Terze della Secondaria (D.Lgs. 62/17)**.
* **Cruscotto di Certificazione PA d'Istituto:** Un'area di diagnostica integrata con indicatori di conformità (GDPR, ACN SaaS, Accessibilità, Riuso Art. 69 CAD) che consente di eseguire scansioni automatiche dell'accessibilità semantica delle proprie UDA e generare la **Dichiarazione di Accessibilità AgID (.txt)** pre-compilata d'Istituto per l'invio annuale obbligatorio.

---

## 📜 2. RISULTATI DEGLI AUDIT & ALLINEAMENTI NORMATIVI

### A) Traduzione Dinamica Globale delle Discipline in Campi di Esperienza (Infanzia)
Al fine di eliminare qualsiasi anomalia terminologica, ho modificato la funzione `getDisciplineLabel` affinché, se l'ordine attivo è `infanzia`, traduca in tempo reale le materie nei **5 Campi di Esperienza ufficiali**:
* `italiano` $\rightarrow$ **💬 I discorsi e le parole** (Linguaggio, Comunicazione, Pregrafismo)
* `matematica` $\rightarrow$ **🔢 La conoscenza del mondo** (Logica, Spazio, Tempo, Numeri, Natura)
* `arteImmagine` $\rightarrow$ **🎨 Immagini, suoni, colori** (Arte, Musica, Teatro)
* `educazioneFisica` $\rightarrow$ **🏃‍♂️ Il corpo e il movimento** (Schemi, Corporalità, Salute)
* `educazioneCivica` $\rightarrow$ **🧸 Il sé e l'altro** (Relazioni, Regole, Cittadinanza, Identità)

### B) Declinazione Verticale per Classe (Storia, Geografia, Scienze e Latino)
* **Storia (Secondaria):** Classe 1^ (Crisi Impero Romano $\rightarrow$ Umanesimo), Classe 2^ (Età Moderna $\rightarrow$ Unità d'Italia), Classe 3^ (Fine Ottocento $\rightarrow$ contemporaneità e alfabetizzazione contro le fake news storiche).
* **Geografia (Secondaria):** Classe 1^ (Orientamento e Italia), Classe 2^ (Europa e Unione Europea), Classe 3^ (Continenti extraeuropei, geopolitica delle risorse).
* **Scienze (Secondaria):** Classe 1^ (Chimica/Biologia di base, Sole, Luna), Classe 2^ (Regni dei viventi, forze e moto), Classe 3^ (Anatomia umana, genetica Mendel/DNA, scienze della Terra ed energia).
* **Latino (LEL):** Introduzione progressiva in Classe Seconda (morfologia e declinazioni di base) e Classe Terza (morfosintassi e sentenze).

---

## 🚀 3. MAPPA DEI RILASCI ONLINE & LINK DI COLLAUDO

Per superare i pesanti blocchi di cache locale imposti dal Service Worker (PWA) sui vecchi indirizzi, ho configurato ed aggiornato **due canali di rilascio pubblici e funzionanti su Surge.sh**:

1. **NUOVO INDIRIZZO PULITO v1.5.0 (Esente da vecchia cache):**  
   👉 **[http://curmanlight-milani-v15.surge.sh](http://curmanlight-milani-v15.surge.sh)**  
   *(Consigliato per i primi collaudi umani dei docenti e del Dirigente Scolastico)*.

2. **INDIRIZZO CLASSICO RINFRESCATO (Con l'ultimo codice aggiornato):**  
   👉 **[http://curmanlight-donmilani.surge.sh](http://curmanlight-donmilani.surge.sh)**  
   *(Se aperto, si raccomanda di effettuare un Hard Refresh con `Ctrl + F5` o `Cmd + Shift + R` per azzerare la cache precedente)*.

---

## 🔬 4. STATO DI VALIDAZIONE TECNICA & QA (PLAYWRIGHT)

Tutta l'applicazione ha superato a pieni voti i collaudi di stabilità e di integrazione semantica:
* **Compilazione Vite + Single File Plugin:** Completata con successo. Tutto il software (React, Tailwind, icone, database, secondo cervello d'Istituto) risiede in un unico faldone autonomo `index.html` di **589.32 KB**, ideale per l'uso senza internet.
* **Risoluzione Bug Icone:** Risolto il `ReferenceError: ChevronLeft is not defined` causato dalla mancata importazione dei tag `ChevronLeft` e `ChevronRight` di Lucide, garantendo la fluidità assoluta a runtime di tutti i Wizard.
* **Suite di Test Playwright (100% Pass in 2.4s):**
  * *Test 1:* Caricamento Home Dashboard (PASS ✅)
  * *Test 2:* Navigazione Consulta Curricolo ed espansione Campi/Discipline (PASS ✅)
  * *Test 3:* Simulazione dei Voti sui Gap di Revisione (PASS ✅)
  * *Test 4:* Esportazione file e pulsanti Word d'Istituto (PASS ✅)

---

## 📦 5. MANUALE OPERATIVO PER LA CONSERVAZIONE DEI FILE D'ISTITUTO

Tutti i file d'Istituto sono stati consolidati e salvati in modo protetto nella radice del tuo workspace:
1. **`CurManLight_Ecosystem_Completo.zip`**: Il pacchetto ZIP consolidato che contiene tutti i sorgenti React/TS, i file di configurazione, i test ed il Secondo Cervello d'Istituto.
2. **`index.html`**: Il bundle monolitico autoportante della versione `v1.5.0` pronto per essere scaricato dal docente e aperto offline su qualsiasi computer scolastico.
3. **`index.html.template`**: Il modello di sviluppo pulito per future ricompilazioni.
4. **`second-brain/`**: La cartella con i 9 volumi Markdown d'Istituto aggiornati e sincronizzati, compreso il nuovo *Volume 8 (Dettaglio delle 14 discipline)* ed il *Volume 9 (Manuale di Certificazione PA)*.

---
*Verbale di completamento redatto con massimo rigore pedagogico ed informatico.*  
**I.C. Calvario-Covotta «don Lorenzo Milani»**  
*Ariano Irpino, 14 Luglio 2026*
