# 08 — Workspace & Social Domains: Google Sync, UDA Social Board

> Google Workspace integration for backup/sync, and UDA social sharing platform.

---

## 1. Workspace Components

### 1.1 `WorkspaceSyncPanel.tsx`

```typescript
// State: reads useWorkspaceStore (accessToken, userInfo, lastSyncTime, isSyncLocked, syncProgress)
// Renders: login button or sync controls (based on auth state)
// Behavior: login, sync, logout, auto-pull
```

**JSX Structure**:
```
<div>
  {!accessToken ? (
    <WorkspaceLogin />
  ) : (
    <div>
      <UserInfo />
      <SyncProgress />
      <div className="flex gap-2">
        <Button onClick={handleWorkspaceSync} disabled={isSyncLocked}>
          Sincronizza
        </Button>
        <Button onClick={handleLocalDriveSync} variant="secondary">
          Salva Localmente
        </Button>
        <Button onClick={handleWorkspaceLogout} variant="danger">
          Esci
        </Button>
      </div>
      {lastSyncTime && <p>Ultimo sync: {formatTime(lastSyncTime)}</p>}
    </div>
  )}
</div>
```

### 1.2 `SyncProgress.tsx`

```typescript
interface SyncProgressProps {
  progress: number;
  phase: string;
}

// Renders: progress bar with phase label
// Behavior: shows upload/processing/complete states
```

### 1.3 `UserInfo.tsx`

```typescript
interface UserInfoProps {
  user: WorkspaceUser;
}

// Renders: avatar, name, email
// Behavior: display only
```

---

## 2. Social Components

### 2.1 `SocialBoard.tsx`

```typescript
// State: reads useSocialStore (board)
// Renders: grid of shared UDAs
// Behavior: browse, like, annotate, reuse
```

### 2.2 `SharedUdaCard.tsx`

```typescript
interface SharedUdaCardProps {
  sharedUda: SharedUda;
  onReuse: (uda: SharedUda) => void;
  onLike: (udaId: string) => void;
  onAnnotate: (udaId: string) => void;
}

// Renders: UDA preview card with author, date, likes, annotations count
// Behavior: click to expand, like, annotate, reuse
```

### 2.3 `UdaAnnotations.tsx`

```typescript
interface UdaAnnotationsProps {
  udaId: string;
  annotations: Annotation[];
  onAdd: (text: string) => void;
}

// State: local — newAnnotation
// Renders: annotation list, add annotation form
// Behavior: add annotation (GDPR filtered)
```

### 2.4 `UdaLikeButton.tsx`

```typescript
interface UdaLikeButtonProps {
  udaId: string;
  likes: string[];
  currentUserId: string;
  onToggle: (udaId: string) => void;
}

// Renders: heart icon with count
// Behavior: toggle like/unlike
```

### 2.5 `UdaOutcomeStats.tsx`

```typescript
interface UdaOutcomeStatsProps {
  stats: OutcomeStat;
  onUpdate: (stats: OutcomeStat) => void;
}

// Renders: completion rate, satisfaction rate, self-evaluation
// Behavior: edit and save outcome stats
```

### 2.6 `ShareUdaModal.tsx`

```typescript
interface ShareUdaModalProps {
  isOpen: boolean;
  onClose: () => void;
  uda: UdaModel;
  onShare: (uda: UdaModel) => void;
}

// State: local — shareMessage
// Renders: modal with UDA preview and share button
// Behavior: confirm share to social board
```

---

## 3. Hooks

### 3.1 `useWorkspaceSync.ts`

```typescript
function useWorkspaceSync(): {
  login: () => void;
  sync: () => Promise<void>;
  localSync: () => Promise<void>;
  logout: () => void;
  autoPull: () => Promise<void>;
  isSyncing: boolean;
  progress: number;
}
// Reads: useWorkspaceStore, all stores via stateRef
// Behavior: Google OAuth, Drive API, backup/restore
```

### 3.2 `useSocialBoard.ts`

