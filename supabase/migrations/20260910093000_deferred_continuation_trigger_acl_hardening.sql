-- CurManLight Arena — keep trigger-only continuation guards out of the exposed RPC surface.
-- These functions are invoked only by database triggers; clients must never call them directly.

revoke all on function public.complete_deferred_team_review_continuation_v1()
  from public, anon, authenticated;

revoke all on function public.guard_vertical_review_against_open_h2_continuation_v1()
  from public, anon, authenticated;
