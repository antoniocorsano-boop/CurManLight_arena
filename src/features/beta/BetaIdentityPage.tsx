import { FormEvent, useEffect, useMemo, useState, type CSSProperties } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Link } from 'react-router-dom';
import {
  getOptionalSupabaseBrowserClient,
  resolveBetaIdentityRedirectUrl,
} from '../../infrastructure/supabase/client';

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

type AuthMode = 'sign-in' | 'sign-up' | 'forgot-password' | 'recovery';

const colors = {
  ink: '#172033',
  muted: '#667085',
  border: '#d7ddeb',
  panel: '#ffffff',
  page: '#f5f7fb',
  primary: '#4a3fd7',
  primaryDark: '#372db9',
  success: '#087b5a',
  successBg: '#ecfdf5',
  warning: '#8a5a00',
  warningBg: '#fff8e7',
  error: '#b42318',
  errorBg: '#fef3f2',
};

const pageStyle: CSSProperties = {
  minHeight: '100vh',
  boxSizing: 'border-box',
  margin: 0,
  padding: '24px 16px 48px',
  fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  lineHeight: 1.5,
  background: colors.page,
  color: colors.ink,
};

const shellStyle: CSSProperties = { width: '100%', maxWidth: 520, margin: '0 auto' };
const panelStyle: CSSProperties = {
  marginTop: 18,
  padding: '24px 20px',
  borderRadius: 20,
  background: colors.panel,
  border: `1px solid ${colors.border}`,
  boxShadow: '0 18px 45px rgba(29, 41, 57, 0.08)',
};
const inputStyle: CSSProperties = {
  display: 'block',
  width: '100%',
  boxSizing: 'border-box',
  minHeight: 52,
  padding: '12px 14px',
  marginTop: 7,
  border: '1px solid #b8c2d8',
  borderRadius: 12,
  color: colors.ink,
  background: '#ffffff',
  fontSize: 16,
  outline: 'none',
};
const labelStyle: CSSProperties = { display: 'block', fontWeight: 700, color: '#344054' };
const primaryButtonStyle: CSSProperties = {
  width: '100%',
  minHeight: 52,
  border: 0,
  borderRadius: 12,
  padding: '12px 16px',
  background: colors.primary,
  color: '#ffffff',
  fontSize: 16,
  fontWeight: 800,
  cursor: 'pointer',
};
const secondaryButtonStyle: CSSProperties = {
  minHeight: 44,
  border: `1px solid ${colors.border}`,
  borderRadius: 10,
  padding: '10px 14px',
  background: '#ffffff',
  color: '#344054',
  fontSize: 15,
  fontWeight: 700,
  cursor: 'pointer',
};
const linkButtonStyle: CSSProperties = {
  border: 0,
  padding: 0,
  background: 'transparent',
  color: colors.primary,
  font: 'inherit',
  fontWeight: 900,
  cursor: 'pointer',
  textDecoration: 'underline',
};

function roleLabel(role: string) {
  switch (role) {
    case 'docente': return 'Docente';
    case 'dipartimento': return 'Dipartimento';
    case 'referente': return 'Referente';
    case 'dirigente': return 'Dirigente';
    case 'amministratore': return 'Amministratore';
    default: return role;
  }
}

function hasRecoveryHint() {
  if (typeof window === 'undefined') return false;
  return window.location.hash.includes('type=recovery')
    || window.location.search.includes('type=recovery')
    || window.location.search.includes('recovery=1');
}

