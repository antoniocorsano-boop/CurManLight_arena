# Teacher Workspace — Executive Design

> Verifica di fattibilità e progettazione esecutiva della proposta Ipotesi 2.

## 1. Sintesi della Fattibilità

**Verdetto: READY_WITH_REDUCED_SCOPE**

La proposta è fattibile come modifica circoscritta. La riduzione dello scope rispetto alla proposta originale è necessaria perché:

- Il wizardStep **non è persistito** (useState), ma i campi del form **sono già persistiti** (localStorage)
- La Dashboard attuale è un componente presentazionale che riceve props, non è raggiungibile via URL
- Il router reindirizza `/` a `/curriculum`, quindi la Dashboard non è visibile nell'architettura attuale

**Modifiche minime necessarie:**
1. Persistere `wizardStep` in localStorage (1 campo)
2. Creare una vista "Stato del Lavoro" accessibile dalla sidebar o dalla Dashboard
3. Collegare i dati esistenti (savedUda, decisions, progTitle) a una vista leggibile

**Non serve:**
- Nuovi store Zustand
- Nuove chiavi localStorage multiple
- Nuova navigazione
- Modifiche alla shell congelata

## 2. Mappa del Codice Attuale

### Wizard State

| Campo | File | Persistito? | Mechanism |
|---|---|---|---|
| `wizardStep` | `src/features/session/hooks/useAppWorkflowState.ts:14` | **NO** | useState(1) |
| `progettazioneMode` | `src/features/session/hooks/useAppWorkflowState.ts:11-13` | SI | localStorage `curman_progettazioneMode` |
| `targetClass` | `src/features/session/hooks/useAppWorkflowState.ts:17` | SI | localStorage `curman_targetClass` |
| `targetSection` | `src/features/session/hooks/useAppWorkflowState.ts:18` | SI | localStorage `curman_targetSection` |
| `progTitle` | `src/features/progettazione/hooks/useUdaProgrammingHandlers.ts:37` | SI | localStorage `curman_progTitle` |
| `progPeriod` | `src/features/progettazione/hooks/useUdaProgrammingHandlers.ts:38` | SI | localStorage `curman_progPeriod` |
| `progHours` | `src/features/progettazione/hooks/useUdaProgrammingHandlers.ts:40` | SI | localStorage `curman_progHours` |
| `progNotes` | `src/features/progettazione/hooks/useUdaProgrammingHandlers.ts:41` | SI | localStorage `curman_progNotes` |
| `realTaskInput` | `src/features/progettazione/hooks/useUdaProgrammingHandlers.ts:42` | SI | localStorage `curman_realTaskInput` |
| `progStatus` | `src/features/progettazione/hooks/useUdaProgrammingHandlers.ts:39` | SI | localStorage `curman_progStatus` |

**Lacuna:** Solo `wizardStep` non è persistito. Tutti gli altri campi sono già salvati.

### Dashboard

| Elemento | File | Responsabilità | Riutilizzabile? |
|---|---|---|---|
| `DashboardView` | `src/features/session/components/DashboardView.tsx` | Rendering Dashboard | SI (pattern) |
| `AppViewsLayer` | `src/features/session/components/AppViewsLayer.tsx` | Orchestrazione viste | SI |
| Widget insegnante | `DashboardView.tsx:38-60` | Contatore UDA | SI (dato reale) |
| Card Azione | `DashboardView.tsx:194-250` | Navigazione rapida | SI (layout) |
| Widget altri ruoli | `DashboardView.tsx:61-191` | Dati hardcoded | NO (fake data) |

### Persistenza

