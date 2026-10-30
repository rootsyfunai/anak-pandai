import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AccountButton } from '../components/AccountButton'
import { Button } from '../components/Button'
import { Logo } from '../components/Logo'
import { StreakBadge, XpBadge } from '../components/Hud'
import { TRIAL_LESSONS_PER_SUBJECT } from '../lib/config'
import { useAccess } from '../lib/useAccess'
import {
  SCHOOL_YEARS,
  SCHOOL_YEAR_ORDER,
  SUBJECTS,
  type SchoolYear,
  type Subject,
} from '../data/curriculum'
import { lessonsForYear, lessonsInYear } from '../data/lessons'
import { clearedLevelCount, isLessonComplete, levelForXp, levelKey } from '../games/engine'
import { useProgress } from '../lib/useProgress'

/** Cleared levels out of all levels for one school year. */
function yearProgress(year: SchoolYear, completedLevels: string[]) {
  const lessons = lessonsInYear(year)
  const total = lessons.reduce((n, l) => n + l.levels.length, 0)
  const cleared = lessons.reduce((n, l) => n + clearedLevelCount(l, completedLevels), 0)
  return { cleared, total }
}

export default function Path() {
  const { progress } = useProgress()
  const access = useAccess()
  // The school year is the only grouping: Tahun 1 and Tahun 2 are never
  // mixed in one list.
  const [year, setYear] = useState<SchoolYear>('tahun1')
  const [subject, setSubject] = useState<Subject>('bm')
  // While access is loading, do not flash locks at a paying parent.
  const onTrial = access.status === 'trial' || access.status === 'anonymous'

  const yearMeta = SCHOOL_YEARS[year]
  const lessons = lessonsForYear(year, subject)
  const { level, intoLevel, needed } = levelForXp(progress.xp)

  function pickYear(next: SchoolYear) {
    setYear(next)
    const subjects = SCHOOL_YEARS[next].subjects
    if (!subjects.includes(subject)) setSubject(subjects[0])
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <header className="sticky top-0 z-10 border-b-2 border-cream-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Logo to="/main" />
          <div className="flex items-center gap-2">
            {yearMeta.hasStreaks && <StreakBadge days={progress.streakDays} />}
            <XpBadge xp={progress.xp} />
            <AccountButton email={access.user?.email ?? null} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {onTrial && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-brand-50 px-4 py-3">
            <p className="text-sm font-bold text-brand-700">
              Mod percubaan — pelajaran pertama setiap subjek percuma.
            </p>
            <Link
              to={access.user ? '/daftar/bayar' : '/daftar'}
              className="text-sm font-black text-brand-700 underline"
            >
              Buka akses penuh · RM50
            </Link>
          </div>
        )}

        <div className="card-3d mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide text-ink-300">
                Tahap {level}
              </p>
              <p className="font-black text-ink-900">{progress.childName}</p>
            </div>
            <p className="text-sm font-bold text-ink-300">
              {intoLevel} / {needed} XP
            </p>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-cream-200">
            <div
              className="h-full rounded-full bg-amber-400 transition-all"
              style={{ width: `${(intoLevel / needed) * 100}%` }}
            />
          </div>
        </div>

        <section className="mb-5">
          <h2 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-ink-300">
            Tahun
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {SCHOOL_YEAR_ORDER.map((id) => {
              const { cleared, total } = yearProgress(id, progress.completedLevels)
              const done = total > 0 && cleared === total
              return (
                <button
                  key={id}
                  onClick={() => pickYear(id)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-extrabold transition-colors ${
                    year === id
                      ? 'bg-ink-900 text-white'
                      : 'bg-white text-ink-500 hover:bg-cream-100'
                  }`}
                >
                  {SCHOOL_YEARS[id].label}
                  <span
                    className={`ml-2 rounded-full px-1.5 py-0.5 text-xs ${
                      year === id
                        ? 'bg-white/20 text-white'
                        : done
                          ? 'bg-green-100 text-green-700'
                          : 'bg-cream-100 text-ink-300'
                    }`}
                  >
                    {done ? '✓' : `${cleared}/${total}`}
                  </span>
                </button>
              )
            })}
          </div>
          <p className="mt-2 text-xs font-semibold text-ink-300">
            {yearMeta.label} · {yearMeta.framework}
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-ink-300">
            Subjek
          </h2>
          <div className="flex flex-wrap gap-2">
            {yearMeta.subjects.map((id) => (
              <button
                key={id}
                onClick={() => setSubject(id)}
                className={`rounded-2xl border-2 border-b-4 px-4 py-2 text-sm font-extrabold transition-all ${
                  subject === id
                    ? 'border-brand-400 bg-brand-50 text-brand-700'
                    : 'border-cream-200 bg-white text-ink-500'
                }`}
              >
                {SUBJECTS[id].emoji} {SUBJECTS[id].name}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-sm font-extrabold uppercase tracking-wide text-ink-300">
            Laluan pembelajaran
          </h2>
          {lessons.length === 0 ? (
            <p className="card-3d text-center font-bold text-ink-300">
              {yearMeta.label}: kandungan untuk subjek ini sedang disediakan.
            </p>
          ) : (
            <ol className="relative space-y-4 pl-6">
              <span className="absolute left-[11px] top-2 bottom-2 w-1 rounded bg-cream-200" />
              {lessons.map((lesson, i) => {
                const cleared = clearedLevelCount(lesson, progress.completedLevels)
                const done = cleared === lesson.levels.length
                const locked = i > 0 && !isLessonComplete(lessons[i - 1], progress.completedLevels)
                const trialLocked = onTrial && i >= TRIAL_LESSONS_PER_SUBJECT
                // Resume at the first level that is not yet cleared.
                const nextLevel = lesson.levels.find(
                  (l) => !progress.completedLevels.includes(levelKey(lesson.id, l.index)),
                )
                return (
                  <li key={lesson.id} className="relative">
                    <span
                      className={`absolute -left-6 top-4 flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${
                        done
                          ? 'bg-green-500 text-white'
                          : locked
                            ? 'bg-ink-300 text-white'
                            : 'bg-brand-600 text-white'
                      }`}
                    >
                      {done ? '✓' : locked || trialLocked ? '🔒' : i + 1}
                    </span>
                    <div className={`card-3d ${locked || trialLocked ? 'opacity-60' : ''}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-black text-ink-900">{lesson.title}</p>
                          <p className="text-sm text-ink-300">{lesson.objective}</p>
                          {lesson.standard && (
                            <p className="mt-1 text-xs font-bold text-brand-500">
                              {lesson.standard}
                            </p>
                          )}
                          {/* Level pips: filled once cleared, ringed for the
                              next one to play, dim for still-locked. */}
                          <div className="mt-2 flex items-center gap-1.5">
                            {lesson.levels.map((l) => {
                              const isCleared = progress.completedLevels.includes(
                                levelKey(lesson.id, l.index),
                              )
                              const isNext = nextLevel?.index === l.index
                              const open = !locked && (isCleared || isNext)
                              const pip = (
                                <span
                                  className={`block h-2.5 w-2.5 rounded-full ${
                                    isCleared
                                      ? 'bg-green-500'
                                      : isNext
                                        ? 'bg-brand-500 ring-2 ring-brand-200'
                                        : 'bg-cream-200'
                                  }`}
                                />
                              )
                              // Cleared levels stay replayable; locked ones are
                              // not links at all.
                              return open ? (
                                <Link
                                  key={l.index}
                                  to={`/main/play/${lesson.id}/${l.index}`}
                                  title={`Tahap ${l.index}: ${l.title}`}
                                  className="p-1"
                                >
                                  {pip}
                                </Link>
                              ) : (
                                <span
                                  key={l.index}
                                  title={`Tahap ${l.index}: ${l.title}`}
                                  className="p-1"
                                >
                                  {pip}
                                </span>
                              )
                            })}
                            <span className="ml-1 text-xs font-bold text-ink-300">
                              {cleared}/{lesson.levels.length} tahap
                            </span>
                          </div>
                        </div>
                        {trialLocked ? (
                          <Link to={access.user ? '/daftar/bayar' : '/daftar'} className="shrink-0">
                            <Button className="px-4 py-2 text-sm">Buka</Button>
                          </Link>
                        ) : locked ? (
                          <Button variant="neutral" disabled className="shrink-0 px-4 py-2 text-sm">
                            Kunci
                          </Button>
                        ) : (
                          <Link
                            to={`/main/play/${lesson.id}/${nextLevel?.index ?? 1}`}
                            className="shrink-0"
                          >
                            <Button
                              variant={done ? 'success' : 'primary'}
                              className="px-4 py-2 text-sm"
                            >
                              {done ? 'Ulang' : cleared > 0 ? 'Sambung' : 'Mula'}
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
        </section>
      </main>
    </div>
  )
}
