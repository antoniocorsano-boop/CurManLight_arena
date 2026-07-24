# CML-616 — Teacher Workspace Product Contract

> Contratto operativo per la vista di lavoro del docente. Definisce cosa il docente vede, quali informazioni sono immediatamente disponibili e come il sistema supporta la continuità tra le attività.

## 1. Frase guida

> "Il docente potrà comprendere immediatamente cosa fare, cosa è successo dall'ultimo accesso e riprendere il lavoro senza ricostruire il contesto."

## 2. Teacher Tasks

### 2.1 Mappa dei compiti principali

| # | Compito | Frequenza | Oggi supportato da | Gap |
|---|---------|-----------|--------------------|-----|
| T1 | Consultare il curricolo della propria disciplina | Giornaliera | CurriculumTab | OK |
| T2 | Revisionare decisioni pendenti | Settimanale | ProcessoTab | OK |
| T3 | Progettare/modificare un UDA | Giornaliera | ProgettazioneTab (wizard) | OK |
| T4 | Verificare lo stato del proprio lavoro | Ogni accesso | DashboardView (Stato del Lavoro) | OK |
| T5 | Riprendere un UDA interrotto | Ogni accesso | DashboardView (Continua UDA) | OK |
| T6 | Consultare/esportare UDA completati | Settimanale | ProgettazioneTab (archivio) | OK |
| T7 | Configurare classi/gruppi | Mensile | ProgettazioneTab (classe) | OK |
| T8 | Usare Copilot per assistenza | Occasionale | CopilotChatSidebar | OK |

### 2.2 Compiti non coperti (candidati CML-617+)

| # | Compito | Gap osservato |
|---|---------|---------------|
| T9 | Sapere cosa è cambiato dall'ultimo accesso | Nessun changelog o activity feed |
| T10 | Vedere tutte le attività in un colpo solo | Dashboard mostra solo stato, non cronologia |
| T11 | Accedere rapidamente a UDA recenti senza cambiare tab | Richiede navigazione a ProgettazioneTab |
| T12 | Ricevere suggerimenti contestuali basati sullo stato | Solo azione primaria, nessuna intelligence |

## 3. Information Architecture

### 3.1 Informazioni immediatamente visibili (soglia 5 secondi)

| Informazione | Fonte | Oggi | Target CML-616 |
|-------------|-------|------|-----------------|
| Stato del lavoro | deriveWorkState | ✅ Badge + metrica | ✅ Mantenuto |
| Ultimo salvataggio | curman_lastSaveTime | ✅ Testo relativo | ✅ Mantenuto |
| UDA in corso | wizardStep + progTitle | ✅ Badge "In corso" | ✅ Mantenuto |
| Decisioni pendenti | decisions count | ✅ Numero | ✅ Mantenuto |
| Nome del docente | UserRole / profilo | ❌ Non mostrato | ❌ Non prioritario |
| Anno scolastico | useCurriculumStore | ❌ Non mostrato | ❌ Non prioritario |
| Le tue classi | assignedCombinations | ❌ Non mostrato | ❌ Non prioritario |
| Attività recenti | savedUda + timestamps | ❌ Non mostrato | 📋 Candidato CML-617 |

### 3.2 Stratificazione informativa

```
Primo sguardo (0-5s):  Stato, metrica, azione primaria
Scansione (5-15s):     Card area core, widget ruolo
Approfondimento (15s+): Navigazione tab specifici
```

## 4. Continuity Model

### 4.1 Matrice di continuità

| Flusso | Stato | Transizione | Dati preservati |
|--------|-------|-------------|-----------------|
| Consultazione curricolo → Progettazione UDA | Curricolo aperto | handleTabSwitch → progetta-annuale | wizardStep, progTitle persistiti |
| UDA wizard interrotto → Ripresa | wizardStep > 1 | Dashboard → Continua UDA | wizardStep, prog*, targetClass |
| UDA completato → Consultazione archivio | progStatus === 'pronta per confronto' | Dashboard → Consulta UDA | savedUda, filter |
| Esportazione → Verifica | Download completato | Toast → Dashboard | lastSaveTime aggiornato |

### 4.2 Regole di continuità

1. L'azione primaria della Dashboard corrisponde SEMPRE allo stato corrente
2. Il wizard preserva passo E dati in localStorage (curman_wizardStep + campi prog*)
3. L'ultimo salvataggio è disponibile in lettura immediata (curman_lastSaveTime)
4. Le card delle tre aree core (Curricolo, Progettazione, Classe) offrono shortcut diretti
5. Nessuna navigazione modale o context switch forzato

## 5. State Contract

### 5.1 Stati del lavoro (invariati)

| Stato | Condizione | Badge | Colore |
|-------|-----------|-------|--------|
| `nessuna_attivita` | wizardStep === 1 && savedUda.length === 0 | Nessuna attività | slate |
| `in_corso` | wizardStep > 1 | In corso | amber |
| `bozza` | wizardStep === 1 && savedUda.length > 0 && progStatus !== 'pronta per confronto' | Bozza salvata | blue |
| `completo` | progStatus === 'pronta per confronto' | Completo | emerald |

### 5.2 Matrice azione primaria

| Stato | Azione | Destinazione | Componente |
|-------|--------|-------------|------------|
| `nessuna_attivita` | Inizia dal Curricolo | curricolo | CurriculumTab |
| `in_corso` | Continua UDA | progetta-annuale → annuale | ProgettazioneTab → Wizard |
| `bozza` | Consulta UDA | progetta-annuale → uda | ProgettazioneTab → Archivio |
| `completo` | Consulta UDA | progetta-annuale → uda | ProgettazioneTab → Archivio |

