# 10 — Onboarding & Session Domains

> Onboarding wizard for new users, session health monitoring, and emergency backup recovery.

---

## 1. Onboarding Components

### 1.1 `OnboardingModal.tsx`

```typescript
// State: reads useSessionStore (showOnboarding)
// State: local — onboardingStep, onboardingRole, onboardingOrder, onboardingDiscipline, onboardingClasses, onboardingSections
// Renders: multi-step modal with role/order/discipline/classes/sections
// Behavior: step-by-step configuration, saves to stores
```

**JSX Structure**:
```
<Modal isOpen={showOnboarding} onClose={() => {}} size="lg">
  <StepIndicator currentStep={step} totalSteps={5} />
  {step === 0 && <OnboardingStep1Role value={role} onChange={setRole} />}
  {step === 1 && <OnboardingStep2Order value={order} onChange={setOrder} />}
  {step === 2 && <OnboardingStep3Discipline value={discipline} onChange={setDiscipline} />}
  {step === 3 && <OnboardingStep4Classes value={classes} onChange={setClasses} order={order} />}
  {step === 4 && <OnboardingStep5Sections value={sections} onChange={setSections} />}
  <WizardNavigation step={step} onBack={handleBack} onNext={handleNext} isLastStep={step === 4} />
</Modal>
```

### 1.2 `OnboardingStep1Role.tsx`

```typescript
interface OnboardingStep1RoleProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
}

// Renders: role selection cards (insegnante, dirigente, genitore, studente)
// Behavior: click to select
```

### 1.3 `OnboardingStep2Order.tsx`

```typescript
interface OnboardingStep2OrderProps {
  value: SchoolOrder;
  onChange: (order: SchoolOrder) => void;
}

// Renders: school order selection (infanzia, primaria, secondaria)
// Behavior: click to select
```

### 1.4 `OnboardingStep3Discipline.tsx`

```typescript
interface OnboardingStep3DisciplineProps {
  value: string;
  onChange: (discipline: string) => void;
}

// Renders: discipline selector (from curriculum KB)
// Behavior: search and select discipline
```

### 1.5 `OnboardingStep4Classes.tsx`

```typescript
interface OnboardingStep4ClassesProps {
  value: number[];
  onChange: (classes: number[]) => void;
  order: SchoolOrder;
}

// Renders: class number checklist based on school order
// Behavior: toggle class selection
```

### 1.6 `OnboardingStep5Sections.tsx`

```typescript
interface OnboardingStep5SectionsProps {
  value: string[];
  onChange: (sections: string[]) => void;
}

// Renders: section letter/name input
// Behavior: add/remove sections
```

---

## 2. Session Components

### 2.1 `EmergencyBanner.tsx`

```typescript
// State: reads useSessionStore (showEmergencyBanner)
// Renders: warning banner with restore button
// Behavior: click restore → handleRestoreFromLocalEmergencyStorage
```

### 2.2 `StorageWarning.tsx`

```typescript
// State: reads useSessionStore (storageUsage)
// Renders: storage usage bar with warning text
// Behavior: shows warning when usage > 80%
```

### 2.3 `OfflineIndicator.tsx`

```typescript
// State: reads useSessionStore (isOffline)
// Renders: small offline badge
// Behavior: shows when offline, hides when online
```

---

## 3. Hooks

### 3.1 `useOnboarding.ts`

```typescript
function useOnboarding(): {
  step: number;
  role: UserRole;
  order: SchoolOrder;
  discipline: string;
  classes: number[];
  sections: string[];
  setRole: (role: UserRole) => void;
  setOrder: (order: SchoolOrder) => void;
  setDiscipline: (discipline: string) => void;
  setClasses: (classes: number[]) => void;
  setSections: (sections: string[]) => void;
  next: () => void;
  back: () => void;
  save: () => void;
  isLastStep: boolean;
  canProceed: boolean;
}
// State: local wizard state
// Behavior: manages onboarding flow
```

### 3.2 `useEmergencyBackup.ts`

```typescript
function useEmergencyBackup(): {
  hasBackup: boolean;
  restore: () => void;
  clear: () => void;
}
// Reads: localStorage 'curmanlight-emergency-backup'
// Behavior: restore/clear emergency backup
```

