-- CurManLight Arena — bounded performance hardening for the H3-bound H4 slice.
-- A composite partial index is useful for decision lookup, but the FK linter
-- also requires the referenced handoff column to lead a covering index.

create index if not exists institutional_revision_decisions_vertical_handoff_fk_idx
  on public.institutional_revision_decisions(vertical_review_handoff_id)
  where vertical_review_handoff_id is not null;
