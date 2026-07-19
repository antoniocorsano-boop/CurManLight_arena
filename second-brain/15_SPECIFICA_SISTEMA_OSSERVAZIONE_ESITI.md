# 📊 SPECIFICA TECNICA E FUNZIONALE: OSSERVATORIO E REGISTRAZIONE DEGLI ESITI UDA
### Motore di Calcolo dell'Indice d'Esito (OSI), Integrazione con D.M. 14/2024 e Tutele GDPR d'Istituto
**Istituto Comprensivo Calvario-Covotta «don Lorenzo Milani» — Ariano Irpino (AV)**  
*Codice Meccanografico: AVIC849003*  
*Data del Progetto: 15 Luglio 2026*  
*Coordinamento: Tavolo di Progettazione d'Istituto per la Misurazione del Successo Formativo*  
*Stato del Progetto: APPROVATO ED INTEGRATO COME VOLUME 15 DEL SECOND BRAIN D'ISTITUTO*

---

## 🗺️ INDICE DEL PROGETTO TECNICO
1. [Visione Strategica: Dalle Vanity Metrics alle Decisioni Basate sui Dati](#-1-visione-strategica-dalle-vanity-metrics-alle-decisioni-basate-sui-dati)
2. [Modello Matematico del Calcolo dell'Indice d'Esito e Successo Didattico (OSI)](#-2-modello-matematico-del-calcolo-dellindice-desito-e-successo-didattico-osi)
3. [Flusso Operativo e Architettura dei Dati nel Codice Sorgente (React)](#-3-flusso-operativo-e-architettura-dei-dati-nel-codice-sorgente-react)
4. [Tutele sul Trattamento dei Dati Personali dei Minori (GDPR Compliant)](#-4-tutele-sul-trattamento-degli-esiti-scolastici-ed-isolamento-gdpr)
5. [Integrazione con i Processi di Autovalutazione d'Istituto (RAV/NIV/PdM)](#-5-integrazione-con-i-processi-di-autovalutazione-distituto-ravnivpdm)

---

## 🏛️ 1. VISIONE STRATEGICA: DALLE VANITY METRICS ALLE DECISIONI BASATE SUI DATI

Nelle pratiche di cooperazione didattica, lo scambio e il riutilizzo delle Unità di Apprendimento (**UDA**) sono stati tradizionalmente guidati da logiche di gradimento soggettivo o popolarità del docente. L'introduzione di una "Like-Economy" scolastica (metodo tipico delle piattaforme social generiche) è inadeguata a rappresentare la reale valenza scientifico-pedagogica di un progetto.

Il **Sistema di Registrazione e Osservazione degli Esiti UDA** (v3.0) sostituisce le logiche di gradimento arbitrario con un **Osservatorio dei Dati Didattici Reali**. 

La piattaforma consente al docente di registrare l'efficacia d'aula dell'UDA dopo averla insegnata, analizzando le distribuzioni percentuali dei livelli di competenza degli studenti. Questo permette al sistema di calcolare in modo deterministico e trasparente un **Indice d'Esito e Successo Didattico (OSI)**, utile per individuare ed esportare le migliori pratiche didattiche d'Istituto.

---

## 📐 2. MODELLO MATEMATICO DEL CALCOLO DELL'INDICE D'ESITO (OSI)

L'**Indice d'Esito e Successo Didattico (OSI - Outcomes Success Index %)** è un punteggio percentuale (da 10% a 100%) calcolato dinamicamente dal sistema per ciascuna UDA condivisa, integrando tre vettori quantitativi:

### 2.1 La Formula di Calcolo
$$OSI = \text{Math.min}\Big(100, \text{Math.round}\big((E_{self} \times 10) + (P_{adv} \times 0.5) + (P_{int} \times 0.3) + (R_{count} \times 1.5)\big)\Big)$$

*Dove:*
*   **$E_{self}$ (Autovalutazione Docente - Peso 50%):** Il punteggio di efficacia didattica espresso a fine lezione dall'insegnante su una scala da 1 a 5 Stelle (moltiplicato per 10, vale fino a un massimo di **50 punti**).
*   **$P_{adv}$ (Livello Avanzato Studenti - Peso 25%):** La percentuale d'alunni della classe che ha raggiunto il livello *Avanzato* di competenza unificata (**D.M. 14/2024**). Ogni punto percentuale vale 0.5 punti, fino a un massimo di **50 punti** (nel caso teorico di 100% di alunni ad Avanzato).
*   **$P_{int}$ (Livello Intermedio Studenti - Peso 15%):** La percentuale d'alunni della classe che ha raggiunto il livello *Intermedio* di competenza. Ogni punto percentuale vale 0.3 punti, fino a un massimo di **30 punti**.
*   **$R_{count}$ (Tasso di Riuso d'Istituto - Peso 10%):** Il numero di volte che l'UDA è stata clonata, importata ed integrata nell'archivio di altri colleghi. Ciascuna replica vale 1.5 punti, fino a un massimo di **20 punti** (limite di saturazione a 14 riutilizzi).

### 2.2 Bollini di Raccomandazione e Classificazione d'Istituto
In base al punteggio OSI calcolato, il sistema classifica automaticamente l'UDA per guidare le scelte di riutilizzo dei dipartimenti:
1.  **OSI $\ge$ 85% ➔ 🏆 Eccellenza d'Istituto (Consigliata per il Riuso):** Visualizzata in verde. Indica progetti con un eccezionale successo formativo e altissimo tasso di replicabilità.
2.  **OSI 65-84% ➔ 📈 Alto Impatto Didattico:** Visualizzata in blu. Indica percorsi didattici solidi, efficaci e largamente integrati.
3.  **OSI < 65% ➔ ⏳ In Corso di Consolidamento / Sperimentale:** Visualizzata in ambra. Indica UDA di nuova stesura o che necessitano di rimodulazione nelle misure inclusive o nei tempi.

---

## 💻 3. FLUSSO OPERATIVO E ARCHITETTURA NEL CODICE SORGENTE (React)

La capability è interamente sviluppata a livello client-side in `src/App.tsx` ed è così articolata:

### 3.1 Struttura del Record dei Dati (TypeScript)
```typescript
interface SharedUda {
  id: string;
  title: string;
  author: string;
  discipline: string;
  order: SchoolOrder;
  period: string;
  hours: number;
  traguardi: string[];
  obiettivi: string[];
  evidenze: string[];
  realTask: string;
  notes: string;
  likes: number;
  likedByMe: boolean;
  reusedCount: number; // Numero di clonazioni / riutilizzi
  selfEvaluation: number; // Valutazione docente (1-5 stelle)
  studentOutcomes: {
    avanzato: number; // % studenti ad Avanzato
    intermedio: number; // % studenti ad Intermedio
    base: number; // % studenti a Base
    iniziale: number; // % studenti a Iniziale
  };
  annotations: Array<{ author: string; text: string }>;
}
```

### 3.2 Il Controller di Salvataggio ed Elaborazione degli Esiti
La funzione `handleSaveOutcomes` convalida i dati in ingresso, controlla la consistenza matematica delle percentuali ed aggiorna l'indice OSI in background:
```typescript
const handleSaveOutcomes = () => {
  if (!selectedUdaForOutcomes) return;
  
  // Convalida: la somma delle percentuali d'esito della classe deve essere esattamente 100%
  const totalPct = Number(outcomesAvanzato) + Number(outcomesIntermedio) + Number(outcomesBase) + Number(outcomesIniziale);
  if (totalPct !== 100) {
    alert(`⚠️ Errore di consistenza d'aula: La somma dei livelli d'esito deve essere pari a 100%! (Attuale: ${totalPct}%)`);
    return;
  }

  const newList = socialUdas.map(s => {
    if (s.id === selectedUdaForOutcomes.id) {
      const newAnnotations = [...s.annotations];
      if (criticalReflectionsInput.trim()) {
        newAnnotations.push({
          author: `${getRoleLabel(role)} (Riflessione d'Esito d'Aula)`,
          text: `Lezione Appresa: ${criticalReflectionsInput.trim()}`
        });
      }
      return {
        ...s,
        selfEvaluation: selfEvaluationStars,
        studentOutcomes: {
          avanzato: outcomesAvanzato,
          intermedio: outcomesIntermedio,
          base: outcomesBase,
          iniziale: outcomesIniziale
        },
        annotations: newAnnotations
      };
    }
    return s;
  });

  updateSocialUdas(newList);
  setCriticalReflectionsInput("");
  setShowOutcomesModal(false);
  setSelectedUdaForOutcomes(null);
  showToast("📊 Esiti didattici registrati e calcolati con successo!");
};
```

---

## 🔐 4. TUTELE SUL TRATTAMENTO DEI DATI PERSONALI (GDPR)

La registrazione e l'osservazione degli esiti formativi all'interno dell'Osservatorio di CurManLight soddisfa nativamente il **GDPR (Regolamento UE 2016/679)** grazie a tre barriere di isolamento dei dati:

1.  **Esclusivo Trattamento di Dati Aggregati e Anonimi:**
    L'applicazione non consente in alcun modulo l'inserimento di voti individuali dei singoli studenti, né di elenchi nominativi di classe. Il sistema acquisisce esclusivamente la **distribuzione statistica ed anonima in percentuale** della classe (es. *80% ad Avanzato, 20% a Intermedio*).
2.  **Divieto Assoluto di Inserimento Dati Particolari (Art. 9 GDPR):**
    All'interno del modulo di inserimento delle riflessioni critiche, è presente un blocco normativo esplicito. È vietato inserire nomi di battesimo, cognomi, sigle o indicazioni indirette che possano ricollegare l'esito a specifiche situazioni sanitarie o cognitive di minori (es. disabilità Legge 104, diagnosi DSA o BES). Le riflessioni devono essere interamente metodologiche.
3.  **Archiviazione Decentralizzata d'Istituto:**
    La sincronizzazione asincrona della bacheca avviene all'interno del cloud scolastico sicuro Google Drive d'Istituto (AppDataFolder personale del docente). Nessun dato viene mai aggregato o trasmesso a server o cloud di terze parti estranei all'istituto, azzerando i rischi di data-breach massivi.

---

## 🏛️ 5. INTERAZIONE CON L'AUTOVALUTAZIONE D'ISTITUTO (RAV/NIV)

I dati quantitativi raccolti dall'Osservatorio degli Esiti di CurManLight forniscono al **Nucleo Interno di Valutazione (NIV)** la base di dati empirica essenziale per monitorare l'efficacia del **Piano di Miglioramento (PdM)** ed aggiornare il **Rapporto di Autovalutazione (RAV)**:

*   **Identificazione delle eccellenze replicabili:** Il NIV può estrarre l'elenco delle UDA certificate con **OSI $\ge$ 85%** ed inserirle stabilmente come *modelli d'Istituto* nel PTOF, facilitando la formazione e l'allineamento dei docenti neo-assunti.
*   **Monitoraggio dell'inclusione reale:** Analizzando i commenti e le lezioni apprese (lessons learned) delle UDA sperimentali (OSI < 65%), i dipartimenti possono rimodulare le misure compensative e dispensative per i successivi trimestri, raccordandole in tempo reale con i bisogni educativi speciali.

---
*Progetto tecnico e specifiche dell'Osservatorio degli Esiti convalidati e depositati.*  
**Il Comitato di Progettazione per la Misurazione del Successo Formativo**  
**Istituto Comprensivo Calvario-Covotta «don Lorenzo Milani»**  
*Ariano Irpino (AV), 15 Luglio 2026*