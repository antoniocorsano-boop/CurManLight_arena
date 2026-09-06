-- CurManLight Arena — active contributor guard for team review coverage
-- Coverage must be computed only from contributors who are still active and eligible
-- in the selected workspace. Historical contribution rows remain stored, but are not
-- exposed through the current comparison surface once their contributor is inactive.

 drop policy if exists "team_review_contributions_select_active_member" on public.team_review_contributions;

create policy "team_review_contributions_select_active_member" on public.team_review_contributions
for select to authenticated using (
  exists (
    select 1
    from public.workspace_memberships requester
    join public.workspaces w on w.id = requester.workspace_id
    where requester.workspace_id = team_review_contributions.workspace_id
      and requester.user_id = auth.uid()
      and requester.status = 'active'
      and w.status = 'active'
  )
  and exists (
    select 1
    from public.workspace_memberships contributor
    where contributor.workspace_id = team_review_contributions.workspace_id
      and contributor.user_id = team_review_contributions.contributor_user_id
      and contributor.status = 'active'
      and contributor.role in ('docente', 'dipartimento', 'referente')
  )
);

comment on policy "team_review_contributions_select_active_member" on public.team_review_contributions is
'An active workspace member may read current team-review contributions only from contributors who are themselves still active and eligible. This prevents inactive historical contributors from satisfying current team coverage.';
