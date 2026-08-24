-- CurManLight Arena H2B — shared workspace foundation
-- Local-first remains authoritative when Supabase is not configured.
-- This migration intentionally exposes NO client-side INSERT/UPDATE/DELETE policy.

create extension if not exists pgcrypto;

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 160),
  status text not null default 'active' check (status in ('active', 'archived')),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_memberships (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (
    role in ('docente', 'dipartimento', 'referente', 'collegio', 'dirigente', 'amministratore')
  ),
  status text not null default 'active' check (status in ('active', 'suspended', 'revoked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create index if not exists workspace_memberships_user_idx
  on public.workspace_memberships(user_id, status);

create index if not exists workspace_memberships_workspace_idx
  on public.workspace_memberships(workspace_id, status);

alter table public.workspaces enable row level security;
alter table public.workspace_memberships enable row level security;

-- A signed-in user can read only their own membership record.
-- This is the row used by the application to resolve authenticated role/capability.
drop policy if exists "memberships_select_own" on public.workspace_memberships;
create policy "memberships_select_own"
  on public.workspace_memberships
  for select
  to authenticated
  using (auth.uid() = user_id);

-- A signed-in user can read a workspace only while they have an active membership.
-- The nested membership read remains scoped to auth.uid().
drop policy if exists "workspaces_select_active_member" on public.workspaces;
create policy "workspaces_select_active_member"
  on public.workspaces
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.workspace_memberships membership
      where membership.workspace_id = workspaces.id
        and membership.user_id = auth.uid()
        and membership.status = 'active'
    )
  );

comment on table public.workspaces is
  'CurManLight Arena shared workspaces. H2B exposes read access only through RLS.';

comment on table public.workspace_memberships is
  'Authenticated workspace role evidence. No self-service role mutation is allowed in H2B.';

-- Deliberately absent in H2B:
-- - INSERT policies
-- - UPDATE policies
-- - DELETE policies
-- - client-side workspace bootstrap
-- - client-side membership administration
-- Future administration must add explicit capability-aware policies/RPCs and audit events.
