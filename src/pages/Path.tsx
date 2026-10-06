import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/Button'
import { Logo } from '../components/Logo'
import { StreakBadge, XpBadge } from '../components/Hud'
import { AGE_BANDS, AGE_BAND_ORDER, SUBJECTS, type AgeBand, type Subject } from '../data/curriculum'
import { lessonsFor } from '../data/lessons'
import { clearedLevelCount, isLessonComplete, levelForXp, levelKey } from '../games/engine'
import { useProgress } from '../lib/useProgress'

export default function Path() {
  const { progress } = useProgress()
  const [band, setBand] = useState<AgeBand>('4-6')
  const [subject, setSubject] = useState<Subject>('bm')

  const bandMeta = AGE_BANDS[band]
  const lessons = lessonsFor(band, subject)
  const { level, intoLevel, needed } = levelForXp(progress.xp)

  function pickBand(next: AgeBand) {
    setBand(next)
    const subjects = AGE_BANDS[next].subjects
    if (!subjects.includes(subject)) setSubject(subjects[0])
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <header className="sticky top-0 z-10 border-b-2 border-cream-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Logo to="/main" />
          <div className="flex items-center gap-2">
            {bandMeta.hasStreaks && <StreakBadge days={progress.streakDays} />}
            <XpBadge xp={progress.xp} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
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
            Peringkat umur
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {AGE_BAND_ORDER.map((id) => (
              <button
                key={id}
                onClick={() => pickBand(id)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-extrabold transition-colors ${
                  band === id
                    ? 'bg-brand-600 text-white'
                    : 'bg-white text-ink-500 hover:bg-cream-100'
                }`}
              >
                {AGE_BANDS[id].label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs font-semibold text-ink-300">{bandMeta.framework}</p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-ink-300">
            Subjek
          </h2>
          <div className="flex flex-wrap gap-2">
            {bandMeta.subjects.map((id) => (
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
              Kandungan untuk subjek ini sedang disediakan.
            </p>
          ) : (
            <ol className="relative space-y-4 pl-6">
              <span className="absolute left-[11px] top-2 bottom-2 w-1 rounded bg-cream-200" />
              {lessons.map((lesson, i) => {
                const cleared = clearedLevelCount(lesson, progress.completedLevels)
                const done = cleared === lesson.levels.length
                const locked = i > 0 && !isLessonComplete(lessons[i - 1], progress.completedLevels)
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
                      {done ? '✓' : locked ? '🔒' : i + 1}
                    </span>
                    <div className={`card-3d ${locked ? 'opacity-60' : ''}`}>
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
                              return (
                                <span
                                  key={l.index}
                                  title={`Tahap ${l.index}: ${l.title}`}
                                  className={`h-2.5 w-2.5 rounded-full ${
                                    isCleared
                                      ? 'bg-green-500'
                                      : isNext
                                        ? 'bg-brand-500 ring-2 ring-brand-200'
                                        : 'bg-cream-200'
                                  }`}
                                />
                              )
                            })}
                            <span className="ml-1 text-xs font-bold text-ink-300">
                              {cleared}/{lesson.levels.length} tahap
                            </span>
                          </div>
                        </div>
                        {locked ? (
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
