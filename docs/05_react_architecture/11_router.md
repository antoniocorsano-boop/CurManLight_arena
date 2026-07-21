# 11 — Router: Route Definitions, Lazy Loading, Guards

> React Router v6 setup with lazy-loaded routes, route guards, and data loading.

---

## 1. Route Definitions

### 1.1 `src/routes/index.tsx`

```typescript
import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Lazy-loaded pages
const CurriculumPage = lazy(() => import('../pages/CurriculumPage'));
const ClassroomPage = lazy(() => import('../pages/ClassroomPage'));
const PlanningPage = lazy(() => import('../pages/PlanningPage'));
const DocumentsPage = lazy(() => import('../pages/DocumentsPage'));
const CopilotPage = lazy(() => import('../pages/CopilotPage'));
const KnowledgePage = lazy(() => import('../pages/KnowledgePage'));
const SocialPage = lazy(() => import('../pages/SocialPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));
const OnboardingPage = lazy(() => import('../pages/OnboardingPage'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/curriculum" replace /> },
      
      // Curriculum routes
      {
        path: 'curriculum',
        element: <CurriculumPage />,
      },
      {
        path: 'curriculum/:discipline',
        element: <CurriculumPage />,
      },
      
      // Classroom routes
      {
        path: 'classroom',
        element: <ClassroomPage />,
      },
      {
        path: 'classroom/:mode',
        element: <ClassroomPage />,
      },
      
      // Planning routes
      {
        path: 'planning',
        element: <PlanningPage />,
      },
      {
        path: 'planning/wizard',
        element: <PlanningPage />,
      },
      
      // Documents routes
      {
        path: 'documents',
        element: <DocumentsPage />,
      },
      {
        path: 'documents/:type',
        element: <DocumentsPage />,
      },
      
      // Copilot route
      {
        path: 'copilot',
        element: <CopilotPage />,
      },
      
      // Knowledge route
      {
        path: 'knowledge',
        element: <KnowledgePage />,
      },
      
      // Social route
      {
        path: 'social',
        element: <SocialPage />,
      },
      
      // Settings route
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },
  
  // Onboarding (outside main layout)
  {
    path: '/onboarding',
    element: <OnboardingPage />,
  },
  
  // Catch-all
  {
    path: '*',
    element: <Navigate to="/curriculum" replace />,
  },
]);
```

---

## 2. Route Guards

### 2.1 `src/routes/guards.tsx`

```typescript
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSessionStore } from '../stores';
import { useCurriculumStore } from '../stores';

interface GuardProps {
  children: ReactNode;
}

// Onboarding Guard — redirects to /onboarding if not completed
export function OnboardingGuard({ children }: GuardProps) {
  const showOnboarding = useSessionStore(s => s.showOnboarding);
  const location = useLocation();
  
  if (showOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
}

// Curriculum Guard — ensures discipline is set
export function CurriculumGuard({ children }: GuardProps) {
  const discipline = useCurriculumStore(s => s.discipline);
  
  if (!discipline) {
    return <Navigate to="/onboarding" replace />;
  }
  
  return <>{children}</>;
}

// Workspace Guard — requires Google auth for sync features
export function WorkspaceGuard({ children }: GuardProps) {
  const accessToken = useWorkspaceStore(s => s.accessToken);
  
  if (!accessToken) {
    return <WorkspaceLoginPrompt />;
  }
  
  return <>{children}</>;
}
```

---

## 3. Page Components

### 3.1 `src/pages/CurriculumPage.tsx`

```typescript
import { Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { CurriculumTab } from '../features/curriculum';
import { ErrorBoundary } from '../components/ui';
import { Spinner } from '../components/ui';

export default function CurriculumPage() {
  const { discipline } = useParams();
  
  return (
    <ErrorBoundary fallback={<CurriculumError />}>
      <Suspense fallback={<Spinner />}>
        <CurriculumTab initialDiscipline={discipline} />
      </Suspense>
    </ErrorBoundary>
  );
}
```

### 3.2 `src/pages/ClassroomPage.tsx`

