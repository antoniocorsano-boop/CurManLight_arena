# ARENA H2 — Shared Workspace & Authorization Boundary

Stato: ADR / H2A IMPLEMENTATION BASELINE  
Data: 2026-08-24

## Decisione

CurManLight Arena mantiene due modalità distinte:

1. **locale/personale** — Dexie/IndexedDB resta la sorgente di persistenza dell'utente;
2. **workspace condiviso** — una futura implementazione Supabase fornisce identità autenticata, membership, persistenza condivisa e RLS.

La modalità condivisa non sostituisce quella locale e non converte automaticamente i dati personali in dati istituzionali.

## Ruolo visualizzato ≠ autorizzazione

I ruoli locali già esistenti restano `self-declared` e possono orientare linguaggio e presentazione. Non attribuiscono:

- autorità collegiale;
- approvazione istituzionale;
- amministrazione del workspace;
- delega del Dirigente;
- identità autenticata.

Le capacità che producono autorità istituzionale o amministrativa richiedono `authenticated-workspace`.

## Capability registry

La sorgente canonica delle capacità è `src/domain/institution/capabilities.ts`.

Baseline H2A:

- `CURRICULUM_READ`;
- `CURRICULUM_PROPOSE`;
- `REVISION_REVIEW`;
- `REVISION_DECIDE`;
- `DOCUMENT_PREPARE`;
- `DOCUMENT_EXPORT`;
- `WORKSPACE_ADMIN`.

### Regole di privilegio minimo

- **Docente**: lettura, proposta e documenti personali; nessuna decisione istituzionale.
- **Dipartimento**: lettura, proposta, revisione e documenti; nessuna decisione collegiale.
- **Referente**: lettura, proposta, revisione e documenti; nessuna decisione collegiale automatica.
- **Collegio**: può esercitare `REVISION_DECIDE` soltanto in un workspace autenticato.
- **Dirigente**: non è un superutente didattico e non riceve automaticamente `REVISION_DECIDE` o `WORKSPACE_ADMIN`.
- **Amministratore**: può amministrare il workspace autenticato, ma non acquisisce per questo autorità curricolare.

## SharedWorkspaceRepository

`src/domain/institution/sharedWorkspacePort.ts` definisce la porta del repository condiviso.

La porta richiede membership autenticata e attiva. Non contiene fallback verso il ruolo autodichiarato.

Le future implementazioni Supabase devono rispettare questa direzione:

```text
UI / Human Task
      │
      ▼
Application / capability check
      │
      ├── LOCAL ──> Dexie
      │
      └── SHARED ─> SharedWorkspaceRepository
                      │
                      ▼
                Supabase + RLS
```

## Stack H2B previsto

Senza cambiare React/Vite/Zustand/Dexie:

- Supabase Auth per identità;
- PostgreSQL per dati condivisi;
- Row Level Security come enforcement server-side;
- client Supabase dietro adapter/repository;
- publishable key soltanto nel client;
- nessuna service-role key nel browser;
- GitHub Actions come gate;
- GitHub Pages resta valido per la SPA pubblica/statica finché le esigenze di runtime non richiedono altro.

## Gate prima di H2B

H2B non può considerare un ruolo locale come membership autenticata. Prima di una mutazione condivisa devono essere verificati:

1. utente autenticato;
2. workspace;
3. membership attiva;
4. ruolo della membership;
5. capability richiesta;
6. policy RLS equivalente lato database.

La UI può nascondere o disabilitare azioni, ma l'enforcement autorevole resta lato database/RLS.
