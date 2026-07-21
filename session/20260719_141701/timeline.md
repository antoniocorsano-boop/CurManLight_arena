# Timeline

## 2026-07-19 14:17:01 +02:00
- Session created.
- Goal: Fix bug critici, sicurezza, a11y e test per CurManLight (Fasi 1-4)

## 2026-07-19 14:26:56 +02:00
- Completed OmniRoute integration: wrote Codex profiles, added codex.cmd PATH shim for Windows launcher compatibility, documented OmniRoute profile routing in docs/AGENT_ORCHESTRATION.md, verified launch-codex help.

## 2026-07-19 14:28:27 +02:00
- Proceeding to configure additional CLIs for OmniRoute: opencode, kilo, cline, claude where possible.

## 2026-07-19 14:33:22 +02:00
- Configured OmniRoute for Claude profiles, OpenCode plugin/auth, Cline, and Kilo Code; added compatibility config paths for OmniRoute detector; verified doctor shows OpenCode/Cline/Kilo configured and OpenCode auth lists omniroute outside sandbox.

## 2026-07-19 14:57:12 +02:00
- All 4 FASE complete. Tests pass (12/12), build succeeds. Extra } brace in triggerWikiLLMQuery fixed. localStorage.setItem calls wrapped in try/catch. escapeHtml extracted to src/utils/escapeHtml.ts and imported. vitest.config.ts created with include filter to skip Playwright specs.

## 2026-07-19 15:23:30 +02:00
- Incongruenza critica #3 risolta: tutti i 15 localStorage.setItem unificati sotto 2 helper (safeLocalStorageSetItem per piccole impostazioni, safeLocalStorageSetLarge per JSON grandi). isQuotaExceededError corretta per legacy browser (code 22 non-DOMException). escapeRegExp estratto in src/utils/semanticSearch.ts — i test ora testano il codice reale, non una copia. Listener STORAGE_QUOTA_EVENT -> toast in App. 21/21 test passano, build 1,002 KB, zero errori di sintassi introdotti.

## 2026-07-19 15:28:31 +02:00
- 10 errori TS2304 eliminati: classeSubTab/setClasseSubTab aggiunto come useState con 3 sottotab (registro/strumenti/pianificazione); export { localCurriculum } morto rimosso. TSC 0 errori di sintassi, 21/21 test passano, build 1,002 KB.

## 2026-07-20 11:58:35 +02:00
- Ripresa estrazione App.tsx: focus su wiring ClasseTab e correzioni di cucitura post-estrazione prima di nuovi split.

## 2026-07-20 12:01:47 +02:00
- Estrazione monolite: cablato SocialTab in App.tsx, completata cucitura ClasseTab, corretti export/types di supporto. npm test e build verdi; tsc filtrato verde; tsc completo resta rosso per debito noUnused/noImplicitAny preesistente.

## 2026-07-20 12:02:29 +02:00
- Post-verifica estrazione: SocialTab cablato, App.tsx ridotto a 11277 righe. npm test 59/59 verde, build verde, tsc filtrato verde. tsc completo ancora rosso per debito noUnused/noImplicitAny.

## 2026-07-20 12:03:20 +02:00
- Procedo con prossimo taglio monolite: analisi cablaggio CurriculumTab per sostituire blocco curricolo inline in App.tsx.

## 2026-07-20 12:06:12 +02:00
- Secondo giro estrazione: cablati CurriculumTab e RevisioneTab in App.tsx usando store principale; App.tsx circa 10483 righe. tsc filtrato verde, npm test 59/59 verde, build verde. ProgettazioneTab analizzato ma non ancora sostituzione intera perché incompleto su certificazione/social/classe.

## 2026-07-20 12:06:55 +02:00
- Procedo nel modo migliore: prima estrazione CertificazioneTab per completare progressivamente area progettazione prima di cablare ProgettazioneTab intero.

## 2026-07-20 12:10:07 +02:00
- Estratto CertificazioneTab e lib competencies. App.tsx circa 10266 righe. tsc filtrato verde, npm test 59/59 verde, build verde. tsc completo resta rosso per noUnused/noImplicitAny e typing generici residui.

## 2026-07-20 12:11:11 +02:00
- Procedo a completare ProgettazioneTab come contenitore dell'intera area progettazione: annuale/uda più CertificazioneTab, classe-home, ClasseTab e SocialTab.

## 2026-07-20 12:19:21 +02:00
- Estratto il blocco progettazione annuale in ProgettazioneTab e stabilizzato App.tsx rimuovendo import/action store inutili dal vecchio inline. Verifiche: tsc compatibile ok, npm test 59/59 ok, npm run build ok. tsc strict resta rosso per debito preesistente nel monolite.

## 2026-07-20 12:20:47 +02:00
- Estratta VIEW esportazioni in EsportazioniTab: App ora importa il componente documentale e passa state/handler esistenti; corretto import useCurriculumStore nel componente. App scesa a 8763 righe. Verifiche: tsc compatibile ok, npm test 59/59 ok, npm run build ok; tsc strict resta rosso per debito preesistente.

