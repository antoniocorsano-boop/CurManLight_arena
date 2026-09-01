-- CurManLight Arena R7A3 — shared frozen proposal snapshot
-- A v2 institutional decision is admissible only when the server already owns
-- the exact immutable proposal-version payload and has recomputed its SHA-256.

create extension if not exists pgcrypto;

create table if not exists public.institutional_revision_proposal_snapshots (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete restrict,
  proposal_ref text not null,
  proposal_version_ref text not null,
  proposal_version_fingerprint text not null check (proposal_version_fingerprint ~ '^[a-f0-9]{64}$'),
  snapshot_payload text not null,
  snapshot_json jsonb not null,
  frozen_by uuid not null,
  frozen_at timestamptz not null default now(),
  unique (workspace_id, proposal_version_ref),
  check (jsonb_typeof(snapshot_json) = 'object')
);

alter table public.institutional_revision_proposal_snapshots enable row level security;
revoke insert, update, delete on public.institutional_revision_proposal_snapshots from authenticated;
grant select on public.institutional_revision_proposal_snapshots to authenticated;

drop policy if exists institutional_revision_proposal_snapshots_read on public.institutional_revision_proposal_snapshots;
create policy institutional_revision_proposal_snapshots_read
on public.institutional_revision_proposal_snapshots for select to authenticated
using (exists (
  select 1 from public.workspace_memberships membership
  where membership.workspace_id = institutional_revision_proposal_snapshots.workspace_id
    and membership.user_id = auth.uid()
    and membership.status = 'active'
));

create or replace function public.freeze_institutional_revision_proposal_snapshot_v1(
  p_workspace_id uuid,
  p_proposal_ref text,
  p_proposal_version_ref text,
  p_expected_fingerprint text,
  p_snapshot_payload text
)
returns setof public.institutional_revision_proposal_snapshots
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_role text;
  v_json jsonb;
  v_fingerprint text;
  v_existing public.institutional_revision_proposal_snapshots%rowtype;
begin
  if v_user_id is null then raise exception 'AUTHENTICATION_REQUIRED' using errcode = '42501'; end if;
  if p_workspace_id is null
     or nullif(trim(p_proposal_ref), '') is null
     or nullif(trim(p_proposal_version_ref), '') is null
     or lower(coalesce(p_expected_fingerprint, '')) !~ '^[a-f0-9]{64}$'
     or nullif(p_snapshot_payload, '') is null then
    raise exception 'INVALID_FROZEN_PROPOSAL_SNAPSHOT_INPUT' using errcode = '22023';
  end if;

  select membership.role into v_role
  from public.workspace_memberships membership
  join public.workspaces workspace on workspace.id = membership.workspace_id
  where membership.workspace_id = p_workspace_id
    and membership.user_id = v_user_id
    and membership.status = 'active'
    and workspace.status = 'active';
  if v_role is distinct from 'collegio' then raise exception 'REVISION_DECIDE_REQUIRED' using errcode = '42501'; end if;

  begin
    v_json := p_snapshot_payload::jsonb;
  exception when others then
    raise exception 'INVALID_FROZEN_PROPOSAL_SNAPSHOT_JSON' using errcode = '22023';
  end;

  if jsonb_typeof(v_json) <> 'object'
     or v_json->>'id' is distinct from trim(p_proposal_version_ref)
     or v_json->>'proposalRef' is distinct from trim(p_proposal_ref)
     or coalesce((v_json->>'frozen')::boolean, false) is not true then
    raise exception 'FROZEN_PROPOSAL_SNAPSHOT_BINDING_MISMATCH' using errcode = '23514';
  end if;

  v_fingerprint := encode(digest(convert_to(p_snapshot_payload, 'UTF8'), 'sha256'), 'hex');
  if v_fingerprint <> lower(p_expected_fingerprint) then
    raise exception 'FROZEN_PROPOSAL_SNAPSHOT_FINGERPRINT_MISMATCH' using errcode = '23514';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_workspace_id::text || ':' || trim(p_proposal_version_ref), 0));
  select * into v_existing from public.institutional_revision_proposal_snapshots snapshot
  where snapshot.workspace_id = p_workspace_id and snapshot.proposal_version_ref = trim(p_proposal_version_ref);
  if found then
    if v_existing.proposal_ref <> trim(p_proposal_ref)
       or v_existing.proposal_version_fingerprint <> v_fingerprint
       or v_existing.snapshot_payload <> p_snapshot_payload
       or v_existing.snapshot_json <> v_json then
      raise exception 'FROZEN_PROPOSAL_SNAPSHOT_IMMUTABILITY_VIOLATION' using errcode = '23514';
    end if;
    return next v_existing; return;
  end if;

  insert into public.institutional_revision_proposal_snapshots (
    workspace_id, proposal_ref, proposal_version_ref, proposal_version_fingerprint,
    snapshot_payload, snapshot_json, frozen_by
  ) values (
    p_workspace_id, trim(p_proposal_ref), trim(p_proposal_version_ref), v_fingerprint,
    p_snapshot_payload, v_json, v_user_id
  ) returning * into v_existing;

  return next v_existing;
end;
$$;

revoke all on function public.freeze_institutional_revision_proposal_snapshot_v1(uuid, text, text, text, text) from public;
grant execute on function public.freeze_institutional_revision_proposal_snapshot_v1(uuid, text, text, text, text) to authenticated;

create or replace function public.require_frozen_proposal_snapshot_for_v2_decision()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.adoption_binding_version = 2 and not exists (
    select 1
    from public.institutional_revision_proposal_snapshots snapshot
    where snapshot.workspace_id = new.workspace_id
      and snapshot.proposal_ref = new.proposal_ref
      and snapshot.proposal_version_ref = new.proposal_version_ref
      and snapshot.proposal_version_fingerprint = new.proposal_version_fingerprint
  ) then
    raise exception 'FROZEN_PROPOSAL_SNAPSHOT_REQUIRED' using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists institutional_revision_decisions_require_frozen_snapshot on public.institutional_revision_decisions;
create trigger institutional_revision_decisions_require_frozen_snapshot
before insert on public.institutional_revision_decisions
for each row execute function public.require_frozen_proposal_snapshot_for_v2_decision();

comment on table public.institutional_revision_proposal_snapshots is
  'R7A3 immutable server-owned proposal-version snapshots. Direct writes are forbidden; SHA-256 is recomputed server-side from the exact frozen payload.';
