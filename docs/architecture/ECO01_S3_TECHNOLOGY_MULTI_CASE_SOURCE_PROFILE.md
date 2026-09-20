# ECO-01/S3 — Technology I/II/III curriculum-source profile

Status: **NON_OPERATIONAL_VALIDATION / RUNTIME_DEFERRED**  
Date: 2026-09-20  
Program: ECO-01/S3

## Purpose

Validate one curriculum-source boundary across three real Technology teaching cases without creating annuality-specific authority logic.

The current Arena Technology projection used for this validation is:

`src/features/curriculum/data/departmentCurriculumV31.section-09.json`

Teaching-design sources are external evidence only; they do not replace Arena curriculum authority.

## Case 1 — Grade I baseline

Teacher-facing title: **Bisogni, risorse e sistemi**

Arena regime:
- Indicazioni 2025;
- institute annualization for grade I;
- current Technology nucleus: **Cultura tecnica e sistemi**.

Current Arena outcome:
- “Legge oggetti e sistemi semplici in rapporto a bisogni e funzioni.”

Current Arena annualized objective:
- “Analizzare struttura/funzione; riconoscere risorse, input/output, rischi d’uso.”

S3 reuses the already validated S2 card as the baseline.

## Case 2 — Grade II transition

Teacher-facing title: **Agricoltura come sistema tecnologico**

Arena regime:
- Indicazioni 2012;
- continuity of the cohort;
- transition remodulation only where necessary.

Current Arena outcome:
- **Cultura tecnica e sistemi** — “Analizza sistemi, servizi e filiere con più componenti.”

Current Arena annualized objective:
- “Individuare relazioni, flussi e criticità; confrontare alternative.”

Teaching-design evidence:
- `ACT-B01-2_Tecnologia_Classe_Seconda_2026-2027`;
- Drive id `1t3l4A5-yIPh1m5r-CCSyAzCRY87RL0S1lmpLwe-wES0`;
- `CAN-PACK-2A_Agricoltura_suolo_e_produzioni_sostenibili_2026-2027`;
- Drive id `1Ae8nHM_pppBw65bmhIhYpe_KMVbG7jEq2i4CHQTl38A`;
- state: `PREPARED_NOT_SECTION_BOUND`.

Lesson-design function:
- read agricultural territory as a technical-production system;
- identify soil, water, crops, infrastructures, machines, human work, energy, inputs and outputs.

The teaching-design documents remain subordinate to Arena for curriculum authority.

## Case 3 — Grade III final transition

Teacher-facing title: **Forme e trasformazioni dell’energia**

Arena regime:
- Indicazioni 2012;
- continuity of the cohort;
- final transition year.

Current Arena outcome:
- **Energia, elettricità e sostenibilità** — “Valuta fonti, trasformazioni, reti e transizione energetica.”

Current Arena annualized objective:
- “Confrontare fonti; interpretare rendimento/consumi; schematizzare circuiti; proporre soluzioni.”

For the opening B01 lesson the teaching design intentionally starts more narrowly with recognition of energy forms and observable transformations. This is teaching sequencing, not a change to the curriculum.

Teaching-design evidence:
- `ACT-B01-3_Tecnologia_Classe_Terza_2026-2027`;
- Drive id `1KmwuVWLp6By4eB93tB2eesWO-gNWTuzwcw2ot6qenVU`;
- `CAN-PACK-3A_Energia_forme_trasformazioni_e_fabbisogni_2026-2027`;
- Drive id `1HAzlPImnX2oImHBpxNestc5Y4UIe5xaG_TklkJNyBOU`;
- state: `PREPARED_NOT_SECTION_BOUND`.

## Shared authority rules

All three cases use the same authority model:

1. Arena supplies curriculum/regime/provenance.
2. Docente OS supplies the operational lesson composition.
3. Teaching plans, UDA, activation sheets and packs are teaching-design evidence.
4. Atlas, when present, supplies material only.
5. No teaching-design source may promote or reinterpret curriculum authority.
6. Grade II and III must remain explicitly in the 2012 transition regime.
7. No section, date or timetable is inferred in S3.

## Snapshot/fingerprint rule

S3 is a **readability/generalizability validation**, not a new handoff run.

- Grade I may display the S2 snapshot fingerprint already materialized in S1/S2.
- Grade II/III static S3 cases must not invent a `CurriculumSnapshot v1` fingerprint.
- Until a real governed snapshot is produced, their snapshot-binding state is `NOT_MATERIALIZED_IN_S3_STATIC_CASE`.
- A future runtime/pilot cannot treat that state as accepted or persisted.

## S3 acceptance

PASS requires:

- one teacher-first shape for all three cases;
- no annuality-specific authority fields;
- no 2025 retrofitting of II/III;
- no parallel Atlas path;
- no invented section/date/fingerprint;
- same canonical material roles;
- human confirmation that the three cards remain pedagogically usable.
