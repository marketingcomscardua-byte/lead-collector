if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[PWA] Service Worker registrado com sucesso:', reg.scope);
      })
      .catch((err) => {
        console.error('[PWA] Falha ao registrar Service Worker:', err);
      });
  });
}

// Global PWA Event Handlers
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  (window as any).deferredPrompt = e;
  // Notify UI
  window.dispatchEvent(new CustomEvent('pwa-prompt-ready'));
});

window.addEventListener('appinstalled', () => {
  // Clear the deferredPrompt
  (window as any).deferredPrompt = null;
  // Notify UI
  window.dispatchEvent(new CustomEvent('pwa-installed'));
  console.log('[PWA] Aplicativo instalado com sucesso.');
});