## 2026-07-20 12:24:35 +02:00
- Estratta VIEW Second Brain/WikiLLM in SecondBrainTab: App passa stati e handler esistenti, corretto import store del componente. Rimossa parte del fallout del grafo architetturale ormai interno al componente. App scesa a 8111 righe. Verifiche: tsc compatibile ok, npm test 59/59 ok, npm run build ok; tsc strict resta rosso per debito unused/implicit-any residuo.

## 2026-07-20 12:28:02 +02:00
- Estratta VIEW Processo & Consenso in nuovo ProcessoTab sotto src/features/processo/components. App ora importa ProcessoTab e passa props esplicite; App scesa a 7875 righe. Verifiche post-estrazione: tsc compatibile ok, npm test 59/59 ok, npm run build ok. tsc strict resta rosso per debito residuale unused/implicit-any.

## 2026-07-20 12:31:43 +02:00
- Pulizia post-estrazioni: rimosso da App il dataset/handler orfano Didactic Second Brain Graph e i generatori AgID non referenziati dopo ProcessoTab. Ripristinate utility safeLocalStorage/LocalZipPacker necessarie e mantenuto cast BlobPart. App a 7688 righe. Verifiche: tsc compatibile ok, npm test 59/59 ok, npm run build ok. tsc strict ancora rosso per unused/implicit-any residui.

## 2026-07-20 12:35:47 +02:00
- Pulizia strict/fallout in App: rimossi vecchi state e blocchi orfani della ricerca semantica traguardi, accordion curricolo, helper accordion e raccordo interdisciplinare non più usati dopo estrazioni; compattati state setter-only per CSV/assignedClasses/isSostegno. App a 7572 righe. Verifiche: tsc compatibile ok, npm test 59/59 ok, npm run build ok.

## 2026-07-20 12:42:26 +02:00
- Migrazione monolite: estratti e cablati i modali session/workspace gia presenti (onboarding, save settings, tour, motto, document view, mic guide, gemma suggestion, cloud account). App.tsx ora circa 6764 righe. Verifiche finali verdi: npx tsc --noEmit --noUnusedLocals false --noUnusedParameters false --noImplicitAny false, npm test 59/59, npm run build. Audit strict npx tsc --noEmit ancora rosso per debiti residui preesistenti/da fase successiva: unused state/helpers, implicit any in App/ProcessoTab, indice modelInfo, unused React in UI, ecc.

## 2026-07-20 12:45:34 +02:00
- Migrazione monolite continuata: cablato AgentSetupModal da features/copilot/components, aggiunto agentIntervalRefs in App, e sostituiti i blocchi inline UdaDetailModal/OutcomesModal con componenti da features/progettazione/components. App.tsx ora circa 5938 righe. Verifiche verdi: npx tsc --noEmit --noUnusedLocals false --noUnusedParameters false --noImplicitAny false, npm test 59/59, npm run build. Strict npx tsc --noEmit ancora rosso per debiti residui: unused/implicit any in App, ProcessoTab, UI React unused, documentGenerator config, store createJSONStorage. La vecchia TS7053 su modelInfo non compare piu dopo estrazione AgentSetupModal.

## 2026-07-20 12:49:14 +02:00
- Migrazione monolite: estratti i modali WikiReaderModal e AddKbDocumentModal in src/features/documents/components/KnowledgeModals.tsx ed esportati da features/documents/components/index.ts. App.tsx ora circa 5816 righe; rimossi blocchi inline Wiki Full Text Reader e Add Custom KB Document e import Copy non piu usato. Verifiche verdi: npx tsc --noEmit --noUnusedLocals false --noUnusedParameters false --noImplicitAny false, npm test 59/59, npm run build. Audit strict npx tsc --noEmit ancora rosso per debiti residui gia noti in App/ProcessoTab/UI/documentGenerator/store.

## 2026-07-20 12:52:42 +02:00
- Migrazione monolite: estratte le view statiche/semi-statiche DashboardView e InfoViews in src/features/session/components, esportate da index e cablate in App.tsx. InfoViews contiene Fonti e Guida; DashboardView contiene dashboard ruolo-specifica. App.tsx ora circa 5451 righe. Verifiche verdi: npx tsc --noEmit --noUnusedLocals false --noUnusedParameters false --noImplicitAny false, npm test 59/59, npm run build. Audit strict ancora rosso per debiti residui noti in App, ProcessoTab, UI, documentGenerator, store.

## 2026-07-20 12:56:18 +02:00
- Migrazione monolite: estratti AppHeader e MobileBottomNav in src/features/navigation/components, esportati da features/navigation/index.ts e cablati in App.tsx. Header conserva topbar, stato IA, menu account e azioni workspace; mobile nav conserva tab inferiori. App.tsx ora circa 5320 righe. Verifiche verdi: npx tsc --noEmit --noUnusedLocals false --noUnusedParameters false --noImplicitAny false, npm test 59/59, npm run build. Audit strict ancora rosso per debiti residui noti in App, ProcessoTab, UI, documentGenerator, store.

## 2026-07-20 12:58:09 +02:00
- Migrazione monolite: estratta AppSidebar in src/features/navigation/components/AppSidebar.tsx, esportata da features/navigation/index.ts e cablata in App.tsx. Mantiene sidebar desktop reale con sotto-menu curricolo/progettazione/classe/supporto e badge pending. App.tsx ora circa 5128 righe. Verifiche verdi: npx tsc --noEmit --noUnusedLocals false --noUnusedParameters false --noImplicitAny false, npm test 59/59, npm run build. Audit strict ancora rosso per debiti residui noti in App, ProcessoTab, UI, documentGenerator, store.

