-- CurManLight Arena — H3 institutional handoff FK performance hardening.

create index if not exists vertical_review_institutional_handoffs_h3_idx
  on public.vertical_review_institutional_handoffs(vertical_review_outcome_id);

create index if not exists vertical_review_institutional_handoffs_prepared_by_idx
  on public.vertical_review_institutional_handoffs(prepared_by_user_id);
