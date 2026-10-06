import { describe, expect, it } from 'vitest'
import { AGE_BANDS, ageBandForBirthYear } from './curriculum'
import { LESSONS, lessonsFor } from './lessons'

describe('ageBandForBirthYear', () => {
  const now = new Date('2026-06-01')

  it('maps a 2-year-old to the baby band', () => {
    expect(ageBandForBirthYear(2024, now)).toBe('1-3')
  })

  it('maps a 5-year-old to KSPK', () => {
    expect(ageBandForBirthYear(2021, now)).toBe('4-6')
  })

  it('maps an 8-year-old to KSSR Tahap 1', () => {
    expect(ageBandForBirthYear(2018, now)).toBe('7-9')
  })

  it('maps an 11-year-old to KSSR Tahap 2', () => {
    expect(ageBandForBirthYear(2015, now)).toBe('10-12')
  })
})

describe('age band config', () => {
  it('disables hearts and streaks for the baby band', () => {
    expect(AGE_BANDS['1-3'].hasHearts).toBe(false)
    expect(AGE_BANDS['1-3'].hasStreaks).toBe(false)
    expect(AGE_BANDS['1-3'].isBabyMode).toBe(true)
  })

  it('enables hearts for reading-age bands', () => {
    expect(AGE_BANDS['7-9'].hasHearts).toBe(true)
    expect(AGE_BANDS['10-12'].hasHearts).toBe(true)
  })

  it('includes Sejarah only in the 10-12 band', () => {
    expect(AGE_BANDS['10-12'].subjects).toContain('sejarah')
    expect(AGE_BANDS['7-9'].subjects).not.toContain('sejarah')
  })
})

describe('lesson content', () => {
  it('has lessons for every band', () => {
    for (const band of ['1-3', '4-6', '7-9', '10-12'] as const) {
      expect(LESSONS.some((l) => l.band === band)).toBe(true)
    }
  })

  it('only assigns lessons to subjects valid for their band', () => {
    for (const lesson of LESSONS) {
      expect(AGE_BANDS[lesson.band].subjects).toContain(lesson.subject)
    }
  })

  it('gives every choice question an answer among its options', () => {
    for (const lesson of LESSONS) {
      for (const q of lesson.questions) {
        if (q.kind === 'choice' || q.kind === 'listen') {
          expect(q.options).toContain(q.answer)
        }
      }
    }
  })

  it('uses unique question ids within a lesson', () => {
    for (const lesson of LESSONS) {
      const ids = lesson.questions.map((q) => q.id)
      expect(new Set(ids).size).toBe(ids.length)
    }
  })

  it('filters lessons by band and subject', () => {
    const bm = lessonsFor('7-9', 'bm')
    expect(bm.length).toBeGreaterThan(0)
    expect(bm.every((l) => l.band === '7-9' && l.subject === 'bm')).toBe(true)
  })
})
