import { useCallback, useEffect, useRef, useState } from 'react'
import { levelKey, nextStreak, toDateKey } from '../games/engine'
import { getProgress, saveProgress } from './api'

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
 * Merges local (possibly offline) progress with the server copy. Completed
 * levels are unioned and counters take the highest value, so playing on two
 * devices never loses work. A wrong device clock can only skew the streak,
 * not the completed curriculum.
 */
function merge(local: Progress, remote: Progress): Progress {
  return {
    childName: local.childName !== EMPTY.childName ? local.childName : remote.childName,
    xp: Math.max(local.xp, remote.xp),
    streakDays: Math.max(local.streakDays, remote.streakDays),
    lastPlayedOn:
      (local.lastPlayedOn ?? '') >= (remote.lastPlayedOn ?? '')
        ? local.lastPlayedOn
        : remote.lastPlayedOn,
    completedLevels: [...new Set([...remote.completedLevels, ...local.completedLevels])],
  }
}

/**
 * Progress store. Writes to localStorage first so the game loop never waits on
 * the network, then mirrors to Railway for signed-in parents. Visitors who are
 * signed out keep local-only progress.
 */
export function useProgress() {
  const [progress, setProgress] = useState<Progress>(load)
  const current = useRef(progress)

  const apply = useCallback((next: Progress) => {
    current.current = next
    setProgress(next)
  }, [])

  useEffect(() => {
    let cancelled = false
    getProgress()
      .then(({ authenticated, progress: remote }) => {
        if (cancelled || !authenticated) return
        if (!remote) {
          // First visit on this account: seed the server from offline play.
          void saveProgress(current.current).catch(() => {})
          return
        }
        const merged = merge(current.current, remote)
        apply(merged)
        void saveProgress(merged).catch(() => {})
      })
      .catch(() => {
        // Offline or API unavailable: keep playing locally.
      })
    return () => {
      cancelled = true
    }
  }, [apply])

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(progress))
    } catch {
      // Storage may be unavailable; progress simply won't persist.
    }
  }, [progress])

  const completeLevel = useCallback(
    (lessonId: string, levelIndex: number, xpEarned: number) => {
      const prev = current.current
      const today = toDateKey(new Date())
      const key = levelKey(lessonId, levelIndex)
      const alreadyDone = prev.completedLevels.includes(key)
      const next: Progress = {
        ...prev,
        xp: prev.xp + xpEarned,
        streakDays: nextStreak(prev.streakDays, prev.lastPlayedOn),
        lastPlayedOn: today,
        completedLevels: alreadyDone ? prev.completedLevels : [...prev.completedLevels, key],
      }
      apply(next)
      void saveProgress(next).catch(() => {
        // The local copy is authoritative until the next successful sync.
      })
    },
    [apply],
  )

  const reset = useCallback(() => {
    apply(EMPTY)
    void saveProgress(EMPTY).catch(() => {})
  }, [apply])

  return { progress, completeLevel, reset }
}
