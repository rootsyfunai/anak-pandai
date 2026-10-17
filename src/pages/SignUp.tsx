import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Logo } from '../components/Logo'
import { signUp } from '../lib/api'

export default function SignUp() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)

    try {
      await signUp(email, password, name)
      navigate('/daftar/bayar')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mendaftar.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-100 to-cream-50">
      <header className="mx-auto flex max-w-md items-center justify-between px-4 py-5">
        <Logo />
        <Link to="/" className="font-bold text-ink-300 hover:text-brand-700">
          Kembali
        </Link>
      </header>

      <main className="mx-auto max-w-md px-4 pb-16">
        <div className="card-3d">
          <h1 className="text-2xl font-black text-ink-900">Daftar akaun</h1>
          <p className="mt-1 text-sm text-ink-500">
            Satu akaun untuk semua anak anda. Bayaran sekali sahaja.
          </p>

          <form onSubmit={submit} className="mt-5 space-y-4">
            <Field label="Nama penuh" value={name} onChange={setName} required />
            <Field label="E-mel" type="email" value={email} onChange={setEmail} required />
            <Field label="Kata laluan" type="password" value={password} onChange={setPassword} required />

            {error && <p className="text-sm font-bold text-red-600">{error}</p>}

            <Button type="submit" disabled={busy} className="w-full py-4">
              {busy ? 'Memproses…' : 'Teruskan ke pembayaran'}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-ink-300">
            Sudah ada akaun?{' '}
            <Link to="/masuk" className="font-bold text-brand-600">
              Masuk
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  required?: boolean
}) {
  return (
    <label className="block">
      <span className="text-sm font-extrabold text-ink-700">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border-2 border-cream-200 px-4 py-3 outline-none focus:border-brand-400"
      />
    </label>
  )
}
