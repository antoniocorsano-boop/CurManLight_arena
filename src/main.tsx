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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
