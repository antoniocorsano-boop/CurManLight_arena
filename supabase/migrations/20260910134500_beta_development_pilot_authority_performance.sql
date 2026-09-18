-- CurManLight Arena Beta — performance hardening for development/pilot authority provenance.
-- Covers the auth.users foreign key independently of the workspace-leading lookup index.

create index if not exists development_pilot_authority_assignments_user_idx
  on public.development_pilot_authority_assignments(user_id);
