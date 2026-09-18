-- CurManLight Arena Beta — performance hardening for H4-bound adoption.
-- Cover the adoption_handoff_id foreign key independently from the composite
-- workspace uniqueness constraint so FK checks and joins stay index-backed.

create index if not exists h4_bound_canonical_adoption_handoff_fk_idx
  on public.h4_bound_canonical_adoption_receipts(adoption_handoff_id);