| Store/Meccanismo | Chiave | Cosa salva |
|---|---|---|
| useCurriculumStore | `curmanlight-react-db-state-v1.4.0` | decisions, savedUda, role, discipline |
| useSessionStore | `curmanlight-session-v1` | showOnboarding, devMode |
| useWorkspaceStore | `curmanlight-workspace-v1` | tokens, userInfo |
| useAutoSave | `curmanlight-emergency-backup` | Snapshot completo tutti store |
| useSessionAutoSave | `curman_emergency_backup` | Solo curriculum data |
| useUdaProgrammingHandlers | `curman_prog*` | Campi form wizard |

### Test Esistenti

| Test | File | Cosa copre |
|---|---|---|
| navigation.cml604d.test.tsx | `src/__tests__/` | Deep linking, route matching |
| curriculum.test.ts | `src/__tests__/` | Curriculum store operations |
| Altri test | `src/__tests__/` | Funzionalità specifiche |

## 3. Verifica dei Sei Stati di Lavoro

### Stato 1: `nessuna_attivita`

| Campo | Valore |
|---|---|
| Dati reali | `savedUda.length === 0` |
| Osservabile? | SI (diretto) |
| Regola ingresso | Primo accesso O nessun UDA salvato |
| Regola uscita | savedUda.length > 0 |
| Testo per docente | "Inizia consultando il curricolo della tua disciplina" |
| Azione | "Consulta Curricolo" |
| Dati incompleti | Mostra stato con configurazione profilo |

### Stato 2: `in_corso`

| Campo | Valore |
|---|---|
| Dati reali | `savedUda.length > 0` && esiste wizardStep con form compilati |
| Osservabile? | Derivato (savedUda.length + wizardStep + campi form) |
| Regola ingresso | savedUda.length > 0 && wizardStep > 1 && campi non vuoti |
| Regola uscita | wizardStep === 5 && tutti i campi obbligatori compilati |
| Testo per docente | "Continua l'attività in corso" |
| Azione | "Continua UDA" |
| Dati incompleti | Mostra bozza con ultimo stato noto |

### Stato 3: `pronto_per_verifica`

| Campo | Valore |
|---|---|
| Dati reali | `savedUda.length > 0` && tutti campi obbligatori compilati |
| Osservabile? | Derivato (campi form tutti compilati) |
| Regola ingresso | wizardStep === 5 && campi obbligatori non vuoti |
| Regola uscita | UDA esportato |
| Testo per docente | "Pronto per la verifica" |
| Azione | "Verifica e Esporta" |
| Dati incompleti | Mostra stato incompleto con campi mancanti |

### Stato 4: `esportato`

| Campo | Valore |
|---|---|
| Dati reali | `savedUda.length > 0` && esiste export recente |
| Osservabile? | Derivato (savedUda con flag export) |
| Regola ingresso | Export completato |
| Regola uscita | Modifica successiva |
| Testo per docente | "Esportato" |
| Azione | "Consulta o Modifica" |
| Dati incompleti | Mostra ultimo export |

### Stato 5: `bozza`

| Campo | Valore |
|---|---|
| Dati reali | `savedUda.length > 0` && `progStatus === 'bozza'` |
| Osservabile? | SI (diretto da localStorage) |
| Regola ingresso | Salvataggio come bozza |
| Regola uscita | Cambio stato a 'in revisione' o 'pronta' |
| Testo per docente | "Bozza salvata" |
| Azione | "Riprendi" |
| Dati incompleti | Mostra bozza con dati disponibili |

### Stato 6: `completo`

| Campo | Valore |
|---|---|
| Dati reali | `savedUda.length > 0` && `progStatus === 'pronta'` |
| Osservabile? | SI (diretto da localStorage) |
| Regola ingresso | Stato 'pronta' |
| Regola uscita | Condivisione o modifica |
| Testo per docente | "Completo" |
| Azione | "Condividi o Archivia" |
| Dati incompleti | Mostra stato completo |

**Regola semplificata per la prima implementazione:**

Lo stato viene derivato da:
1. `savedUda.length` (0 = nessuna attività)
2. `wizardStep` (1-5 = in corso)
3. `progStatus` ('bozza', 'in revisione', 'pronta')

