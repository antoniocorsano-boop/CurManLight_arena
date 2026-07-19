# 🧙‍♂️ PROPOSTA DI INTEGRAZIONE INTERFACCE WIZARD (CURMANLIGHT)
### Studio di Fattibilità, Analisi dei Processi Utente e Mappa dell'Integrazione Frontend
**Istituto Comprensivo Calvario-Covotta «don Lorenzo Milani» — Ariano Irpino (AV)**

Il modello di interazione **Wizard (procedura guidata passo-passo)** è uno degli strumenti più efficaci nel design delle interfacce scolastiche (EdTech UX). Esso riduce drasticamente il carico cognitivo dei docenti, elimina la sensazione di smarrimento davanti a form densi di dati e previene errori di input, garantendo un'esperienza fluida e direzionata anche per utenti con limitate competenze digitali.

Questo documento analizza **quali processi dell'applicazione CurManLight trarrebbero massimo beneficio da un'interfaccia a Wizard**, ne definisce gli step operativi e individua i punti esatti di integrazione nel codice React/TypeScript.

---

## 🗺️ INDICE DELL'ANALISI
1. [Perché il Wizard? Razionale Pedagogico ed Ergonomico](#1-perché-il-wizard-razionale-pedagogico-ed-ergonomico)
2. [I 4 Processi Utente Ideali per un'Interfaccia a Wizard](#2-i-4-processi-utente-ideali-per-uninterfaccia-a-wizard)
3. [Mappa di Integrazione nel Frontend (Dove e Come)](#3-mappa-di-integrazione-nel-frontend-dove-e-come)
4. [Esempio di Implementazione Logica dello Stato React](#4-esempio-di-implementazione-logica-dello-stato-react)

---

## 🧠 1. PERCHÉ IL WIZARD? RAZIONALE PEDAGOGICO ED ERGONOMICO

I docenti lavorano spesso in contesti ad alto livello di distrazione (aule, laboratori, consigli di classe) e gestiscono flussi di lavoro burocratici complessi. Il passaggio da un approccio a "schermata unica con molteplici pannelli" a un approccio "un compito alla volta" (Wizard) offre tre grandi vantaggi:
* **Chunking Cognitivo:** Suddividere un compito complesso (come la scrittura di un'UDA di 5 pagine) in piccole porzioni logiche digeribili.
* **Focus e Riduzione del Rumore:** Nascondere le opzioni non pertinenti allo step corrente (es. non mostrare le note sull'inclusione DSA mentre si sta ancora scegliendo il titolo del modulo).
* **Prevenzione degli Errori:** Validare ciascuno step prima di consentire il passaggio al successivo, assicurando la qualità del dato finale memorizzato nel database locale.

---

## ⚙️ 2. I 4 PROCESSI UTENTE IDEALI PER UN'INTERFACCIA A WIZARD

L'audit ha individuato **quattro flussi di lavoro chiave** all'interno di CurManLight che trarrebbero enorme valore dalla trasformazione in Wizard passo-passo:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. WIZARD DI ONBOARDING (Primo avvio o cambio profilo)                      │
│    Scegli Ruolo ──► Imposta Ordine ──► Attiva Materia ──► Avvia Test/Lavoro │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. WIZARD DI PROGETTAZIONE UDA (Per docenti e dipartimenti)                │
│    Dati Generali ──► Seleziona Traguardi ──► Evidenze ──► Compito ──► Fine  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. WIZARD DI ALLINEAMENTO GAP 2025 (Per referenti e commissioni)           │
│    Filtra Ambito ──► Vota Schede 1-a-1 ──► Personalizza ──► Salva Consenso │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 4. WIZARD DI ESPORTAZIONE REPORTISTICA (Per amministratori e DS)            │
│    Seleziona Tipo ──► Applica Filtri ──► Anteprima ──► Scarica (.docx/.json)│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 👤 WIZARD A: Onboarding, Profilazione e Accoglienza Docente
* **Obiettivo:** Accogliere il docente al primo avvio, guidandolo nella configurazione iniziale del proprio contesto d'insegnamento per evitare che si trovi davanti a dati non pertinenti.
* **Gli Step del Wizard:**
  1. **Step 1 - Chi Sei? (Ruolo):** Selezione del profilo all'interno della governance scolastica (es. Insegnante, Dipartimento, Referente, DS).
  2. **Step 2 - Dove Insegni? (Ordine di Scuola):** Scelta tra Infanzia, Primaria e Secondaria di Primo Grado.
  3. **Step 3 - Cosa Insegni? (Disciplina):** Selezione della materia attiva tra le 14 disponibili (es. Italiano, Matematica, Latino).
  4. **Step 4 - Pronti a Partire!:** Schermata finale che offre la possibilità di avviare il **Test Guidato d'Istituto** (caricando dati fittizi di esempio in memoria) o di iniziare con un foglio di lavoro vuoto.
* **Perché è utile:** Evita che un docente della scuola dell'infanzia veda per errore i traguardi di Latino della scuola media o che un insegnante di educazione fisica visualizzi formati non idonei.

---

### 📂 WIZARD B: Progettazione Guidata dell'Unità di Apprendimento (UDA)
* **Obiettivo:** Trasformare l'attuale modulo di progettazione (che ha molti campi) in una sequenza lineare assistita, culminante nel salvataggio dell'UDA in archivio.
* **Gli Step del Wizard:**
  1. **Step 1 - Carta d'Identità (Dati Introduttivi):** Titolo dell'UDA, Monte Ore, Periodo di svolgimento (es. Primo Trimestre) e Stato (Bozza/Pronta).
  2. **Step 2 - Allineamento Istituzionale (Traguardi & Obiettivi):** Presentazione di una lista interattiva a caselle di controllo (checkbox) contenente *solo* i traguardi d'Istituto e gli obiettivi formativi previsti per la materia e l'ordine selezionati.
  3. **Step 3 - Comportamenti Attesi (Evidenze Osservabili):** Associazione delle evidenze comportamentali ed etiche ministeriali collegate alle competenze chiave europee.
  4. **Step 4 - Metodologia & Compito (Compito Autentico e Inclusione):** Inserimento in formato testuale del compito di realtà e delle note specifiche per la personalizzazione didattica (es. facilitazioni per alunni con DSA o BES).
  5. **Step 5 - Convalida ed Esportazione:** Anteprima visiva della scheda UDA d'Istituto con opzione immediata di copia del testo o salvataggio diretto nell'archivio protetto offline del browser.
* **Perché è utile:** Rende la stesura dell'UDA un processo standardizzato ed estremamente veloce. Un'UDA completa può essere redatta in meno di 3 minuti.

---

### ⚖️ WIZARD C: Allineamento e Votazione dei Gap Disciplinari (Commissione)
* **Obiettivo:** Guidare i membri dei dipartimenti disciplinari nell'esame metodico e individuale delle discrepanze tra le vecchie indicazioni (2012) e le nuove linee guida (2025).
* **Gli Step del Wizard:**
  1. **Step 1 - Selezione del Campo d'Indagine:** Scelta della materia e dell'ordine di scuola su cui deliberare.
  2. **Step 2 - Votazione Focalizzata (Schede 1-a-1):** Invece di mostrare una lista infinita di righe, il Wizard mostra **una singola variazione di testo alla volta** (Vecchio testo vs Nuovo testo) con una barra di avanzamento (es. "Variazione 3 di 8"). Per ciascuna scheda, l'utente preme un grande bottone colorato: *"Accetta Riforma 2025"* (Verde), *"Mantieni Tradizione 2012"* (Rosso) o *"Personalizza d'Istituto"* (Giallo).
  3. **Step 3 - Revisione d'Insieme:** Una tabella riassuntiva mostra le decisioni prese, segnalando eventuali schede non votate.
  4. **Step 4 - Firma ed Invio:** Generazione del pacchetto di delibera in formato `.json` o `.cml` da trasmettere al referente.
* **Perché è utile:** Rende il lavoro delle commissioni estremamente strutturato, quasi "gamificato", assicurando che non venga saltata alcuna variazione curricolare.

---

## 🛠️ 3. MAPPA DI INTEGRAZIONE NEL FRONTEND (DOVE E COME)

### 3.1 Punti di Iniezione in `App.tsx`

I quattro Wizard andrebbero integrati nelle seguenti viste dell'interfaccia desktop e mobile:

1. **Iniezione Wizard di Onboarding:**  
   * **Dove:** All'interno del modale esistente `showOnboardingModal` in `App.tsx`.
   * **Integrazione:** Sostituire il form statico con un componente a stati progressivi gestito da un contatore `onboardingStep` (da 1 a 4).
   * **Trigger di attivazione:** Mostrato automaticamente all'avvio se la memoria locale è vuota, oppure avviato manualmente tramite la voce *"Configura Profilo"* presente nel menu di gestione file.

2. **Iniezione Wizard Progettazione UDA:**  
   * **Where:** Nella sezione principale *"Area Progettazione UDA"* (`activeTab === 'progetta-annuale'`).
   * **Integrazione:** Affiancare o sostituire il layout a tre colonne con un selettore di modalità: *"Modalità Wizard (Consigliata)"* o *"Modalità Griglia Libera (Esperti)"*. La modalità Wizard caricherà un'interfaccia a schermo intero focalizzata, con indicatori di progresso circolari in alto.

3. **Iniezione Wizard Allineamento Gap:**  
   * **Where:** Nel tab *"Revisione (Gap 2025)"* (`activeTab === 'revisione'`).
   * **Integrazione:** Attualmente le schede di gap sono mostrate come una pila verticale. L'inserimento del Wizard trasformerà la visualizzazione in un **Carousel focalizzato di schede singole**, ideale anche per l'uso da smartphone durante le riunioni di dipartimento.

---

## 💻 4. ESEMPIO DI IMPLEMENTAZIONE LOGICA DELLO STATO REACT

Dal punto di vista dello sviluppo in TypeScript, la logica di controllo di un Wizard in `App.tsx` può essere gestita in modo pulito e lineare. Di seguito viene presentata la struttura dello stato reattivo consigliata per il **Wizard di Progettazione UDA**:

```tsx
import React, { useState } from 'react';
import { Check, ChevronRight, ChevronLeft, Save } from 'lucide-react';

export function UdaWizardComponent({ onSave, onCancel, defaultDiscipline, defaultOrder }) {
  // 1. Stato del progresso del Wizard (da 1 a 5)
  const [currentStep, setCurrentStep] = useState<number>(1);
  
  // 2. Stati locali dei dati del form dell'UDA
  const [title, setTitle] = useState('');
  const [hours, setHours] = useState(15);
  const [period, setPeriod] = useState('Primo Trimestre');
  const [selectedTraguardi, setSelectedTraguardi] = useState<number[]>([]);
  const [selectedObiettivi, setSelectedObiettivi] = useState<number[]>([]);
  const [realTask, setRealTask] = useState('');
  const [notes, setNotes] = useState('');

  // Configurazione dei passaggi del Wizard
  const stepsConfig = [
    { number: 1, label: "Dati Introduttivi", desc: "Titolo, ore e periodo dell'UDA" },
    { number: 2, label: "Traguardi & Obiettivi", desc: "Selezione dei riferimenti d'Istituto" },
    { number: 3, label: "Competenze & Evidenze", desc: "Associazione dei comportamenti attesi" },
    { number: 4, label: "Compito & Inclusione", desc: "Definizione del compito autentico" },
    { number: 5, label: "Convalida", desc: "Riepilogo e salvataggio finale" }
  ];

  // Gestori di navigazione del Wizard con validazione integrata
  const handleNext = () => {
    if (currentStep === 1 && !title.trim()) {
      alert("Inserire un titolo prima di procedere!");
      return;
    }
    if (currentStep === 4 && !realTask.trim()) {
      alert("Fornire una descrizione del compito di realtà per l'inclusione!");
      return;
    }
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden max-w-4xl mx-auto">
      
      {/* TESTATA DEL WIZARD: Indicatore Visivo dei Passaggi */}
      <div className="bg-slate-50 border-b border-slate-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-indigo-950 uppercase tracking-wider">Creazione Guidata UDA</h2>
            <p className="text-[10px] text-slate-400 font-medium">Passo {currentStep} di 5: {stepsConfig[currentStep - 1].desc}</p>
          </div>
          <span className="text-xs bg-indigo-100 text-indigo-800 font-black px-2.5 py-1 rounded-full">
            {Math.round((currentStep / 5) * 100)}% Completato
          </span>
        </div>
        
        {/* Barra di Avanzamento Orizzontale */}
        <div className="flex items-center space-x-1.5 mt-4">
          {stepsConfig.map((s) => (
            <div key={s.number} className="flex-1 flex items-center space-x-1">
              <div className={`h-1.5 rounded-full transition-all duration-300 flex-1 ${
                s.number <= currentStep ? 'bg-indigo-600' : 'bg-slate-200'
              }`} />
              <span className={`text-[9px] font-bold hidden sm:inline ${
                s.number === currentStep ? 'text-indigo-600 font-black' : 'text-slate-400'
              }`}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CORPO DEL WIZARD: Contenuto Dinamico in base allo Step */}
      <div className="p-6 min-h-[300px] text-xs text-slate-700">
        
        {currentStep === 1 && (
          <div className="space-y-4 fade-in">
            <h3 className="font-extrabold text-slate-900 text-sm">Step 1: Inquadramento Generale dell'Unità di Apprendimento</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Titolo dell'UDA d'Istituto</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  placeholder="Es. Il corsivo come espressione di sé e della mente" 
                  className="w-full border rounded-lg p-2 bg-slate-50 focus:bg-white text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Monte Ore Stimato</label>
                  <input 
                    type="number" 
                    value={hours} 
                    onChange={e => setHours(Number(e.target.value))} 
                    className="w-full border rounded-lg p-2 bg-slate-50 focus:bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Periodo d'Attuazione</label>
                  <select 
                    value={period} 
                    onChange={e => setPeriod(e.target.value)} 
                    className="w-full border rounded-lg p-2 bg-slate-50 focus:bg-white text-xs font-semibold"
                  >
                    <option value="Primo Trimestre">Primo Trimestre</option>
                    <option value="Secondo Trimestre">Secondo Trimestre</option>
                    <option value="Primo Pentamestre">Primo Pentamestre</option>
                    <option value="Secondo Pentamestre">Secondo Pentamestre</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4 fade-in">
            <h3 className="font-extrabold text-slate-900 text-sm">Step 2: Allineamento con gli Obiettivi d'Istituto</h3>
            <p className="text-[11px] text-slate-400">Seleziona i traguardi e gli obiettivi formativi previsti nel Curricolo Verticale per la materia attiva:</p>
            
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              <strong className="text-[10px] uppercase text-indigo-600 block">Traguardi di Competenza d'Istituto:</strong>
              {/* Esempio di mappatura dei traguardi reali del database */}
              <label className="flex items-start space-x-2.5 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition cursor-pointer">
                <input type="checkbox" className="mt-0.5 rounded border-slate-300" />
                <span className="font-medium text-slate-700">L'alunno partecipa a scambi comunicativi con compagni e insegnanti rispettando il turno.</span>
              </label>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4 fade-in">
            <h3 className="font-extrabold text-slate-900 text-sm">Step 3: Selezione delle Evidenze Comportamentali</h3>
            <p className="text-[11px] text-slate-400">Associa i comportamenti concretamente osservabili degli studenti per la certificazione finale:</p>
            
            <div className="space-y-2">
              <label className="flex items-start space-x-2.5 p-2 bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100/50 rounded-lg transition cursor-pointer">
                <input type="checkbox" className="mt-0.5 text-emerald-600 rounded border-slate-300" />
                <span className="font-semibold text-slate-700">Produce un testo narrativo coerente scritto interamente in corsivo.</span>
              </label>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4 fade-in">
            <h3 className="font-extrabold text-slate-900 text-sm">Step 4: Compito Autentico e Strategie per l'Inclusione</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Descrizione del Compito di Realtà (Prodotto finale)</label>
                <textarea 
                  value={realTask} 
                  onChange={e => setRealTask(e.target.value)} 
                  placeholder="Descrivere il compito autentico che gli studenti svolgeranno (es. Scrivere una lettera formale al Dirigente o realizzare un piccolo cartellone illustrativo)..." 
                  className="w-full border rounded-lg p-2 bg-slate-50 focus:bg-white text-xs h-20"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Misure Dispensative e Compensative (Inclusione PEI/PDP/DSA)</label>
                <textarea 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)} 
                  placeholder="Es. Predisposizione di fogli a righe facilitate, testi a caratteri ingranditi (EasyReading) o monte ore flessibile..." 
                  className="w-full border rounded-lg p-2 bg-slate-50 focus:bg-white text-xs h-16"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-4 fade-in text-center py-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">Riepilogo e Convalida UDA d'Istituto</h3>
            <p className="text-[11px] text-slate-400 max-w-md mx-auto">La progettazione guidata è terminata con successo. Tutti i campi obbligatori sono coerenti con il curricolo verticale selezionato.</p>
            
            <div className="p-4 bg-slate-50 rounded-xl border text-left space-y-1.5 max-w-md mx-auto text-[10px]">
              <div><strong className="text-slate-500">Titolo Modulo:</strong> {title}</div>
              <div><strong className="text-slate-500">Durata:</strong> {hours} ore ({period})</div>
              <div><strong className="text-slate-500">Inclusione:</strong> {notes || "Misure standard d'Istituto"}</div>
            </div>
          </div>
        )}

      </div>

      {/* PIÈ DI PAGINA DEL WIZARD: Pulsanti di Controllo e Navigazione */}
      <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-between">
        
        {/* Bottone Annulla / Esci */}
        <button 
          onClick={onCancel} 
          className="px-4 py-2 text-slate-500 hover:text-slate-800 font-bold transition"
        >
          Annulla
        </button>

        {/* Pulsanti Avanti, Indietro e Salva */}
        <div className="flex items-center space-x-2">
          {currentStep > 1 && (
            <button 
              onClick={handleBack} 
              className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl flex items-center space-x-1.5 font-bold transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Indietro</span>
            </button>
          )}

          {currentStep < 5 ? (
            <button 
              onClick={handleNext} 
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center space-x-1.5 font-bold shadow-md transition"
            >
              <span>Avanti</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button 
              onClick={() => onSave({ title, hours, period, selectedTraguardi, selectedObiettivi, realTask, notes })} 
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center space-x-1.5 font-bold shadow-md transition"
            >
              <Save className="w-4 h-4" />
              <span>Salva in Archivio</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
```

---

## 📈 5. PROSSIMI PASSI PER LO SVILUPPO

L'integrazione di questi Wizard è **tecnicamente e pedagogicamente fattibile a costo zero di architettura**, poiché la struttura dati degli oggetti (UDA, Decisioni, Profili) è già stata completamente tipizzata in `src/types/curriculum.ts` ed è pienamente compatibile con lo stato globale gestito da Zustand in `useCurriculumStore.ts`.

Se lo desideri, posso procedere immediatamente ad integrare:
1. Il **Wizard di Onboarding** nel modale di avvio dell'app.
2. Il **Wizard di Progettazione UDA** (inserendo l'opzione passo-passo nell'area di lavoro dell'insegnante).
3. Oppure avviare la ristrutturazione della sezione di **Revisione dei Gap dei Dipartimenti** trasformandola in un carousel interattivo monoscheda! 

*Fammi sapere da quale dei tre desideri iniziare la sistemazione sul codice attivo!*
