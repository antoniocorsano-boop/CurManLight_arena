# CML-633D Local Context and Role Policy

> Defines how institutional context and declared roles operate within CurManLight.

## 1. Institutional Context

The institutional context is a local, user-configured record that associates:

- An **active institute** (from the institutional archive)
- An **active academic year** (non-overlapping, one per institute)
- An optional **main site**
- An optional **declared actor** (name and role)

### 1.1 Active Institute

- Must have status `confirmed-local`
- Set via `setActiveInstitute(archive, instituteId)`
- Only one can be active at a time
- Setting a new active institute clears the previous context if the context belonged to a different institute

### 1.2 Active Academic Year

- Must belong to the active institute
- Must be `planned` or `active`; setting as active closes other active years for the same institute
- Managed via `setActiveAcademicYear(archive, instituteId, yearId)`
- At most one active year per institute at any time

### 1.3 Site

- Optional; resolved from context `siteRef` or fallback to main site
- Never assumed; `undefined` when not configured

## 2. Declared Actor

### 2.1 Contract

```typescript
interface DeclaredActorReference {
  displayName: string;
  role: InstitutionalRole;
  assertion: 'self-declared';
}
```

### 2.2 Roles

Available roles (all self-declared):

| Value | Label |
|---|---|
| `docente` | Docente |
| `dipartimento` | Dipartimento |
| `referente` | Referente |
| `collegio` | Collegio |
| `dirigente` | Dirigente |
| `amministratore` | Amministratore |

### 2.3 Key Invariants

- `assertion` is always `'self-declared'`; no other assertion type is accepted
- Role is per-session only; not persisted as authentication
- Role does NOT grant institutional delegation or approval authority
- Role does NOT enable institutional transitions or governance actions
- Role wording always includes "dichiarato": e.g., "Ruolo dichiarato per questa sessione: docente"

### 2.4 What the Role Does

- Appears in A07 document header projection as `declaredRoleLine`
- Appears in SCORM metadata as declared role
- Appears in A04 preview when configured

### 2.5 What the Role Does NOT Do

- Does NOT authenticate the user
- Does NOT grant institutional authority
- Does NOT enable formal approval workflows
- Does NOT replace or imply institutional delegation
- Does NOT create or modify the institutional archive
- Does NOT persist beyond the session context

## 3. Behavior Without Context

When no valid institutional context exists:

| Surface | Behavior |
|---|---|
| Institute name | `'Istituto non configurato'` |
| Mechanical code | Not displayed |
| Site | Not displayed |
| Academic year | Not displayed |
| Document heading | Not displayed |
| Role | Not displayed |
| A04 preview | Shows "MODALITA: PERSONALE" |
| A07 exports | Uses neutral heading, warns about incomplete config |
| SCORM metadata | Uses `curmanlight-local` as organization ID |

## 4. Behavior With Context

When a valid context is configured:

| Surface | Behavior |
|---|---|
| Institute name | Derived from `Institute.name` |
| Mechanical code | From `Institute.mechanicalCode` if present |
| Site | From context `siteRef` or main site |
| Academic year | From context `academicYearRef` or active year |
| Document heading | From `Institute.documentProfile.heading` |
| A04 preview | Shows configured institute, year, orders |
| A07 exports | Uses configured identity and heading |
| SCORM metadata | Uses `institute-{id}` as organization ID |

## 5. Effect of Context Changes on Existing Artifacts

| Artifact | Behavior on context change |
|---|---|
| Saved UDA records | NOT rewritten; no institutional context injected retroactively |
| Previously exported documents | NOT modified; each export uses the current context at export time |
| Backup/restore | Archive is included; old archives with different contexts can be imported |
| Personal mode text | Not affected by institutional context |

## 6. Backup and Restore Context

- The institutional archive is included in backup payloads
- Old backups without an archive restore as neutral (empty archive)
- Malformed or future-schema archives are rejected without mutation
- Emergency restore follows the same validation rules
- Cloud restore validates the archive before applying
