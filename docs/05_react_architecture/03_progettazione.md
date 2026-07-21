# 03 — Progettazione Domain: Wizard Steps, Form State, UDA Generation

> Step-by-step wizard for creating UDA (Unità Didattica d'Apprendimento) from form fields.

---

## 1. Components

### 1.1 `ProgettazioneTab.tsx`

```typescript
// State: reads useNavigationStore (activeProgTab)
// State: local — progettazioneStep (0-5)
// Renders: step indicator, current step form, navigation buttons
// Behavior: orchestrates wizard flow
```

**JSX Structure**:
```
<div>
  <StepIndicator currentStep={step} totalSteps={6} />
  {step === 0 && <WizardStep1Title />}
  {step === 1 && <WizardStep2Competenze />}
  {step === 2 && <WizardStep3Descrizione />}
  {step === 3 && <WizardStep4Strumenti />}
  {step === 4 && <WizardStep5Verifica />}
  {step === 5 && <WizardStep6Note />}
  <WizardNavigation step={step} onBack={handleBack} onNext={handleNext} />
</div>
```

### 1.2 `WizardStep1Title.tsx`

```typescript
// State: local — title (string)
// Renders: text input for UDA title
// Behavior: validates non-empty, shows AI suggestion button
```

### 1.3 `WizardStep2Competenze.tsx`

```typescript
// State: local — competenze (string[])
// Renders: tag input for competenze
// Behavior: add/remove competenze, AI suggestion for each
```

### 1.4 `WizardStep3Descrizione.tsx`

```typescript
// State: local — descrizione (string)
// Renders: textarea for description
// Behavior: word count, AI expansion suggestion
```

### 1.5 `WizardStep4Strumenti.tsx`

```typescript
// State: local — strumenti (string[])
// Renders: checklist of available tools/methods
// Behavior: toggle selection, custom tool input
```

### 1.6 `WizardStep5Verifica.tsx`

```typescript
// State: local — verifica (string)
// Renders: textarea for verification criteria
// Behavior: AI suggestion for verification methods
```

### 1.7 `WizardStep6Note.tsx`

```typescript
// State: local — note (string)
// Renders: textarea for additional notes
// Behavior: free text, optional
```

### 1.8 `WizardNavigation.tsx`

```typescript
interface WizardNavigationProps {
  step: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  onGenerate?: () => void;
  isLastStep: boolean;
}

// Renders: Back/Next buttons, step counter, Generate button on last step
// Behavior: disables Back on step 0, shows Generate on step 5
```

---

## 2. Handlers (in ProgettazioneTab)

```typescript
const handleBack = () => {
  setStep(Math.max(0, step - 1));
};

const handleNext = () => {
  if (step === 0 && !title.trim()) {
    toast.error('Inserisci un titolo valido');
    return;
  }
  setStep(Math.min(5, step + 1));
};

const handleGenerate = () => {
  const uda: UdaModel = {
    id: crypto.randomUUID(),
    title,
    discipline,
    order,
    competenze,
    descrizione,
    strumenti,
    verifica,
    note,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  store.addUda(uda);
  toast.success('UDA salvata nella libreria');
  setStep(0);
  resetForm();
};
```

---

## 3. Suggested UDA Templates

### 3.1 `UdaTemplatesModal.tsx`

```typescript
// State: reads useSessionStore (showUdaTemplatesModal)
// Renders: grid of pre-built UDA templates
// Behavior: click template → load into wizard form
```

### 3.2 Pre-built Templates

| Template | Title | Discipline | Description |
|----------|-------|-----------|-------------|
| Smart Home IoT | Smart Home IoT | tecnologia | Automazione domestica con Arduino |
| Etica IA | Etica nell'Intelligenza Artificiale | filosofia | Implicazioni etiche dell'AI |
| Corsivo | La scrittura corsiva | italiano | Insegnamento del corsivo |
| Barbiana | La scuola di Barbiana | pedagogia | Metodologia di Don Milani |
| Etimologia Latino | Etimologia delle parole italiane | latino | Origini latine dell'italiano |

### 3.3 `handleLoadSuggestedUda.ts`

```typescript
function handleLoadSuggestedUda(template: SuggestedUda) {
  setTitle(template.title);
  setCompetenze(template.competenze);
  setDescrizione(template.descrizione);
  setStrumenti(template.strumenti);
  setVerifica(template.verifica);
  setNote(template.note);
  setShowUdaTemplatesModal(false);
  toast.success('Template caricato');
}
```

---

## 4. Data Flow

```
User fills wizard (6 steps)
  → each step stores local state
  → handleGenerate()
  → creates UdaModel
  → store.addUda(uda)
  → Zustand persist → IndexedDB
  → toast "UDA salvata"
  → wizard resets to step 0

User clicks template
  → handleLoadSuggestedUda()
  → fills all form fields
  → user can edit before generating
```

---

## 5. Tests

| Test File | Tests |
|-----------|-------|
| `ProgettazioneTab.test.tsx` | renders step 0, navigates forward/back, generates UDA |
| `WizardStep1Title.test.tsx` | renders input, validates non-empty |
| `WizardStep2Competenze.test.tsx` | adds/removes competenze |
| `WizardStep3Descrizione.test.tsx` | renders textarea, word count |
| `WizardStep4Strumenti.test.tsx` | toggles tools, adds custom tool |
| `WizardStep5Verifica.test.tsx` | renders textarea |
| `WizardStep6Note.test.tsx` | renders textarea |
| `WizardNavigation.test.tsx` | disables Back on step 0, shows Generate on step 5 |
| `UdaTemplatesModal.test.tsx` | renders templates, loads template into form |
| `handleLoadSuggestedUda.test.ts` | fills form fields correctly |

**Total**: ~30 tests
