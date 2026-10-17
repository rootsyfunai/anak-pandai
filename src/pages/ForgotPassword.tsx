import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/Button'
import { Logo } from '../components/Logo'
import { requestPasswordReset } from '../lib/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const result = await requestPasswordReset(email)
      setMessage(result.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghantar pautan.')
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
          <h1 className="text-2xl font-black text-ink-900">Lupa kata laluan</h1>
          <p className="mt-1 text-sm text-ink-500">
            Masukkan e-mel anda dan kami akan hantar pautan untuk set semula kata laluan.
          </p>

          <form onSubmit={submit} className="mt-5 space-y-4">
            <label className="block">
              <span className="text-sm font-extrabold text-ink-700">E-mel</span>
              <input
                type="email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border-2 border-cream-200 px-4 py-3 outline-none focus:border-brand-400"
              />
            </label>

            {message && <p className="text-sm font-bold text-green-700">{message}</p>}
            {error && <p className="text-sm font-bold text-red-600">{error}</p>}

            <Button type="submit" disabled={busy} className="w-full py-4">
              {busy ? 'Menghantar…' : 'Hantar pautan'}
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
