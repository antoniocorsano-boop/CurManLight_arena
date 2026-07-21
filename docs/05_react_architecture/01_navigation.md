# 01 — Navigation Domain: AppShell, Sidebar, TopBar, TabBar

> The layout shell that wraps all pages. Handles tab routing, sidebar visibility, and responsive behavior.

---

## 1. Components

### 1.1 `AppShell.tsx`

```typescript
interface AppShellProps {
  children: React.ReactNode;
}

// State: reads useNavigationStore (showMobileSidebar), useSessionStore (isOffline)
// Renders: flex layout with sidebar + main area
// Behavior: responsive — sidebar hidden on mobile, toggle via hamburger
```

**JSX Structure**:
```
<div className="flex h-screen bg-gray-50">
  {isOffline && <OfflineIndicator />}
  {!isMobile && <Sidebar />}
  {isMobile && showMobileSidebar && (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={closeSidebar} />
      <div className="fixed inset-y-0 left-0 z-50 w-64">
        <MobileSidebar />
      </div>
    </>
  )}
  <main className="flex-1 flex flex-col overflow-hidden">
    <TopBar />
    <TabBar />
    <div className="flex-1 overflow-auto p-4">
      {children}
    </div>
  </main>
</div>
```

### 1.2 `Sidebar.tsx`

```typescript
// State: reads useCurriculumStore (discipline, order, savedUda)
// State: reads useNavigationStore (activeTab)
// Renders: discipline list, quick stats, settings button
// Behavior: click discipline → setDiscipline, click settings → setShowSettingsPanel
```

**Props**: None (reads from stores directly)
**Key Elements**:
- Logo/title
- Discipline selector (radio group)
- Order selector (infanzia/primaria/secondaria)
- Quick stats (UDA count, decisions count)
- Settings gear icon
- Profile avatar

### 1.3 `TopBar.tsx`

```typescript
// State: reads useNavigationStore (showProfileModal, showSettingsPanel)
// State: reads useCurriculumStore (role, discipline)
// Renders: breadcrumb, search, profile, voice controls
// Behavior: click profile → setShowProfileModal, click search → opens search overlay
```

**Props**: None
**Key Elements**:
- Breadcrumb (current tab > subtab)
- Global search input
- Voice toggle button
- Profile avatar/name
- Settings icon (mobile only)

### 1.4 `TabBar.tsx`

```typescript
// State: reads useNavigationStore (activeTab)
// State: reads useCurriculumStore (discipline)
// Renders: horizontal tab list with icons
// Behavior: click tab → setActiveTab + scroll to top
```

**Props**: None
**Tabs**:
| Tab ID | Label | Icon | Route |
|--------|-------|------|-------|
| `curriculum` | Curricolo | BookOpen | `/curriculum` |
| `classroom` | Classe | Users | `/classroom` |
| `planning` | Pianificazione | Calendar | `/planning` |
| `documents` | Documenti | FileText | `/documents` |
| `copilot` | Copilot | Bot | `/copilot` |
| `knowledge` | Second Brain | Brain | `/knowledge` |
| `social` | Bacheca | Share2 | `/social` |

### 1.5 `MobileSidebar.tsx`

```typescript
// State: reads useNavigationStore (showMobileSidebar)
// Renders: same as Sidebar but in mobile overlay
// Behavior: click item → closeSidebar + navigate
```

---

## 2. Hooks

### 2.1 `useResponsive.ts`

```typescript
function useResponsive(): { isMobile: boolean; isTablet: boolean; isDesktop: boolean }
// Reads: window.innerWidth via matchMedia
// Behavior: breakpoint at 768px (mobile), 1024px (tablet)
```

---

## 3. Tests

| Test File | Tests |
|-----------|-------|
| `AppShell.test.tsx` | renders children, shows sidebar on desktop, hides on mobile, shows offline indicator |
| `Sidebar.test.tsx` | renders discipline list, click changes discipline, shows settings |
| `TopBar.test.tsx` | renders breadcrumb, shows profile modal on click |
| `TabBar.test.tsx` | renders all tabs, click changes active tab, highlights active |
| `MobileSidebar.test.tsx` | renders in overlay, closes on item click, closes on backdrop click |
| `useResponsive.test.ts` | returns correct breakpoints |

**Total**: ~20 tests
