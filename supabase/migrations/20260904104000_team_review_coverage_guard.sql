-- CurManLight Arena — team review coverage guard
-- A point may be called shared only when every eligible contributor in the selected
-- team workspace has a current contribution. The client receives only the count,
-- never the membership identities.

create or replace function public.get_team_review_eligible_contributor_count_v1(
  p_workspace_id uuid
) returns integer
language plpgsql
security definer
stable
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_member_active boolean;
  v_count integer;
begin
  if v_user is null then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = '42501';
  end if;

  select exists (
    select 1
    from public.workspace_memberships m
    join public.workspaces w on w.id = m.workspace_id
    where m.workspace_id = p_workspace_id
      and m.user_id = v_user
      and m.status = 'active'
      and w.status = 'active'
  ) into v_member_active;

  if not v_member_active then
    raise exception 'ACTIVE_WORKSPACE_MEMBERSHIP_REQUIRED' using errcode = '42501';
  end if;

  select count(*)::integer into v_count
  from public.workspace_memberships m
  where m.workspace_id = p_workspace_id
    and m.status = 'active'
    and m.role in ('docente', 'dipartimento', 'referente');

  return v_count;
end;
$$;

revoke all on function public.get_team_review_eligible_contributor_count_v1(uuid) from public;
grant execute on function public.get_team_review_eligible_contributor_count_v1(uuid) to authenticated;

comment on function public.get_team_review_eligible_contributor_count_v1(uuid) is
'Privacy-minimal coverage guard for team review. Returns only the number of active contributor-role memberships in the selected workspace; it confers no authority and exposes no member identity.';
