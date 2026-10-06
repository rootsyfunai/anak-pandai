import { describe, expect, it } from 'vitest'
import {
  accuracy,
  advance,
  answer,
  clearedLevelCount,
  isLessonComplete,
  isLevelUnlocked,
  levelForXp,
  levelKey,
  levelOf,
  MAX_HEARTS,
  nextStreak,
  stars,
  startSession,
  toDateKey,
  xpMultiplierForLevel,
} from './engine'
import { lessonById } from '../data/lessons'

const lesson = lessonById('kspk-nombor-10')!
const level1 = levelOf(lesson, 1)!

describe('session flow', () => {
  it('starts with full hearts and no progress', () => {
    const s = startSession(lesson, '4-6')
    expect(s.hearts).toBe(MAX_HEARTS)
    expect(s.index).toBe(0)
    expect(s.xp).toBe(0)
    expect(s.finished).toBe(false)
    expect(s.levelIndex).toBe(1)
  })

  it('awards XP for a correct answer', () => {
    const s = answer(startSession(lesson, '7-9'), true, '7-9')
    expect(s.correct).toBe(1)
    expect(s.xp).toBe(10)
    expect(s.hearts).toBe(MAX_HEARTS)
  })

  it('removes a heart for a wrong answer in the 7-9 band', () => {
    const s = answer(startSession(lesson, '7-9'), false, '7-9')
    expect(s.hearts).toBe(MAX_HEARTS - 1)
    expect(s.correct).toBe(0)
  })

  it('never removes hearts in baby mode', () => {
    let s = startSession(lesson, '1-3')
    for (let i = 0; i < 5; i++) s = answer(s, false, '1-3')
    expect(s.hearts).toBe(MAX_HEARTS)
    expect(s.failed).toBe(false)
  })

  it('never removes hearts in the 4-6 band', () => {
    let s = startSession(lesson, '4-6')
    for (let i = 0; i < 5; i++) s = answer(s, false, '4-6')
    expect(s.hearts).toBe(MAX_HEARTS)
  })

  it('fails the lesson when hearts run out', () => {
    let s = startSession(lesson, '7-9')
    for (let i = 0; i < MAX_HEARTS; i++) s = answer(s, false, '7-9')
    expect(s.failed).toBe(true)
    expect(s.finished).toBe(true)
  })

  it('advances through questions and finishes with a bonus', () => {
    let s = startSession(lesson, '7-9')
    const total = level1.questions.length
    for (let i = 0; i < total; i++) {
      s = answer(s, true, '7-9')
      s = advance(lesson, s)
    }
    expect(s.finished).toBe(true)
    expect(s.xp).toBe(total * 10 + 20)
  })
})

describe('level progression', () => {
  it('scales XP with the level index', () => {
    expect(xpMultiplierForLevel(1)).toBe(1)
    expect(xpMultiplierForLevel(2)).toBe(1.25)
    expect(xpMultiplierForLevel(3)).toBe(1.5)
  })

  it('awards more XP for a later level', () => {
    const l1 = answer(startSession(lesson, '7-9', 1), true, '7-9')
    const l3 = answer(startSession(lesson, '7-9', 3), true, '7-9')
    expect(l3.xp).toBeGreaterThan(l1.xp)
  })

  it('always unlocks level 1', () => {
    expect(isLevelUnlocked(lesson, 1, [])).toBe(true)
  })

  it('locks level 2 until level 1 is cleared', () => {
    expect(isLevelUnlocked(lesson, 2, [])).toBe(false)
    expect(isLevelUnlocked(lesson, 2, [levelKey(lesson.id, 1)])).toBe(true)
  })

  it('counts cleared levels', () => {
    expect(clearedLevelCount(lesson, [])).toBe(0)
    expect(clearedLevelCount(lesson, [levelKey(lesson.id, 1)])).toBe(1)
  })

  it('reports the lesson complete only when every level is cleared', () => {
    const all = lesson.levels.map((l) => levelKey(lesson.id, l.index))
    expect(isLessonComplete(lesson, all.slice(0, -1))).toBe(false)
    expect(isLessonComplete(lesson, all)).toBe(true)
  })

  it('falls back to the first level for a stale index', () => {
    expect(levelOf(lesson, 99)?.index).toBe(1)
  })
})

describe('scoring', () => {
  it('computes accuracy', () => {
    let s = startSession(lesson, '7-9')
    s = answer(s, true, '7-9')
    s = answer(s, false, '7-9')
    expect(accuracy(s)).toBe(50)
  })

  it('awards three stars for high accuracy', () => {
    let s = startSession(lesson, '7-9')
    for (let i = 0; i < 10; i++) s = answer(s, true, '7-9')
    expect(stars(s)).toBe(3)
  })

  it('awards no stars when the lesson is failed', () => {
    let s = startSession(lesson, '7-9')
    for (let i = 0; i < MAX_HEARTS; i++) s = answer(s, false, '7-9')
    expect(stars(s)).toBe(0)
  })
})

describe('streaks', () => {
  const today = new Date('2026-03-10T10:00:00')

  it('starts at one on the first play', () => {
    expect(nextStreak(0, null, today)).toBe(1)
  })

  it('does not increment twice in one day', () => {
    expect(nextStreak(4, '2026-03-10', today)).toBe(4)
  })

  it('increments on a consecutive day', () => {
    expect(nextStreak(4, '2026-03-09', today)).toBe(5)
  })

  it('resets after a missed day', () => {
    expect(nextStreak(9, '2026-03-01', today)).toBe(1)
  })

  it('formats a date key', () => {
    expect(toDateKey(today)).toBe('2026-03-10')
  })
})

describe('levels', () => {
  it('starts at level 1', () => {
    expect(levelForXp(0).level).toBe(1)
  })

  it('levels up after 100 XP', () => {
    expect(levelForXp(100).level).toBe(2)
  })

  it('reports progress within the current level', () => {
    const { level, intoLevel } = levelForXp(150)
    expect(level).toBe(2)
    expect(intoLevel).toBe(50)
  })
})
