# CML-601: Mappatura React Component — Architettura Completa

> Mapping da monolite App.tsx → architettura a componenti
> Stack: React 18, TypeScript, Zustand + Dexie, Tailwind CSS
> Nessun React Router attuale → routing con useState proposto

---

## Indice

1. [Stato Attuale](#stato-attuale)
2. [Architettura Proposta](#architettura-proposta)
3. [Mappatura Schermate](#mappatura-schermate)
4. [Libreria Componenti Riusabili](#libreria-componenti-riusabili)
5. [Store Slices](#store-slices)
6. [Pattern State Management](#pattern-state-management)
7. [Custom Hooks](#custom-hooks)
8. [Dependency Graph](#dependency-graph)

---

## Stato Attuale

```
App.tsx (12,500 righe)
├── ~120+ useState hooks
├── 1 Zustand store (useCurriculumStore)
│   └── 19 actions, Dexie persistence
├── 0 React Router
├── 0 componenti estratti
├── 0 custom hooks
├── 11 tabs gestite con activeTab useState
├── 3 sub-tab systems (classeSubTab, activeProgTab, activeCurricoloView)
├── 14 discipline hardcoded
├── 3 ordini scolastici
├── 22 volumi
├── 38 icone Lucide importate
└── ~120+ useState locali nel componente unico
```

### Problemi Identificati

| Problema | Impatto |
|----------|---------|
| Componente monolite | Rendimento, manutenibilità |
| Stato non partitionato | Re-render eccessivi |
| Nessun code splitting | Bundle singolo enorme |
| Hook duplicati | Consistenza, bug |
| Nessun custom hook | Logica ripetuta |
| Nessun layout system | Codice layout duplicato |
| Nessun error boundary | crash totali |

---

## Architettura Proposta

```
src/
├── App.tsx                          (routing shell, ~200 righe)
├── router.tsx                       (route config)
├── stores/
│   ├── useNavigationStore.ts        (activeTab, sidebar)
│   ├── useCurriculumStore.ts        (curriculum data)
│   ├── useUdaStore.ts               (UDA, social)
│   ├── useClassroomStore.ts         (classi, feedback)
│   └── useSyncStore.ts              (workspace, cloud)
├── hooks/
│   ├── useScreenState.ts
│   ├── useScreenActions.ts
│   ├── useKeyboard.ts
│   ├── useGestures.ts
│   ├── useVoiceInput.ts
│   └── useOfflineSync.ts
├── layouts/
│   ├── DesktopLayout.tsx
│   ├── TabletLayout.tsx
│   ├── MobileLayout.tsx
│   └── OverlayLayout.tsx
├── screens/
│   ├── Home/
│   │   ├── HomeScreen.tsx
│   │   ├── StatsGrid.tsx
│   │   ├── QuickActions.tsx
│   │   └── RecentActivity.tsx
│   ├── Curricolo/
│   │   ├── CurricoloScreen.tsx
│   │   ├── CurricoloAlbero.tsx
│   │   ├── CurricoloMappa.tsx
│   │   ├── CurricoloPopolamento.tsx
│   │   ├── DisciplineDropdown.tsx
│   │   └── CompetenzaAccordion.tsx
│   ├── Revisione/
│   │   ├── RevisioneScreen.tsx
│   │   ├── RevisioneStats.tsx
│   │   ├── ProposalCard.tsx
│   │   └── ProposalFilters.tsx
│   ├── Progettazione/
│   │   ├── ProgettazioneHome.tsx
│   │   ├── UdaWizard/
│   │   │   ├── UdaWizard.tsx
│   │   │   ├── StepInfo.tsx
│   │   │   ├── StepObiettivi.tsx
│   │   │   ├── StepAttivita.tsx
│   │   │   ├── StepVerifica.tsx
│   │   │   └── StepRiepilogo.tsx
│   │   ├── UdaArchivio/
│   │   │   ├── UdaArchivio.tsx
│   │   │   └── UdaCard.tsx
│   │   ├── MatriceCompetenze/
│   │   │   └── MatriceCompetenze.tsx
│   │   └── Social/
│   │       ├── SocialFeed.tsx
│   │       └── SocialUdaCard.tsx
│   ├── Classe/
│   │   ├── ClasseHome.tsx
│   │   ├── Registro/
│   │   │   ├── RegistroScreen.tsx
│   │   │   ├── StudentCard.tsx
│   │   │   ├── StarRating.tsx
│   │   │   └── FeedbackForm.tsx
│   │   ├── Strumenti/
│   │   │   └── StrumentiScreen.tsx
│   │   └── Pianificazione/
│   │       └── PianificazioneScreen.tsx
│   ├── Processo/
│   │   ├── ProcessoFlusso.tsx
│   │   └── ProcessoVerifica.tsx
│   ├── Esportazioni/
│   │   ├── EsportazioniScreen.tsx
│   │   └── ExportCard.tsx
│   ├── Certificazione/
│   │   └── CertificazionePa.tsx
│   ├── Fonti/
│   │   └── FontiIstituto.tsx
│   ├── SecondBrain/
│   │   ├── SecondBrainScreen.tsx
│   │   ├── VolumeList.tsx
│   │   └── WikiLLMChat.tsx
│   ├── Guida/
│   │   └── GuidaScreen.tsx
│   └── Onboarding/
│       └── OnboardingModal.tsx
├── components/
│   ├── ui/                           (design system)
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Textarea.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Dialog.tsx
│   │   ├── Toast.tsx
│   │   ├── Skeleton.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── Tabs.tsx
│   │   ├── Accordion.tsx
│   │   ├── Tree.tsx
│   │   ├── Checkbox.tsx
│   │   ├── Toggle.tsx
│   │   ├── Dropdown.tsx
│   │   ├── Tooltip.tsx
│   │   └── Avatar.tsx
│   ├── layout/
│   │   ├── AppLayout.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── BottomNav.tsx
│   │   ├── Breadcrumb.tsx
│   │   └── PageHeader.tsx
│   ├── domain/
│   │   ├── DisciplineSelector.tsx
│   │   ├── OrderSelector.tsx
│   │   ├── ProposalCard.tsx
│   │   ├── UdaCard.tsx
│   │   ├── StudentCard.tsx
│   │   ├── ExportCard.tsx
│   │   ├── VolumeCard.tsx
│   │   ├── CopilotFloating.tsx
│   │   └── CopilotChat.tsx
│   └── shared/
│       ├── EmptyState.tsx
│       ├── LoadingSpinner.tsx
│       ├── ErrorBoundary.tsx
│       ├── ConfirmDialog.tsx
│       └── SwipeableCard.tsx
└── utils/
    ├── cn.ts                         (className helper)
    ├── dates.ts                      (date formatting)
    ├── export.ts                     (export logic)
    └── validators.ts                 (form validation)
```

---

## Mappatura Schermate

### 1. Dashboard → `/home`

```typescript
// Screen: Home
Route:            /home
Component:        <HomeScreen />
Hook(s):          useScreenState(), useScreenActions()
Store slice:      useNavigationStore (activeTab)
                  useCurriculumStore (stats, recentActivity)
Layout:           <DesktopLayout> | <TabletLayout> | <MobileLayout>
Reusable:         Card, Badge, Button, Skeleton
New components:   StatsGrid, QuickActions, RecentActivity

// States
idle:             Stats + activity list
loading:          Skeleton grid
error:            <EmptyState icon="home" message="..." />
```

```
Screen Component Tree:
<HomeScreen>
  <PageHeader title="Home" />
  <StatsGrid stats={stats} />
  <QuickActions actions={quickActions} onAction={handleAction} />
  <RecentActivity items={recentActivity} />
```

**Store Fields:**
- `stats.curricula` → number
- `stats.studenti` → number
- `stats.udaAttivi` → number
- `stats.copertura` → number
- `recentActivity[]` → array of activity items

---

### 2. Curricolo Albero → `/curricolo/tree`

```typescript
Route:            /curricolo/tree
Component:        <CurricoloAlbero />
Hook(s):          useScreenState(), useCurricoloActions()
Store slice:      useCurriculumStore
                    .localCurriculum
                    .activeDisciplina
                    .activeOrder
Layout:           <DesktopLayout> | <TabletLayout> | <MobileLayout>
Reusable:         Tabs, Accordion, Tree, Select, Badge, Skeleton
New components:   DisciplineDropdown, CompetenzaAccordion, TreeView

// States
idle:             Discipline selector + tree
loading:          Skeleton tree
error:            <EmptyState icon="tree" message="Nessun curriculum" />
empty:            <EmptyState icon="plus" message="Seleziona una disciplina" action="Seleziona" />
```

```
Screen Component Tree:
<CurricoloAlbero>
  <Tabs views={["Albero", "Mappa", "Popolamento"]} active={view} />
  <DisciplineDropdown disciplines={14} selected={active} />
  <OrderSelector orders={3} selected={active} />
  <Tree competenze={competenze} onExpand={toggleCompetenza} />
    <CompetenzaAccordion
      competenza={c}
      expanded={expandedId === c.id}
      indicatori={c.indicatori}
    />
</CurricoloAlbero>
```

---

### 3. Curricolo Mappa → `/curricolo/map`

```typescript
Route:            /curricolo/map
Component:        <CurricoloMappa />
Hook(s):          useScreenState(), useCurricoloActions()
Store slice:      useCurriculumStore .mapData, .mapFilters
Layout:           <DesktopLayout> | <MobileLayout>
Reusable:         Tabs, Card, Badge, Select
New components:   MappaGrid, CompetenzaCell

// States
idle:             Grid mappa
loading:          Skeleton grid
empty:            <EmptyState icon="map" message="Mappa non disponibile" />
```

---

### 4. Curricolo Popolamento → `/curricolo/populate`

```typescript
Route:            /curricolo/populate
Component:        <CurricoloPopolamento />
Hook(s):          useScreenState(), useCurricoloActions()
Store slice:      useCurriculumStore
                    .localCurriculum
                    .customTexts
                    .decisions
Layout:           <DesktopLayout> | <MobileLayout>
Reusable:         Tabs, Button, Input, Textarea, Accordion
New components:   PopolamentoForm, IndicatorEditor

// States
idle:             Form di popolamento
loading:          <LoadingSpinner />
error:            <EmptyState icon="alert" message="Errore nel caricamento" />
success:          <Toast message="Curriculum aggiornato" type="success" />
```

---

### 5. Revisione → `/revisione`

```typescript
Route:            /revisione
Component:        <RevisioneScreen />
Hook(s):          useScreenState(), useRevisioneActions()
Store slice:      useCurriculumStore
                    .proposals
                    .proposalStats
Layout:           <DesktopLayout> | <TabletLayout> | <MobileLayout>
Reusable:         Card, Badge, Button, Select, Skeleton, SwipeableCard
New components:   RevisioneStats, ProposalCard, ProposalFilters

// States
idle:             Stats + proposals list
loading:          <Skeleton count={3} height={200} />
empty:            <EmptyState icon="check-circle" message="Nessuna proposta in attesa" />
error:            <EmptyState icon="alert" message="Errore nel caricamento" />
```

```
Screen Component Tree:
<RevisioneScreen>
  <PageHeader title="Revisione" />
  <RevisioneStats stats={proposalStats} />
  <ProposalFilters filter={filter} onChange={setFilter} />
  <div className="space-y-3">
    {proposals.map(p => (
      <ProposalCard
        key={p.id}
        proposal={p}
        onApprove={approveProposal}
        onReject={rejectProposal}
      />
    ))}
  </div>
</RevisioneScreen>
```

---

### 6. Progettazione Home → `/progettazione`

```typescript
Route:            /progettazione
Component:        <ProgettazioneHome />
Hook(s):          useScreenState(), useScreenActions()
Store slice:      useUdaStore .savedUda, .socialUdas
Layout:           <DesktopLayout> | <MobileLayout>
Reusable:         Card, Button, Badge
New components:   UdaCard, ProgettazioneQuickActions

// States
idle:             Cards for UDA, Archivio, Matrice, Social
loading:          Skeleton cards
```

---

### 7. UDA Wizard → `/progettazione/wizard`

```typescript
Route:            /progettazione/wizard
Component:        <UdaWizard />
Hook(s):          useScreenState(), useUdaActions()
Store slice:      useUdaStore
                    .wizardStep
                    .wizardData
                    .savedUda
Layout:           <MobileLayout> | <DesktopLayout> (fullscreen modal on mobile)
Reusable:         ProgressBar, Button, Input, Select, Textarea, Checkbox
New components:   StepInfo, StepObiettivi, StepAttivita, StepVerifica, StepRiepilogo

// States
idle:             Current step form
loading:          <LoadingSpinner /> during save
validation:       Inline errors per field
success:          <Toast message="UDA salvato" type="success" />
```

```
Wizard Component Tree:
<UdaWizard>
  <Modal fullScreen={isMobile}>
    <ModalHeader title="Nuovo UDA" step={currentStep} total={5} />
    <ProgressBar current={currentStep} total={5} />
    <StepIndicator steps={steps} active={currentStep} />
    {currentStep === 0 && <StepInfo data={data} onChange={update} />}
    {currentStep === 1 && <StepObiettivi data={data} onChange={update} />}
    {currentStep === 2 && <StepAttivita data={data} onChange={update} />}
    {currentStep === 3 && <StepVerifica data={data} onChange={update} />}
    {currentStep === 4 && <StepRiepilogo data={data} />}
    <WizardNav onPrev={prev} onNext={next} step={currentStep} />
  </Modal>
</UdaWizard>
```

---

### 8. UDA Archivio → `/progettazione/archivio`

```typescript
Route:            /progettazione/archivio
Component:        <UdaArchivio />
Hook(s):          useScreenState(), useUdaActions()
Store slice:      useUdaStore .savedUdas, .udaFilters
Layout:           <DesktopLayout> | <MobileLayout>
Reusable:         Card, Badge, Button, Select, Input, Skeleton
New components:   UdaCard, UdaSearch, UdaFilters

// States
idle:             List of saved UDAs
loading:          Skeleton cards
empty:            <EmptyState icon="archive" message="Nessun UDA salvato" action="Crea primo UDA" />
search:           Filtered results
```

---

### 9. Matrice Competenze → `/progettazione/certificazione`

```typescript
Route:            /progettazione/certificazione
Component:        <MatriceCompetenze />
Hook(s):          useScreenState(), useCertificazioneActions()
Store slice:      useCurriculumStore .competenze, .valutazioni
Layout:           <DesktopLayout> | <TabletLayout>
Reusable:         Card, Badge, Select, Table
New components:   MatriceGrid, CompetenzaRow, ValutazioneCell

// States
idle:             Matrix grid
loading:          Skeleton table
empty:            <EmptyState icon="grid" message="Nessuna competenza da certificare" />
export:           Download options
```

---

### 10. Social UDA → `/progettazione/social`

```typescript
Route:            /progettazione/social
Component:        <SocialFeed />
Hook(s):          useScreenState(), useSocialActions()
Store slice:      useUdaStore .socialUdas, .socialFilters
Layout:           <DesktopLayout> | <MobileLayout>
Reusable:         Card, Badge, Button, Tabs, Skeleton
New components:   SocialUdaCard, SocialFilters, LikeButton, CloneButton

// States
idle:             Feed list
loading:          <Skeleton count={3} height={280} />
empty:            <EmptyState icon="users" message="Nessun UDA condiviso" />
like:             Heart animation
clone:            <ConfirmDialog message="Clonare questo UDA?" />
```

```
Social Component Tree:
<SocialFeed>
  <Tabs tabs={["Popolari", "Recenti", "Miei"]} active={filter} />
  {socialUdas.map(uda => (
    <SocialUdaCard
      key={uda.id}
      uda={uda}
      onLike={toggleLike}
      onClone={cloneUda}
      onAnnotation={addAnnotation}
    />
  ))}
</SocialFeed>
```

---

### 11. Classe Home → `/classe`

```typescript
Route:            /classe
Component:        <ClasseHome />
Hook(s):          useScreenState(), useClassActions()
Store slice:      useClassroomStore .classi, .activeClasse
Layout:           <DesktopLayout> | <MobileLayout>
Reusable:         Card, Badge, Button, Skeleton
New components:   ClasseCard, ClasseStats

// States
idle:             List of classes
loading:          Skeleton cards
empty:            <EmptyState icon="users" message="Nessuna classe" action="Aggiungi classe" />
```

---

### 12. Classe Registro → `/classe/registro`

```typescript
Route:            /classe/registro
Component:        <RegistroScreen />
Hook(s):          useScreenState(), useRegistroActions()
Store slice:      useClassroomStore
                    .students
                    .feedback
                    .grades
Layout:           <DesktopLayout> | <TabletLayout> | <MobileLayout>
Reusable:         Tabs, Card, Badge, Button, Input, Textarea, Avatar, Skeleton
New components:   StudentCard, StarRating, FeedbackForm, StudentList

// States
idle:             Student list
loading:          <Skeleton count={5} height={120} />
expanded:         Student card with feedback form
feedback:         Star rating + textarea
saved:            <Toast message="Feedback salvato" type="success" />
```

```
Registro Component Tree:
<RegistroScreen>
  <PageHeader title="Registro" subtitle={classeName} />
  <Tabs tabs={["Registro", "Strumenti", "Pianificazione"]} />
  <StudentList>
    {students.map(s => (
      <StudentCard
        key={s.id}
        student={s}
        expanded={expandedId === s.id}
        onExpand={toggleExpand}
      >
        <StarRating
          rating={s.rating}
          onChange={updateRating}
          size="mobile"
        />
        <FeedbackForm
          feedback={s.feedback}
          onSave={saveFeedback}
        />
      </StudentCard>
    ))}
  </StudentList>
</RegistroScreen>
```

---

### 13. Classe Strumenti → `/classe/strumenti`

```typescript
Route:            /classe/strumenti
Component:        <StrumentiScreen />
Hook(s):          useScreenState(), useStrumentiActions()
Store slice:      useClassroomStore .strumenti, .strumentiTemplates
Layout:           <DesktopLayout> | <MobileLayout>
Reusable:         Card, Badge, Button, Tabs
New components:   StrumentoCard, StrumentoTemplate

// States
idle:             List of instruments
loading:          Skeleton cards
empty:            <EmptyState icon="tool" message="Nessuno strumento" action="Aggiungi strumento" />
```

---

### 14. Classe Pianificazione → `/classe/pianificazione`

```typescript
Route:            /classe/pianificazione
Component:        <PianificazioneScreen />
Hook(s):          useScreenState(), usePianificazioneActions()
Store slice:      useClassroomStore .pianificazione, .lezioni
Layout:           <DesktopLayout> | <MobileLayout>
Reusable:         Card, Badge, Button, Input, Calendar
New components:   LezioneCard, CalendarioLezioni

// States
idle:             Calendar + lesson list
loading:          Skeleton calendar
empty:            <EmptyState icon="calendar" message="Nessuna lezione pianificata" />
```

---

### 15. Processo Flusso → `/processo`

```typescript
Route:            /processo
Component:        <ProcessoFlusso />
Hook(s):          useScreenState(), useProcessoActions()
Store slice:      useCurriculumStore .flussi, .processoSteps
Layout:           <DesktopLayout> | <MobileLayout>
Reusable:         Card, Badge, Button, ProgressBar
New components:   FlussoStep, FlussoTimeline

// States
idle:             Flow diagram
loading:          Skeleton steps
completed:        <Toast message="Flusso completato" type="success" />
```

---

### 16. Processo Verifica → `/processo/verifica`

```typescript
Route:            /processo/verifica
Component:        <ProcessoVerifica />
Hook(s):          useScreenState(), useVerificaActions()
Store slice:      useCurriculumStore .verifiche, .verificaResults
Layout:           <DesktopLayout> | <MobileLayout>
Reusable:         Card, Badge, Button, ProgressBar
New components:   VerificaCard, VerificaResult

// States
idle:             Verification checklist
loading:          <LoadingSpinner />
pass:             <Badge variant="success">Superata</Badge>
fail:             <Badge variant="error">Non superata</Badge>
```

---

### 17. Esportazioni → `/esportazioni`

```typescript
Route:            /esportazioni
Component:        <EsportazioniScreen />
Hook(s):          useScreenState(), useExportActions()
Store slice:      useSyncStore .exportHistory
Layout:           <DesktopLayout> | <MobileLayout>
Reusable:         Card, Button, Badge, Skeleton
New components:   ExportCard, ExportProgress, ExportHistory

// States
idle:             Format list
loading:          <LoadingSpinner /> during export
progress:         <ExportProgress percent={45} format="PDF" />
success:          <Toast message="Esportazione completata" type="success" />
error:            <Toast message="Errore nell'esportazione" type="error" />
```

```
Export Component Tree:
<EsportazioniScreen>
  <PageHeader title="Esportazioni" />
  {formats.map(f => (
    <ExportCard
      key={f.id}
      format={f}
      onExport={startExport}
      progress={exportProgress[f.id]}
    />
  ))}
  {isExporting && <ExportProgress percent={progress} />}
</EsportazioniScreen>
```

---

### 18. Certificazione PA → `/certificazione-pa`

```typescript
Route:            /certificazione-pa
Component:        <CertificazionePa />
Hook(s):          useScreenState(), useCertificazionePaActions()
Store slice:      useCurriculumStore .certificazione, .trattiIdentitari
Layout:           <DesktopLayout> | <MobileLayout>
Reusable:         Card, Badge, Button, Tabs
New components:   TrattoCard, CertificazioneForm

// States
idle:             Certification options
loading:          <LoadingSpinner />
generating:       <ExportProgress percent={progress} />
success:          <Toast message="Certificazione generata" type="success" />
```

---

### 19. Fonti d'Istituto → `/fonti`

```typescript
Route:            /fonti
Component:        <FontiIstituto />
Hook(s):          useScreenState(), useFontiActions()
Store slice:      useCurriculumStore .fonti, .fontiCategories
Layout:           <DesktopLayout> | <MobileLayout>
Reusable:         Card, Badge, Button, Input, Select, Tabs
New components:   FonteCard, FonteCategories

// States
idle:             Category list + sources
loading:          Skeleton cards
empty:            <EmptyState icon="book" message="Nessuna fonte" action="Aggiungi fonte" />
search:           Filtered results
```

---

### 20. Second Brain → `/second-brain`

```typescript
Route:            /second-brain
Component:        <SecondBrainScreen />
Hook(s):          useScreenState(), useChatActions()
Store slice:      useUdaStore .volumes, .chatHistory, .activeVolume
Layout:           <DesktopLayout> | <MobileLayout>
Reusable:         Input, Button, Card, Badge, Skeleton
New components:   VolumeList, VolumePill, WikiLLMChat, ChatMessage, ChatInput

// States
idle:             Volume list + chat
loading:          <LoadingSpinner />
streaming:        Streaming response animation
error:            <EmptyState icon="brain" message="Errore di connessione" />
emptyChat:        Welcome message with suggestions
```

```
SecondBrain Component Tree:
<SecondBrainScreen>
  <PageHeader title="Second Brain" />
  <SearchBar placeholder="Cerca nel knowledge base..." />
  <VolumeList volumes={volumes} active={activeVolume} onSelect={selectVolume} />
  <WikiLLMChat messages={chatHistory} onSend={sendMessage} />
</SecondBrainScreen>
```

---

### 21. Guida → `/guida`

```typescript
Route:            /guida
Component:        <GuidaScreen />
Hook(s):          useScreenState()
Store slice:      (none — static content)
Layout:           <DesktopLayout> | <MobileLayout>
Reusable:         Card, Tabs, Accordion
New components:   GuidaSection, GuidaSearch

// States
idle:             Guide content
search:           Filtered sections
```

---

### 22. Onboarding → (modal overlay)

```typescript
Route:            (modal, no route)
Component:        <OnboardingModal />
Hook(s):          useOnboardingState()
Store slice:      useNavigationStore .onboardingComplete
Layout:           <OverlayLayout>
Reusable:         Modal, Button, Input, ProgressBar
New components:   OnboardingStep1, OnboardingStep2, OnboardingStep3

// States
active:           Step form
complete:         <Toast message="Setup completato" type="success" />
skip:             Skip confirmation
```

---

### 23. Copilot → (floating overlay)

```typescript
Route:            (floating, no route)
Component:        <CopilotFloating /> → <CopilotChat />
Hook(s):          useCopilotState(), useCopilotActions()
Store slice:      useUdaStore .copilotMessages, .copilotOpen
Layout:           <OverlayLayout>
Reusable:         Modal, Button, Input, Badge
New components:   CopilotBubble, CopilotChat, ChatMessage, QuickActionPill

// States
closed:           Floating button (bottom-right, 56×56)
open:             Chat panel (bottom 85vh)
typing:           Typing indicator dots
streaming:        Streaming response
error:            <Toast message="Copilot non disponibile" type="error" />
```

```
Copilot Component Tree:
<CopilotFloating>
  {!isOpen && (
    <button className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-primary-600 shadow-lg">
      <Bot className="w-6 h-6 text-white" />
    </button>
  )}
  {isOpen && (
    <div className="fixed inset-0 bg-slate-950/50 z-50">
      <div className="absolute bottom-0 h-[85vh] bg-white rounded-t-2xl">
        <CopilotHeader onClose={close} />
        <ChatMessageList messages={messages} />
        <QuickActionPills actions={suggestions} onSelect={sendQuickAction} />
        <ChatInput onSend={sendMessage} onVoice={startVoice} />
      </div>
    </div>
  )}
</CopilotFloating>
```

---

## Libreria Componenti Riusabili

### UI Components

#### Button

```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}
```

#### Input

```typescript
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  icon?: LucideIcon;
  error?: string;
  disabled?: boolean;
  className?: string;
}
```

#### Select

```typescript
interface SelectProps {
  options: Array<{ value: string; label: string; icon?: LucideIcon }>;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}
```

#### Textarea

```typescript
interface TextareaProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  maxLength?: number;
  error?: string;
  className?: string;
}
```

#### Badge

```typescript
interface BadgeProps {
  variant: 'primary' | 'success' | 'warning' | 'error' | 'neutral';
  size?: 'sm' | 'md';
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}
```

#### Card

```typescript
interface CardProps {
  variant?: 'default' | 'hover' | 'active';
  padding?: 'sm' | 'md' | 'lg';
  bordered?: boolean;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}
```

#### Modal

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'fullscreen';
  closeOnOverlay?: boolean;
  showCloseButton?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
}
```

#### Dialog

```typescript
interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'info' | 'warning' | 'danger';
}
```

#### Toast

```typescript
interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onDismiss: (id: string) => void;
}
```

#### Skeleton

```typescript
interface SkeletonProps {
  count?: number;
  height?: number | string;
  width?: number | string;
  variant?: 'text' | 'card' | 'circle' | 'avatar';
  className?: string;
}
```

#### ProgressBar

```typescript
interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  variant?: 'primary' | 'success' | 'warning';
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}
```

#### Tabs

```typescript
interface TabsProps {
  tabs: Array<{ id: string; label: string; icon?: LucideIcon; count?: number }>;
  active: string;
  onChange: (id: string) => void;
  size?: 'sm' | 'md';
  fullWidth?: boolean;
  className?: string;
}
```

#### Accordion

```typescript
interface AccordionProps {
  items: Array<{
    id: string;
    title: string;
    subtitle?: string;
    icon?: LucideIcon;
    badge?: BadgeProps;
    content: React.ReactNode;
  }>;
  expandedId: string | null;
  onToggle: (id: string) => void;
  className?: string;
}
```

#### Tree

```typescript
interface TreeProps {
  data: TreeNode[];
  onExpand: (id: string) => void;
  expandedIds: Set<string>;
  selectedId?: string;
  onSelect?: (id: string) => void;
  renderNode?: (node: TreeNode) => React.ReactNode;
}

interface TreeNode {
  id: string;
  label: string;
  icon?: LucideIcon;
  children?: TreeNode[];
  badge?: BadgeProps;
  metadata?: Record<string, unknown>;
}
```

---

### Layout Components

#### AppLayout

```typescript
interface AppLayoutProps {
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  bottomNav?: React.ReactNode;
  children: React.ReactNode;
}
```

#### Sidebar

```typescript
interface SidebarProps {
  items: SidebarItem[];
  active: string;
  collapsed?: boolean;
  onToggle: () => void;
  onSelect: (id: string) => void;
}

interface SidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  badge?: number;
  children?: SidebarItem[];
}
```

#### Header

```typescript
interface HeaderProps {
  title: string;
  subtitle?: string;
  backAction?: () => void;
  actions?: HeaderAction[];
  breadcrumbs?: Breadcrumb[];
}

interface HeaderAction {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: 'ghost' | 'primary';
}
```

#### BottomNav

```typescript
interface BottomNavProps {
  items: BottomNavItem[];
  active: string;
  onSelect: (id: string) => void;
}

interface BottomNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  badge?: number;
}
```

#### Breadcrumb

```typescript
interface BreadcrumbItem {
  label: string;
  path?: string;
  active?: boolean;
}
```

#### PageHeader

```typescript
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}
```

---

### Domain Components

#### DisciplineSelector

```typescript
interface DisciplineSelectorProps {
  disciplines: Discipline[];
  selected: string;
  onChange: (id: string) => void;
  showOrder?: boolean;
}

interface Discipline {
  id: string;
  name: string;
  order: 'primaria' | 'secondaria-I' | 'secondaria-II';
  icon?: LucideIcon;
}
```

#### OrderSelector

```typescript
interface OrderSelectorProps {
  orders: Order[];
  selected: string;
  onChange: (id: string) => void;
}

interface Order {
  id: string;
  name: string;
  description: string;
}
```

#### ProposalCard

```typescript
interface ProposalCardProps {
  proposal: Proposal;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  expanded?: boolean;
  onExpand?: (id: string) => void;
}

interface Proposal {
  id: string;
  title: string;
  author: string;
  classe: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  description?: string;
}
```

#### UdaCard

```typescript
interface UdaCardProps {
  uda: Uda;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onShare?: (id: string) => void;
  compact?: boolean;
}

interface Uda {
  id: string;
  title: string;
  classe: string;
  discipline: string[];
  obiettivi: string[];
  durata: string;
  status: 'draft' | 'active' | 'completed';
  likes?: number;
  clones?: number;
}
```

#### StudentCard

```typescript
interface StudentCardProps {
  student: Student;
  expanded: boolean;
  onExpand: (id: string) => void;
  onRate: (id: string, rating: number) => void;
  onFeedback: (id: string, text: string) => void;
}

interface Student {
  id: string;
  nome: string;
  cognome: string;
  media: number;
  rating: number;
  feedback?: string;
  avatar?: string;
}
```

#### ExportCard

```typescript
interface ExportCardProps {
  format: ExportFormat;
  onExport: (format: string) => void;
  progress?: number;
}

interface ExportFormat {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  size: string;
  extension: string;
}
```

#### VolumeCard

```typescript
interface VolumeCardProps {
  volume: Volume;
  active: boolean;
  onSelect: (id: string) => void;
}

interface Volume {
  id: string;
  name: string;
  description: string;
  entries: number;
}
```

---

## Store Slices

### useNavigationStore

```typescript
interface NavigationState {
  activeTab: string;
  sidebarCollapsed: boolean;
  classeSubTab: 'registro' | 'strumenti' | 'pianificazione';
  activeProgTab: 'annuale' | 'uda' | 'certificazione' | 'social' | 'classe';
  activeCurricoloView: 'albero' | 'mappa' | 'popolamento';
  onboardingComplete: boolean;
  copilotOpen: boolean;

  // Actions
  setActiveTab: (tab: string) => void;
  toggleSidebar: () => void;
  setClasseSubTab: (tab: string) => void;
  setActiveProgTab: (tab: string) => void;
  setActiveCurricoloView: (view: string) => void;
  completeOnboarding: () => void;
  toggleCopilot: () => void;
}
```

### useCurriculumStore

```typescript
interface CurriculumState {
  localCurriculum: Curriculum | null;
  decisions: Decision[];
  customTexts: CustomText[];
  proposals: Proposal[];
  proposalStats: ProposalStats;
  competenze: Competenza[];
  mapData: MapData;
  mapFilters: MapFilters;
  flussi: Flusso[];
  verifiche: Verifica[];
  certificazione: Certificazione;
  trattiIdentitari: TrattoIdentitario[];
  fonti: Fonte[];
  fontiCategories: FonteCategory[];

  // Actions (19 existing)
  setCurriculum: (curriculum: Curriculum) => void;
  addDecision: (decision: Decision) => void;
  updateCustomText: (id: string, text: string) => void;
  approveProposal: (id: string) => void;
  rejectProposal: (id: string) => void;
  // ... remaining 14 actions
}
```

### useUdaStore

```typescript
interface UdaState {
  savedUda: Uda | null;
  savedUdas: Uda[];
  socialUdas: SocialUda[];
  socialFilters: SocialFilters;
  wizardStep: number;
  wizardData: WizardData;
  volumes: Volume[];
  chatHistory: ChatMessage[];
  activeVolume: string | null;
  copilotMessages: CopilotMessage[];
  udaFilters: UdaFilters;

  // Actions
  setSavedUda: (uda: Uda) => void;
  addSavedUda: (uda: Uda) => void;
  deleteSavedUda: (id: string) => void;
  setWizardStep: (step: number) => void;
  updateWizardData: (data: Partial<WizardData>) => void;
  resetWizard: () => void;
  setSocialFilter: (filter: SocialFilters) => void;
  likeUda: (id: string) => void;
  cloneUda: (id: string) => void;
  addChatMessage: (message: ChatMessage) => void;
  setActiveVolume: (id: string) => void;
  toggleCopilot: () => void;
  addCopilotMessage: (message: CopilotMessage) => void;
}
```

### useClassroomStore

```typescript
interface ClassroomState {
  classi: Classe[];
  activeClasse: string | null;
  students: Student[];
  groups: Group[];
  feedback: Feedback[];
  strumenti: Strumento[];
  strumentiTemplates: StrumentoTemplate[];
  pianificazione: Pianificazione;
  lezioni: Lezione[];

  // Actions
  addClasse: (classe: Classe) => void;
  setActiveClasse: (id: string) => void;
  addStudent: (student: Student) => void;
  updateStudentRating: (id: string, rating: number) => void;
  addFeedback: (studentId: string, feedback: Feedback) => void;
  addStrumento: (strumento: Strumento) => void;
  addLezione: (lezione: Lezione) => void;
  updatePianificazione: (data: Pianificazione) => void;
}
```

### useSyncStore

```typescript
interface SyncState {
  workspace: Workspace | null;
  cloudAccount: CloudAccount | null;
  exportHistory: ExportHistory[];
  isExporting: boolean;
  exportProgress: number;

  // Actions
  setWorkspace: (workspace: Workspace) => void;
  setCloudAccount: (account: CloudAccount) => void;
  startExport: (format: string) => void;
  updateExportProgress: (progress: number) => void;
  completeExport: (history: ExportHistory) => void;
}
```

---

## Pattern State Management

### Cosa resta in Zustand (persistente, cross-screen)

```
✅ Curriculum data (Dexie persistence)
✅ Proposals e stats
✅ UDA saved/archived
✅ Social UDA data
✅ Studenti e feedback
✅ Classi
✅ Navigation state (activeTab, sidebar)
✅ Volumes e chat history
✅ Export history
```

### Cosa va in React Context

```
🔄 Theme (light/dark) — se implementato
🔄 Locale (it-IT) — per i18n futuro
🔄 User preferences (font size, layout mode)
🔄 Copilot session state (streaming status)
```

### Cosa resta come local state

```
📌 Form inputs (temporary, not persisted)
📌 UI toggles (expanded, dropdown open)
📌 Search queries (debounced)
📌 Scroll positions
📌 Animation states
📌 Validation errors
📌 Loading states per azione
```

---

## Custom Hooks

### useScreenState

```typescript
function useScreenState(): ScreenState {
  const activeTab = useNavigationStore(s => s.activeTab);
  const classeSubTab = useNavigationStore(s => s.classeSubTab);
  const activeProgTab = useNavigationStore(s => s.activeProgTab);
  const activeCurricoloView = useNavigationStore(s => s.activeCurricoloView);

  return useMemo(() => ({
    activeTab,
    classeSubTab,
    activeProgTab,
    activeCurricoloView,
    currentScreen: getCurrentScreen(activeTab, classeSubTab, activeProgTab, activeCurricoloView),
  }), [activeTab, classeSubTab, activeProgTab, activeCurricoloView]);
}
```

### useScreenActions

```typescript
function useScreenActions(): ScreenActions {
  const setActiveTab = useNavigationStore(s => s.setActiveTab);
  const setClasseSubTab = useNavigationStore(s => s.setClasseSubTab);
  const setActiveProgTab = useNavigationStore(s => s.setActiveProgTab);
  const setActiveCurricoloView = useNavigationStore(s => s.setActiveCurricoloView);

  return useMemo(() => ({
    navigateTo: (screen: string) => setActiveTab(screen),
    navigateToClasse: (sub: string) => setClasseSubTab(sub),
    navigateToProgettazione: (tab: string) => setActiveProgTab(tab),
    navigateToCurricolo: (view: string) => setActiveCurricoloView(view),
    goBack: () => setActiveTab('home'),
  }), []);
}
```

### useKeyboard

```typescript
function useKeyboard(handlers: KeyboardHandlers): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key in handlers) {
        handlers[e.key as keyof KeyboardHandlers](e);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}

