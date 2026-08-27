import { FormEvent, useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { getOptionalSupabaseBrowserClient } from '../../infrastructure/supabase/client';

const REHEARSAL_WORKSPACE_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

type MembershipSnapshot = {
  role: string;
  status: string;
} | null;

export function BetaIdentityRehearsal() {
  const [{ client, config }] = useState(() => getOptionalSupabaseBrowserClient());
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [membership, setMembership] = useState<MembershipSnapshot>(null);
  const [workspaceVisible, setWorkspaceVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const refreshBoundary = useCallback(async () => {
    if (!client || !session?.user?.id) {
      setMembership(null);
      setWorkspaceVisible(false);
      return;
    }

    const [{ data: membershipData, error: membershipError }, { data: workspaceData, error: workspaceError }] = await Promise.all([
      client
        .from('workspace_memberships')
        .select('role,status')
        .eq('workspace_id', REHEARSAL_WORKSPACE_ID)
        .eq('user_id', session.user.id)
        .maybeSingle(),
      client
        .from('workspaces')
        .select('id')
        .eq('id', REHEARSAL_WORKSPACE_ID)
        .maybeSingle(),
    ]);

    if (membershipError) {
      setMessage(`Errore membership: ${membershipError.message}`);
    } else if (workspaceError) {
      setMessage(`Errore workspace: ${workspaceError.message}`);
    }

    setMembership(membershipData ? { role: membershipData.role, status: membershipData.status } : null);
    setWorkspaceVisible(Boolean(workspaceData));
  }, [client, session?.user?.id]);

  useEffect(() => {
    if (!client) return;

    void client.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = client.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => data.subscription.unsubscribe();
  }, [client]);

  useEffect(() => {
    void refreshBoundary();
  }, [refreshBoundary]);

  const signUp = async (event: FormEvent) => {
    event.preventDefault();
    if (!client) return;
    setBusy(true);
    setMessage('');
    const { data, error } = await client.auth.signUp({ email, password });
    setBusy(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage(data.session ? 'Account creato e sessione attiva.' : 'Account creato. Conferma l’email se Supabase lo richiede, poi accedi.');
  };

  const signIn = async () => {
    if (!client) return;
    setBusy(true);
    setMessage('');
    const { error } = await client.auth.signInWithPassword({ email, password });
    setBusy(false);
    setMessage(error ? error.message : 'Sessione Supabase autenticata.');
  };

  const signOut = async () => {
    if (!client) return;
    await client.auth.signOut();
    setMessage('Sessione chiusa.');
  };

  if (!client) {
    return (
      <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
        <div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">Beta Identity Rehearsal</h1>
          <p className="mt-3 text-sm text-red-700">Supabase non disponibile: configurazione {config.status}.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-2xl space-y-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">BETA-G3 · ambiente canonico</p>
          <h1 className="mt-2 text-2xl font-semibold">Identity & Authority Rehearsal</h1>
          <p className="mt-2 text-sm text-slate-600">Pagina isolata per osservare una sessione Supabase reale e l’effetto delle policy RLS sulla membership.</p>
        </section>

        {!session ? (
          <form onSubmit={signUp} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <label className="block text-sm font-medium">
              Email di test
              <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label className="block text-sm font-medium">
              Password
              <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" type="password" autoComplete="current-password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
            <div className="flex flex-wrap gap-2">
              <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" type="submit" disabled={busy}>Crea account di prova</button>
              <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-50" type="button" onClick={signIn} disabled={busy}>Accedi</button>
            </div>
          </form>
        ) : (
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Sessione autenticata</p>
              <p className="mt-1 break-all font-mono text-xs text-slate-600">user_id: {session.user.id}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-100 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">Membership</p>
                <p className="mt-1 font-semibold">{membership ? `${membership.role} · ${membership.status}` : 'nessuna visibile'}</p>
              </div>
              <div className="rounded-xl bg-slate-100 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">Workspace rehearsal</p>
                <p className="mt-1 font-semibold">{workspaceVisible ? 'visibile' : 'non visibile'}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white" type="button" onClick={() => void refreshBoundary()}>Rileggi dal database</button>
              <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold" type="button" onClick={() => void signOut()}>Esci</button>
            </div>
          </section>
        )}

        {message && <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">{message}</p>}
      </div>
    </main>
  );
}
