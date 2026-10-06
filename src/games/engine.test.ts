import { describe, expect, it } from 'vitest'
import {
  accuracy,
  advance,
  answer,
  levelForXp,
  MAX_HEARTS,
  nextStreak,
  stars,
  startSession,
  toDateKey,
} from './engine'
import { lessonById } from '../data/lessons'

const lesson = lessonById('kspk-nombor-10')!

describe('session flow', () => {
  it('starts with full hearts and no progress', () => {
    const s = startSession(lesson, '4-6')
    expect(s.hearts).toBe(MAX_HEARTS)
    expect(s.index).toBe(0)
    expect(s.xp).toBe(0)
    expect(s.finished).toBe(false)
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
    const total = lesson.questions.length
    for (let i = 0; i < total; i++) {
      s = answer(s, true, '7-9')
      s = advance(lesson, s)
    }
    expect(s.finished).toBe(true)
    expect(s.xp).toBe(total * 10 + 20)
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