## 4. Contratto Funzionale Minimo

### Informazioni persistite

| Informazione | Chiave localStorage | Aggiornamento | Validità |
|---|---|---|---|
| wizardStep | `curman_wizardStep` | Ad ogni cambio passo | Validofinchè il wizard è attivo |
| ultimoAccesso | `curman_ultimoAccesso` | Ad ogni apertura app | Sempre valido |
| ultimaAttivita | `curman_ultimaAttivita` | Ad ogni salvataggio UDA | Validofinchè non sostituito |

### Regole di comportamento

| Scenario | Comportamento |
|---|---|
| Primo accesso | Mostra "Benvenuto" + configurazione profilo |
| Ritorno con attività | Mostra "Riprendi" con stato e ultimo accesso |
| Ritorno senza attività | Mostra "Inizia" con guida |
| Una sola attività | Mostra attività con azione primaria |
| Più attività | Mostra lista con stato di ciascuna |
| Attività non recuperabile | Mostra "Nessuna attività recente" |
| Dopo esportazione | Mostra "Esportato" con opzione modifica |
| Dopo completamento | Mostra "Completo" con opzione condivisione |
| Dopo riapertura | Mostra stato aggiornato |

### Scelta prossima azione

La prossima azione viene scelta in base a:
1. Se `wizardStep > 1` → "Continua UDA"
2. Se `savedUda.length > 0` && nessun wizard attivo → "Consulta UDA"
3. Se `savedUda.length === 0` → "Consulta Curricolo"
4. Se `decisions` count > 0 → "Revisiona decisioni"

## 5. Progettazione della Dashboard Stato

### Mock 1: Ritorno dopo interruzione

**Contenuti visibili:**
- Saluto personalizzato con nome ruolo
- Ultimo accesso (data/ora)
- Attività in corso con stato
- Azione primaria "Continua"

**Gerarchia informativa:**
1. Saluto + ultimo accesso (primario)
2. Attività in corso (secondario)
3. Azione primaria (call-to-action)

**Azione primaria:** "Continua UDA"

**Azioni secondarie:** "Consulta Curricolo", "Revisiona Decisioni"

**Desktop:** Layout a colonne, card centrale
**Mobile:** Layout impilato, card a tutta larghezza

**Stato vuoto:** "Inizia consultando il curricolo"
**Stato errore:** "Nessuna attività recente"

### Mock 2: Primo accesso

**Contenuti:**
- "Benvenuto in CurManLight"
- Guida ai primi passi
- Configurazione profilo

**Azione primaria:** "Consulta Curricolo"

### Mock 3: Multiple attività

**Contenuti:**
- Lista attività con stato
- Per ciascuna: titolo, stato, ultimo aggiornamento
- Azione per ogni attività

**Azione primaria:** Continua prima attività incompleta
**Azioni secondarie:** Nuovo UDA, Consulta tutti

## 6. Piano File per File

### File da modificare

| File | Responsabilità | Modifica |
|---|---|---|
| `src/features/session/hooks/useAppWorkflowState.ts` | Stato wizard | Aggiungere persistenza `wizardStep` |
| `src/features/session/components/DashboardView.tsx` | Dashboard | Aggiungere sezione "Stato del Lavoro" |
| `src/features/session/components/AppViewsLayer.tsx` | Orchestrazione | Passare dati aggiuntivi a DashboardView |

### File NON da modificare

- `src/App.tsx` — shell congelata
- `src/routes/index.tsx` — navigazione congelata
- `src/stores/useCurriculumStore.ts` — store congelato
- `src/stores/useSessionStore.ts` — persistenza congelata

### Test da aggiornare/aggiungere

| Test | Cosa verifica |
|---|---|
| `src/__tests__/teacher-workspace.test.tsx` | Persistenza wizardStep |
| `src/__tests__/teacher-workspace.test.tsx` | Stato Dashboard per ogni scenario |
| `src/__tests__/navigation.cml604d.test.tsx` | Nessuna regressione navigazione |