## 2026-07-20 13:00:15 +02:00
- Migrazione monolite: estratto GlobalAlerts in src/features/navigation/components/GlobalAlerts.tsx, esportato da features/navigation/index.ts e cablato in App.tsx. Contiene banner memoria volatile, protocollo file:// e scadenza token Workspace. App.tsx ora circa 5087 righe. Verifiche verdi: npx tsc --noEmit --noUnusedLocals false --noUnusedParameters false --noImplicitAny false, npm test 59/59, npm run build. Audit strict ancora rosso per debiti residui noti in App, ProcessoTab, UI, documentGenerator, store.

## 2026-07-20 13:03:58 +02:00
- Migrazione monolite: cablato CopilotChatSidebar da src/features/copilot/components in App.tsx e allineato il componente al comportamento reale: ttsPlayingState usa idle, chip contestuali leggono activeTab/activeProgTab. Rimossa sidebar chat inline dal root. App.tsx ora circa 4965 righe. Verifiche verdi: npx tsc --noEmit --noUnusedLocals false --noUnusedParameters false --noImplicitAny false, npm test 59/59, npm run build. Audit strict ancora rosso per debiti residui noti in App, ProcessoTab, UI, documentGenerator, store.

## 2026-07-20 13:07:02 +02:00
- Migrazione monolite: creato AppModalsLayer in src/features/session/components/AppModalsLayer.tsx, esportato da index e cablato in App.tsx. Il root ora delega l'intera pila modali a un layer unico e non importa piu i singoli modali. App.tsx circa 4916 righe. Verifiche verdi: npx tsc --noEmit --noUnusedLocals false --noUnusedParameters false --noImplicitAny false, npm test 59/59, npm run build. Audit strict ancora rosso per debiti residui noti in App, ProcessoTab, UI, documentGenerator, store.

## 2026-07-20 14:59:22 +02:00
- Migrazione monolite: creato AppViewsLayer in src/features/session/components/AppViewsLayer.tsx, esportato da index e cablato in App.tsx. Il root ora delega il rendering delle view principali (Dashboard, Curricolo, Revisione, Progettazione, Processo, Esportazioni, Fonti/Guida, SecondBrain) a un layer dedicato. App.tsx circa 4866 righe. Verifiche verdi: npx tsc --noEmit --noUnusedLocals false --noUnusedParameters false --noImplicitAny false, npm test 59/59, npm run build. Audit strict ancora rosso per debiti residui noti in App, ProcessoTab, UI, documentGenerator, store.

## 2026-07-20 15:04:09 +02:00
- Migrazione monolite: estratti helper/dati file-level da App.tsx. Creati src/lib/architectureGraph.ts con GraphNode/GraphEdge/initialNodes/initialEdges, src/lib/localZipPacker.ts con LocalZipPacker, src/lib/consolidatedStorage.ts con safeLocalStorage* e safeLocalStorageGetGlossary. App.tsx ora circa 4655 righe. Verifiche verdi: npx tsc --noEmit --noUnusedLocals false --noUnusedParameters false --noImplicitAny false, npm test 59/59, npm run build. Audit strict ancora rosso per debiti residui noti in App, ProcessoTab, UI, documentGenerator, store.

## 2026-07-20 15:22:44 +02:00
- Migrazione monolite: estratti orderLabelsForMap/getDisciplineIcon/getDisciplineLabel in src/lib/disciplineLabels.ts. App.tsx importa e riesporta gli helper per compatibilita, ora circa 4208 righe. Verifiche verdi: tsc permissivo, npm test 59/59, npm run build. Strict audit resta rosso solo per debito preesistente in App.tsx/ProcessoTab/UI/documentGenerator/store.

## 2026-07-20 15:23:09 +02:00
- Pulizia post-estrazione disciplineLabels: rimossi BOM da src/App.tsx e src/lib/disciplineLabels.ts, tsc permissivo rieseguito con esito verde. Stato invariato: App.tsx circa 4208 righe; test/build gia verdi nello step.

## 2026-07-20 15:26:14 +02:00
- Migrazione monolite: estratto seed social UDA da App.tsx in src/features/social/data/defaultSocialUdas.ts con createDefaultSocialUdas(). App.tsx ora circa 4169 righe. Verifiche verdi: tsc permissivo, npm test 59/59, npm run build. Strict audit resta rosso solo su debito preesistente; nessun errore nel nuovo modulo.

## 2026-07-20 15:28:49 +02:00
- Migrazione monolite: estratto seed classroomStudentFeedback in src/features/classroom/data/defaultClassroomStudents.ts con createDefaultClassroomStudentFeedback(). App.tsx ora circa 4161 righe. Verifiche verdi: tsc permissivo, npm test 59/59, npm run build. Strict audit ancora rosso solo per debito preesistente; nessun errore nei nuovi moduli dati social/classroom.

## 2026-07-20 15:38:13 +02:00
- Migrazione monolite: estratte costanti di pianificazione aula in src/features/classroom/data/classroomPlanning.ts (id studenti, mappe pseudonimi, ruoli jigsaw/laboratorio, coppie peer tutoring). App.tsx usa le costanti e ora circa 4118 righe. Verifiche verdi: tsc permissivo, npm test 59/59, npm run build. Strict audit resta rosso solo su debito preesistente, nessun errore nel nuovo modulo.

