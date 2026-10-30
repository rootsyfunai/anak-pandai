import { useEffect, useState } from 'react'
import { getAccess, type AccessState } from './api'

export type AccessStatus = 'loading' | 'anonymous' | 'trial' | 'paid'

/**
 * Reads whether the signed-in parent has an approved order. The lesson bundle
 * is static, so this gates the experience rather than the downloaded bytes:
 * unpaid visitors get a bounded trial, paid parents get the full path.
 */
export function useAccess() {
  const [state, setState] = useState<AccessState | null>(null)

  useEffect(() => {
    let cancelled = false
    getAccess().then((result) => {
      if (!cancelled) setState(result)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const status: AccessStatus = !state
    ? 'loading'
    : state.hasAccess
      ? 'paid'
      : state.user
        ? 'trial'
        : 'anonymous'

  return {
    status,
    user: state?.user ?? null,
    isAdmin: state?.isAdmin ?? false,
    refresh: () => getAccess().then(setState),
  }
}