interface KeyboardHandlers {
  Enter?: (e: KeyboardEvent) => void;
  Escape?: (e: KeyboardEvent) => void;
  ArrowUp?: (e: KeyboardEvent) => void;
  ArrowDown?: (e: KeyboardEvent) => void;
  Tab?: (e: KeyboardEvent) => void;
}
```

### useGestures

```typescript
function useGestures(ref: RefObject<HTMLElement>, options: GestureOptions): void {
  // Swipe left/right, pull to refresh, long press, double tap
  // Returns gesture state and handlers
}
```

### useVoiceInput

```typescript
function useVoiceInput(): {
  isListening: boolean;
  transcript: string;
  start: () => void;
  stop: () => void;
  error: string | null;
}
```

### useOfflineSync

```typescript
function useOfflineSync(): {
  isOnline: boolean;
  pendingChanges: number;
  sync: () => Promise<void>;
  lastSync: Date | null;
}
```

---

## Dependency Graph

```
App.tsx (routing shell)
├── useNavigationStore
├── DesktopLayout | TabletLayout | MobileLayout
│   ├── Sidebar → SidebarItem[]
│   ├── Header → PageHeader
│   ├── BottomNav → BottomNavItem[]
│   └── Content Area → React Router Outlet
├── screens/*
│   └── Each screen imports from:
│       ├── stores/* (slice)
│       ├── hooks/*
│       ├── components/ui/*
│       ├── components/layout/*
│       └── components/domain/*
├── CopilotFloating
│   └── CopilotChat
└── OnboardingModal
```

### Import Flow

```
Screen Component
  ↓
useScreenState() → useNavigationStore
  ↓
useScreenActions() → useNavigationStore
  ↓
Screen-specific data → useCurriculumStore / useUdaStore / useClassroomStore
  ↓
UI rendering → components/ui/*
  ↓
Layout wrapping → components/layout/*
  ↓
Domain logic → components/domain/*
```