## 2026-07-20 15:48:06 +02:00
- Migrazione monolite: centralizzato filtro GDPR/inclusione in src/lib/gdprFilter.ts con sanitizeInclusiveSensitiveTerms e containsInclusiveSensitiveTerms. App.tsx rimosso sanitizzatore locale e usa helper condivisi per prefill/clonazione, copilot e annotazioni social. App.tsx ora circa 4103 righe. Verifiche verdi: tsc permissivo, npm test 59/59, npm run build. Strict audit resta rosso solo su debito preesistente.

## 2026-07-20 16:03:27 +02:00
- Migrazione monolite: estratto mapping getRoleLabel/roleLabels in src/lib/roleLabels.ts e App.tsx ora importa l'helper. App.tsx circa 4093 righe. Verifiche verdi: tsc permissivo, npm test 59/59, npm run build. Strict audit resta rosso solo su debito preesistente; nessun errore in roleLabels.

## 2026-07-20 16:04:54 +02:00
- Analisi puntuale App.tsx: file a 4093 righe, 154 useState, 11 useEffect, 72 handler handle*, 35 helper/update/trigger/apply/check. Problemi principali: root ancora orchestratore di dominio, mega props any in AppViewsLayer/AppModalsLayer, strict TS rosso per unused/implicit any, hook/store modulari gia presenti ma non integrati nel root. Prossimo passo consigliato: piano di sistemazione per fasi con contratti tipati e hook/domain extraction.

## 2026-07-20 16:05:36 +02:00
- Piano operativo approvato: 1) ridurre debito strict TS facile senza cambio comportamento; 2) tipare AppViewsLayer/AppModalsLayer eliminando mega props any; 3) estrarre hook dominio classroom/social/workspace/copilot/documents; 4) spostare exporter documentali; 5) ridurre App.tsx a composizione e chiudere strict/build/test. Priorita immediata: fase 1.

## 2026-07-20 16:09:53 +02:00
- Fase 1 completata: strict TypeScript ora verde con npx tsc --noEmit. Fix applicati: rimossi React import inutilizzati UI, config documentGenerator rinominato _config, rimosso createJSONStorage inutilizzato da src/stores/useCurriculumStore, puliti unused/dead handler in App.tsx, aggiunti tipi minimi ClassroomFeedback/CurricularExportData e ProcessoCurricularLevel. Verifiche verdi: npx tsc --noEmit, npm test 59/59, npm run build. App.tsx circa 4016 righe. Fase 2 avviata: tipare AppViewsLayer/AppModalsLayer.

## 2026-07-20 16:10:57 +02:00
- Piano mantenuto e avanzato. Fase 1 completata: npx tsc --noEmit verde, npm test 59/59 verde, npm run build verde. Fase 2 avviata: AppViewsLayer/AppModalsLayer non usano piu [key:string]: any ma interfacce props esplicite generate dai props destructured; tsc/test/build restano verdi. Prossimo sotto-step fase 2: rimuovere index signatures residui in ProgettazioneTab e ProcessoTab e raffinare i tipi any piu importanti.

## 2026-07-20 16:13:02 +02:00
- Fase 2 completata: rimossi tutti gli index signature [key:string]: any da src. AppViewsLayer/AppModalsLayer hanno props esplicite; ProgettazioneTab e ProcessoTab hanno props esplicite, con ProcessoTab tipizzato su Proposal/SchoolOrder. Verifiche verdi: npx tsc --noEmit, npm test 59/59, npm run build. App.tsx stabile a circa 4016 righe. Fase 3 avviata: estrazione hook di dominio, primo candidato classroom/social.

## 2026-07-20 16:18:09 +02:00
- Fase 3 avanzata: creato src/features/classroom/hooks/useClassroomSocialState.ts. Spostati dal root App.tsx stati ed effetti di classroom/social/outcomes: socialUdas/updateSocialUdas, annotazioni, studenti/feedback, layout aula, gruppi cooperativi, topic assistant, modal esiti e persistenze localStorage. App.tsx ora usa useClassroomSocialState e scende a circa 3935 righe. Verifiche verdi: npx tsc --noEmit, npm test 59/59, npm run build. Prossimo candidato fase 3: estrarre handler classroom/social o workspace sync in hook dedicato.

## 2026-07-20 16:23:15 +02:00
- Migrazione App.tsx: estratti i handler classroom/social in src/features/classroom/hooks/useClassroomSocialHandlers.ts, rimosse le funzioni corrispondenti dal monolite e cablato App via hook. Verifiche verdi: npx tsc --noEmit, npm test (59/59), npm run build. App.tsx ora 3671 righe. Prossimo passo: estrarre exporter/document generation residui o tipizzare social/classroom props condivise.

## 2026-07-20 16:33:40 +02:00
- Migrazione App.tsx: estratti exporter documentali standard e generatori documento in src/features/documents/hooks/useDocumentExportHandlers.ts. App.tsx ora 2939 righe. Verifiche verdi: npx tsc --noEmit, npm test (59/59), npm run build. Restano da estrarre: SCORM/UDA copy-register, CML import + backup/restore, workspace sync, custom KB/document reader handlers, e tipizzazione componenti social/classroom/documenti.

