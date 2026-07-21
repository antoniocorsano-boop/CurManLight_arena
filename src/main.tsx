// Intercept and silence external browser extension errors (e.g. Grammarly, Adblock, password managers)
window.addEventListener('unhandledrejection', function (event) {
  if (event.reason && event.reason.message && event.reason.message.includes('A listener indicated an asynchronous response')) {
    event.preventDefault();
    console.warn("[CurManLight Safe-Guard] Intercettato e silenziato avviso asincrono relativo alle estensioni esterne del browser.");
  }
});

// Force unregister and clear all old PWA caches to prevent old cached files from showing a white screen
if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
  try {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      for (let registration of registrations) {
        registration.unregister().then(() => {
          console.log('Old Service Worker successfully removed.');
        });
      }
    }).catch(e => {
      console.warn("ServiceWorker registration read blocked:", e);
    });
  } catch (e) {
    console.warn("ServiceWorker unregistration blocked:", e);
  }
  try {
    caches.keys().then(function(names) {
      for (let name of names) {
        caches.delete(name);
      }
    }).catch(e => {
      console.warn("Caches read blocked:", e);
    });
  } catch (e) {
    console.warn("Caches delete blocked:", e);
  }
}

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

class ErrorBoundary extends React.Component<
 { children: React.ReactNode },
 { hasError: boolean; error: Error | null }
> {
 state = { hasError: false, error: null as Error | null };

 static getDerivedStateFromError(error: Error) {
  return { hasError: true, error };
 }

 render() {
  if (this.state.hasError) {
   return (
    <div style={{ padding: 32, fontFamily: 'system-ui', maxWidth: 600, margin: '40px auto' }}>
     <h1 style={{ color: '#dc2626' }}>Si e verificato un errore imprevisto</h1>
     <p style={{ color: '#64748b' }}>
      L'applicazione ha riscontrato un errore critico. Prova a ricaricare la pagina.
     </p>
     <pre style={{ background: '#f1f5f9', padding: 16, borderRadius: 8, overflow: 'auto', fontSize: 12 }}>
      {this.state.error?.message}
     </pre>
     <button
      onClick={() => { localStorage.removeItem('curmanlight_stato_consolidato'); window.location.reload(); }}
      style={{ marginTop: 16, padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
     >
      Ricarica (azzera stato)
     </button>
    </div>
   );
  }
  return this.props.children;
 }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
 <React.StrictMode>
  <ErrorBoundary>
   <App />
  </ErrorBoundary>
 </React.StrictMode>,
)
