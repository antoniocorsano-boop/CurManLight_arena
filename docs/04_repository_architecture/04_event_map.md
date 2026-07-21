# 04 — Event Map: Click → Event → Store → Render → Toast → Persist

> Traces the complete event flow for every user interaction in App.tsx, from DOM event through state mutation to UI update and optional persistence.

---

## 1. Event Flow Template

```
User Action (click/change/keydown)
  → DOM Event Handler
    → Read local state (useState)
    → Read store (useCurriculumStore)
    → Validate / Transform
    → Write state (setState)
    → Write store (store action)
    → Side effects (localStorage, download, API call, speech)
    → Toast notification
    → Re-render
```

---

## 2. Flow Traces by Domain

### A. Navigation (Tab Switch)
```
Click on tab button
  → handleTabSwitch(tab)
    → setActiveTab(tab)           [useState]
    → setShowMobileSidebar(false) [useState]
  → useEffect[activeTab] fires
    → scrollToTop()
  → useEffect[activeTab] fires (speech)
    → speechSynthesis.cancel()
    → setIsSpeaking(false)       [useState]
    → setCurrentSpeakingBlock(null) [useState]
  → Re-render with new tab content
```

### B. Curriculum Decision
```
Click on traguardo/obiettivo checkbox
  → toggleTraguardoSelection(index)  [Zustand store]
    → set({ selectedTraguardi: [...] })
  → Component re-renders with new selection
  → No toast, no persistence (already in IndexedDB via Zustand persist)
```

### C. Curriculum Save (Custom Text)
```
Edit in textarea
  → onChange → setCustomText(id, text) [Zustand store]
    → set({ customTexts: { ...state.customTexts, [id]: text } })
  → Component re-renders with new text
  → Zustand persist middleware → IndexedDB write (async, debounced)
```

### D. Progettazione Wizard Step
```
Click "Avanti" (Next)
  → handleNext()
    → Read progettazioneStep, progettazioneTitle
    → Validate: if step === 1 && !title → toast "Inserisci un titolo"
    → If valid: setProgettazioneStep(step + 1) [useState]
  → Re-render with next step form

Click "Indietro" (Back)
  → handleBack()
    → setProgettazioneStep(step - 1) [useState]
  → Re-render with previous step form
```

### E. UDA Generation
```
Click "Genera UDA"
  → handleGenerateUda()
    → Read: progettazioneTitle, Competenze, Descrizione, Strumenti, Verifica, Note, discipline, order
    → Create UdaModel object with UUID
    → addUda(uda) [Zustand store]
      → set({ savedUda: [...state.savedUda, uda] })
    → toast("UDA salvata nella libreria")
    → setProgettazioneStep(0) [useState] (reset wizard)
  → Zustand persist → IndexedDB
  → UDA Library re-renders with new UDA
```

### F. Document Export (Word)
```
Click "Scarica Word"
  → handleDownloadWordDefinitivo()
    → Read: localCurriculum, discipline, order
    → Build HTML string with ministerial headers
    → Create Blob → URL.createObjectURL
    → Create <a> element → click → download
    → URL.revokeObjectURL (cleanup)
    → toast("Download completato")
  → No state mutation, no persistence
```

### G. Document Export (PDF via Print)
```
Click "Stampa PDF"
  → handlePrintDocumentPdf()
    → Read: documentType, documentFormat, selectedTemplate
    → window.open('', '_blank')
    → Write HTML to new window document
    → newWindow.print()
    → toast("Finestra di stampa aperta")
  → No state mutation
```

### H. AI Copilot Message
```
Type message + Enter
  → handleSendCopilotMessage()
    → Read: copilotMessages, copilotContext, activeTab, discipline
    → Set copilotLoading = true [useState]
    → Create user message object
    → Append to copilotMessages [useState]
    → Simulate AI response (delayed)
    → Create assistant message object
    → Append to copilotMessages [useState]
    → Set copilotLoading = false [useState]
  → Chat re-renders with new messages
  → No persistence (messages lost on reload)
```

