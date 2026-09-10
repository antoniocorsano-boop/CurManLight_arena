-- CurManLight Arena Beta — H4 pgcrypto schema resolution fix.
-- Supabase installs pgcrypto in the `extensions` schema. The H4 SECURITY DEFINER
-- function intentionally pins its search_path, so `extensions` must be included
-- explicitly for digest(bytea,text) to resolve at runtime.

alter function public.record_h3_bound_institutional_decision_v1(uuid,uuid,uuid,text,text,uuid)
  set search_path = public, extensions, pg_temp;

comment on function public.record_h3_bound_institutional_decision_v1(uuid,uuid,uuid,text,text,uuid) is
  'H4 REVISION_DECIDE boundary bound to one current H3 institutional handoff. Search path includes the trusted extensions schema so pgcrypto digest resolves deterministically; authority, stale-source and no-adoption invariants remain unchanged.';