## 2026-07-20 16:40:16 +02:00
- Migrazione App.tsx: estratti handler UDA package/SCORM in src/features/documents/hooks/useUdaPackageHandlers.ts (copy UDA, copy registro, download pacchetto SCORM zip). Rimosso LocalZipPacker da App. App.tsx ora 2695 righe. Verifiche verdi: npx tsc --noEmit, npm test (59/59), npm run build. Prossimo taglio consigliato: CML import + backup/restore in hook dedicato, poi Workspace sync.

## 2026-07-20 16:41:45 +02:00
- Migrazione App.tsx: estratti CML import + backup/restore in src/features/documents/hooks/useBackupHandlers.ts. App.tsx ora 2636 righe. Verifiche verdi: npx tsc --noEmit, npm test (59/59), npm run build. Prossimo taglio consigliato: Workspace sync Google oppure custom KB/document reader handlers.

## 2026-07-20 16:45:46 +02:00
- Migrazione App.tsx: estratti handler Google Workspace sync in src/features/workspace/hooks/useWorkspaceSyncHandlers.ts (login OAuth, sync Drive, local Drive sync, logout, auto pull). App.tsx ora 2409 righe. Verifiche verdi: npx tsc --noEmit, npm test (59/59), npm run build. Restano: custom KB/document reader handlers, copilot/voice/Gem handlers, import CSV/reset curriculum, UDA programming helpers, tipizzazione props componenti.

## 2026-07-20 16:49:05 +02:00
- Migrazione App.tsx: estratti stato e handler custom KB / document reader in src/features/documents/hooks/useKnowledgeBaseHandlers.ts (documenti custom, add/delete, title/html/plain helpers, speech Second Brain). App.tsx ora 2336 righe. Verifiche verdi: npx tsc --noEmit, npm test (59/59), npm run build. Restano: copilot/voice/Gem handlers, CSV/reset curriculum, UDA programming helpers e tipizzazione props.

## 2026-07-20 20:04:49 +02:00
- Migrazione App.tsx: estratti chat Copilot, voice typing, TTS, Gem suggestions e RAM safety in src/features/copilot/hooks/useCopilotInteractionHandlers.ts. App.tsx ora 2087 righe. Verifiche verdi: npx tsc --noEmit, npm test (59/59), npm run build. Restano: WikiLLM/glossario, CSV/reset curriculum, UDA programming helpers, local agent setup e tipizzazione props.

## 2026-07-20 20:07:13 +02:00
- Migrazione App.tsx: estratti WikiLLM query processor e glossario agent in src/features/documents/hooks/useWikiGlossaryHandlers.ts. App.tsx ora 1957 righe. Verifiche verdi: npx tsc --noEmit, npm test (59/59), npm run build. Restano: CSV/reset curriculum, UDA programming helpers, local agent setup, onboarding/session helpers e tipizzazione props componenti.

## 2026-07-20 20:09:10 +02:00
- Migrazione App.tsx: estratti generatore/import curricolo, CSV upload e reset baseline in src/features/curriculum/hooks/useCurriculumImportHandlers.ts. App.tsx ora 1788 righe. Verifiche verdi: npx tsc --noEmit, npm test (59/59), npm run build. Restano: UDA programming helpers, local agent setup, onboarding/session helpers e tipizzazione props.

## 2026-07-20 20:10:45 +02:00
- Prima estrazione UDA programming: individuati stato programmazione, saveProgDraft, preview, generazione UDA e filtri archivio da spostare in hook dedicato.

## 2026-07-20 20:14:36 +02:00
- Migrazione App.tsx: estratti stato e handler UDA/programmazione annuale in src/features/progettazione/hooks/useUdaProgrammingHandlers.ts. Spostati form state, persistenza bozza, saveProgDraft, preview programmazione, generazione UDA suggerite e filtri/ordinamento archivio. App.tsx ora 1782 righe; nuovo hook 265 righe. Verifiche verdi: npx tsc --noEmit, npm test (59/59), npm run build.

## 2026-07-20 20:17:47 +02:00
- Migrazione App.tsx: estratto setup agente locale/Ollama in src/features/copilot/hooks/useLocalAgentSetup.ts. Spostati stati localAgent*, ollama*, activeHelpModel, detectedDeviceType, agentIntervalRefs e handleTestOllamaConnection; ripristinati in App gli stati non-agent popolamentoTab, expandedMapSections e isCopilotChatOpen. App.tsx ora 1742 righe; nuovo hook 93 righe. Verifiche verdi: npx tsc --noEmit, npm test (59/59), npm run build.

## 2026-07-20 20:19:02 +02:00
- Prima estrazione autosave sessione: individuati stateRef, auto-save beforeunload/visibilitychange e restore da curman_emergency_backup da spostare in hook dedicato mantenendo stateRef per useWorkspaceSyncHandlers.

## 2026-07-20 20:20:26 +02:00
- Migrazione App.tsx: estratto autosave sessione/emergenza in src/features/workspace/hooks/useSessionAutoSave.ts. Spostati stateRef, aggiornamento ref, beforeunload/visibilitychange autosave, upload keepalive e restore da curman_emergency_backup; stateRef resta passato a useWorkspaceSyncHandlers. App.tsx ora 1636 righe; nuovo hook 161 righe. Verifiche verdi: npx tsc --noEmit, npm test (59/59), npm run build.

