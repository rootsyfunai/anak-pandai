/**
 * Anak Pandai service worker.
 *
 * The goal is narrow: make the app open and playable with no network, without
 * ever serving a stale build. That rules out the usual "cache everything"
 * recipe, so the strategy is split by request type:
 *
 *   - Navigations  → network-first. A deploy must be picked up immediately,
 *                    and the cached shell is only a fallback for offline.
 *   - Hashed assets → cache-first. Vite content-hashes these, so a cached
 *                    copy can never be stale; a changed file is a new URL.
 *   - Supabase API → never cached. Auth tokens and order data must not be
 *                    written to disk, and a cached API response would show
 *                    one parent another parent's data.
 *
 * Bump CACHE_VERSION on any change to this file's logic. The activate handler
 * deletes every cache that does not match, which is what evicts old builds.
 */

const CACHE_VERSION = 'v2'
const SHELL_CACHE = `ap-shell-${CACHE_VERSION}`
const ASSET_CACHE = `ap-assets-${CACHE_VERSION}`
const OFFLINE_URL = '/offline.html'

/**
 * The minimum needed to render something useful offline. Hashed build assets
 * are not listed here because their names are not known at author time; they
 * are cached on first fetch instead.
 *
 * The shell HTML is precached rather than relying on the navigation handler:
 * the worker does not control the page during its own install, so the very
 * first navigation is never intercepted. Without this, a user who installs
 * the app and immediately goes offline would have no cached shell at all.
 */
const PRECACHE = [
  '/',
  '/offline.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE)
      // addAll rejects the whole batch if any single request fails, which
      // would leave the worker uninstalled. Add individually instead.
      await Promise.all(
        PRECACHE.map((url) => cache.add(new Request(url, { cache: 'reload' })).catch(() => {})),
      )
      await self.skipWaiting()
    })(),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys
          .filter((key) => key !== SHELL_CACHE && key !== ASSET_CACHE)
          .map((key) => caches.delete(key)),
      )
      await self.clients.claim()
    })(),
  )
})

/** True for Vite's content-hashed build output, which is safe to cache forever. */
function isImmutableAsset(url) {
  return /^\/assets\/.+-[A-Za-z0-9_-]{8,}\.(js|css|woff2?|png|jpe?g|webp|avif|svg)$/.test(
    url.pathname,
  )
}

/** True for the small set of unhashed UI chrome in public/. */
function isStaticChrome(url) {
  return (
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/favicon.svg' ||
    url.pathname === '/manifest.webmanifest'
  )
}

self.addEventListener('fetch', (event) => {
  const { request } = event

  // Only GET is cacheable, and cross-origin requests (Supabase, YouTube,
  // Cloudflare images) are left entirely to the browser.
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // Navigations: network-first so a deploy is picked up on the next load,
  // falling back to the cached shell and then the offline page.
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request)
          // Only cache a real success. Caching an error page here would
          // poison the offline fallback for every future navigation.
          if (response.ok) {
            const cache = await caches.open(SHELL_CACHE)
            cache.put('/', response.clone())
          }
          return response
        } catch {
          // Offline. Prefer the cached shell so the app opens fully; fall back
          // to the standalone offline page, which is self-contained.
          const cached = await caches.match('/')
          if (cached) return cached
          const offline = await caches.match(OFFLINE_URL)
          if (offline) return offline
          return new Response('Offline', { status: 503, statusText: 'Offline' })
        }
      })(),
    )
    return
  }

  // Hashed assets and UI chrome: cache-first, since the URL changes whenever
  // the content does.
  if (isImmutableAsset(url) || isStaticChrome(url)) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request)
        if (cached) return cached
        try {
          const response = await fetch(request)
          if (response.ok) {
            const cache = await caches.open(ASSET_CACHE)
            cache.put(request, response.clone())
          }
          return response
        } catch {
          return new Response('', { status: 504, statusText: 'Offline' })
        }
      })(),
    )
  }

  // Everything else same-origin (the HTML shell, robots.txt, …) goes to the
  // network with no caching, so nothing stale can be served.
})