### 3.3 `useSessionHealth.ts`

```typescript
function useSessionHealth(): {
  storageUsage: number;
  isOffline: boolean;
  lastSaveTime: number | null;
  isWarning: boolean;
}
// Reads: navigator.onLine, localStorage usage
// Behavior: monitors session health
```

---

## 4. Handlers

```typescript
// In OnboardingModal
const saveOnboardingProfile = () => {
  // Set role in store
  useCurriculumStore.getState().setRole(role);
  
  // Set discipline and order (resets selections)
  useCurriculumStore.getState().setDiscipline(discipline);
  useCurriculumStore.getState().setOrder(order);
  
  // Save classes and sections to localStorage
  localStorage.setItem('curmanlight-onboarding-classes', JSON.stringify(classes));
  localStorage.setItem('curmanlight-onboarding-sections', JSON.stringify(sections));
  localStorage.setItem('curmanlight-onboarding-done', 'true');
  
  // Close onboarding
  useSessionStore.getState().setShowOnboarding(false);
  
  toast.success('Profilo configurato!');
};

// In EmergencyBanner
const handleRestoreFromLocalEmergencyStorage = () => {
  try {
    const backup = localStorage.getItem('curmanlight-emergency-backup');
    if (backup) {
      const state = JSON.parse(backup);
      useCurriculumStore.getState().restoreBackupState(state.curriculum);
      useClassroomStore.getState().restoreBackupState(state.classroom);
      // ... restore other stores
      toast.success('Backup ripristinato');
      useSessionStore.getState().setShowEmergencyBanner(false);
    }
  } catch (error) {
    toast.error('Errore nel ripristino del backup');
  }
};

// In SessionHealth useEffect
useEffect(() => {
  const handleBeforeUnload = () => {
    const state = {
      curriculum: useCurriculumStore.getState(),
      classroom: useClassroomStore.getState(),
      // ... other stores
    };
    localStorage.setItem('curmanlight-emergency-backup', JSON.stringify(state));
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      handleBeforeUnload();
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  document.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}, []);
```

---

## 5. Data Flow

### Onboarding Flow
```
New user opens app
  → useEffect checks localStorage 'curmanlight-onboarding-done'
  → if not done → useSessionStore.setShowOnboarding(true)
  → OnboardingModal renders

User completes steps 1-5
  → local state accumulates selections
  → saveOnboardingProfile()
  → sets role/discipline/order in Zustand stores
  → saves classes/sections to localStorage
  → marks onboarding as done
  → closes modal
  → app renders with configured discipline
```

### Emergency Backup Flow
```
App mounts
  → useEmergencyBackup hook checks localStorage
  → if backup exists → useSessionStore.setShowEmergencyBanner(true)
  → EmergencyBanner renders

User clicks "Ripristina"
  → handleRestoreFromLocalEmergencyStorage()
  → parses backup JSON
  → restores all stores
  → toast "Backup ripristinato"
  → banner hides

Auto-save (background)
  → beforeunload/visibilitychange
  → saves all store states to localStorage
  → if quota exceeded → toast warning
```

---

## 6. Tests

| Test File | Tests |
|-----------|-------|
| `OnboardingModal.test.tsx` | renders step 1, navigates through steps, saves profile |
| `OnboardingStep1Role.test.tsx` | renders roles, selects role |
| `OnboardingStep2Order.test.tsx` | renders orders, selects order |
| `OnboardingStep3Discipline.test.tsx` | renders disciplines, selects discipline |
| `OnboardingStep4Classes.test.tsx` | renders classes based on order, toggles selection |
| `OnboardingStep5Sections.test.tsx` | renders sections, adds/removes sections |
| `EmergencyBanner.test.tsx` | renders banner, restores backup |
| `StorageWarning.test.tsx` | renders warning when usage > 80% |
| `OfflineIndicator.test.tsx` | renders when offline |
| `useOnboarding.test.ts` | manages wizard flow correctly |
| `useEmergencyBackup.test.ts` | restores/clears backup |
| `useSessionHealth.test.ts` | monitors health correctly |

**Total**: ~30 tests