```typescript
export default function ClassroomPage() {
  const { mode } = useParams();
  
  return (
    <ErrorBoundary fallback={<ClassroomError />}>
      <Suspense fallback={<Spinner />}>
        <ClassroomTab initialMode={mode} />
      </Suspense>
    </ErrorBoundary>
  );
}
```

### 3.3 `src/pages/PlanningPage.tsx`

```typescript
export default function PlanningPage() {
  return (
    <ErrorBoundary fallback={<PlanningError />}>
      <Suspense fallback={<Spinner />}>
        <ProgettazioneTab />
      </Suspense>
    </ErrorBoundary>
  );
}
```

### 3.4 `src/pages/DocumentsPage.tsx`

```typescript
export default function DocumentsPage() {
  const { type } = useParams();
  
  return (
    <ErrorBoundary fallback={<DocumentsError />}>
      <Suspense fallback={<Spinner />}>
        <DocumentsTab initialType={type} />
      </Suspense>
    </ErrorBoundary>
  );
}
```

### 3.5 Remaining Pages

Same pattern: ErrorBoundary → Suspense → Feature Component.

---

## 4. Navigation Integration

### 4.1 `src/features/navigation/components/TabBar.tsx` (updated)

```typescript
import { useNavigate, useLocation } from 'react-router-dom';
import { useNavigationStore } from '../../../stores';

const tabs = [
  { id: 'curriculum', label: 'Curricolo', icon: BookOpen, path: '/curriculum' },
  { id: 'classroom', label: 'Classe', icon: Users, path: '/classroom' },
  { id: 'planning', label: 'Pianificazione', icon: Calendar, path: '/planning' },
  { id: 'documents', label: 'Documenti', icon: FileText, path: '/documents' },
  { id: 'copilot', label: 'Copilot', icon: Bot, path: '/copilot' },
  { id: 'knowledge', label: 'Second Brain', icon: Brain, path: '/knowledge' },
  { id: 'social', label: 'Bacheca', icon: Share2, path: '/social' },
];

export function TabBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentTab = location.pathname.split('/')[1] || 'curriculum';
  
  return (
    <div className="flex border-b">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => navigate(tab.path)}
          className={`flex items-center gap-2 px-4 py-2 ${
            currentTab === tab.id
              ? 'border-b-2 border-indigo-500 text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <tab.icon size={18} />
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
```

---

## 5. Suspense Boundaries

```
<BrowserRouter>
  <OnboardingGuard>
    <AppShell>
      <Suspense fallback={<PageSpinner />}>
        <Routes>
          {routes.map(route => (
            <Route key={route.path} {...route} />
          ))}
        </Routes>
      </Suspense>
      <CopilotPanel />  {/* Always available, not lazy */}
      <ToastContainer />
    </AppShell>
  </OnboardingGuard>
</BrowserRouter>
```

---

## 6. URL Parameter Handling

| Route | Parameter | Usage |
|-------|-----------|-------|
| `/curriculum/:discipline` | `discipline` | Sets active discipline on mount |
| `/classroom/:mode` | `mode` | Sets classroom mode on mount |
| `/planning/wizard` | — | Opens wizard directly |
| `/documents/:type` | `type` | Sets active document type |

### 6.1 Syncing URL to State

```typescript
// In each page component
useEffect(() => {
  if (discipline && discipline !== store.discipline) {
    store.setDiscipline(discipline);
  }
}, [discipline]);
```

---

## 7. Tests

| Test File | Tests |
|-----------|-------|
| `routes/index.test.tsx` | all routes render correct pages |
| `guards.test.tsx` | OnboardingGuard redirects, CurriculumGuard checks discipline |
| `CurriculumPage.test.tsx` | renders with discipline param |
| `ClassroomPage.test.tsx` | renders with mode param |
| `PlanningPage.test.tsx` | renders planning |
| `DocumentsPage.test.tsx` | renders with type param |
| `TabBar.test.tsx` | navigates to correct route on click |

**Total**: ~20 tests
