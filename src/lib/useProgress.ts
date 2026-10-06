import { useCallback, useEffect, useState } from 'react'
import { nextStreak, toDateKey } from '../games/engine'

const KEY = 'ap_progress'

export interface Progress {
  childName: string
  xp: number
  streakDays: number
  lastPlayedOn: string | null
  completedLessons: string[]
}

const EMPTY: Progress = {
  childName: 'Anak Saya',
  xp: 0,
  streakDays: 0,
  lastPlayedOn: null,
  completedLessons: [],
}

function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return EMPTY
    return { ...EMPTY, ...(JSON.parse(raw) as Partial<Progress>) }
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

  const completeLesson = useCallback((lessonId: string, xpEarned: number) => {
    setProgress((prev) => {
      const today = toDateKey(new Date())
      const alreadyDone = prev.completedLessons.includes(lessonId)
      return {
        ...prev,
        xp: prev.xp + xpEarned,
        streakDays: nextStreak(prev.streakDays, prev.lastPlayedOn),
        lastPlayedOn: today,
        completedLessons: alreadyDone
          ? prev.completedLessons
          : [...prev.completedLessons, lessonId],
      }
    })
  }, [])

  const reset = useCallback(() => setProgress(EMPTY), [])

  return { progress, completeLesson, reset }
}
