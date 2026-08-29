# ARENA-S2C — Institutional Planning Language Map

Date: 2026-08-29
Baseline: `main@08dd515870e6408a5bdcf5c8cc9359748e2c3111`
Status: REMEDIATION_IN_PROGRESS

## Governing rule

CurManLight Arena owns institutional curriculum, curriculum-governed design, reusable UDA frameworks, review and evidence. It does not own the teacher's personal operational workspace, classroom execution environment, pupil-level state or daily teaching plan.

S2C therefore changes copy only where wording assigns personal/classroom ownership to Arena. It does not alter UDA logic, curriculum authority, persistence, interoperability or Docente OS responsibilities.

## Canonical replacements

| Current wording | Canonical Arena wording |
| --- | --- |
| `Area di progettazione personale` | `Area di progettazione curricolare` |
| `questo dispositivo d'aula` | `questo archivio di progettazione` |
| `Area di progettazione personale e locale.` | `Area di progettazione curricolare e riuso istituzionale.` |
| `bozza UDA personale` | `bozza UDA curricolare` |
| `nella tua programmazione annuale` | `nella programmazione curricolare annuale` |
| `Assistente Ergonomico d'Aula` | `Assistente Ergonomico di Progettazione` |
| `schermo d'aula` | `ambiente di progettazione` |
| `criteri personali` | `criteri curricolari` |
| `Quadro generale personale` | `Quadro generale di progettazione` |
| `per la tua classe` | `per la classe selezionata` |
| `Non hai ancora pianificato Unità di Apprendimento per questa classe` | `Non risultano ancora Unità di Apprendimento pianificate per la classe selezionata` |

## Additional review targets

The same surface also contains expressions such as `Pianificazione diacronica locale`, `Layout di compilazione locale`, `Archivio UDA locale`, `Riusa e importa localmente` and other uses of `locale`. These are not automatically forbidden: `locale` can describe storage/runtime behavior without assigning teacher-operational authority. They must therefore be reviewed semantically rather than removed mechanically.

Likewise, references to `classe` are legitimate when they identify the curricular cohort/target class. They become out of boundary only when the wording implies pupil-level operations, classroom execution or the teacher's personal daily workspace.

## Machine gate

`src/__tests__/arena-institutional-planning-language.test.ts` must fail if personal/classroom-owned copy reappears in the canonical planning surface while continuing to require the curriculum-design vocabulary `Unità di Apprendimento`, `traguardi` and `obiettivi`.

## Acceptance

S2C can pass only when:
1. the forbidden-copy gate is green;
2. existing fast regressions remain green;
3. Human Governance and KX guards remain green;
4. TypeScript and production build pass;
5. Beta Identity Authority and Beta Release Contract pass where triggered;
6. no behavior, authority or persistence semantic is changed as part of the copy remediation.
