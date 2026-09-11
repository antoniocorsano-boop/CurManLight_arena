-- CurManLight Arena Beta — explicit development/pilot authority provenance.
--
-- This migration does not assign any user. It only creates the governed
-- metadata needed to distinguish a Beta development authority from a formal
-- institutional authority in production. User assignment remains an explicit
-- environment-specific data operation.

create extension if not exists pgcrypto;

create table if not exists public.development_pilot_authority_assignments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete restrict,
  authority_role text not null default 'collegio' check (authority_role = 'collegio'),
  scope text not null default 'BETA_DEVELOPMENT_PILOT' check (scope = 'BETA_DEVELOPMENT_PILOT'),
  status text not null default 'active' check (status in ('active','revoked')),
  previous_workspace_role text not null check (previous_workspace_role in ('docente','dipartimento','referente','collegio','dirigente','amministratore')),
  basis text not null check (char_length(trim(basis)) between 1 and 600),
  source_ref text not null check (char_length(trim(source_ref)) between 1 and 240),
  assigned_at timestamptz not null default now(),
  revoked_at timestamptz,
  constraint development_pilot_authority_assignments_state_check check (
    (status = 'active' and revoked_at is null)
    or (status = 'revoked' and revoked_at is not null)
  ),
  unique (workspace_id, user_id, scope)
);

alter table public.development_pilot_authority_assignments enable row level security;

create index if not exists development_pilot_authority_assignments_active_idx
  on public.development_pilot_authority_assignments(workspace_id, user_id, status);

revoke insert, update, delete on table public.development_pilot_authority_assignments from public, anon, authenticated;
grant select on table public.development_pilot_authority_assignments to authenticated;

drop policy if exists "development_pilot_authority_assignments_select_own" on public.development_pilot_authority_assignments;
create policy "development_pilot_authority_assignments_select_own"
  on public.development_pilot_authority_assignments
  for select to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.workspace_memberships membership
      join public.workspaces workspace on workspace.id = membership.workspace_id
      where membership.workspace_id = development_pilot_authority_assignments.workspace_id
        and membership.user_id = (select auth.uid())
        and membership.status = 'active'
        and workspace.status = 'active'
    )
  );

alter table public.institutional_revision_decisions
  add column if not exists authority_context text not null default 'INSTITUTIONAL',
  add column if not exists authority_assignment_id uuid references public.development_pilot_authority_assignments(id) on delete restrict;

alter table public.institutional_revision_decisions
  drop constraint if exists institutional_revision_decisions_authority_context_check;
alter table public.institutional_revision_decisions
  add constraint institutional_revision_decisions_authority_context_check check (
    (authority_context = 'INSTITUTIONAL' and authority_assignment_id is null)
    or (authority_context = 'DEVELOPMENT_PILOT' and authority_assignment_id is not null)
  );

create index if not exists institutional_revision_decisions_authority_assignment_idx
  on public.institutional_revision_decisions(authority_assignment_id)
  where authority_assignment_id is not null;

create or replace function public.annotate_institutional_revision_authority_context_v1()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_assignment_id uuid;
begin
  new.authority_context := 'INSTITUTIONAL';
  new.authority_assignment_id := null;

  if new.decision_basis = 'VERTICAL_REVIEW_HANDOFF' and new.authority_role = 'collegio' then
    select assignment.id into v_assignment_id
    from public.development_pilot_authority_assignments assignment
    where assignment.workspace_id = new.workspace_id
      and assignment.user_id = new.decided_by
      and assignment.authority_role = 'collegio'
      and assignment.scope = 'BETA_DEVELOPMENT_PILOT'
      and assignment.status = 'active'
    order by assignment.assigned_at desc, assignment.id desc
    limit 1;

    if found then
      new.authority_context := 'DEVELOPMENT_PILOT';
      new.authority_assignment_id := v_assignment_id;
    end if;
  end if;

  return new;
end;
$$;

revoke all on function public.annotate_institutional_revision_authority_context_v1()
  from public, anon, authenticated;

drop trigger if exists institutional_revision_decision_authority_context_v1
  on public.institutional_revision_decisions;
create trigger institutional_revision_decision_authority_context_v1
  before insert on public.institutional_revision_decisions
  for each row execute function public.annotate_institutional_revision_authority_context_v1();

comment on table public.development_pilot_authority_assignments is
  'Explicit Beta-only development/pilot authority provenance. It never proves a formal production Collegio mandate.';
comment on column public.institutional_revision_decisions.authority_context is
  'INSTITUTIONAL for formal authority; DEVELOPMENT_PILOT when the H4 receipt is produced under an explicit Beta development authority assignment.';
comment on column public.institutional_revision_decisions.authority_assignment_id is
  'Optional provenance link used only when authority_context = DEVELOPMENT_PILOT.';