### I. AI Inline Suggestion
```
Click "Suggerisci" on realTask field
  → handleGenerateInlineRealTaskSuggestion()
    → Read: discipline, order
    → Set inlineSuggestionLoading = true [useState]
    → Simulate AI generation
    → Show suggestion in UI
    → Set inlineSuggestionLoading = false [useState]

Click "Accetta"
  → handleAcceptGemSuggestion()
    → Read: gemSuggestionText, activeGemField
    → setProgettazioneCompetenze(text) [useState] (or appropriate field)
    → Set gemSuggestionText = '' [useState]
    → Set activeGemField = null [useState]
    → toast("Suggerimento applicato")
  → Form re-renders with applied text
```

### J. Voice Toggle
```
Click "🔊" on text block
  → handleToggleSpeech(text, blockId)
    → If isSpeaking && currentSpeakingBlock === blockId:
        → speechSynthesis.cancel()
        → setIsSpeaking(false)
        → setCurrentSpeakingBlock(null)
    → Else:
        → Create SpeechSynthesisUtterance(text)
        → Set voice, rate from selectedVoice, voiceRate
        → utterance.onend → setIsSpeaking(false), setCurrentSpeakingBlock(null)
        → speechSynthesis.speak(utterance)
        → setIsSpeaking(true)
        → setCurrentSpeakingBlock(blockId)
  → Icon toggles 🔊↔🔇
```

### K. Voice Typing
```
Click microphone button
  → handleToggleVoiceTyping()
    → If active:
        → recognition.stop()
        → Set voiceTypingActive = false
    → Else:
        → Create SpeechRecognition instance
        → recognition.onresult → setVoiceTypingTranscript(transcript)
        → recognition.onend → setVoiceTypingActive(false)
        → recognition.start()
        → Set voiceTypingActive = true
  → Microphone icon toggles, transcript appears in input
```

### L. Classroom Shuffle
```
Click "Mescola Pseudonimi"
  → handleShufflePseudonyms()
    → Read: shuffledStudentMap, exclusionsList
    → Fisher-Yates shuffle with exclusion constraints
    → Set shuffledStudentMap = newMap [useState]
    → toast("Pseudonimi mescolati")
  → useEffect[shuffledStudentMap] fires
    → localStorage.setItem('curmanlight-student-map', JSON.stringify(map))
  → Student list re-renders with new assignments
```

### M. Cooperative Group Generation
```
Click "Genera Gruppi"
  → handleGenerateCooperativeGroups()
    → Read: shuffledStudentMap, exclusionsList, activeCooperativeMethod
    → 100-trial optimization algorithm
    → Set cooperativeGroups = groups [useState]
    → toast("Gruppi cooperativi generati")
  → useEffect[cooperativeGroups] fires
    → localStorage.setItem('curmanlight-cooperative-groups', JSON.stringify(groups))
  → Group display re-renders
```

### N. Google Workspace Login
```
Click "Accedi con Google"
  → handleWorkspaceLogin()
    → Build OAuth URL with client_id, redirect_uri, scope
    → window.location.href = oauthUrl (full page redirect)
  → [After redirect back]
  → useEffect line 2006 (init) parses hash
    → Extracts access_token
    → Set workspaceAccessToken = token [useState]
    → Fetch user info from Google API
    → Set workspaceUserInfo = info [useState]
    → toast("Accesso effettuato")
```

### O. Google Workspace Sync
```
Click "Sync to Drive"
  → handleWorkspaceSync()
    → Read: workspaceAccessToken, all state via stateRef
    → Set isWorkspaceSyncLocked = true, workspaceSyncProgress = 0 [useState]
    → Build JSON payload
    → Google Drive REST API: create/update file
    → Set workspaceLastSyncTime = now [useState]
    → Set isWorkspaceSyncLocked = false, workspaceSyncProgress = 100
    → toast("Sincronizzazione completata")
  → No Zustand mutation (tokens are in useState)
```

