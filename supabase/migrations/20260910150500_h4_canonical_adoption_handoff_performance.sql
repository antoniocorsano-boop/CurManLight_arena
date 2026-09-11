-- CurManLight Arena Beta — FK coverage for the H4 -> adoption handoff slice.

create index if not exists h4_canonical_adoption_handoffs_decision_idx
  on public.h4_canonical_adoption_handoffs(institutional_decision_id);
