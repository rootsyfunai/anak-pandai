import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/Button'
import { Hearts, ProgressBar } from '../components/Hud'
import {
  DragDropBoard,
  FillBlankBoard,
  MemoryBoard,
  SortBoard,
  StoryBoard,
  TraceBoard,
} from '../components/QuestionBoards'
import { AGE_BANDS, type AgeBand } from '../data/curriculum'
import { lessonById, type Question } from '../data/lessons'
import {
  accuracy,
  advance,
  answer,
  currentQuestion,
  levelOf,
  MAX_HEARTS,
  stars,
  startSession,
  type SessionState,
} from '../games/engine'
import { speak } from '../lib/speech'
import { useProgress } from '../lib/useProgress'

export default function Play() {
  const { lessonId = '', levelIndex = '1' } = useParams()
  const navigate = useNavigate()
  const lesson = lessonById(lessonId)
  const { completeLevel } = useProgress()

  const requestedLevel = Number.parseInt(levelIndex, 10) || 1
  const band: AgeBand = lesson?.band ?? '4-6'
  const bandMeta = AGE_BANDS[band]

  const [state, setState] = useState<SessionState | null>(() =>
    lesson ? startSession(lesson, lesson.band, requestedLevel) : null,
  )
  const [selected, setSelected] = useState<string | null>(null)
  const [shake, setShake] = useState(false)

  // Reset the session when navigating between lessons or levels.
  const sessionKey = lesson ? `${lesson.id}:${requestedLevel}` : null
  const [activeKey, setActiveKey] = useState(sessionKey)
  if (lesson && sessionKey !== activeKey) {
    setActiveKey(sessionKey)
    setState(startSession(lesson, lesson.band, requestedLevel))
    setSelected(null)
  }

  const level = lesson ? levelOf(lesson, requestedLevel) : undefined

  const question = useMemo(
    () => (lesson && state ? currentQuestion(lesson, state) : null),
    [lesson, state],
  )

  // Read the prompt aloud for pre-readers and for listening practice.
  useEffect(() => {
    if (!question) return
    const text = question.audioText ?? question.prompt
    if (bandMeta.isBabyMode || question.kind === 'listen') speak(text)
  }, [question, bandMeta.isBabyMode])

  const handleAnswer = useCallback(
    (value: string) => {
      if (!lesson || !state || !question || state.revealed) return
      // Boards that are self-checking (match, dragdrop, trace, sort, memory,
      // story) only call back once the child has got it right, so they are
      // always correct by the time we get here.
      const selfChecking =
        question.kind === 'match' ||
        question.kind === 'dragdrop' ||
        question.kind === 'trace' ||
        question.kind === 'sort' ||
        question.kind === 'memory' ||
        question.kind === 'story'
      const correct = selfChecking
        ? true
        : question.kind === 'fillblank'
          ? value === question.answer
          : value === question.answer
      setSelected(value)
      if (!correct) {
        setShake(true)
        setTimeout(() => setShake(false), 400)
      }
      setState(answer(state, correct, lesson.band))
    },
    [lesson, state, question],
  )

  const handleContinue = useCallback(() => {
    if (!lesson || !state) return
    setSelected(null)
    const next = advance(lesson, state)
    if (next.finished && !next.failed) {
      completeLevel(lesson.id, state.levelIndex, next.xp)
    }
    setState(next)
  }, [lesson, state, completeLevel])

  if (!lesson || !level) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
        <p className="text-xl font-bold">Pelajaran tidak dijumpai.</p>
        <Link to="/main">
          <Button>Kembali</Button>
        </Link>
      </div>
    )
  }

  if (!state || !question) {
    return <div className="p-6 text-center font-bold">Memuatkan…</div>
  }

  if (state.finished) {
    return (
      <Summary
        lessonTitle={lesson.title}
        levelTitle={level.title}
        state={state}
        onDone={() => navigate('/main')}
      />
    )
  }

  const isCorrect = state.lastAnswerCorrect === true

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="mx-auto flex w-full max-w-2xl items-center gap-4 px-4 py-4">
        <Link to="/main" className="text-2xl text-ink-300 hover:text-ink-500" aria-label="Keluar">
          ✕
        </Link>
        <div className="flex-1">
          <ProgressBar value={state.index} max={level.questions.length} />
        </div>
        {bandMeta.hasHearts && <Hearts hearts={state.hearts} />}
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-40">
        <p className="text-center text-xs font-black uppercase tracking-widest text-brand-500">
          Tahap {level.index} · {level.title}
        </p>
        <h1 className="mt-1 text-center text-2xl font-black text-ink-900">{question.prompt}</h1>

        {question.kind === 'listen' && (
          <>
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => speak(question.audioText ?? question.prompt)}
                className="flex h-24 w-24 items-center justify-center rounded-3xl bg-brand-100 text-5xl"
                aria-label="Main bunyi"
              >
                🔊
              </button>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-3">
              {question.options.map((opt) => (
                <OptionTile
                  key={opt}
                  label={opt}
                  selected={selected === opt}
                  revealed={state.revealed}
                  isAnswer={opt === question.answer}
                  shake={shake && selected === opt}
                  onClick={() => handleAnswer(opt)}
                />
              ))}
            </div>
          </>
        )}

        {question.kind === 'choice' && (
          <>
            {question.visual && (
              <p className="mt-6 text-center text-5xl tracking-widest">{question.visual}</p>
            )}
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {question.options.map((opt) => (
                <OptionTile
                  key={opt}
                  label={opt}
                  selected={selected === opt}
                  revealed={state.revealed}
                  isAnswer={opt === question.answer}
                  shake={shake && selected === opt}
                  onClick={() => handleAnswer(opt)}
                />
              ))}
            </div>
          </>
        )}

        {question.kind === 'match' && (
          <MatchBoard question={question} onComplete={() => handleAnswer('match')} />
        )}

        {question.kind === 'dragdrop' && (
          <DragDropBoard question={question} onComplete={() => handleAnswer('dragdrop')} />
        )}

        {question.kind === 'fillblank' && (
          <FillBlankBoard question={question} onComplete={() => handleAnswer(question.answer)} />
        )}

        {question.kind === 'trace' && (
          <TraceBoard question={question} onComplete={() => handleAnswer('trace')} />
        )}

        {question.kind === 'story' && (
          <StoryBoard question={question} onComplete={() => handleAnswer('story')} />
        )}

        {question.kind === 'sort' && (
          <SortBoard question={question} onComplete={() => handleAnswer('sort')} />
        )}

        {question.kind === 'memory' && (
          <MemoryBoard question={question} onComplete={() => handleAnswer('memory')} />
        )}
      </main>

      {state.revealed && (
        <footer
          className={`fixed inset-x-0 bottom-0 border-t-2 p-4 ${
            isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
          }`}
        >
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
            <div>
              <p className={`text-lg font-black ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                {isCorrect ? '✅ Betul!' : '❌ Cuba lagi'}
              </p>
              {!isCorrect && (question.kind === 'choice' || question.kind === 'listen') && (
                <p className="text-sm font-semibold text-red-600">Jawapan: {question.answer}</p>
              )}
            </div>
            <Button variant={isCorrect ? 'success' : 'danger'} onClick={handleContinue}>
              Sambung
            </Button>
          </div>
        </footer>
      )}
    </div>
  )
}

interface TileProps {
  label: string
  selected: boolean
  revealed: boolean
  isAnswer: boolean
  shake: boolean
  onClick: () => void
}

function OptionTile({ label, selected, revealed, isAnswer, shake, onClick }: TileProps) {
  let tone = 'border-cream-200 bg-white hover:bg-cream-50'
  if (revealed && isAnswer) tone = 'border-green-400 bg-green-100'
  else if (revealed && selected) tone = 'border-red-400 bg-red-100'
  else if (selected) tone = 'border-brand-400 bg-brand-50'

  return (
    <button
      onClick={onClick}
      disabled={revealed}
      className={`rounded-2xl border-2 border-b-4 p-5 text-2xl font-extrabold transition-all ${tone} ${
        shake ? 'animate-shake' : ''
      }`}
    >
      {label}
    </button>
  )
}

function MatchBoard({
  question,
  onComplete,
}: {
  question: Extract<Question, { kind: 'match' }>
  onComplete: () => void
}) {
  const [pickedLeft, setPickedLeft] = useState<string | null>(null)
  const [matched, setMatched] = useState<string[]>([])

  // Shuffle once per question so the right column is not in the same
  // order as the left, which would give the answer away.
  const [rights] = useState(() =>
    [...question.pairs].sort(() => Math.random() - 0.5).map((p) => p.right),
  )

  function pickRight(right: string) {
    if (!pickedLeft) return
    const pair = question.pairs.find((p) => p.left === pickedLeft)
    if (pair?.right === right) {
      const next = [...matched, pickedLeft]
      setMatched(next)
      setPickedLeft(null)
      if (next.length === question.pairs.length) onComplete()
    } else {
      setPickedLeft(null)
    }
  }

  return (
    <div className="mt-8 grid grid-cols-2 gap-4">
      <div className="space-y-3">
        {question.pairs.map((p) => (
          <button
            key={p.left}
            onClick={() => setPickedLeft(p.left)}
            disabled={matched.includes(p.left)}
            className={`w-full rounded-2xl border-2 border-b-4 p-4 font-extrabold transition-all ${
              matched.includes(p.left)
                ? 'border-green-400 bg-green-100 opacity-60'
                : pickedLeft === p.left
                  ? 'border-brand-400 bg-brand-50'
                  : 'border-cream-200 bg-white'
            }`}
          >
            {p.left}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {rights.map((right) => {
          const pair = question.pairs.find((p) => p.right === right)
          const isMatched = pair ? matched.includes(pair.left) : false
          return (
            <button
              key={right}
              onClick={() => pickRight(right)}
              disabled={isMatched}
              className={`w-full rounded-2xl border-2 border-b-4 p-4 font-extrabold transition-all ${
                isMatched
                  ? 'border-green-400 bg-green-100 opacity-60'
                  : 'border-cream-200 bg-white'
              }`}
            >
              {right}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Summary({
  lessonTitle,
  levelTitle,
  state,
  onDone,
}: {
  lessonTitle: string
  levelTitle: string
  state: SessionState
  onDone: () => void
}) {
  const earned = stars(state)
  const acc = accuracy(state)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-b from-amber-50 to-white p-6 text-center">
      <span className="animate-pop text-7xl">{state.failed ? '💪' : '🎉'}</span>
      <h1 className="text-3xl font-black text-ink-900">
        {state.failed ? 'Cuba lagi!' : 'Syabas!'}
      </h1>
      <p className="font-bold text-ink-300">
        {lessonTitle} · Tahap {state.levelIndex}: {levelTitle}
      </p>

      <div className="flex gap-2 text-4xl">
        {[0, 1, 2].map((i) => (
          <span key={i} className={i < earned ? '' : 'opacity-20 grayscale'}>
            ⭐
          </span>
        ))}
      </div>

      <div className="grid w-full max-w-sm grid-cols-3 gap-3">
        <Stat label="XP" value={state.xp} />
        <Stat label="Ketepatan" value={`${acc}%`} />
        <Stat label="Betul" value={`${state.correct}/${state.answered}`} />
      </div>

      <Button onClick={onDone} className="px-10 py-4 text-lg">
        Selesai
      </Button>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card-3d">
      <p className="text-xs font-extrabold uppercase tracking-wide text-ink-300">{label}</p>
      <p className="text-xl font-black text-ink-900">{value}</p>
    </div>
  )
}

export { MAX_HEARTS }
