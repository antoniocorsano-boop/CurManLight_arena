-- CurManLight Arena Beta — extend explicit development/pilot authority to the
-- adoption authority role without rewriting the authenticated workspace role.
--
-- A Beta tester may hold multiple explicit pilot authority assignments. Each
-- assignment is scoped by authority_role and remains provenance-only: it does
-- not assert a formal production mandate.

alter table public.development_pilot_authority_assignments
  drop constraint if exists development_pilot_authority_assignments_authority_role_check;

alter table public.development_pilot_authority_assignments
  add constraint development_pilot_authority_assignments_authority_role_check
  check (authority_role in ('collegio','dirigente'));

alter table public.development_pilot_authority_assignments
  drop constraint if exists development_pilot_authority_assi_workspace_id_user_id_scope_key;

alter table public.development_pilot_authority_assignments
  add constraint development_pilot_authority_assignments_workspace_user_scope_role_key
  unique (workspace_id, user_id, scope, authority_role);

create index if not exists development_pilot_authority_assignments_role_active_idx
  on public.development_pilot_authority_assignments(workspace_id, user_id, authority_role, status);

comment on column public.development_pilot_authority_assignments.authority_role is
  'Explicit Beta pilot authority role. collegio is used for H4; dirigente is used for the separated adoption phase. Neither value proves a production mandate.';