### 5.3 Empty states

| Vista | Condizione | Messaggio | Azione |
|-------|-----------|-----------|--------|
| Dashboard (nessuna attività) | savedUda.length === 0 && wizardStep === 1 | "Non hai ancora creato UDA. Consulta il curricolo per iniziare." | Inizia dal Curricolo |
| Dashboard (nessuna decisione) | decisions vuoto | "Tutte le decisioni sono state revisionate." | (nessuna) |
| Dashboard (senza salvataggio) | curman_lastSaveTime assente | — | (timestamp nascosto) |

### 5.4 Conferme (invariati da CML-611)

| Azione | Conferma | Componente |
|--------|----------|------------|
| Reset completo | UiConfirmDialog title="Resettare tutto?" description="Tutti i dati... saranno persi" confirmLabel="Resetta" | UiConfirmDialog |
| Abbandono wizard | (implicito: salvataggio automatico) | — |

## 6. Component Inventory

### 6.1 Componenti già consolidati (da non reimplementare)

| Componente | Path | Ruolo in Teacher Workspace |
|-----------|------|---------------------------|
| DashboardView | src/features/session/components/DashboardView.tsx | Vista principale |
| deriveWorkState | (inline in DashboardView) | Derivazione stato |
| formatRelativeTime | (inline in DashboardView) | Formattazione timestamp |
| WORK_STATE_CONFIG | (inline in DashboardView) | Configurazione badge |
| WIZARD_STEP_LABELS | (inline in DashboardView) | Label wizard |
| UiConfirmDialog | CML-611 | Conferme distruttive |
| CopilotChatSidebar | src/features/copilot/components | Assistenza contestuale |
| ProgettazioneTab | src/features/progettazione/components | Wizard + Archivio UDA |
| CurriculumTab | src/features/curriculum/components | Consultazione curricolo |

### 6.2 Hook già disponibili

| Hook | Path | Fornisce |
|------|------|----------|
| useAppNavigation | src/features/navigation/hooks/useAppNavigation.ts | handleTabSwitch, activeTab |
| useSessionUiState | src/features/session/hooks/useSessionUiState.ts | activeProgTab, setActiveProgTab |
| useCurriculumProgressStats | src/features/curriculum/hooks/useCurriculumProgressStats.ts | decisions count |
| useOnboardingProfile | src/features/session/hooks/useOnboardingProfile.ts | teacherType, assignedClasses |
| useSessionAutoSave | src/features/workspace/hooks/useSessionAutoSave.ts | stateRef, lastSave |

### 6.3 Store già disponibili

| Store | Chiave | Persistenza |
|-------|--------|-------------|
| useCurriculumStore | savedUda, progStatus, wizardStep | Zustand persist + localStorage |
| useCurriculumProgressStats | totalDecisions, approvedCount | Derivato |
| — (locale) | curman_lastSaveTime | localStorage standalone + blob |

## 7. Vincoli (frozen baseline)

| Area | Vincolo | Riferimento |
|------|---------|-------------|
| Navigazione | React Router v7, BrowserRouter in main.tsx | CML-604A |
| Shell | AppContext + Outlet + lazy loading | CML-604B |
| Persistenza | Tier 1 (refresh), Tier 2 (navigation), Tier 3 (ephemeral) | CML-604C |
| Architettura | 10 active domains con index.ts entrypoint | CML-603E |
| Tipi | Feature boundaries tipizzati, 0 any in src/features | CML-603C |
| Stato | Zustand stores esistenti, nessun nuovo store | WORKING_PROTOCOL.md |

## 8. Criteri di validazione

### CV1: Comprensione immediata
Un docente che apre CurManLight per la prima volta o dopo un'assenza deve poter rispondere in ≤5 secondi a:
- "Qual è lo stato del mio lavoro?"
- "Qual è la prossima azione che dovrei compiere?"

### CV2: Continuità
Un docente che ha iniziato un UDA al passo 3 deve poterlo riprendere esattamente al passo 3 con i dati precedenti, in ≤2 click.

### CV3: Zero perdita dati
Dopo refresh o navigazione, i dati del wizard (progTitle, progPeriod, progHours, wizardStep) devono essere preservati.

### CV4: Azione corretta
Per ogni stato (nessuna_attivita, in_corso, bozza, completo), l'azione primaria deve portare alla vista corretta con il contesto corretto.

### CV5: Assenza di modifiche alla baseline
Nessuna modifica a routing, shell, nuovi store, nuove rotte, nuove dipendenze.

## 9. Piano di implementazione

```
CML-616 ─── Contratto operativo (questo documento)
     │
CML-617 ─── Prima slice runtime
     │        - Activity feed leggero
     │        - Attività recenti nella Dashboard
     │        - Test (14 nuovi)
     │
CML-618 ─── Seconda slice runtime
              - Notifiche contestuali
              - Badge "novità" sugli aggiornamenti
              - Test (14 nuovi)
```

## 10. Rischi

| Rischio | Impatto | Probabilità | Mitigazione |
|---------|---------|-------------|-------------|
| Activity feed aumenta complessità percepita | Violazione principio "un cambiamento per volta" | Media | Feed minimale, 3 elementi, testo solo |
| Nuove dipendenze da storage | Degrado performance | Bassa | Solo localStorage, nessuna nuova chiave |
| Deriva verso nuova vista non necessaria | Sovraingegneria | Media | Mock prima di implementare |

---

*Approvato per implementazione CML-617. Il contratto è modificabile solo con nuova decisione di prodotto.*
