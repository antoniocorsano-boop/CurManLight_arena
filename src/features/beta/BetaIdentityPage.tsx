import { FormEvent, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { getOptionalSupabaseBrowserClient } from '../../infrastructure/supabase/client';

type MembershipRow = {
  workspace_id: string;
  user_id: string;
  role: string;
  status: string;
};

type ProbeState = {
  status: 'idle' | 'checking' | 'reachable' | 'http-error' | 'unreachable';
  detail: string;
};

const pageStyle = {
  minHeight: '100vh',
  boxSizing: 'border-box' as const,
  margin: 0,
  padding: '48px 24px',
  fontFamily: 'system-ui',
  lineHeight: 1.5,
  background: '#f8f9fa',
  color: '#212529',
};

const panelStyle = {
  maxWidth: 760,
  margin: '0 auto',
  padding: 24,
  borderRadius: 12,
  background: '#ffffff',
  border: '1px solid #dee2e6',
};

const inputStyle = {
  display: 'block',
  width: '100%',
  boxSizing: 'border-box' as const,
  padding: 10,
  marginTop: 4,
  color: '#212529',
  background: '#fff',
};

function hasRecoveryHint() {
  if (typeof window === 'undefined') return false;
  return window.location.hash.includes('type=recovery')
    || window.location.search.includes('type=recovery');
}

export default function BetaIdentityPage() {
  const optional = useMemo(() => getOptionalSupabaseBrowserClient(), []);
  const client = optional.client;
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
  const [session, setSession] = useState<Session | null>(null);
  const [memberships, setMemberships] = useState<MembershipRow[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [recoveryMode, setRecoveryMode] = useState(hasRecoveryHint);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [transportProbe, setTransportProbe] = useState<ProbeState>({ status: 'idle', detail: 'Non verificato' });
  const [apiProbe, setApiProbe] = useState<ProbeState>({ status: 'idle', detail: 'Non verificata' });

  const probeTransport = async () => {
    if (!supabaseUrl) {
      setTransportProbe({ status: 'http-error', detail: 'Configurazione Beta incompleta' });
      return false;
    }

    setTransportProbe({ status: 'checking', detail: 'Verifica HTTPS no-CORS in corso…' });
    try {
      await fetch(`${supabaseUrl.replace(/\/$/, '')}/auth/v1/health`, {
        method: 'GET',
        mode: 'no-cors',
        cache: 'no-store',
      });
      setTransportProbe({ status: 'reachable', detail: 'Trasporto HTTPS raggiungibile' });
      return true;
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'Errore di rete sconosciuto';
      setTransportProbe({ status: 'unreachable', detail: `NETWORK_UNREACHABLE · ${detail}` });
      return false;
    }
  };

  const probeApi = async () => {
    if (!supabaseUrl || !publishableKey) {
      setApiProbe({ status: 'http-error', detail: 'Configurazione Beta incompleta' });
      return false;
    }

    setApiProbe({ status: 'checking', detail: 'Verifica API/CORS in corso…' });
    try {
      const response = await fetch(`${supabaseUrl.replace(/\/$/, '')}/auth/v1/settings`, {
        method: 'GET',
        headers: { apikey: publishableKey },
        cache: 'no-store',
      });

      if (!response.ok) {
        setApiProbe({ status: 'http-error', detail: `Endpoint raggiunto, HTTP ${response.status}` });
        return false;
      }

      setApiProbe({ status: 'reachable', detail: 'API Auth raggiungibile con CORS' });
      return true;
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'Errore di rete sconosciuto';
      setApiProbe({ status: 'unreachable', detail: `FETCH_BLOCKED · ${detail}` });
      return false;
    }
  };

  const probeSupabase = async () => {
    await Promise.all([probeTransport(), probeApi()]);
  };

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

    void probeSupabase();
    void client.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session && hasRecoveryHint()) setRecoveryMode(true);
      void refreshMemberships(data.session);
    });

    const { data: subscription } = client.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      if (event === 'PASSWORD_RECOVERY') {
        setRecoveryMode(true);
        setMessage('Link di recupero verificato. Imposta ora una nuova password.');
      }
      void refreshMemberships(nextSession);
    });

    return () => subscription.subscription.unsubscribe();
  }, [client]);

  const signIn = async (event: FormEvent) => {
    event.preventDefault();
    if (!client) return;
    setBusy(true);
    setMessage(null);
    const { error } = await client.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      setMessage('Accesso non riuscito. Controlla email e password oppure usa “Password dimenticata?”.');
      if (/failed to fetch|network/i.test(error.message)) void probeSupabase();
      return;
    }
    setMessage('Sessione autenticata creata.');
  };

  const signUp = async () => {
    if (!client) return;
    setBusy(true);
    setMessage(null);
    const { data, error } = await client.auth.signUp({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      setMessage(`Creazione account non riuscita: ${error.message}`);
      if (/failed to fetch|network/i.test(error.message)) void probeSupabase();
      return;
    }
    setMessage(data.session ? 'Account creato e sessione autenticata attiva.' : 'Account creato. Controlla l’email se Supabase richiede conferma prima dell’accesso.');
  };

  const requestPasswordReset = async () => {
    if (!client || !email.trim()) {
      setMessage('Inserisci prima l’indirizzo email dell’account Beta.');
      return;
    }
    setBusy(true);
    setMessage(null);
    // Nessun redirectTo esplicito: usiamo il Site URL già autorizzato da Supabase.
    // main.tsx intercetta poi il recovery fragment e lo porta su /beta-identity.
    const { error } = await client.auth.resetPasswordForEmail(email.trim());
    setBusy(false);
    if (error) {
      setMessage('Non riesco a inviare il messaggio di recupero. Riprova tra poco.');
      return;
    }
    setMessage('Se l’indirizzo corrisponde a un account Beta, riceverai un’email di recupero. Apri il nuovo link ricevuto.');
  };

  const updateRecoveredPassword = async (event: FormEvent) => {
    event.preventDefault();
    if (!client) return;
    if (newPassword.length < 8) {
      setMessage('La nuova password deve contenere almeno 8 caratteri.');
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setMessage('Le due nuove password non coincidono.');
      return;
    }
    setBusy(true);
    setMessage(null);
    const { error } = await client.auth.updateUser({ password: newPassword });
    setBusy(false);
    if (error) {
      setMessage('Il link di recupero non è valido o è scaduto. Richiedi una nuova email di recupero.');
      return;
    }
    setNewPassword('');
    setNewPasswordConfirm('');
    setRecoveryMode(false);
    setMessage('Password aggiornata. Puoi continuare con questa sessione oppure accedere di nuovo dalla preview #201.');
    if (typeof window !== 'undefined' && window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  const signOut = async () => {
    if (!client) return;
    setBusy(true);
    await client.auth.signOut();
    setBusy(false);
    setRecoveryMode(false);
    setMessage('Sessione terminata.');
  };

  if (optional.config.status !== 'configured' || !client) {
    return (
      <main style={pageStyle}>
        <section style={panelStyle}>
          <h1>Identità Beta non configurata</h1>
          <p>Questa pagina è disponibile solo nella build Beta collegata al Supabase canonico.</p>
        </section>
      </main>
    );
  }

  const endpointHost = supabaseUrl ? new URL(supabaseUrl).hostname : '—';
  const browserOnline = typeof navigator === 'undefined' ? '—' : navigator.onLine ? 'sì' : 'no';
  const transportReachable = transportProbe.status === 'reachable';
  const apiBlocked = apiProbe.status === 'unreachable';
  const diagnosticMessage = transportReachable && apiBlocked
    ? 'Il telefono raggiunge Supabase via HTTPS, ma il browser blocca la richiesta API cross-origin.'
    : transportProbe.status === 'unreachable'
      ? 'Il telefono non raggiunge il trasporto HTTPS verso Supabase.'
      : apiProbe.status === 'reachable'
        ? 'Trasporto e API/CORS sono entrambi raggiungibili.'
        : 'Diagnostica in corso o non ancora conclusiva.';

  return (
    <main style={pageStyle}>
      <section style={panelStyle}>
        <p style={{ marginBottom: 8, fontWeight: 700 }}>CurManLight Arena · BETA</p>
        <h1 style={{ marginTop: 0 }}>{recoveryMode ? 'Imposta una nuova password' : 'Identità e autorità'}</h1>
        <p>
          L’accesso identifica la persona. Il recupero password non attribuisce ruoli o autorità istituzionale.
        </p>

        {recoveryMode ? (
          <form onSubmit={updateRecoveredPassword} style={{ display: 'grid', gap: 12, marginTop: 24 }}>
            <label>
              Nuova password
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                style={inputStyle}
              />
            </label>
            <label>
              Conferma nuova password
              <input
                type="password"
                value={newPasswordConfirm}
                onChange={(event) => setNewPasswordConfirm(event.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                style={inputStyle}
              />
            </label>
            <button type="submit" disabled={busy} style={{ padding: '10px 16px' }}>
              {busy ? 'Aggiornamento…' : 'Aggiorna password'}
            </button>
          </form>
        ) : !session ? (
          <form onSubmit={signIn} style={{ display: 'grid', gap: 12, marginTop: 24 }}>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                style={inputStyle}
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
                style={inputStyle}
              />
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button type="submit" disabled={busy} style={{ padding: '10px 16px' }}>Accedi</button>
              <button type="button" disabled={busy || !email || password.length < 8} onClick={signUp} style={{ padding: '10px 16px' }}>
                Crea account Beta
              </button>
              <button type="button" disabled={busy || !email.trim()} onClick={() => void requestPasswordReset()} style={{ padding: '10px 16px' }}>
                Password dimenticata?
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

        {message && <p role="status" style={{ marginTop: 20, fontWeight: 700 }}>{message}</p>}

        <details style={{ marginTop: 24 }}>
          <summary style={{ cursor: 'pointer', fontWeight: 700 }}>Problemi di connessione?</summary>
          <section aria-label="Diagnostica connessione Supabase" style={{ marginTop: 12, padding: 16, border: '1px solid #dee2e6', borderRadius: 8, background: '#f8f9fa' }}>
            <p style={{ margin: '4px 0' }}>Trasporto HTTPS: <code>{transportProbe.status.toUpperCase()}</code></p>
            <p style={{ margin: '4px 0' }}>API/CORS: <code>{apiProbe.status.toUpperCase()}</code></p>
            <p style={{ margin: '4px 0' }}>Browser online: <strong>{browserOnline}</strong></p>
            <p style={{ margin: '4px 0' }}>Endpoint: <code>{endpointHost}</code></p>
            <button type="button" onClick={() => void probeSupabase()} disabled={transportProbe.status === 'checking' || apiProbe.status === 'checking'} style={{ padding: '8px 12px', marginTop: 8 }}>
              Verifica connessione
            </button>
            <p role="status" style={{ marginBottom: 0 }}>{diagnosticMessage}</p>
          </section>
        </details>
      </section>
    </main>
  );
}
