import type { SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/**
 * Supabase is optional at runtime: the app runs in local-only mode when
 * credentials are absent, which keeps `npm run dev` usable before a
 * project has been provisioned.
 */
export const isSupabaseConfigured = Boolean(url && anonKey)

let client: SupabaseClient | null = null
let pending: Promise<SupabaseClient> | null = null

/**
 * Loads the Supabase client on demand.
 *
 * `@supabase/supabase-js` is ~30KB gzipped and is only needed once a user
 * actually signs in, pays, or opens the admin dashboard. Importing it
 * statically would put it in the initial bundle that every visitor
 * downloads, so it is fetched dynamically and cached after first use.
 */
export function loadSupabase(): Promise<SupabaseClient> {
  if (client) return Promise.resolve(client)
  if (!isSupabaseConfigured) {
    return Promise.reject(
      new Error(
        'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local',
      ),
    )
  }
  if (!pending) {
    pending = import('@supabase/supabase-js').then(({ createClient }) => {
      client = createClient(url as string, anonKey as string, {
        auth: { persistSession: true, autoRefreshToken: true },
      })
      return client
    })
  }
  return pending
}
