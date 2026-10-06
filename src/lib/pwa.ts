/**
 * Service worker registration.
 *
 * Registered only in production builds. In dev the worker would cache Vite's
 * module graph and serve stale modules after an edit, which is a confusing
 * failure mode to debug — and the offline behaviour is not what is being
 * tested during development anyway.
 */
export function registerServiceWorker(): void {
  if (!import.meta.env.PROD) return
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Offline support is an enhancement; a failed registration must never
      // break the app.
    })
  })
}
