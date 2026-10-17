export interface ApiUser {
  id: string
  email: string
  full_name: string | null
  is_admin: boolean
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
  if (!response.ok) throw new Error(body.error ?? 'Permintaan gagal.')
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

export interface Order {
  id: string
  amount_myr: number
  affiliate_code: string | null
  reference_note: string
  proof_path?: string
  status: string
  created_at: string
  parent_id?: string
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
  if (!response.ok) throw new Error(body.error ?? 'Gagal menghantar.')
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
