-- CurManLight Arena B3 hotfix — explicit least-privilege RPC grants
-- Supabase default function privileges can grant EXECUTE directly to anon.
-- PUBLIC revocation alone is therefore insufficient for this SECURITY DEFINER boundary.

revoke execute on function public.record_institutional_revision_decision(
  uuid, text, text, text, text, text, uuid
) from anon;

revoke all on function public.record_institutional_revision_decision(
  uuid, text, text, text, text, text, uuid
) from public;

grant execute on function public.record_institutional_revision_decision(
  uuid, text, text, text, text, text, uuid
) to authenticated;

comment on function public.record_institutional_revision_decision(
  uuid, text, text, text, text, text, uuid
) is
  'Server-authoritative REVISION_DECIDE boundary. EXECUTE is denied to anon and exposed only to authenticated callers, with auth.uid(), active membership and collegio role rechecked inside the function.';
