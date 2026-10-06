import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Logo } from '../components/Logo'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

export default function SignIn() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)

    if (!isSupabaseConfigured || !supabase) {
      navigate('/main')
      return
    }

    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)
    if (err) {
      setError(err.message)
      return
    }
    navigate('/main')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      <header className="mx-auto flex max-w-md items-center justify-between px-4 py-5">
        <Logo />
        <Link to="/" className="font-bold text-slate-500 hover:text-brand-700">
          Kembali
        </Link>
      </header>

      <main className="mx-auto max-w-md px-4 pb-16">
        <div className="card-3d">
          <h1 className="text-2xl font-black text-slate-900">Masuk</h1>
          <form onSubmit={submit} className="mt-5 space-y-4">
            <label className="block">
              <span className="text-sm font-extrabold text-slate-700">E-mel</span>
              <input
                type="email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border-2 border-slate-200 px-4 py-3 outline-none focus:border-brand-400"
              />
            </label>
            <label className="block">
              <span className="text-sm font-extrabold text-slate-700">Kata laluan</span>
              <input
                type="password"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border-2 border-slate-200 px-4 py-3 outline-none focus:border-brand-400"
              />
            </label>

            {error && <p className="text-sm font-bold text-red-600">{error}</p>}

            <Button type="submit" disabled={busy} className="w-full py-4">
              {busy ? 'Memproses…' : 'Masuk'}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-500">
            Belum ada akaun?{' '}
            <Link to="/daftar" className="font-bold text-brand-600">
              Daftar
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