export default function BetaIdentityPage() {
  const optional = useMemo(() => getOptionalSupabaseBrowserClient(), []);
  const client = optional.client;
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

  const [session, setSession] = useState<Session | null>(null);
  const [memberships, setMemberships] = useState<MembershipRow[]>([]);
  const [authMode, setAuthMode] = useState<AuthMode>(() => hasRecoveryHint() ? 'recovery' : 'sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [recoveryPassword, setRecoveryPassword] = useState('');
  const [recoveryPasswordConfirm, setRecoveryPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageKind, setMessageKind] = useState<'success' | 'error' | 'info'>('info');
  const [awaitingEmailConfirmation, setAwaitingEmailConfirmation] = useState(false);
  const [transportProbe, setTransportProbe] = useState<ProbeState>({ status: 'idle', detail: 'Non verificato' });
  const [apiProbe, setApiProbe] = useState<ProbeState>({ status: 'idle', detail: 'Non verificata' });

  const probeTransport = async () => {
    if (!supabaseUrl) {
      setTransportProbe({ status: 'http-error', detail: 'Configurazione Beta incompleta' });
      return false;
    }
    setTransportProbe({ status: 'checking', detail: 'Verifica HTTPS in corso…' });
    try {
      await fetch(`${supabaseUrl.replace(/\/$/, '')}/auth/v1/health`, {
        method: 'GET', mode: 'no-cors', cache: 'no-store',
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
    setApiProbe({ status: 'checking', detail: 'Verifica API in corso…' });
    try {
      const response = await fetch(`${supabaseUrl.replace(/\/$/, '')}/auth/v1/settings`, {
        method: 'GET', headers: { apikey: publishableKey }, cache: 'no-store',
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

  const probeSupabase = async () => Promise.all([probeTransport(), probeApi()]);

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
      setMessageKind('error');
      setMessage(`Non riesco a leggere l'appartenenza al team: ${error.message}`);
      return;
    }
    setMemberships((data ?? []) as MembershipRow[]);
  };

  useEffect(() => {
    if (!client) return;
    void probeSupabase();
    void client.auth.getSession().then(({ data }) => {
      setSession(data.session);
      void refreshMemberships(data.session);
    });

    const { data: subscription } = client.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      if (event === 'PASSWORD_RECOVERY') {
        setAuthMode('recovery');
        setMessageKind('info');
        setMessage('Link di recupero verificato. Imposta ora una nuova password.');
      }
      void refreshMemberships(nextSession);
    });
    return () => subscription.subscription.unsubscribe();
  }, [client]);

  const signIn = async () => {
    if (!client) return;
    setBusy(true);
    setMessage(null);
    const { error } = await client.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      const authCode = (error as { code?: string }).code;
      if (authCode === 'email_not_confirmed' || /email not confirmed/i.test(error.message)) {
        setAwaitingEmailConfirmation(true);
        setMessageKind('info');
        setMessage('Account creato, ma email non ancora confermata. Apri il messaggio ricevuto e conferma l’indirizzo prima di accedere.');
        return;
      }
      setMessageKind('error');
      setMessage('Accesso non riuscito. Controlla email e password oppure usa “Password dimenticata?”.');
      if (/failed to fetch|network/i.test(error.message)) void probeSupabase();
      return;
    }
    setAwaitingEmailConfirmation(false);
    setMessageKind('success');
    setMessage('Accesso effettuato. Ora puoi entrare nel lavoro condiviso del team.');
  };

  const signUp = async () => {
    if (!client) return;
    if (password !== passwordConfirm) {
      setMessageKind('error');
      setMessage('Le due password non coincidono.');
      return;
    }
    setBusy(true);
    setMessage(null);
    const { data, error } = await client.auth.signUp({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      setMessageKind('error');
      setMessage(`Creazione account non riuscita: ${error.message}`);
      if (/failed to fetch|network/i.test(error.message)) void probeSupabase();
      return;
    }
    setMessageKind('success');
    if (data.session) {
      setAwaitingEmailConfirmation(false);
      setMessage('Account creato. La sessione è già attiva.');
    } else {
      setAwaitingEmailConfirmation(true);
      setAuthMode('sign-in');
      setPassword('');
      setPasswordConfirm('');
      setMessage('Account creato. Ti abbiamo inviato un’email: conferma l’indirizzo prima di accedere.');
    }
  };

  const requestPasswordReset = async () => {
    if (!client || !email.trim()) return;
    setBusy(true);
    setMessage(null);
    const redirectTo = resolveBetaIdentityRedirectUrl();
    const { error } = await client.auth.resetPasswordForEmail(
      email.trim(),
      redirectTo ? { redirectTo } : undefined,
    );
    setBusy(false);
    if (error) {
      setMessageKind('error');
      setMessage('Non riesco a inviare il messaggio di recupero. Verifica la connessione e riprova.');
      return;
    }
    setMessageKind('success');
    setMessage('Se l’indirizzo corrisponde a un account Beta, riceverai un’email con il link per impostare una nuova password. Controlla anche Spam o Posta indesiderata.');
  };

  const updateRecoveredPassword = async () => {
    if (!client) return;
    if (recoveryPassword.length < 8) {
      setMessageKind('error');
      setMessage('La nuova password deve contenere almeno 8 caratteri.');
      return;
    }
    if (recoveryPassword !== recoveryPasswordConfirm) {
      setMessageKind('error');
      setMessage('Le due nuove password non coincidono.');
      return;
    }
    setBusy(true);
    const { error } = await client.auth.updateUser({ password: recoveryPassword });
    setBusy(false);
    if (error) {
      setMessageKind('error');
      setMessage('Il link di recupero non è valido o è scaduto. Richiedi un nuovo messaggio di recupero.');
      return;
    }
    setRecoveryPassword('');
    setRecoveryPasswordConfirm('');
    setAuthMode('sign-in');
    setMessageKind('success');
    setMessage('Password aggiornata. La sessione è attiva e puoi continuare nel lavoro del team.');
  };

  const resendConfirmation = async () => {
    if (!client || !email.trim()) return;
    setBusy(true);
    const { error } = await client.auth.resend({ type: 'signup', email: email.trim() });
    setBusy(false);
    if (error) {
      setMessageKind('error');
      setMessage('Non riesco a reinviare l’email di conferma. Riprova tra poco.');
      return;
    }
    setMessageKind('success');
    setMessage('Email di conferma inviata di nuovo. Controlla anche la cartella Spam o Posta indesiderata.');
  };

  const submitAuth = async (event: FormEvent) => {
    event.preventDefault();
    if (authMode === 'sign-up') await signUp();
    else if (authMode === 'forgot-password') await requestPasswordReset();
    else if (authMode === 'recovery') await updateRecoveredPassword();
    else await signIn();
  };

  const signOut = async () => {
    if (!client) return;
    setBusy(true);
    await client.auth.signOut();
    setBusy(false);
    setAuthMode('sign-in');
    setMessageKind('info');
    setMessage('Sessione terminata.');
  };

  const switchMode = (nextMode: AuthMode) => {
    setAuthMode(nextMode);
    setMessage(null);
    setAwaitingEmailConfirmation(false);
    setPassword('');
    setPasswordConfirm('');
    setRecoveryPassword('');
    setRecoveryPasswordConfirm('');
  };

  if (optional.config.status !== 'configured' || !client) {
    return (
      <main style={pageStyle}>
        <div style={shellStyle}>
          <Link to="/revisione" style={{ color: colors.primary, fontWeight: 800, textDecoration: 'none' }}>← Torna alla revisione</Link>
          <section style={panelStyle}>
            <p style={{ margin: 0, color: colors.error, fontWeight: 800 }}>Accesso non disponibile</p>
            <h1 style={{ margin: '6px 0 8px', fontSize: 28 }}>Identità Beta non configurata</h1>
            <p style={{ marginBottom: 0, color: colors.muted }}>Questa build non è collegata al servizio di identità necessario per il lavoro del team.</p>
          </section>
        </div>
      </main>
    );
  }

  const endpointHost = supabaseUrl ? new URL(supabaseUrl).hostname : '—';
  const browserOnline = typeof navigator === 'undefined' ? '—' : navigator.onLine ? 'sì' : 'no';
  const transportReachable = transportProbe.status === 'reachable';
  const apiReachable = apiProbe.status === 'reachable';
  const apiBlocked = apiProbe.status === 'unreachable';
  const connectionReady = transportReachable && apiReachable;
  const activeMemberships = memberships.filter((membership) => membership.status === 'active');
  const diagnosticMessage = transportReachable && apiBlocked
    ? 'Il telefono raggiunge Supabase via HTTPS, ma il browser blocca la richiesta API cross-origin.'
    : transportProbe.status === 'unreachable'
      ? 'Il telefono non raggiunge il servizio di identità. Controlla rete, VPN, DNS privato o filtri del browser.'
      : apiReachable
        ? 'Connessione al servizio di identità disponibile.'
        : 'Diagnostica in corso o non ancora conclusiva.';
  const messageStyle: CSSProperties = messageKind === 'error'
    ? { background: colors.errorBg, color: colors.error, border: '1px solid #fecdca' }
    : messageKind === 'success'
      ? { background: colors.successBg, color: colors.success, border: '1px solid #abefc6' }
      : { background: '#f2f4f7', color: '#475467', border: '1px solid #e4e7ec' };

  const recoveryActive = authMode === 'recovery';
  const unauthenticated = !session || authMode === 'forgot-password' || authMode === 'sign-up' || recoveryActive;
  const title = recoveryActive
    ? 'Imposta una nuova password'
    : authMode === 'forgot-password'
      ? 'Recupera la password'
      : session
        ? 'Accesso effettuato'
        : authMode === 'sign-up'
          ? 'Crea il tuo accesso'
          : 'Accedi al lavoro del team';

  return (
    <main style={pageStyle}>
      <div style={shellStyle}>
        <Link to="/revisione" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: colors.primary, fontWeight: 800, textDecoration: 'none' }}>
          ← Torna alla revisione
        </Link>

        <section style={panelStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <span style={{ display: 'inline-block', padding: '5px 9px', borderRadius: 999, background: '#eeecff', color: colors.primaryDark, fontSize: 12, fontWeight: 900, letterSpacing: '.04em' }}>
                CURMANLIGHT ARENA · BETA
              </span>
              <h1 style={{ margin: '14px 0 8px', fontSize: 'clamp(28px, 7vw, 36px)', lineHeight: 1.12 }}>{title}</h1>
            </div>
            {unauthenticated && !recoveryActive && (
              <span aria-label={connectionReady ? 'Connessione disponibile' : 'Connessione in verifica'} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 10px', borderRadius: 999, background: connectionReady ? colors.successBg : '#f2f4f7', color: connectionReady ? colors.success : colors.muted, fontSize: 13, fontWeight: 800 }}>
                <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: 999, background: connectionReady ? '#12b76a' : '#98a2b3' }} />
                {connectionReady ? 'Connessione disponibile' : 'Verifica connessione'}
              </span>
            )}
          </div>

          {unauthenticated ? (
            <>
              <p style={{ margin: '0 0 22px', color: colors.muted, fontSize: 16 }}>
                {recoveryActive
                  ? 'Scegli una nuova password per il tuo account Beta. Questo passaggio modifica soltanto le credenziali di accesso e non attribuisce ruoli o autorità.'
                  : authMode === 'forgot-password'
                    ? 'Inserisci l’email del tuo account Beta. Riceverai un link personale per impostare una nuova password.'
                    : 'Usa il tuo account Beta per vedere e condividere i contributi del team. L’accesso identifica la persona, ma non attribuisce automaticamente alcuna autorità istituzionale.'}
              </p>

              <form onSubmit={submitAuth} style={{ display: 'grid', gap: 18 }}>
                {!recoveryActive && (
                  <label style={labelStyle}>
                    Email
                    <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" inputMode="email" placeholder="nome@esempio.it" style={inputStyle} />
                  </label>
                )}

                {authMode !== 'forgot-password' && !recoveryActive && (
                  <label style={labelStyle}>
                    Password
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                        minLength={8}
                        autoComplete={authMode === 'sign-up' ? 'new-password' : 'current-password'}
                        placeholder="Almeno 8 caratteri"
                        style={{ ...inputStyle, paddingRight: 86 }}
                      />
                      <button type="button" onClick={() => setShowPassword((current) => !current)} aria-pressed={showPassword} style={{ position: 'absolute', right: 8, top: 13, border: 0, background: 'transparent', color: colors.primary, fontWeight: 800, padding: '8px 9px', cursor: 'pointer' }}>
                        {showPassword ? 'Nascondi' : 'Mostra'}
                      </button>
                    </div>
                  </label>
                )}

                {authMode === 'sign-up' && (
                  <label style={labelStyle}>
                    Conferma password
                    <input type={showPassword ? 'text' : 'password'} value={passwordConfirm} onChange={(event) => setPasswordConfirm(event.target.value)} required minLength={8} autoComplete="new-password" placeholder="Ripeti la password" style={inputStyle} />
                  </label>
                )}

                {recoveryActive && (
                  <>
                    <label style={labelStyle}>
                      Nuova password
                      <input type={showPassword ? 'text' : 'password'} value={recoveryPassword} onChange={(event) => setRecoveryPassword(event.target.value)} required minLength={8} autoComplete="new-password" placeholder="Almeno 8 caratteri" style={inputStyle} />
                    </label>
                    <label style={labelStyle}>
                      Conferma nuova password
                      <input type={showPassword ? 'text' : 'password'} value={recoveryPasswordConfirm} onChange={(event) => setRecoveryPasswordConfirm(event.target.value)} required minLength={8} autoComplete="new-password" placeholder="Ripeti la nuova password" style={inputStyle} />
                    </label>
                  </>
                )}

                {message && (
                  <p role="status" aria-live="polite" style={{ ...messageStyle, margin: 0, padding: '11px 12px', borderRadius: 10, fontWeight: 700 }}>{message}</p>
                )}

                {awaitingEmailConfirmation && (
                  <section style={{ padding: 14, borderRadius: 12, background: colors.warningBg, border: '1px solid #fedf89' }}>
                    <strong style={{ display: 'block', color: colors.warning }}>Conferma la tua email</strong>
                    <p style={{ margin: '6px 0 12px', color: '#754c00' }}>L’account esiste già. Prima del primo accesso devi aprire l’email di conferma ricevuta dal servizio Beta.</p>
                    <button type="button" onClick={() => void resendConfirmation()} disabled={busy} style={secondaryButtonStyle}>{busy ? 'Invio in corso…' : 'Invia di nuovo l’email di conferma'}</button>
                  </section>
                )}

                <button
                  type="submit"
                  disabled={busy
                    || (authMode !== 'recovery' && !email.trim())
                    || (authMode === 'sign-in' && password.length < 8)
                    || (authMode === 'sign-up' && (password.length < 8 || passwordConfirm.length < 8))
                    || (authMode === 'recovery' && (recoveryPassword.length < 8 || recoveryPasswordConfirm.length < 8))}
                  style={{ ...primaryButtonStyle, opacity: busy ? 0.65 : 1 }}
                >
                  {busy
                    ? 'Attendi…'
                    : recoveryActive
                      ? 'Salva nuova password'
                      : authMode === 'forgot-password'
                        ? 'Invia email di recupero'
                        : authMode === 'sign-up'
                          ? 'Crea account Beta'
                          : 'Accedi'}
                </button>
              </form>

              {authMode === 'sign-in' && (
                <div style={{ marginTop: 14, textAlign: 'center' }}>
                  <button type="button" onClick={() => switchMode('forgot-password')} style={linkButtonStyle}>Password dimenticata?</button>
                </div>
              )}

              <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid #eaecf0', textAlign: 'center' }}>
                {authMode === 'forgot-password' || recoveryActive ? (
                  <button type="button" onClick={() => switchMode('sign-in')} style={linkButtonStyle}>Torna all’accesso</button>
                ) : (
                  <p style={{ margin: 0, color: colors.muted }}>
                    {authMode === 'sign-up' ? 'Hai già un account?' : 'Non hai ancora un account Beta?'}{' '}
                    <button type="button" onClick={() => switchMode(authMode === 'sign-in' ? 'sign-up' : 'sign-in')} style={linkButtonStyle}>
                      {authMode === 'sign-up' ? 'Accedi' : 'Crea account'}
                    </button>
                  </p>
                )}
              </div>

              <p style={{ margin: '18px 0 0', color: '#7b8497', fontSize: 13, textAlign: 'center' }}>
                Le credenziali vengono inviate direttamente al servizio di autenticazione tramite HTTPS. Arena non usa la password per attribuire ruoli o decisioni.
              </p>
            </>
          ) : (
            <>
              <p style={{ margin: '0 0 18px', color: colors.muted }}>Sei autenticato come <strong style={{ color: colors.ink }}>{session?.user.email ?? 'utente Beta'}</strong>.</p>
              {message && <p role="status" aria-live="polite" style={{ ...messageStyle, margin: '0 0 18px', padding: '11px 12px', borderRadius: 10, fontWeight: 700 }}>{message}</p>}

              {activeMemberships.length === 0 ? (
                <section style={{ padding: 16, borderRadius: 14, background: colors.warningBg, border: '1px solid #fedf89' }}>
                  <strong style={{ display: 'block', color: colors.warning }}>Account riconosciuto, team non ancora associato</strong>
                  <p style={{ margin: '7px 0 0', color: '#754c00' }}>Puoi accedere all’app, ma questo account non risulta ancora membro attivo di un team. Nessuna autorità viene attribuita.</p>
                </section>
              ) : (
                <section>
                  <h2 style={{ margin: '0 0 12px', fontSize: 20 }}>I tuoi team</h2>
                  <div style={{ display: 'grid', gap: 10 }}>
                    {activeMemberships.map((membership) => (
                      <article key={`${membership.workspace_id}:${membership.user_id}`} style={{ padding: 14, borderRadius: 12, border: `1px solid ${colors.border}`, background: '#fbfcff' }}>
                        <strong style={{ display: 'block' }}>{roleLabel(membership.role)}</strong>
                        <span style={{ color: colors.success, fontSize: 14, fontWeight: 800 }}>Membership attiva</span>
                        <details style={{ marginTop: 7, color: colors.muted, fontSize: 13 }}>
                          <summary style={{ cursor: 'pointer' }}>Dettagli tecnici</summary>
                          <code style={{ wordBreak: 'break-all' }}>{membership.workspace_id}</code>
                        </details>
                      </article>
                    ))}
                  </div>
                </section>
              )}

              <Link to="/revisione" style={{ ...primaryButtonStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', marginTop: 20, textDecoration: 'none' }}>Continua alla revisione</Link>
              <button type="button" disabled={busy} onClick={signOut} style={{ ...secondaryButtonStyle, width: '100%', marginTop: 10 }}>Esci dall’account</button>
            </>
          )}

          <details style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid #eaecf0' }}>
            <summary style={{ cursor: 'pointer', color: '#475467', fontWeight: 800 }}>Problemi di connessione?</summary>
            <section aria-label="Diagnostica connessione Supabase" style={{ marginTop: 12, padding: 14, border: '1px solid #e4e7ec', borderRadius: 12, background: '#f8f9fb' }}>
              <p style={{ margin: '0 0 6px' }}>Trasporto HTTPS: <strong>{transportProbe.status.toUpperCase()}</strong></p>
              <p style={{ margin: '0 0 6px' }}>API/CORS: <strong>{apiProbe.status.toUpperCase()}</strong></p>
              <p style={{ margin: '0 0 6px' }}>Browser online: <strong>{browserOnline}</strong></p>
              <p style={{ margin: '0 0 10px', wordBreak: 'break-all' }}>Endpoint: <code>{endpointHost}</code></p>
              <p role="status" style={{ margin: '0 0 12px', color: colors.muted }}>{diagnosticMessage}</p>
              <button type="button" onClick={() => void probeSupabase()} disabled={transportProbe.status === 'checking' || apiProbe.status === 'checking'} style={secondaryButtonStyle}>Verifica connessione</button>
            </section>
          </details>
        </section>
      </div>
    </main>
  );
}
