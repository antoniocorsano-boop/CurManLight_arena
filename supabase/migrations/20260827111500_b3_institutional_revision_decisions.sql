-- CurManLight Arena B3 — institutional revision decision boundary
-- Consequential curriculum decisions are append-only server receipts.
-- The browser has no direct INSERT/UPDATE/DELETE privilege on this table.

create table if not exists public.institutional_revision_decisions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete restrict,
  proposal_ref text not null check (char_length(trim(proposal_ref)) between 1 and 240),
  proposal_version_ref text not null check (char_length(trim(proposal_version_ref)) between 1 and 240),
  proposal_version_fingerprint text not null check (proposal_version_fingerprint ~ '^[a-f0-9]{64}$'),
  outcome text not null check (
    outcome in ('approve', 'approve-with-changes', 'reject', 'defer', 'return-for-revision')
  ),
  rationale text not null check (char_length(trim(rationale)) between 1 and 4000),
  decided_by uuid not null references auth.users(id) on delete restrict,
  authority_role text not null check (authority_role = 'collegio'),
  decided_at timestamptz not null default now(),
  client_request_id uuid not null,
  unique (workspace_id, client_request_id)
);

create index if not exists institutional_revision_decisions_workspace_idx
  on public.institutional_revision_decisions(workspace_id, decided_at desc);

alter table public.institutional_revision_decisions enable row level security;

-- Active workspace members may inspect institutional decision receipts.
drop policy if exists "institutional_revision_decisions_select_active_member"
  on public.institutional_revision_decisions;
create policy "institutional_revision_decisions_select_active_member"
  on public.institutional_revision_decisions
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.workspace_memberships membership
      join public.workspaces workspace on workspace.id = membership.workspace_id
      where membership.workspace_id = institutional_revision_decisions.workspace_id
        and membership.user_id = auth.uid()
        and membership.status = 'active'
        and workspace.status = 'active'
    )
  );

-- Direct mutations stay closed. The only authenticated write path is the RPC below.
revoke insert, update, delete on table public.institutional_revision_decisions from anon, authenticated;
grant select on table public.institutional_revision_decisions to authenticated;

create or replace function public.record_institutional_revision_decision(
  p_workspace_id uuid,
  p_proposal_ref text,
  p_proposal_version_ref text,
  p_proposal_version_fingerprint text,
  p_outcome text,
  p_rationale text,
  p_client_request_id uuid
)
returns setof public.institutional_revision_decisions
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_role text;
  v_existing public.institutional_revision_decisions%rowtype;
begin
  if v_user_id is null then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = '42501';
  end if;

  if p_workspace_id is null
     or p_proposal_ref is null
     or nullif(trim(p_proposal_ref), '') is null
     or p_proposal_version_ref is null
     or nullif(trim(p_proposal_version_ref), '') is null
     or p_proposal_version_fingerprint is null
     or p_proposal_version_fingerprint !~ '^[a-f0-9]{64}$'
     or p_outcome is null
     or p_outcome not in ('approve', 'approve-with-changes', 'reject', 'defer', 'return-for-revision')
     or p_rationale is null
     or nullif(trim(p_rationale), '') is null
     or char_length(trim(p_rationale)) > 4000
     or p_client_request_id is null then
    raise exception 'INVALID_INSTITUTIONAL_DECISION_INPUT' using errcode = '22023';
  end if;

  select membership.role
    into v_role
  from public.workspace_memberships membership
  join public.workspaces workspace on workspace.id = membership.workspace_id
  where membership.workspace_id = p_workspace_id
    and membership.user_id = v_user_id
    and membership.status = 'active'
    and workspace.status = 'active';

  -- Mirrors the canonical Arena capability registry: only authenticated
  -- collegio membership currently owns REVISION_DECIDE.
  if v_role is distinct from 'collegio' then
    raise exception 'REVISION_DECIDE_REQUIRED' using errcode = '42501';
  end if;

  select *
    into v_existing
  from public.institutional_revision_decisions decision
  where decision.workspace_id = p_workspace_id
    and decision.client_request_id = p_client_request_id;

  if found then
    if v_existing.decided_by <> v_user_id
       or v_existing.proposal_ref <> trim(p_proposal_ref)
       or v_existing.proposal_version_ref <> trim(p_proposal_version_ref)
       or v_existing.proposal_version_fingerprint <> p_proposal_version_fingerprint
       or v_existing.outcome <> p_outcome
       or v_existing.rationale <> trim(p_rationale) then
      raise exception 'CLIENT_REQUEST_ID_REUSE_MISMATCH' using errcode = '23505';
    end if;

    return next v_existing;
    return;
  end if;

  insert into public.institutional_revision_decisions (
    workspace_id,
    proposal_ref,
    proposal_version_ref,
    proposal_version_fingerprint,
    outcome,
    rationale,
    decided_by,
    authority_role,
    client_request_id
  ) values (
    p_workspace_id,
    trim(p_proposal_ref),
    trim(p_proposal_version_ref),
    p_proposal_version_fingerprint,
    p_outcome,
    trim(p_rationale),
    v_user_id,
    'collegio',
    p_client_request_id
  )
  returning * into v_existing;

  return next v_existing;
end;
$$;

revoke all on function public.record_institutional_revision_decision(uuid, text, text, text, text, text, uuid) from public;
grant execute on function public.record_institutional_revision_decision(uuid, text, text, text, text, text, uuid) to authenticated;

comment on table public.institutional_revision_decisions is
  'Append-only institutional decision receipts for the bounded Arena Beta workflow. They do not mutate the curriculum automatically.';

comment on function public.record_institutional_revision_decision(uuid, text, text, text, text, text, uuid) is
  'Server-authoritative REVISION_DECIDE boundary. Verifies auth.uid(), active workspace membership and collegio role before appending an idempotent decision receipt.';
