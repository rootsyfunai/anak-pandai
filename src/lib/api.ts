export interface ApiUser {
  id: string
  email: string
  full_name: string | null
  is_admin: boolean
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

let cachedUser: ApiUser | null | undefined

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  headers.set('Content-Type', 'application/json')
  const response = await fetch(`/api${path}`, {
    ...init,
    credentials: 'same-origin',
    headers,
  })
  const body = (await response.json()) as { error?: string } & T
  if (!response.ok) throw new ApiError(body.error ?? 'Permintaan gagal.', response.status)
  return body
}

export function signUp(email: string, password: string, fullName: string) {
  return request<{ user: ApiUser }>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, fullName }),
  })
}

export function signIn(email: string, password: string) {
  return request<{ user: ApiUser }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function signOut() {
  try {
    await request<{ ok: boolean }>('/auth/logout', { method: 'POST' })
  } finally {
    cachedUser = null
  }
}

export function requestPasswordReset(email: string) {
  return request<{ ok: boolean; message: string }>('/auth/forgot', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export function resetPassword(token: string, password: string) {
  return request<{ ok: boolean }>('/auth/reset', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  })
}

export async function currentUser(): Promise<ApiUser | null> {
  if (cachedUser !== undefined) return cachedUser
  try {
    const result = await request<{ user: ApiUser | null }>('/auth/me')
    cachedUser = result.user
    return cachedUser
  } catch {
    cachedUser = null
    return null
  }
}

export function clearCurrentUser() {
  cachedUser = null
}

export interface AccessState {
  user: ApiUser | null
  hasAccess: boolean
  isAdmin: boolean
}

/** Whether the signed-in parent has paid access. Anonymous users never do. */
export async function getAccess(): Promise<AccessState> {
  try {
    const result = await request<AccessState>('/access')
    cachedUser = result.user
    return result
  } catch {
    return { user: null, hasAccess: false, isAdmin: false }
  }
}

export interface ProgressData {
  childName: string
  xp: number
  streakDays: number
  lastPlayedOn: string | null
  completedLevels: string[]
}

/**
 * Returns `authenticated: false` when the visitor is signed out so the caller
 * can keep progress local without treating that as an error.
 */
export async function getProgress(): Promise<{
  authenticated: boolean
  progress: ProgressData | null
}> {
  try {
    const result = await request<{ progress: ProgressData | null }>('/progress')
    return { authenticated: true, progress: result.progress }
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 503)) {
      return { authenticated: false, progress: null }
    }
    throw error
  }
}

export function saveProgress(progress: ProgressData) {
  return request<{ progress: ProgressData }>('/progress', {
    method: 'PUT',
    body: JSON.stringify(progress),
  })
}

export interface Order {
  id: string
  amount_myr: number
  affiliate_code: string | null
  reference_note: string
  proof_path?: string
  status: string
  created_at: string
  parent_id?: string
  parent_email?: string
}

export async function submitOrder(file: File, note: string, affiliateCode: string | null) {
  const form = new FormData()
  form.append('proof', file)
  form.append('referenceNote', note)
  if (affiliateCode) form.append('affiliateCode', affiliateCode)
  const response = await fetch('/api/orders', {
    method: 'POST',
    credentials: 'same-origin',
    body: form,
  })
  const body = (await response.json()) as { error?: string }
  if (!response.ok) throw new ApiError(body.error ?? 'Gagal menghantar.', response.status)
}

export function listOrders() {
  return request<{ orders: Order[] }>('/admin/orders')
}

export function decideOrder(id: string, approve: boolean) {
  return request<{ order: Order }>(`/admin/orders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: approve ? 'approved' : 'rejected' }),
  })
}

/** Same-origin URL that redirects to a short-lived presigned R2 link. */
export function receiptUrl(orderId: string) {
  return `/api/admin/orders/${orderId}/proof`
}