## 7. Suddivisione in Parti

### Parte 1: Persistenza wizardStep (1 giorno)

**Frase:** "Il docente potrà riprendere un UDA esattamente dal passo in cui lo aveva lasciato."

**Comportamento:**
- `wizardStep` viene salvato in localStorage
- Al refresh, il wizard si ripristina al passo corretto
- I campi form sono già persistiti (nessuna modifica)

**File interessati:**
- `src/features/session/hooks/useAppWorkflowState.ts`

**Criteri di accettazione:**
- wizardStep sopravvive al refresh
- wizardStep si resetta solo quando esplicitamente richiesto
- Nessun effetto collaterale su altre funzionalità

**Test richiesti:**
- Test persistenza wizardStep
- Test reset wizardStep dopo completamento UDA

**Rischi:**
- Conflitto con resetAll() → Mitigazione: resetAll() non tocca wizardStep
- Dati stale → Mitigazione: invalidare se savedUda.length === 0

**Condizione di arresto:** Test falliscono

**Dipendenza:** Nessuna

### Parte 2: Vista Stato del Lavoro (2 giorni)

**Frase:** "Il docente potrà comprendere immediatamente stato, priorità e prossima azione."

**Comportamento:**
- Dashboard mostra riepilogo stato lavoro
- Attività recenti con stato
- Contatore decisioni pendenti
- Ultimo accesso

**File interessati:**
- `src/features/session/components/DashboardView.tsx`
- `src/features/session/components/AppViewsLayer.tsx`

**Criteri di accettazione:**
- Dashboard mostra dati reali (savedUda, decisions, ultimoAccesso)
- Layout leggibile su desktop e mobile
- Nessun dato hardcoded

**Test richiesti:**
- Test rendering Dashboard per ogni stato
- Test accessibilità mobile

**Rischi:**
- Sovraccarico visivo → Mitigazione: mostrare solo info essenziali
- Dati mancanti → Mitigazione: stati vuoti gestiti

**Condizione di arresto:** Dashboard non leggibile

**Dipendenza:** Parte 1 completata

### Parte 3: Integrazione e validazione (2 giorni)

**Frase:** "Il docente potrà riprendere il lavoro con un numero minimo di passaggi."

**Comportamento:**
- Click "Continua" apre wizard al passo corretto
- Stato si aggiorna dopo ogni azione
- Transizioni fluide tra stati

**File interessati:**
- `src/features/session/components/DashboardView.tsx`
- `src/features/progettazione/components/ProgettazioneTab.tsx`

**Criteri di accettazione:**
- Click "Continua" → wizard al passo giusto
- Click "Consulta" → vista UDA
- Click "Revisiona" → tab Processo

**Test richiesti:**
- Test navigazione da Dashboard
- Test aggiornamento stato dopo azioni
- Test compatibilità con dati esistenti

**Rischi:**
- Navigazione rotta → Mitigazione: usare handleTabSwitch esistente
- Dati inconsistenti → Mitigazione: validazione stati

**Condizione di arresto:** Navigazione non funziona

**Dipendenza:** Parte 2 completata

## 8. Piano di Validazione

### Test 1: Ritorno dopo interruzione

| Campo | Valore |
|---|---|
| Situazione iniziale | Docente al passo 3/5, chiude browser |
| Attività | Riapre CurManLight |
| Atteso | Vede "Continua UDA" con passo 3 |
| Tempo max | 5 secondi |
| Errore critico | Wizard al passo 1 |
| Osservazioni | Velocità ripresa, chiarezza stato |
| Superamento | Docente riprende senza cercare |

### Test 2: Dashboard informativa

