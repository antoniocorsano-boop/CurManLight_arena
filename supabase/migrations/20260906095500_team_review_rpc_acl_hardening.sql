-- CurManLight Arena — #201 explicit RPC ACL hardening
-- Supabase may retain explicit anon/authenticated EXECUTE grants independently
-- from PUBLIC. Make the intended client boundary explicit after the scope migration.

-- Legacy APIs: no browser/client execution. They remain only for historical
-- schema compatibility and service-side inspection.
revoke all on function public.upsert_team_review_contribution_v1(uuid,text,text,text,text)
  from public, anon, authenticated;
revoke all on function public.record_team_review_outcome_v1(uuid,text,text,text,text,text,text)
  from public, anon, authenticated;
revoke all on function public.get_team_review_eligible_contributor_count_v1(uuid)
  from public, anon, authenticated;

-- Current self-service/profile and scoped APIs: authenticated only.
revoke all on function public.upsert_my_operational_profile_v1(text,text,text[],text)
  from public, anon, authenticated;
grant execute on function public.upsert_my_operational_profile_v1(text,text,text[],text)
  to authenticated;

revoke all on function public.upsert_team_review_contribution_v2(uuid,text,text,text,text,text,text,text)
  from public, anon, authenticated;
grant execute on function public.upsert_team_review_contribution_v2(uuid,text,text,text,text,text,text,text)
  to authenticated;

revoke all on function public.get_team_review_eligible_contributor_count_v3(uuid,text,text,text)
  from public, anon, authenticated;
grant execute on function public.get_team_review_eligible_contributor_count_v3(uuid,text,text,text)
  to authenticated;

revoke all on function public.record_team_review_outcome_v2(uuid,text,text,text,text,text,text,text,text,text)
  from public, anon, authenticated;
grant execute on function public.record_team_review_outcome_v2(uuid,text,text,text,text,text,text,text,text,text)
  to authenticated;

-- Trigger functions are not public RPCs.
revoke all on function public.assert_team_operational_contribution_scope_v1()
  from public, anon, authenticated;
revoke all on function public.assert_team_operational_outcome_scope_v1()
  from public, anon, authenticated;

comment on function public.upsert_team_review_contribution_v1(uuid,text,text,text,text) is
'Legacy pre-scope team-review writer retained for schema history; browser execution revoked by #201.';
comment on function public.record_team_review_outcome_v1(uuid,text,text,text,text,text,text) is
'Legacy pre-scope team-outcome writer retained for schema history; browser execution revoked by #201.';
comment on function public.get_team_review_eligible_contributor_count_v1(uuid) is
'Legacy workspace-wide denominator retained for schema history; browser execution revoked because #201 requires exact discipline scope.';
