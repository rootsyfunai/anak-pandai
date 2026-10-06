import { MAX_HEARTS } from '../games/engine'

export function Hearts({ hearts }: { hearts: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${hearts} nyawa`}>
      {Array.from({ length: MAX_HEARTS }, (_, i) => (
        <span key={i} className={i < hearts ? '' : 'opacity-25 grayscale'}>
          ❤️
        </span>
      ))}
    </div>
  )
}

export function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max === 0 ? 0 : Math.min(100, (value / max) * 100)
  return (
    <div className="h-4 w-full overflow-hidden rounded-full bg-slate-200">
      <div
        className="h-full rounded-full bg-green-500 transition-all duration-300"
        style={{ width: `${pct}%` }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      />
    </div>
  )
}

export function StreakBadge({ days }: { days: number }) {
  if (days <= 0) return null
  return (
    <div className="flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 font-extrabold text-orange-600">
      <span>🔥</span>
      <span>{days}</span>
    </div>
  )
}

export function XpBadge({ xp }: { xp: number }) {
  return (
    <div className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 font-extrabold text-amber-700">
      <span>⭐</span>
      <span>{xp}</span>
    </div>
  )
}