| Campo | Valore |
|---|---|
| Situazione | Docente con 3 UDA salvati |
| Attività | Apre app |
| Atteso | Vede lista attività con stato |
| Tempo max | 10 secondi |
| Errore critico | Nessuna info attività |
| Osservazioni | Completezza info, utilità |
| Superamento | Trova attività in < 5 click |

### Test 3: Decisioni pendenti

| Campo | Valore |
|---|---|
| Situazione | Docente con 20 decisioni pendenti |
| Attività | Apre app |
| Atteso | Vede contatore "20 pendenti" |
| Tempo max | 3 secondi |
| Errore critico | Nessun contatore |
| Osservazioni | Visibilità urgenza |
| Superamento | Click diretto a revisione |

### Test 4: Wizard persistente

| Campo | Valore |
|---|---|
| Situazione | Docente al passo 3/5 |
| Attività | Fa refresh |
| Atteso | Torna al passo 3 con dati |
| Tempo max | 2 secondi |
| Errore critico | Dati persi |
| Osservazioni | Integrità dati |
| Superamento | Nessun dato perso |

### Test 5: Mobile

| Campo | Valore |
|---|---|
| Situazione | Docente su tablet |
| Attività | Apre app |
| Atteso | Dashboard leggibile e usabile |
| Tempo max | 10 secondi |
| Errore critico | Layout rotto |
| Osservazioni | Accessibilità touch |
| Superamento | Navigazione completa |

### Controlli automatici

| Controllo | Cosa verifica |
|---|---|
| `npm test` | Nessuna regressione |
| `npx tsc --noEmit` | Nessun errore TypeScript |
| `npm run build` | Build verde |
| Test persistenza | wizardStep sopravvive refresh |
| Test Dashboard | Rendering corretto per ogni stato |
| Test navigazione | Nessuna rotta rotta |

## 9. Matrice dei Rischi

| Risco | Probabilità | Impatto | Mitigazione | Test |
|---|---|---|---|---|
| Ripristino contesto non valido | Media | Alto | Invalidare se savedUda.length === 0 | Test persistenza |
| Conflitto wizard/dati reale | Bassa | Alto | wizardStep separato da savedUda | Test integrazione |
| Proliferazione chiavi | Bassa | Medio | Aggiungere solo 1 chiave (wizardStep) | Audit localStorage |
| Perdita compatibilità | Bassa | Alto | Leggere chiavi esistenti, non sovrascrivere | Test compatibilità |
| Home sovraccarica | Media | Medio | Mostrare solo info essenziali | Test usabilità |
| Azione successiva errata | Bassa | Alto | Regole chiare basate su stati | Test stati |
| Confusione stati | Media | Medio | Etichette chiare, non tecniche | Test utente |
| Priorità multiple | Bassa | Medio | Prima attività incompleta come primaria | Test priorità |
| Regressione navigazione | Bassa | Alto | Non modificare routing | Test navigazione |
| Mobile non coerente | Media | Medio | Layout responsive | Test mobile |

## 10. Verdetto Finale

### READY_WITH_REDUCED_SCOPE

**Motivazione:**
La proposta è fattibile come modifica circoscritta. Lo scope ridotto rispetto alla proposta originale è:
- Parte 1: Persistenza wizardStep (1 campo)
- Parte 2: Vista stato lavoro (modifica DashboardView)
- Parte 3: Integrazione (collegamento click a navigazione)

**Perimetro approvato:**
- Persistenza wizardStep
- Dashboard con dati reali
- Integrazione con navigazione esistente

**Perimetro escluso:**
- Nuovi store Zustand
- Nuove chiavi localStorage multiple
- Nuove route
- Modifiche alla shell

**Prima parte raccomandata:**
Parte 1 — Persistenza wizardStep

**Criterio di arresto prima di estendere:**
- Parte 1 completata e testata
- Nessuna regressione
- Build verde
- wizardStep sopravvive al refresh

---

*Documento di progettazione esecutiva. Nessuna modifica al codice è stata effettuata.*
