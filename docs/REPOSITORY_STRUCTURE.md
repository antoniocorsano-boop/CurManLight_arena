# CurManLight Arena — Repository Structure

**Status:** CANONICAL NAVIGATION GUIDE  
**Reconciled:** 2026-09-24

## Scopo

Il repository contiene codice corrente e più generazioni di documentazione. Questa guida descrive come orientarsi senza confondere storia, proposta e authority corrente.

## Struttura principale

```text
CurManLight_arena/
├── README.md
├── AGENTS.md
├── CONTRIBUTING.md
├── SECURITY.md
├── package.json
├── src/
├── supabase/
├── docs/
│   ├── README.md
│   ├── architecture/
│   ├── assurance/
│   ├── evidence/
│   └── ...
├── .human/
├── .github/
├── agent_skills/
├── scripts/
├── tools/
├── second-brain/
└── session/
```

## Precedenza

Per lavoro di prodotto:
1. `AGENTS.md`;
2. memoria governata pertinente;
3. stato live / exact-head evidence;
4. contratti architetturali correnti;
5. codice e test correnti;
6. documentazione storica come supporto.

Una README, una roadmap o un report non possono da soli autorizzare una capability.

## Directory chiave

### `src/`
Codice applicativo, dominio, feature, infrastruttura e test. Gli invarianti di authority non vanno dedotti solo dalla UI.

### `docs/architecture/`
Contratti e governance. Verificare sempre stato e data del documento.

### `docs/evidence/`
Protocolli, ricevute ed evidenze. Un template o protocollo non equivale a un PASS umano.

### `docs/assurance/`
Materiale di assurance. Non implica certificazione legale o istituzionale.

### `.human/`
Human Task / Human Interaction contracts. L'automazione non produce il verdetto umano.

### `.github/`
Workflow, template e automazioni di repository.

### `second-brain/`
Archivio storico/conoscitivo. Non è authority runtime per default.

### `session/`
Checkpoint e handoff operativi. Utili per continuità, non sostituiscono governance.

## Confini cross-product

Per lavoro che coinvolge Atlas o Docente OS leggere almeno:
- `docs/architecture/ARENA_ATLAS_DOCENTE_OS_SURFACE_BOUNDARY_M4S4.md`;
- `docs/architecture/ECO00_ECOSYSTEM_ROLE_AND_HANDOFF.md`;
- i contratti specifici della capability.

## Regola anti-entropia

Ogni nuovo documento dovrebbe dichiarare:
- stato;
- owner/domain;
- cosa autorizza;
- cosa non autorizza;
- cosa lo può superare;
- quando va riesaminato.

Se queste informazioni mancano, il documento non dovrebbe essere trattato come canonico.
