import { useCallback, useEffect, useState } from 'react'
import { levelKey, nextStreak, toDateKey } from '../games/engine'

const KEY = 'ap_progress'

export interface Progress {
  childName: string
  xp: number
  streakDays: number
  lastPlayedOn: string | null
  /** Keys of the form `lessonId:levelIndex`. */
  completedLevels: string[]
}

const EMPTY: Progress = {
  childName: 'Anak Saya',
  xp: 0,
  streakDays: 0,
  lastPlayedOn: null,
  completedLevels: [],
}

/**
 * Older builds stored a flat `completedLessons` array. Treat each of those
 * as level 1 cleared, so an existing child does not lose their progress.
 */
function migrate(raw: Record<string, unknown>): Progress {
  const merged = { ...EMPTY, ...(raw as Partial<Progress>) }
  const legacy = raw.completedLessons
  if (Array.isArray(legacy) && merged.completedLevels.length === 0) {
    merged.completedLevels = legacy.map((id) => levelKey(String(id), 1))
  }
  return merged
}

function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return EMPTY
    return migrate(JSON.parse(raw) as Record<string, unknown>)
  } catch {
    return EMPTY
  }
}

/**
 * Local progress store. Keeps the app usable before Supabase is wired up;
 * the same shape is written to `game_results` once auth is in place.
 */
export function useProgress() {
  const [progress, setProgress] = useState<Progress>(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(progress))
    } catch {
      // Storage may be unavailable; progress simply won't persist.
    }
  }, [progress])

  const completeLevel = useCallback((lessonId: string, levelIndex: number, xpEarned: number) => {
    setProgress((prev) => {
      const today = toDateKey(new Date())
      const key = levelKey(lessonId, levelIndex)
      const alreadyDone = prev.completedLevels.includes(key)
      return {
        ...prev,
        xp: prev.xp + xpEarned,
        streakDays: nextStreak(prev.streakDays, prev.lastPlayedOn),
        lastPlayedOn: today,
        completedLevels: alreadyDone ? prev.completedLevels : [...prev.completedLevels, key],
      }
    })
  }, [])

  const reset = useCallback(() => setProgress(EMPTY), [])

  return { progress, completeLevel, reset }
}
