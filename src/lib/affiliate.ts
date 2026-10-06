/**
 * Affiliate link capture.
 *
 * Affiliates share links like https://anakpandai.my/?ref=ALI123
 * The code is captured on first landing and persisted so it survives
 * navigation and the signup flow. It is attached to the order at
 * checkout — the parent never types a code.
 */

const STORAGE_KEY = 'ap_ref'
const COOKIE_KEY = 'ap_ref'
const MAX_AGE_DAYS = 90

export interface CapturedRef {
  code: string
  capturedAt: string
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

function writeCookie(name: string, value: string, days: number): void {
  if (typeof document === 'undefined') return
  const expires = new Date(Date.now() + days * 86_400_000).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`
}

/** Normalise a raw ref value; returns null when it is not usable. */
export function normaliseCode(raw: string | null | undefined): string | null {
  if (!raw) return null
  const code = raw.trim().toUpperCase()
  if (!/^[A-Z0-9_-]{3,32}$/.test(code)) return null
  return code
}

/**
 * Read ?ref= from the current URL and persist it. Safe to call on every
 * page load — an existing capture is not overwritten by a later visit
 * without a ref, but a new ref does replace the old one.
 */
export function captureRefFromUrl(search = window.location.search): CapturedRef | null {
  const params = new URLSearchParams(search)
  const code = normaliseCode(params.get('ref'))
  if (!code) return getStoredRef()

  const captured: CapturedRef = { code, capturedAt: new Date().toISOString() }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(captured))
  } catch {
    // localStorage can be unavailable in private mode; cookie is the fallback.
  }
  writeCookie(COOKIE_KEY, code, MAX_AGE_DAYS)
  return captured
}

export function getStoredRef(): CapturedRef | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as CapturedRef
      if (normaliseCode(parsed.code)) return parsed
    }
  } catch {
    // fall through to cookie
  }
  const fromCookie = normaliseCode(readCookie(COOKIE_KEY))
  return fromCookie ? { code: fromCookie, capturedAt: new Date().toISOString() } : null
}

export function clearRef(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
  if (typeof document !== 'undefined') {
    document.cookie = `${COOKIE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
  }
}

/** Build a shareable affiliate link for a given code. */
export function buildAffiliateLink(code: string, origin = window.location.origin): string {
  return `${origin}/?ref=${encodeURIComponent(code)}`
}
