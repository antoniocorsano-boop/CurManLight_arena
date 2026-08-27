import { FormEvent, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { getOptionalSupabaseBrowserClient } from '../../infrastructure/supabase/client';

type MembershipRow = {
  workspace_id: string;
  user_id: string;
  role: string;
  status: string;
};

export default function BetaIdentityPage() {
  const optional = useMemo(() => getOptionalSupabaseBrowserClient(), []);
  const client = optional.client;
  const [session, setSession] = useState<Session | null>(null);
  const [memberships, setMemberships] = useState<MembershipRow[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const refreshMemberships = async (nextSession: Session | null) => {
    if (!client || !nextSession) {
      setMemberships([]);
      return;
    }

    const { data, error } = await client
      .from('workspace_memberships')
      .select('workspace_id,user_id,role,status')
      .eq('user_id', nextSession.user.id);

    if (error) {
      setMemberships([]);
      setMessage(`Membership non leggibile: ${error.message}`);
      return;
    }

    setMemberships((data ?? []) as MembershipRow[]);
  };

  useEffect(() => {
    if (!client) return;

    void client.auth.getSession().then(({ data }) => {
      setSession(data.session);
      void refreshMemberships(data.session);
    });

    const { data: subscription } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      void refreshMemberships(nextSession);
    });

    return () => subscription.subscription.unsubscribe();
  }, [client]);

  const signIn = async (event: FormEvent) => {
    event.preventDefault();
    if (!client) return;
    setBusy(true);
    setMessage(null);
    const { error } = await client.auth.signInWithPassword({ email, password });
    setBusy(false);
    setMessage(error ? `Accesso non riuscito: ${error.message}` : 'Sessione autenticata creata.');
  };

  const signUp = async () => {
    if (!client) return;
    setBusy(true);
    setMessage(null);
    const { data, error } = await client.auth.signUp({ email, password });
    setBusy(false);
    if (error) {
      setMessage(`Creazione account non riuscita: ${error.message}`);
      return;
    }
    setMessage(data.session ? 'Account creato e sessione autenticata attiva.' : 'Account creato. Controlla l’email se Supabase richiede conferma prima dell’accesso.');
  };

  const signOut = async () => {
    if (!client) return;
    setBusy(true);
    await client.auth.signOut();
    setBusy(false);
    setMessage('Sessione terminata.');
  };

  if (optional.config.status !== 'configured' || !client) {
    return (
      <main style={{ maxWidth: 760, margin: '48px auto', padding: 24, fontFamily: 'system-ui' }}>
        <h1>Identità Beta non configurata</h1>
        <p>Questa pagina è disponibile solo nella build Beta collegata al Supabase canonico.</p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 760, margin: '48px auto', padding: 24, fontFamily: 'system-ui', lineHeight: 1.5 }}>
      <p style={{ marginBottom: 8, fontWeight: 700 }}>CurManLight Arena · BETA-G3</p>
      <h1 style={{ marginTop: 0 }}>Identità e autorità</h1>
      <p>
        Questo punto di verifica usa esclusivamente la sessione Supabase e la membership letta dal database.
        Il ruolo locale dell’app non attribuisce autorità istituzionale.
      </p>

      {!session ? (
        <form onSubmit={signIn} style={{ display: 'grid', gap: 12, marginTop: 24 }}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              style={{ display: 'block', width: '100%', boxSizing: 'border-box', padding: 10, marginTop: 4 }}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              autoComplete="current-password"
              style={{ display: 'block', width: '100%', boxSizing: 'border-box', padding: 10, marginTop: 4 }}
            />
          </label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="submit" disabled={busy} style={{ padding: '10px 16px' }}>Accedi</button>
            <button type="button" disabled={busy || !email || password.length < 8} onClick={signUp} style={{ padding: '10px 16px' }}>
              Crea account Beta
            </button>
          </div>
        </form>
      ) : (
        <section style={{ marginTop: 24 }}>
          <h2>Sessione autenticata</h2>
          <dl>
            <dt>Email</dt><dd>{session.user.email ?? '—'}</dd>
            <dt>User ID</dt><dd><code>{session.user.id}</code></dd>
          </dl>

          <h2>Membership server-backed</h2>
          {memberships.length === 0 ? (
            <p>Nessuna membership disponibile: nessuna autorità istituzionale viene attribuita.</p>
          ) : (
            <ul>
              {memberships.map((membership) => (
                <li key={`${membership.workspace_id}:${membership.user_id}`}>
                  workspace <code>{membership.workspace_id}</code> · ruolo <strong>{membership.role}</strong> · stato <strong>{membership.status}</strong>
                </li>
              ))}
            </ul>
          )}

          <button type="button" disabled={busy} onClick={signOut} style={{ padding: '10px 16px', marginTop: 16 }}>Esci</button>
        </section>
      )}

      {message && <p role="status" style={{ marginTop: 20 }}>{message}</p>}
    </main>
  );
}
