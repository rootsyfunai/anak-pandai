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
      for (const level of lesson.levels) {
        for (const q of level.questions) {
          if (q.kind === 'choice' || q.kind === 'listen') {
            expect(q.options).toContain(q.answer)
          }
        }
      }
    }
  })

  it('uses unique question ids within a lesson', () => {
    for (const lesson of LESSONS) {
      const ids = lesson.levels.flatMap((l) => l.questions.map((q) => q.id))
      expect(new Set(ids).size).toBe(ids.length)
    }
  })

  it('numbers levels from 1 without gaps', () => {
    for (const lesson of LESSONS) {
      const indices = lesson.levels.map((l) => l.index)
      expect(indices).toEqual(indices.map((_, i) => i + 1))
    }
  })

  it('gives every level at least one question', () => {
    for (const lesson of LESSONS) {
      for (const level of lesson.levels) {
        expect(level.questions.length).toBeGreaterThan(0)
      }
    }
  })

  it('gives every fillblank question an answer among its options', () => {
    for (const lesson of LESSONS) {
      for (const level of lesson.levels) {
        for (const q of level.questions) {
          if (q.kind === 'fillblank') {
            expect(q.options).toContain(q.answer)
            expect(q.sentence).toContain('___')
          }
        }
      }
    }
  })

  it('gives every dragdrop slot at least one accepted token', () => {
    for (const lesson of LESSONS) {
      for (const level of lesson.levels) {
        for (const q of level.questions) {
          if (q.kind === 'dragdrop') {
            for (const slot of q.slots) {
              expect(slot.accepts.length).toBeGreaterThan(0)
              for (const token of slot.accepts) {
                expect(q.tokens).toContain(token)
              }
            }
          }
        }
      }
    }
  })

  it('gives every sort item a bucket that exists', () => {
    for (const lesson of LESSONS) {
      for (const level of lesson.levels) {
        for (const q of level.questions) {
          if (q.kind === 'sort') {
            const bucketIds = q.buckets.map((b) => b.id)
            for (const item of q.items) {
              expect(bucketIds).toContain(item.bucket)
            }
          }
        }
      }
    }
  })

  it('gives every story question an answer among its options', () => {
    for (const lesson of LESSONS) {
      for (const level of lesson.levels) {
        for (const q of level.questions) {
          if (q.kind === 'story') {
            expect(q.panels.length).toBeGreaterThan(0)
            for (const sq of q.questions) {
              expect(sq.options).toContain(sq.answer)
            }
          }
        }
      }
    }
  })

  it('filters lessons by band and subject', () => {
    const bm = lessonsFor('7-9', 'bm')
    expect(bm.length).toBeGreaterThan(0)
    expect(bm.every((l) => l.band === '7-9' && l.subject === 'bm')).toBe(true)
  })
})
