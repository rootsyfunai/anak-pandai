import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/Button'
import { Logo } from '../components/Logo'
import { StreakBadge, XpBadge } from '../components/Hud'
import { AGE_BANDS, AGE_BAND_ORDER, SUBJECTS, type AgeBand, type Subject } from '../data/curriculum'
import { lessonsFor } from '../data/lessons'
import { levelForXp } from '../games/engine'
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
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b-2 border-slate-200 bg-white">
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
              <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">
                Tahap {level}
              </p>
              <p className="font-black text-slate-900">{progress.childName}</p>
            </div>
            <p className="text-sm font-bold text-slate-500">
              {intoLevel} / {needed} XP
            </p>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-amber-400 transition-all"
              style={{ width: `${(intoLevel / needed) * 100}%` }}
            />
          </div>
        </div>

        <section className="mb-5">
          <h2 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-slate-400">
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
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                {AGE_BANDS[id].label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs font-semibold text-slate-500">{bandMeta.framework}</p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-slate-400">
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
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                {SUBJECTS[id].emoji} {SUBJECTS[id].name}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-sm font-extrabold uppercase tracking-wide text-slate-400">
            Laluan pembelajaran
          </h2>
          {lessons.length === 0 ? (
            <p className="card-3d text-center font-bold text-slate-500">
              Kandungan untuk subjek ini sedang disediakan.
            </p>
          ) : (
            <ol className="relative space-y-4 pl-6">
              <span className="absolute left-[11px] top-2 bottom-2 w-1 rounded bg-slate-200" />
              {lessons.map((lesson, i) => {
                const done = progress.completedLessons.includes(lesson.id)
                const locked = i > 0 && !progress.completedLessons.includes(lessons[i - 1].id)
                return (
                  <li key={lesson.id} className="relative">
                    <span
                      className={`absolute -left-6 top-4 flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${
                        done
                          ? 'bg-green-500 text-white'
                          : locked
                            ? 'bg-slate-300 text-white'
                            : 'bg-brand-600 text-white'
                      }`}
                    >
                      {done ? '✓' : locked ? '🔒' : i + 1}
                    </span>
                    <div className={`card-3d ${locked ? 'opacity-60' : ''}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-black text-slate-900">{lesson.title}</p>
                          <p className="text-sm text-slate-500">{lesson.objective}</p>
                          {lesson.standard && (
                            <p className="mt-1 text-xs font-bold text-brand-500">
                              {lesson.standard}
                            </p>
                          )}
                        </div>
                        {locked ? (
                          <Button variant="neutral" disabled className="shrink-0 px-4 py-2 text-sm">
                            Kunci
                          </Button>
                        ) : (
                          <Link to={`/main/play/${lesson.id}`} className="shrink-0">
                            <Button
                              variant={done ? 'success' : 'primary'}
                              className="px-4 py-2 text-sm"
                            >
                              {done ? 'Ulang' : 'Mula'}
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
