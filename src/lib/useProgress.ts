import { useCallback, useEffect, useState } from 'react'
import { levelKey, nextStreak, toDateKey } from '../games/engine'
import { lessonById } from '../data/lessons'
import { isSupabaseConfigured, loadSupabase } from './supabase'

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
 * Record a cleared level in `game_results` so a parent can see it on another
 * device. Best-effort: the local store is the source of truth for gameplay,
 * and a signed-out or offline child must never be blocked by a failed write.
 */
async function syncResult(lessonId: string, levelIndex: number, xpEarned: number) {
  if (!isSupabaseConfigured) return
  const lesson = lessonById(lessonId)
  if (!lesson) return

  try {
    const supabase = await loadSupabase()
    const { data: auth } = await supabase.auth.getUser()
    const userId = auth.user?.id
    if (!userId) return

    // A child profile is required by the schema; use the first one.
    const { data: children } = await supabase
      .from('children')
      .select('id')
      .eq('parent_id', userId)
      .limit(1)
    const childId = children?.[0]?.id
    if (!childId) return

    const level = lesson.levels.find((l) => l.index === levelIndex)
    await supabase.from('game_results').insert({
      child_id: childId,
      game_id: `${lessonId}:${levelIndex}`,
      subject: lesson.subject,
      age_band: lesson.year,
      score: level?.questions.length ?? 0,
      total: level?.questions.length ?? 0,
      xp_earned: xpEarned,
    })
  } catch {
    // Offline or unauthenticated: the local store already has the progress.
  }
}

/**
 * Progress store. localStorage is the source of truth so the app works
 * offline and before sign-in; cleared levels are also mirrored to
 * `game_results` when Supabase is configured.
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
    void syncResult(lessonId, levelIndex, xpEarned)
  }, [])

  const reset = useCallback(() => setProgress(EMPTY), [])

  return { progress, completeLevel, reset }
}
