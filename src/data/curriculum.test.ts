import { describe, expect, it } from 'vitest'
import { SCHOOL_YEARS, SCHOOL_YEAR_ORDER, schoolYearForBirthYear } from './curriculum'
import { LESSONS, lessonsForYear } from './lessons'

describe('schoolYearForBirthYear', () => {
  const now = new Date('2026-06-01')

  it('maps a 2-year-old to baby mode', () => {
    expect(schoolYearForBirthYear(2024, now)).toBe('baby')
  })

  it('maps a 5-year-old to Prasekolah', () => {
    expect(schoolYearForBirthYear(2021, now)).toBe('prasekolah')
  })

  it('maps an 8-year-old to Tahun 2', () => {
    expect(schoolYearForBirthYear(2018, now)).toBe('tahun2')
  })

  it('maps an 11-year-old to Tahun 5', () => {
    expect(schoolYearForBirthYear(2015, now)).toBe('tahun5')
  })

  it('never returns a year above Tahun 6', () => {
    expect(schoolYearForBirthYear(2000, now)).toBe('tahun6')
  })
})

describe('school year config', () => {
  it('disables hearts and streaks for baby mode', () => {
    expect(SCHOOL_YEARS.baby.hasHearts).toBe(false)
    expect(SCHOOL_YEARS.baby.hasStreaks).toBe(false)
    expect(SCHOOL_YEARS.baby.isBabyMode).toBe(true)
  })

  it('enables hearts from Tahun 1 onwards', () => {
    for (const year of ['tahun1', 'tahun2', 'tahun3', 'tahun4', 'tahun5', 'tahun6'] as const) {
      expect(SCHOOL_YEARS[year].hasHearts).toBe(true)
    }
  })

  it('includes Sejarah only from Tahun 4', () => {
    expect(SCHOOL_YEARS.tahun4.subjects).toContain('sejarah')
    expect(SCHOOL_YEARS.tahun3.subjects).not.toContain('sejarah')
  })
})

describe('lesson content', () => {
  it('has lessons for every school year', () => {
    for (const year of SCHOOL_YEAR_ORDER) {
      expect(LESSONS.some((l) => l.year === year)).toBe(true)
    }
  })

  it('only assigns lessons to subjects valid for their year', () => {
    for (const lesson of LESSONS) {
      expect(SCHOOL_YEARS[lesson.year].subjects).toContain(lesson.subject)
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

  it('filters lessons by year and subject', () => {
    const bm = lessonsForYear('tahun1', 'bm')
    expect(bm.length).toBeGreaterThan(0)
    expect(bm.every((l) => l.year === 'tahun1' && l.subject === 'bm')).toBe(true)
  })
})

describe('school years', () => {
  it('never mixes years in a single year query', () => {
    for (const year of SCHOOL_YEAR_ORDER) {
      for (const subject of SCHOOL_YEARS[year].subjects) {
        const lessons = lessonsForYear(year, subject)
        expect(lessons.every((l) => l.year === year && l.subject === subject)).toBe(true)
      }
    }
  })

  it('keeps the KSSR Tahap 1 lessons in Tahun 1', () => {
    const t1 = lessonsForYear('tahun1', 'bm')
    expect(t1.length).toBeGreaterThan(0)
    expect(t1.every((l) => l.standard?.startsWith('KSSR T1'))).toBe(true)
  })

  it('keeps the KSSR Tahap 2 lessons in Tahun 4', () => {
    const t4 = lessonsForYear('tahun4', 'math')
    expect(t4.length).toBeGreaterThan(0)
    expect(t4.every((l) => l.standard?.startsWith('KSSR T2'))).toBe(true)
  })

  it('gives every school year content for every subject it offers', () => {
    const missing: string[] = []
    for (const year of SCHOOL_YEAR_ORDER) {
      for (const subject of SCHOOL_YEARS[year].subjects) {
        if (lessonsForYear(year, subject).length === 0) missing.push(`${year}/${subject}`)
      }
    }
    expect(missing).toEqual([])
  })

  it('gives every lesson at least two levels', () => {
    const thin = LESSONS.filter((l) => l.levels.length < 2).map((l) => l.id)
    expect(thin).toEqual([])
  })

  it('labels each lesson with the curriculum code for its own year', () => {
    // KSSR Tahap 2 covers Tahun 4-6, so Tahun 4-6 lessons may use either the
    // tahap code (T2) or their own year code (T4/T5/T6).
    // Baby mode is pre-formal, so it has no curriculum code at all.
    const allowed: Record<string, string[]> = {
      prasekolah: ['KSPK'],
      tahun1: ['KSSR T1'],
      tahun2: ['KSSR T2'],
      tahun3: ['KSSR T3'],
      tahun4: ['KSSR T2', 'KSSR T4'],
      tahun5: ['KSSR T5'],
      tahun6: ['KSSR T6'],
    }
    const wrong = LESSONS.filter(
      (l) => l.year !== 'baby' && !allowed[l.year].some((p) => l.standard?.startsWith(p)),
    ).map((l) => `${l.id} (${l.year}): ${l.standard}`)
    expect(wrong).toEqual([])
  })

  it('never repeats a lesson id', () => {
    const ids = LESSONS.map((l) => l.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