## 2026-07-20 20:22:36 +02:00
- Migrazione App.tsx: estratto AI Template Engine in src/features/documents/hooks/useTemplateEngine.ts. Spostati esportazioniTab, templateDocType, templateJsonState, templateChatInput, templateChatHistory e handleSendTemplateInstruction. App.tsx ora 1532 righe; nuovo hook 141 righe. Verifiche verdi: npx tsc --noEmit, npm test (59/59), npm run build.

## 2026-07-20 20:25:19 +02:00
- Prima estrazione onboarding: individuati teacherType, availableSections, assignedClasses/assignedCombinations, stati onboarding, handler sezioni/combinazioni e saveOnboardingProfile da spostare in hook session dedicato.

## 2026-07-20 20:27:11 +02:00
- Migrazione App.tsx: estratto onboarding/profilo istituto in src/features/session/hooks/useOnboardingProfile.ts. Spostati teacherType, assignedClasses, assignedCombinations, availableSections, newSectionInput, stati onboarding, handleSetOnboardingOrdLocal, handleToggleOnboardingCombination, handleAddSectionLocal e saveOnboardingProfile. App.tsx ora 1452 righe; nuovo hook 147 righe. Verifiche verdi: npx tsc --noEmit, npm test (59/59), npm run build.

## 2026-07-20 20:29:30 +02:00
- Migrazione App.tsx: estratto blocco assistivo progettazione in src/features/progettazione/hooks/useProgettazioneAssistiveHandlers.ts. Spostati TEP/click miss detection, branch focus highlight, prefill anticipatorio, conferma campi anticipati e clonazione adattiva UDA con filtro GDPR. App.tsx ora 1361 righe; nuovo hook 155 righe. Verifiche verdi: npx tsc --noEmit, npm test (59/59), npm run build.

## 2026-07-20 20:31:12 +02:00
- Migrazione App.tsx: estratto calcolo progressi curricolo in src/features/curriculum/hooks/useCurriculumProgressStats.ts. Spostati totalDecisions, approved/rejected/custom counts, progressPercent, pendingCount, currentDisciplineProps e currentDisciplineDecided. App.tsx ora 1349 righe; nuovo hook 53 righe. Verifiche verdi: npx tsc --noEmit, npm test (59/59), npm run build.

## 2026-07-20 20:34:26 +02:00
- Migrazione App.tsx: estratta navigazione app in src/features/navigation/hooks/useAppNavigation.ts. Spostati activeTab, sidebarCollapsed, toggleSidebar, handleTabSwitch e scroll reset multi-tab; mantenuto reset speech in App per dipendenza selectedBrainDoc/isSpeaking. Ripristinato classeSubTab come stato locale non-navigation. App.tsx ora 1312 righe; nuovo hook 87 righe. Verifiche verdi: npx tsc --noEmit, npm test (59/59), npm run build.

## 2026-07-20 20:54:40 +02:00
- Migrazione App.tsx: estratto sistema toast in src/features/session/hooks/useToast.ts. Spostati toastMessage, toastSuccess e showToast; App renderizza ancora il toast con i valori del hook. App.tsx ora 1308 righe; nuovo hook 20 righe. Verifiche verdi: npx tsc --noEmit, npm test (59/59), npm run build.

## 2026-07-20 20:57:47 +02:00
- Estratto stato Google Workspace/Cloud da App.tsx in useWorkspaceState. Verifiche: npx tsc --noEmit, npm test 59/59, npm run build passate. App.tsx 1315 righe; nuovo hook 47 righe.

## 2026-07-20 21:00:56 +02:00
- Estratto bootstrap/startup effect da App.tsx in useAppStartupEffects. La chiamata e' stata posizionata dopo useWorkspaceSyncHandlers per preservare handleWorkspaceAutoPull. Verifiche fresche dopo cleanup whitespace: git diff --check, npx tsc --noEmit, npm test 59/59, npm run build passate. App.tsx 1187 righe; nuovo hook startup 158 righe.

## 2026-07-20 21:02:54 +02:00
- Estratti handler locali residui da App.tsx in useAppLocalHandlers: wizard back/next, clear local storage/reset, trigger PWA install. Chiamata posizionata dopo useUdaProgrammingHandlers per usare progTitle. Verifiche: git diff --check, npx tsc --noEmit, npm test 59/59, npm run build passate. App.tsx 1148 righe; nuovo hook 68 righe.

## 2026-07-20 21:04:43 +02:00
- Estratto stato UI/sessione trasversale da App.tsx in useSessionUiState: filtri profilo, volatilita DB, font dyslexia wiki, popolamento tab, expanded map, copilot sidebar, modali, selectedUda, document viewer e tour modal. Verifiche: git diff --check, npx tsc --noEmit, npm test 59/59, npm run build passate. App.tsx 1164 righe; nuovo hook 64 righe. Prossimi blocchi candidati: wizard/revisione state, target curriculum context, graph state.

