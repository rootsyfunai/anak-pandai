import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '../components/Button'
import { Logo } from '../components/Logo'
import { resetPassword } from '../lib/api'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await resetPassword(token, password)
      navigate('/masuk')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal set semula kata laluan.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-100 to-cream-50">
      <header className="mx-auto flex max-w-md items-center justify-between px-4 py-5">
        <Logo />
        <Link to="/masuk" className="font-bold text-ink-300 hover:text-brand-700">
          Kembali
        </Link>
      </header>

      <main className="mx-auto max-w-md px-4 pb-16">
        <div className="card-3d">
          <h1 className="text-2xl font-black text-ink-900">Kata laluan baharu</h1>

          {!token ? (
            <p className="mt-4 text-sm font-bold text-red-600">
              Pautan ini tidak lengkap. Sila minta pautan baharu.
            </p>
          ) : (
            <form onSubmit={submit} className="mt-5 space-y-4">
              <label className="block">
                <span className="text-sm font-extrabold text-ink-700">Kata laluan baharu</span>
                <input
                  type="password"
                  value={password}
                  required
                  minLength={8}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-xl border-2 border-cream-200 px-4 py-3 outline-none focus:border-brand-400"
                />
              </label>

              {error && <p className="text-sm font-bold text-red-600">{error}</p>}

              <Button type="submit" disabled={busy} className="w-full py-4">
                {busy ? 'Menyimpan…' : 'Simpan kata laluan'}
              </Button>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}
