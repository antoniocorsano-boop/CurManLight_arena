-- CurManLight Arena — bounded performance hardening for the H2 deferred-continuation slice.
-- Keep the change local to the two new tables: indexed foreign-key paths and
-- RLS predicates that evaluate auth.uid() once per statement.

create index if not exists team_review_deferred_continuations_completed_outcome_idx
  on public.team_review_deferred_continuations(completed_by_outcome_id);
create index if not exists team_review_deferred_continuations_group_code_idx
  on public.team_review_deferred_continuations(group_code);
create index if not exists team_review_deferred_continuations_opened_by_idx
  on public.team_review_deferred_continuations(opened_by_user_id);

create index if not exists team_review_contribution_history_source_outcome_idx
  on public.team_review_contribution_history(source_outcome_id);
create index if not exists team_review_contribution_history_workspace_idx
  on public.team_review_contribution_history(workspace_id);
create index if not exists team_review_contribution_history_contributor_idx
  on public.team_review_contribution_history(contributor_user_id);

drop policy if exists "team_review_deferred_continuations_select_active_member"
  on public.team_review_deferred_continuations;
create policy "team_review_deferred_continuations_select_active_member"
  on public.team_review_deferred_continuations
  for select to authenticated
  using (exists (
    select 1
    from public.workspace_memberships membership
    join public.workspaces workspace on workspace.id = membership.workspace_id
    where membership.workspace_id = team_review_deferred_continuations.workspace_id
      and membership.user_id = (select auth.uid())
      and membership.status = 'active'
      and workspace.status = 'active'
  ));

drop policy if exists "team_review_contribution_history_select_active_member"
  on public.team_review_contribution_history;
create policy "team_review_contribution_history_select_active_member"
  on public.team_review_contribution_history
  for select to authenticated
  using (exists (
    select 1
    from public.workspace_memberships membership
    join public.workspaces workspace on workspace.id = membership.workspace_id
    where membership.workspace_id = team_review_contribution_history.workspace_id
      and membership.user_id = (select auth.uid())
      and membership.status = 'active'
      and workspace.status = 'active'
  ));
