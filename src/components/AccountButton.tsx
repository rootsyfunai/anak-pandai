import { Link, useNavigate } from 'react-router-dom'
import { signOut } from '../lib/api'

export function AccountButton({
  email,
  signedIn = Boolean(email),
}: {
  email: string | null
  signedIn?: boolean
}) {
  const navigate = useNavigate()

  if (!signedIn) {
    return (
      <Link to="/masuk" className="text-sm font-bold text-ink-300 hover:text-brand-700">
        Masuk
      </Link>
    )
  }

  return (
    <button
      onClick={async () => {
        await signOut()
        navigate('/')
      }}
      className="text-sm font-bold text-ink-300 hover:text-brand-700"
      title={email ?? undefined}
    >
      Keluar
    </button>
  )
}