```typescript
function useSocialBoard(): {
  board: SharedUda[];
  share: (uda: UdaModel) => void;
  reuse: (sharedUda: SharedUda) => UdaModel;
  like: (udaId: string) => void;
  annotate: (udaId: string, text: string) => void;
}
// Reads: useSocialStore, useCurriculumStore
// Behavior: share, reuse, like, annotate
```

---

## 4. Handlers

```typescript
// In WorkspaceSyncPanel
const handleWorkspaceLogin = () => {
  const authUrl = googleAuth(window.location.origin + '/callback');
  window.location.href = authUrl;
};

const handleWorkspaceSync = async () => {
  if (!accessToken) return;
  store.setSyncStatus(true, 0);
  try {
    const stateJson = JSON.stringify(getAllState());
    await uploadToDrive(accessToken, 'curmanlight-backup.json', stateJson);
    store.setLastSyncTime(Date.now());
    store.setSyncStatus(false, 100);
    toast.success('Sincronizzazione completata');
  } catch (error) {
    store.setSyncStatus(false, 0);
    toast.error('Errore di sincronizzazione');
  }
};

const handleWorkspaceLogout = () => {
  store.logout();
  toast.info('Disconnesso da Google Workspace');
};

// In SocialBoard
const handleShareUdaToSocial = (uda: UdaModel) => {
  const shared: SharedUda = {
    id: crypto.randomUUID(),
    uda,
    authorId: userInfo?.id || 'anonymous',
    authorName: userInfo?.name || 'Anonimo',
    sharedAt: Date.now(),
    likes: [],
    annotations: [],
  };
  socialStore.addToBoard(shared);
  toast.success('UDA condivisa sulla bacheca');
};

const handleReuseUda = (sharedUda: SharedUda) => {
  const imported: UdaModel = {
    ...sharedUda.uda,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  curriculumStore.addUda(imported);
  toast.success('UDA importata nella libreria');
};
```

---

## 5. Data Flow

### Workspace Sync Flow
```
User clicks "Accedi con Google"
  → handleWorkspaceLogin()
  → redirect to Google OAuth
  → callback parses token
  → useWorkspaceStore.setTokens
  → useWorkspaceStore.setUserInfo

User clicks "Sincronizza"
  → handleWorkspaceSync()
  → reads all state via stateRef
  → uploads to Google Drive
  → useWorkspaceStore.setLastSyncTime
  → toast "Sincronizzazione completata"

Auto-pull on mount
  → handleWorkspaceAutoPull()
  → downloads from Google Drive
  → parses JSON
  → useCurriculumStore.restoreBackupState
  → full app re-renders
```

### Social Board Flow
```
User clicks "Condividi" on UDA
  → handleShareUdaToSocial(uda)
  → useSocialStore.addToBoard
  → SocialBoard re-renders

User clicks "Riusa" on shared UDA
  → handleReuseUda(sharedUda)
  → creates new UdaModel with new ID
  → useCurriculumStore.addUda
  → toast "UDA importata"

User clicks "Mi piace"
  → handleLikeUda(udaId)
  → useSocialStore.toggleLike
  → UdaLikeButton re-renders

User adds annotation
  → handleAddAnnotation(udaId, text)
  → filterGdpr(text)
  → useSocialStore.addAnnotation
  → UdaAnnotations re-renders
```

---

## 6. Tests

| Test File | Tests |
|-----------|-------|
| `WorkspaceSyncPanel.test.tsx` | renders login/sync based on auth state |
| `SyncProgress.test.tsx` | renders progress bar |
| `UserInfo.test.tsx` | renders user avatar/name |
| `SocialBoard.test.tsx` | renders shared UDAs, filters |
| `SharedUdaCard.test.tsx` | renders card, shows author/date/likes |
| `UdaAnnotations.test.tsx` | renders annotations, adds annotation |
| `UdaLikeButton.test.tsx` | toggles like, shows count |
| `UdaOutcomeStats.test.tsx` | renders stats, edits stats |
| `ShareUdaModal.test.tsx` | renders modal, shares UDA |
| `useWorkspaceSync.test.ts` | login, sync, logout work correctly |
| `useSocialBoard.test.ts` | share, reuse, like, annotate work |
| `googleDrive.test.ts` | all API functions work correctly |

**Total**: ~30 tests
