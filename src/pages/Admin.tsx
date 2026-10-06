import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/Button'
import { Logo } from '../components/Logo'
import { formatMYR } from '../lib/config'
import { isSupabaseConfigured, loadSupabase } from '../lib/supabase'

interface PendingOrder {
  id: string
  amount_myr: number
  affiliate_code: string | null
  reference_note: string
  file_name?: string
  proof_path?: string
  status: string
  created_at: string
}

export default function Admin() {
  const [orders, setOrders] = useState<PendingOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void load()
  }, [])

  async function load() {
    setLoading(true)
    setError(null)

    if (!isSupabaseConfigured) {
      const local = JSON.parse(localStorage.getItem('ap_pending_orders') ?? '[]') as PendingOrder[]
      setOrders(local)
      setLoading(false)
      return
    }

    const supabase = await loadSupabase()
    const { data, error: err } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    if (err) setError(err.message)
    else setOrders((data ?? []) as PendingOrder[])
    setLoading(false)
  }

  async function decide(order: PendingOrder, approve: boolean) {
    if (!isSupabaseConfigured) {
      const local = JSON.parse(localStorage.getItem('ap_pending_orders') ?? '[]') as PendingOrder[]
      const next = local.map((o) =>
        o.id === order.id ? { ...o, status: approve ? 'approved' : 'rejected' } : o,
      )
      localStorage.setItem('ap_pending_orders', JSON.stringify(next))
      setOrders(next)
      return
    }

    const supabase = await loadSupabase()
    const { error: err } = await supabase
      .from('orders')
      .update({
        status: approve ? 'approved' : 'rejected',
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', order.id)
    if (err) {
      setError(err.message)
      return
    }

    if (approve) {
      await supabase.from('entitlements').insert({
        parent_id: (order as PendingOrder & { parent_id: string }).parent_id,
        order_id: order.id,
      })
    }
    await load()
  }

  const pending = orders.filter((o) => o.status === 'pending')
  const totalCommission = orders
    .filter((o) => o.status === 'approved')
    .reduce((sum, o) => sum + o.amount_myr * 0.5, 0)

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b-2 border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Logo />
          <span className="rounded-full bg-slate-900 px-3 py-1 text-sm font-extrabold text-white">
            Admin
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        {!isSupabaseConfigured && (
          <p className="mb-4 rounded-xl bg-amber-100 px-4 py-3 text-sm font-bold text-amber-800">
            Mod tempatan — Supabase belum dikonfigurasi. Pesanan disimpan dalam pelayar sahaja.
          </p>
        )}

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Stat label="Menunggu semakan" value={pending.length} />
          <Stat label="Jumlah pesanan" value={orders.length} />
          <Stat label="Komisen terkumpul" value={formatMYR(totalCommission)} />
        </div>

        {error && (
          <p className="mb-4 rounded-xl bg-red-100 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </p>
        )}

        <h2 className="mb-3 font-black text-slate-900">Pesanan</h2>
        {loading ? (
          <p className="font-bold text-slate-500">Memuatkan…</p>
        ) : orders.length === 0 ? (
          <p className="card-3d text-center font-bold text-slate-500">Tiada pesanan lagi.</p>
        ) : (
          <ul className="space-y-3">
            {orders.map((o) => (
              <li key={o.id} className="card-3d">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-slate-900">{formatMYR(o.amount_myr)}</p>
                    <p className="text-sm text-slate-500">
                      {new Date(o.created_at).toLocaleString('ms-MY')}
                    </p>
                    {o.affiliate_code && (
                      <p className="mt-1 text-sm font-bold text-brand-600">
                        Kod affiliate: {o.affiliate_code}
                      </p>
                    )}
                    {o.reference_note && (
                      <p className="mt-1 text-sm text-slate-600">Nota: {o.reference_note}</p>
                    )}
                    {o.proof_path && (
                      <p className="mt-1 text-xs text-slate-400">Resit: {o.proof_path}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill status={o.status} />
                    {o.status === 'pending' && (
                      <>
                        <Button
                          variant="success"
                          className="px-4 py-2 text-sm"
                          onClick={() => decide(o, true)}
                        >
                          Lulus
                        </Button>
                        <Button
                          variant="danger"
                          className="px-4 py-2 text-sm"
                          onClick={() => decide(o, false)}
                        >
                          Tolak
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 text-center">
          <Link to="/main">
            <Button variant="neutral">Ke App</Button>
          </Link>
        </div>
      </main>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card-3d">
      <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-2xl font-black text-slate-900">{value}</p>
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const tone =
    status === 'approved'
      ? 'bg-green-100 text-green-700'
      : status === 'rejected'
        ? 'bg-red-100 text-red-700'
        : 'bg-amber-100 text-amber-700'
  const label =
    status === 'approved' ? 'Diluluskan' : status === 'rejected' ? 'Ditolak' : 'Menunggu'
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${tone}`}>{label}</span>
  )
}