## 2026-07-20 21:09:06 +02:00
- Accelerazione migrazione App.tsx: estratti useAppWorkflowState (classeSubTab, wizard/revisione, target class/section, competency explorer, graph state), useLocalCurriculum, useResetSpeechOnContextChange. App.tsx non contiene piu useState/useEffect diretti ne handler inline locali rilevati da rg. Verifiche finali: git diff --check, npx tsc --noEmit, npm test 59/59, npm run build passate. App.tsx 1150 righe; nuovi hook 44/21/18 righe.

## 2026-07-20 21:12:13 +02:00
- Rifinita orchestrazione App.tsx: esportati AppViewsLayerProps/AppModalsLayerProps, creati appViewsLayerProps e appModalsLayerProps tipizzati, sostituiti i blocchi JSX lunghi con spread. Corretto markup main esplicito. Verifiche: git diff --check, npx tsc --noEmit, npm test 59/59, npm run build passate. App.tsx 1155 righe; nessun useState/useEffect/handler inline residuo rilevato, resta accoppiamento dati nei due oggetti props.

## 2026-07-20 21:14:22 +02:00
- Audit repository completo eseguito. Verifiche fresche: npx tsc --noEmit pass, npm test 59/59 pass, npm run build pass, npm audit --audit-level=low 0 vulnerabilities. Findings principali: PWA service worker/caches disabilitati in main.tsx, 548 occorrenze any, AppViewsLayer/AppModalsLayer props tutte any, duplicati identici lib/utils per wikiLLM/storage/clipboard, bundle single-file ~1.02 MB, test limitati a storage/wikiLLM/copilot utilities, rischi XSS/document.write/dangerouslySetInnerHTML da sanitizzare.

## 2026-07-20 21:19:18 +02:00
- Formalizzata CML-603 come milestone di governance architetturale. Creati docs/06_architecture_governance/CML-603_ARCHITECTURE_GOVERNANCE.md e index.md. Documento include ADR-0001, principi architetturali, CML-603A-F, Architecture Gate e Architectural Health Dashboard. Aggiornati indici CML-601/CML-602 per indicare che CML-603 e' stabilizzazione/governance, non semplice code extraction. Verifica: git diff --check sui docs modificati passata. Prossima azione consigliata: CML-603A Runtime & Distribution Strategy.

## 2026-07-20 21:22:45 +02:00
- Creata CML-603A Runtime & Distribution Strategy come Architecture Decision Paper decisionale. Documento copre Product Runtime Model, Execution Modes, Distribution Matrix, Product Constraints, Persistence, Synchronization, Service Worker lifecycle, Versioning, Compatibility, Failure Strategy, Decision Matrix, Future Runtime, Approved Decisions e Verification Criteria. Collegato da docs/06_architecture_governance/index.md e CML-603_ARCHITECTURE_GOVERNANCE.md. Verifica: git diff --check sui docs governance passata.

## 2026-07-20 21:25:50 +02:00
- Rafforzata CML-603A come contratto architetturale governabile: aggiunti Decision Status Lifecycle, Decision Dependencies e Decision Register RT-001..RT-011. Aggiornato CML-603 governance con Decision Paper Standard per CML-603B+ e CML-604 Architecture Baseline. Convertite frecce corrotte in ASCII e Health Dashboard in punteggi 1/5. Verifica: git diff --check sui docs governance passata.

## 2026-07-20 21:32:44 +02:00
- Aggiunto Architecture Decision Index (ADI) in docs/06_architecture_governance/ARCHITECTURE_DECISION_INDEX.md. Include Decision Register centrale con ADR-0001, RT-001..RT-011 e decisioni future UT/TY/TS/DM/NAV/DS in Draft; include Traceability Matrix decisione->documento->implementazione->verifica e Baseline Rule per CML-604. Collegato in index.md e CML-603_ARCHITECTURE_GOVERNANCE.md. Verifica: git diff --check docs/06_architecture_governance passata.

## 2026-07-20 21:36:03 +02:00
- CML-603B UT-001 documented; imports migrated from src/utils to src/lib; duplicate utils removed before verification.

## 2026-07-20 21:37:12 +02:00
- CML-603B completed: UT-001 documented and marked Verified; src/lib canonicalized; src/utils duplicates removed; tsc, npm test, npm run build passed.

## 2026-07-20 21:40:23 +02:00
- CML-603B governance review added: Decision Outcome, review checklist, central dashboard Utility Layer/DX/Maintainability updates, Decision Paper Standard extended.

## 2026-07-20 21:40:43 +02:00
- CML-603B paper refined with local Utility Layer/Maintainability health deltas and clean Governance Review spacing.

## 2026-07-20 21:41:03 +02:00
- CML-603B Decision Outcome and Governance Review finalized; health deltas now include Utility Layer and Maintainability.

## 2026-07-20 21:44:06 +02:00
- CML-603C TY-001 decision paper created; ADI updated to Approved; boundary-first type strategy documented before implementation.

## 2026-07-20 21:46:19 +02:00
- TY-001 implementation paused before code: batch implementation plan added, Trusted Flow Coverage linked, governance rule added to prevent theoretical decision papers.

## 2026-07-20 21:47:49 +02:00
- TY-001 planning closed: Green Repository Rule added to implementation plan and CML-603F gate criteria; no application code changed.

## 2026-07-20 21:49:43 +02:00
- Starting TY-001 Batch 1 execution: AppViewsLayerProps only; no-propagation and green repository rules apply.

