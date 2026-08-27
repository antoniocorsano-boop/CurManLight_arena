# Human Communication Model (HCM) v1

Status: **CANONICAL CANDIDATE / BETA-G5**  
Scope: reusable human-facing communication contract  
Companion model: Human Interaction Model (HIM)

## 1. Problem

A system can be technically correct and still force people to read its internal model: enum names, verification jargon, identifiers, governance labels, transport failures or architectural concepts.

HCM separates **canonical truth** from **human projection**.

The canonical state remains owned by the domain. HCM only decides how that state should be expressed for the current human task, role context and requested level of detail.

## 2. Relationship with HIM

HIM answers:

> What is the human trying to accomplish, what is the next action, what can fail, and what consequence/authority boundary applies?

HCM answers:

> Given that canonical state and Human Task, how should the product communicate it without leaking implementation detail, inventing authority or losing precision?

HCM cannot override HIM or domain authority.

## 3. Projection pipeline

Every meaningful communication is projected through seven inputs:

1. **Canonical State** — immutable meaning supplied by the owning domain.
2. **Human Task** — the HIM task currently being performed.
3. **Role Context** — vocabulary and examples relevant to the person.
4. **Task Phase** — ORIENT, EXPLORE, ACT, REVIEW, DECIDE, RECOVER, COMPLETE.
5. **Consequence Level** — NONE, LOCAL, INSTITUTIONAL.
6. **Authority State** — NOT_REQUIRED, UNVERIFIED, VERIFIED, supplied externally by the authority domain.
7. **Detail Level** — PRIMARY, SECONDARY, TECHNICAL.

The output is a **Human Projection**. It may change wording and emphasis. It must not change canonical state, capability or authority.

## 4. Role-aware language

Role is a language lens, not a permission system.

Examples of legitimate variation for the same underlying object:

| Canonical concept | Docente | Referente | Organo collegiale |
| --- | --- | --- | --- |
| revision proposal | Prepara la proposta | Coordina la revisione | Esamina la proposta |
| curriculum source | Fonte da consultare | Fonte da verificare | Fonte a supporto della decisione |
| local draft | Nota di lavoro | Bozza di revisione | Materiale preparatorio |

This variation is prohibited from changing:

- membership;
- capability;
- Decision Authority;
- institutional outcome;
- receipt state.

A locally remembered role remains non-authoritative communication context.

## 5. Tone by phase

| Phase | Tone | Rule |
| --- | --- | --- |
| ORIENT | plain | where am I, what can I do now |
| EXPLORE | descriptive | compare and understand without pressure |
| ACT | operational | verb-led, concrete next action |
| REVIEW | precise | what is being checked and why |
| DECIDE | formal | neutral outcomes, consequence explicit |
| RECOVER | recovery | factual failure + safe state + next action |
| COMPLETE | confirmatory | what completed, resulting state/receipt |

The task phase takes precedence over a role's stylistic preference. In particular, institutional decisions remain formal and neutral for every role.

## 6. Terminology layers

### PRIMARY — human task layer

Contains only language required to understand and perform the task. Avoid implementation identifiers and platform internals.

Example:

**Primary:** `La sessione è attiva, ma non posso verificare l'autorità necessaria. La decisione resta bloccata.`

Not:

`Membership RPC failed / RLS blocked decision.`

### SECONDARY — informed-work layer

May expose provenance, verification state, legal/domain precision, reason for a block and other material context.

### TECHNICAL — inspection layer

May expose UUIDs, fingerprints, schema names, transport details and diagnostics. It must be intentionally opened or reached through a technical surface.

Technical detail is never deleted merely to simplify language; it is moved to the correct disclosure layer.

## 7. Memory model

HCM distinguishes **adaptive memory** from **canonical records**.

Adaptive memory may remember:

- working context;
- display preferences;
- resume point;
- role context as a non-authoritative preference.

Adaptive memory may not establish:

- membership;
- Decision Authority;
- institutional decision;
- receipt.

Those facts may be persisted by their owning canonical domain, but HCM treats them as records to re-read, not as remembered assumptions.

This gives a strict rule:

> Memory can restore continuity; it cannot restore authority.

## 8. Failure language

A recoverable failure should answer, in order:

1. What could not be completed?
2. Did anything change?
3. What remains safe/available?
4. What should the person do next?

Example:

`Connessione non disponibile. Nessuna decisione è stata registrata. La proposta resta disponibile. Riprova quando torni online.`

Transport or stack details belong in TECHNICAL disclosure.

## 9. Consequential decisions

For consequential actions HCM adds communication constraints on top of HIM/domain controls:

- no persuasive wording among valid outcomes;
- no preselected human outcome when a choice is required;
- authority described from domain evidence only;
- consequence visible before commit;
- wording distinguishes local/preparatory work from institutional effect;
- receipt visible after commit;
- identifiers/fingerprint secondary unless actively verifying integrity.

## 10. Portable installation

Reusable contract:

```text
.human/
└── hcm.config.json

agent_skills/
└── human-communication-model/
    └── SKILL.md

tools/
└── human-communication-model/
    ├── hcm.config.schema.json
    ├── hcm.config.example.json
    ├── init.mjs
    └── validate.mjs
```

A product may additionally implement a pure runtime adapter such as Arena's:

```text
src/domain/human-communication/
├── model.ts
└── index.ts
```

React, CSS, routes and product-specific copy catalogs are deliberately outside the portable contract.

Initialize in another repository:

```bash
node tools/human-communication-model/init.mjs .
```

Validate:

```bash
node tools/human-communication-model/validate.mjs .
```

## 11. Acceptance invariants

A HCM-L2 installation fails when:

- role is allowed to imply authority;
- remembered state can be treated as membership/authority evidence;
- institutional decisions can skip an explicit authority state;
- technical detail is the default primary language;
- the technical and human labels can represent different canonical states;
- error copy can imply success after a failed mutation;
- the repository claims HCM without a machine-validatable config.

Runtime acceptance should additionally test representative projections and technical-leak detection.

## 12. Arena adoption rule

Arena must migrate surfaces incrementally. HCM is not permission to rewrite all text mechanically.

For each surface:

**canonical state → Human Task → HCM projection → HIA evidence → human acceptance**.

The first targets after the model itself are Home, Revisione, Consulta, Progetta and Esporta, with the same GOV.UK-informed Human Task budgets already adopted for interaction density and scroll.