### P. Onboarding Complete
```
Click "Completa" on last step
  → saveOnboardingProfile()
    → Read: onboardingRole, onboardingOrder, onboardingDiscipline, onboardingClasses, onboardingSections
    → setRole(role) [Zustand store]
    → setDiscipline(discipline) [Zustand store]
    → setOrder(order) [Zustand store]
    → localStorage.setItem('curmanlight-onboarding-done', 'true')
    → setShowOnboarding(false) [useState]
    → toast("Profilo configurato!")
  → Zustand persist → IndexedDB
  → App re-renders with configured discipline/order
```

### Q. TEP Banner Actions
```
Click "Prova modalità semplificata"
  → handleTepSimplifyGrid()
    → setTepSimplifyActive(true) [useState]
    → setTepBannerDismissed(true) [useState]
    → localStorage.setItem('curmanlight-tep-dismissed', 'true')
  → Grid re-renders in simplified mode

Click "Passa alla procedura guidata"
  → handleTepSwitchToWizard()
    → setTepWizardMode(true) [useState]
    → setTepBannerDismissed(true) [useState]
    → localStorage.setItem('curmanlight-tep-dismissed', 'true')
  → UI switches to wizard mode
```

### R. Emergency Storage Recovery
```
Click "Ripristina backup"
  → handleRestoreFromLocalEmergencyStorage()
    → Read: localStorage 'curmanlight-emergency-backup'
    → Parse JSON
    → restoreBackupState(parsed) [Zustand store]
    → toast("Backup ripristinato")
    → setShowEmergencyBanner(false) [useState]
  → Full app re-renders with restored state
```

### S. Full Backup Download
```
Click "Scarica Backup"
  → handleDownloadBackup()
    → Read: entire Zustand store
    → Build JSON string
    → Create Blob → download
    → toast("Backup scaricato")
  → No state mutation
```

### T. Full Backup Restore
```
Click "Ripristina da file" → file picker
  → handleRestoreBackup()
    → Read uploaded file
    → Validate JSON structure
    → restoreBackupState(parsed) [Zustand store]
    → toast("Backup ripristinato con successo")
  → Full app re-renders with restored state
```

---

## 3. Toast Event Catalog

| Toast Message | Triggered By | Duration |
|--------------|-------------|----------|
| "Inserisci un titolo valido" | handleNext (validation) | 3s error |
| "UDA salvata nella libreria" | handleGenerateUda | 3s success |
| "Suggerimento applicato" | handleAcceptGemSuggestion | 2s success |
| "Pseudonimi mescolati" | handleShufflePseudonyms | 2s success |
| "Gruppi cooperativi generati" | handleGenerateCooperativeGroups | 3s success |
| "Sincronizzazione completata" | handleWorkspaceSync | 3s success |
| "Profilo configurato!" | saveOnboardingProfile | 3s success |
| "Download completato" | handleDownloadWordDefinitivo, etc. | 2s success |
| "Finestra di stampa aperta" | handlePrintDocumentPdf | 2s info |
| "Backup ripristinato" | handleRestoreFromLocalEmergencyStorage | 3s success |
| "Backup scaricato" | handleDownloadBackup | 2s success |
| "Backup ripristinato con successo" | handleRestoreBackup | 3s success |
| "Connessione Ollama riuscita" | handleTestOllamaConnection | 3s success |
| "Connessione Ollama fallita" | handleTestOllamaConnection | 3s error |
| "Errore di archiviazione" | Storage quota event listener | 5s warning |
| "Spazio di archiviazione quasi esaurito" | Storage maintenance useEffect | 5s warning |
| "Token OAuth scaduto, effettua nuovamente l'accesso" | useEffect line 558 | 5s warning |
| "Accesso effettuato" | useEffect line 2006 (OAuth parse) | 3s success |
| "AgID audit generato" | handleRunAgidAuditLocal | 3s success |
| "Dichiarazione di accessibilità generata" | handleGenerateDichiarazioneAccessibilita | 3s success |
| "Messaggio copiato negli appunti" | handleCopyToClipboardFormatted | 2s success |
| "File CML importato e unito" | handleImportMergeCml | 3s success |
| "Backup unito al progetto corrente" | handleImportMergeCml | 3s success |