## 2026-07-20 21:51:54 +02:00
- TY-001 Batch 1 edit applied: AppViewsLayerProps moved to typed session contract; inline any casts removed before TypeScript verification.

## 2026-07-20 21:53:05 +02:00
- TY-001 Batch 1 TypeScript verification passed after contract adjustments; running batch green checks.

## 2026-07-20 21:53:53 +02:00
- TY-001 Batch 1 complete: AppViewsLayerProps typed, 0 any in AppViewsLayer contract files, tsc/test/build passed; CML-603C outcome and ADI traceability updated, TY-001 not Verified.

## 2026-07-20 21:57:24 +02:00
- TY-001 Batch 2 edit applied: appModalContracts.ts created; AppModalsLayerProps moved to typed modal contract; local casts replaced with guards before TypeScript verification.

## 2026-07-20 21:58:29 +02:00
- TY-001 Batch 2 complete: AppModalsLayerProps typed via appModalContracts.ts, 0 any in App layer contract files, tsc/test/build passed; outcome and ADI traceability updated without verifying TY-001.

## 2026-07-20 21:59:08 +02:00
- Starting TY-001 Batch 3: Shared Hooks contracts only; no-propagation and green repository rules apply.

## 2026-07-20 22:00:49 +02:00
- TY-001 Batch 3 edits applied to root hooks and useSessionAutoSave; removed any from selected hook public/runtime boundaries before TypeScript verification.

## 2026-07-20 22:02:10 +02:00
- TY-001 Batch 3 complete: selected shared hooks typed, Web Speech/OAuth/autosave boundaries use typed or unknown inputs, tsc/test/build passed; outcome and ADI updated, TY-001 remains Approved.

## 2026-07-20 22:06:01 +02:00
- CML-603C Batch 4 complete: shared store contracts exported, active curriculum store IndexedDB boundary typed, tsc/test/build green, TY-001 ADI/outcome updated while remaining Approved.

## 2026-07-20 22:27:32 +02:00
- CML-603C TY-001 verified: Batch 5 feature boundaries completed, src/features has 0 any/as any matches, tsc/test/build green, ADI and Decision Outcome updated; legacy simulator as any deferred outside TY-001.

## 2026-07-20 22:31:50 +02:00
- Post TY-001 verification update: Architectural Health adjusted after CML-603C Verified; Type Safety 4/5, Boundary Coverage 5/5, Maintainability 5/5; CML-603C boundary dashboard observed values updated.

## 2026-07-20 22:44:59 +02:00
- Added CML-603 decision progress snapshot: implementation decisions Verified 2/4 (UT-001, TY-001), TS-001 next before DM-001; runtime RT-001..011 remain Approved/traced, not Verified without implementation evidence.

## 2026-07-20 22:52:50 +02:00
- TS-001 interaction decision paper and first full interaction suite added; targeted Vitest run passed 5/5 priority flows.

## 2026-07-20 22:57:13 +02:00
- Implemented TS-001 interaction tests: added CML-603D decision paper and 5 React interaction tests covering all priority flows. tsc, npm test 64/64, build and scoped diff-check pass. TS-001 left Implemented, not Verified, because global git diff --check is blocked by generated index.html whitespace outside TS-001 scope.

## 2026-07-20 23:02:17 +02:00
- Promoted TS-001 to Verified after confirming index.html diff-check failure is external generated artifact BL-001. Added Known External Blockers register, refined Green Repository Rule scope, updated progress to 3/4 Verified decisions and next DM-001. Fresh checks: tsc pass, npm test 64/64, build pass, scoped diff-check clean; global diff-check blocked only by BL-001.

## 2026-07-20 23:13:28 +02:00
- DM-001 started: added CML-603E Domain Modularization decision paper with explicit exit criteria; ADI/index/main governance moved DM-001 from Draft to Approved. Next batch: public domain entrypoints and cross-domain imports.

## 2026-07-20 23:20:00 +02:00
- DM-001 Verified: added public root entrypoints for active feature domains, updated cross-domain imports to domain APIs, TS-001 tests now consume feature roots. Import scans show no cross-domain imports into active domain components/hooks/types/data. Checks: npx tsc --noEmit pass, npm test 64/64 pass, npm run build pass, scoped git diff --check pass; BL-001 index.html remains open external. CML-603 implementation decisions now 4/4 Verified; next CML-603F Architecture Gate.

## 2026-07-20 23:23:02 +02:00
- CML-603F plan formed: audit decisions, ADI/health, boundaries, technical checks, BL-001 classification, gate report.

## 2026-07-20 23:24:37 +02:00
- CML-603F pre-verification audit: governance links 0 broken; 4/4 implementation decisions have outcomes; src/utils absent; 10/10 active domains expose root APIs; no feature any or internal cross-domain imports found. Starting full technical gate.

## 2026-07-20 23:29:04 +02:00
- CML-603F Architecture Gate PASSED. Fresh evidence: tsc exit 0; npm test 64/64; TS-001 5/5; build 1619 modules; governance links 0 broken; scoped diff-check clean. BL-001 reproduced, classified Open-Accepted with no architectural impact. Gate report added; ADI/governance/index/React checklist aligned. Next: CML-604 Architecture Baseline.
