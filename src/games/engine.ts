import type { AgeBand } from '../data/curriculum'
import type { Lesson, Level, Question } from '../data/lessons'

export const MAX_HEARTS = 5
export const XP_PER_CORRECT = 10
export const XP_LESSON_BONUS = 20

/** Later levels are worth more, so replaying an easy level is not optimal. */
export function xpMultiplierForLevel(levelIndex: number): number {
  return 1 + (levelIndex - 1) * 0.25
}

export interface SessionState {
  lessonId: string
  /** 1-based level index within the lesson. */
  levelIndex: number
  band: AgeBand
  index: number
  hearts: number
  xp: number
  correct: number
  answered: number
  /** True once the child has answered the current question. */
  revealed: boolean
  lastAnswerCorrect: boolean | null
  finished: boolean
  failed: boolean
}

export function startSession(lesson: Lesson, band: AgeBand, levelIndex = 1): SessionState {
  return {
    lessonId: lesson.id,
    levelIndex,
    band,
    index: 0,
    hearts: MAX_HEARTS,
    xp: 0,
    correct: 0,
    answered: 0,
    revealed: false,
    lastAnswerCorrect: null,
    finished: false,
    failed: false,
  }
}

/** The level being played, falling back to the first if the index is stale. */
export function levelOf(lesson: Lesson, levelIndex: number): Level | undefined {
  return lesson.levels.find((l) => l.index === levelIndex) ?? lesson.levels[0]
}

export function currentQuestion(lesson: Lesson, state: SessionState): Question | null {
  const level = levelOf(lesson, state.levelIndex)
  return level?.questions[state.index] ?? null
}

/**
 * Record an answer. Baby mode never loses hearts and never fails — the
 * child simply retries, which keeps the experience encouraging for 1-3.
 */
export function answer(state: SessionState, isCorrect: boolean, band: AgeBand): SessionState {
  const hasHearts = band !== '1-3' && band !== '4-6'
  const next: SessionState = {
    ...state,
    answered: state.answered + 1,
    revealed: true,
    lastAnswerCorrect: isCorrect,
  }

  if (isCorrect) {
    next.correct = state.correct + 1
    next.xp = state.xp + Math.round(XP_PER_CORRECT * xpMultiplierForLevel(state.levelIndex))
  } else if (hasHearts) {
    next.hearts = Math.max(0, state.hearts - 1)
    if (next.hearts === 0) {
      next.failed = true
      next.finished = true
    }
  }

  return next
}

/** Advance to the next question, or finish the level. */
export function advance(lesson: Lesson, state: SessionState): SessionState {
  if (state.finished) return state

  const level = levelOf(lesson, state.levelIndex)
  const total = level?.questions.length ?? 0
  const isLast = state.index >= total - 1
  if (isLast) {
    const bonus = Math.round(XP_LESSON_BONUS * xpMultiplierForLevel(state.levelIndex))
    return { ...state, finished: true, xp: state.xp + bonus }
  }

  return {
    ...state,
    index: state.index + 1,
    revealed: false,
    lastAnswerCorrect: null,
  }
}

export function accuracy(state: SessionState): number {
  if (state.answered === 0) return 0
  return Math.round((state.correct / state.answered) * 100)
}

/** Stars awarded for the lesson summary: 0-3. */
export function stars(state: SessionState): number {
  if (state.failed) return 0
  const acc = accuracy(state)
  if (acc >= 90) return 3
  if (acc >= 70) return 2
  if (acc >= 50) return 1
  return 0
}

/**
 * Streak update. A streak continues when the child plays on consecutive
 * days, and resets when a day is missed. Baby mode has no streaks.
 */
export function nextStreak(
  currentStreak: number,
  lastPlayedOn: string | null,
  today = new Date(),
): number {
  const todayKey = toDateKey(today)
  if (!lastPlayedOn) return 1
  if (lastPlayedOn === todayKey) return Math.max(currentStreak, 1)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (lastPlayedOn === toDateKey(yesterday)) return currentStreak + 1

  return 1
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Level curve: each level needs progressively more XP. */
export function levelForXp(xp: number): { level: number; intoLevel: number; needed: number } {
  let level = 1
  let remaining = xp
  let needed = 100
  while (remaining >= needed) {
    remaining -= needed
    level += 1
    needed = Math.round(needed * 1.25)
  }
  return { level, intoLevel: remaining, needed }
}

/** Stable key for "this level of this lesson", used by the progress store. */
export function levelKey(lessonId: string, levelIndex: number): string {
  return `${lessonId}:${levelIndex}`
}

/**
 * A level unlocks once the previous one is cleared. Level 1 is always open,
 * so a child can never be locked out of a lesson entirely.
 */
export function isLevelUnlocked(
  lesson: Lesson,
  levelIndex: number,
  completedLevels: string[],
): boolean {
  if (levelIndex <= 1) return true
  return completedLevels.includes(levelKey(lesson.id, levelIndex - 1))
}

/** How many of a lesson's levels are cleared. */
export function clearedLevelCount(lesson: Lesson, completedLevels: string[]): number {
  return lesson.levels.filter((l) => completedLevels.includes(levelKey(lesson.id, l.index))).length
}

/** True once every level of the lesson is cleared. */
export function isLessonComplete(lesson: Lesson, completedLevels: string[]): boolean {
  return clearedLevelCount(lesson, completedLevels) === lesson.levels.length
}
