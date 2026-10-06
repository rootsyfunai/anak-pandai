import { Link } from 'react-router-dom'
import { APP_NAME } from '../lib/config'

export function Logo({ to = '/' }: { to?: string }) {
  return (
    <Link to={to} className="flex items-center gap-2">
      <span className="text-3xl">🦉</span>
      <span className="text-xl font-black tracking-tight text-brand-700">{APP_NAME}</span>
    </Link>
  )
}
