import { useEffect, useMemo, useRef, useState } from 'react'
import type {
  DragDropQuestion,
  FillBlankQuestion,
  MemoryQuestion,
  SortQuestion,
  StoryQuestion,
  TraceQuestion,
} from '../data/lessons'
import { speak } from '../lib/speech'

/**
 * The interactive question boards.
 *
 * Each board owns its own local interaction state and calls `onComplete`
 * exactly once, when the child has finished. The parent (Play.tsx) owns
 * scoring, hearts, and progression — boards never touch those.
 */

const TILE =
  'rounded-2xl border-2 border-b-4 p-4 font-extrabold transition-[background-color,border-color,transform]'

/* ------------------------------------------------------------------ dragdrop */

export function DragDropBoard({
  question,
  onComplete,
}: {
  question: DragDropQuestion
  onComplete: () => void
}) {
  const [placed, setPlaced] = useState<Record<string, string>>({})
  const [held, setHeld] = useState<string | null>(null)
  const [wrongSlot, setWrongSlot] = useState<string | null>(null)

  const usedTokens = new Set(Object.values(placed))
  const remaining = question.tokens.filter((t) => !usedTokens.has(t))

  function drop(slotId: string) {
    if (!held) return
    const slot = question.slots.find((s) => s.id === slotId)
    if (!slot) return

    if (slot.accepts.includes(held)) {
      const next = { ...placed, [slotId]: held }
      setPlaced(next)
      setHeld(null)
      if (Object.keys(next).length === question.slots.length) onComplete()
    } else {
      setWrongSlot(slotId)
      setTimeout(() => setWrongSlot(null), 400)
      setHeld(null)
    }
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap justify-center gap-2">
        {remaining.map((token) => (
          <button
            key={token}
            onClick={() => setHeld(held === token ? null : token)}
            className={`${TILE} ${
              held === token
                ? 'border-brand-400 bg-brand-50'
                : 'border-cream-200 bg-white hover:bg-cream-50'
            }`}
          >
            {token}
          </button>
        ))}
        {remaining.length === 0 && (
          <p className="text-sm font-bold text-ink-300">Semua telah diletakkan</p>
        )}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {question.slots.map((slot) => (
          <button
            key={slot.id}
            onClick={() => drop(slot.id)}
            disabled={!!placed[slot.id]}
            className={`${TILE} min-h-20 ${
              placed[slot.id]
                ? 'border-green-400 bg-green-100'
                : wrongSlot === slot.id
                  ? 'animate-shake border-red-400 bg-red-100'
                  : held
                    ? 'border-brand-300 border-dashed bg-brand-50'
                    : 'border-cream-200 border-dashed bg-white'
            }`}
          >
            <span className="block text-xs font-bold uppercase tracking-wide text-ink-300">
              {slot.label}
            </span>
            <span className="mt-1 block text-xl">{placed[slot.id] ?? '—'}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ----------------------------------------------------------------- fillblank */

export function FillBlankBoard({
  question,
  onComplete,
}: {
  question: FillBlankQuestion
  onComplete: () => void
}) {
  const [picked, setPicked] = useState<string | null>(null)
  const [wrong, setWrong] = useState(false)

  const [before, after] = question.sentence.split('___')

  function pick(option: string) {
    if (picked) return
    setPicked(option)
    if (option === question.answer) {
      onComplete()
    } else {
      setWrong(true)
      setTimeout(() => {
        setWrong(false)
        setPicked(null)
      }, 700)
    }
  }

  return (
    <div className="mt-8">
      <p className="text-center text-2xl font-black leading-relaxed text-ink-900">
        {before}
        <span
          className={`mx-1 inline-block min-w-24 rounded-xl border-b-4 px-3 ${
            picked && !wrong
              ? 'border-green-400 bg-green-100 text-green-800'
              : wrong
                ? 'animate-shake border-red-400 bg-red-100 text-red-800'
                : 'border-brand-300 bg-brand-50 text-brand-700'
          }`}
        >
          {picked ?? '\u00A0'}
        </span>
        {after}
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {question.options.map((opt) => (
          <button
            key={opt}
            onClick={() => pick(opt)}
            disabled={!!picked}
            className={`${TILE} ${
              picked === opt && !wrong
                ? 'border-green-400 bg-green-100'
                : 'border-cream-200 bg-white hover:bg-cream-50'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

/* --------------------------------------------------------------------- trace */

/**
 * Trace a glyph with a finger or mouse.
 *
 * Scoring is coverage-based, not stroke-order-based: we sample the guide
 * path, then check what fraction of those points the child's stroke passed
 * near. Stroke order is too strict for 4-year-olds and for a touch screen,
 * and a child who traces the shape correctly should not be marked wrong
 * for starting at the bottom.
 */
export function TraceBoard({
  question,
  onComplete,
}: {
  question: TraceQuestion
  onComplete: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const [coverage, setCoverage] = useState(0)
  const [done, setDone] = useState(false)

  // Guide points, sampled from the rendered glyph. Recomputed only when the
  // glyph changes, since measuring text is not free.
  const guidePoints = useMemo(() => sampleGlyph(question.glyph), [question.glyph])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const size = canvas.clientWidth
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)

    ctx.clearRect(0, 0, size, size)
    ctx.font = `${size * 0.7}px Nunito, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#f2e9e0'
    ctx.fillText(question.glyph, size / 2, size / 2)
  }, [question.glyph])

  function pointFrom(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  function draw(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const p = pointFrom(e)
    ctx.lineWidth = 14
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#7c3aed'
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)

    const size = canvas.clientWidth
    const hit = guidePoints.filter(
      (g) => Math.hypot(g.x * size - p.x, g.y * size - p.y) < size * 0.09,
    ).length
    const next = Math.min(1, hit / Math.max(1, guidePoints.length))
    setCoverage((c) => Math.max(c, next))
  }

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    drawing.current = true
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return
    const p = pointFrom(e)
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
  }

  function end() {
    if (!drawing.current) return
    drawing.current = false
    if (coverage >= 0.55 && !done) {
      setDone(true)
      onComplete()
    }
  }

  function clear() {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const size = canvas.clientWidth
    ctx.clearRect(0, 0, size, size)
    ctx.font = `${size * 0.7}px Nunito, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#f2e9e0'
    ctx.fillText(question.glyph, size / 2, size / 2)
    setCoverage(0)
  }

  return (
    <div className="mt-6 flex flex-col items-center">
      <canvas
        ref={canvasRef}
        onPointerDown={start}
        onPointerMove={draw}
        onPointerUp={end}
        onPointerLeave={end}
        className="h-64 w-64 touch-none rounded-3xl border-4 border-cream-200 bg-white"
      />
      {question.hint && <p className="mt-3 text-sm font-bold text-ink-300">{question.hint}</p>}
      <div className="mt-3 flex items-center gap-3">
        <div className="h-2 w-40 overflow-hidden rounded-full bg-cream-200">
          <div
            className="h-full rounded-full bg-brand-500 transition-[width] duration-150"
            style={{ width: `${Math.round(coverage * 100)}%` }}
          />
        </div>
        <button onClick={clear} className="text-sm font-bold text-ink-300 hover:text-ink-500">
          Padam
        </button>
      </div>
    </div>
  )
}

/**
 * Approximate the glyph's outline as normalised points by rendering it to an
 * offscreen canvas and sampling the pixels that were actually painted.
 */
function sampleGlyph(glyph: string): { x: number; y: number }[] {
  const S = 100
  const canvas = document.createElement('canvas')
  canvas.width = S
  canvas.height = S
  const ctx = canvas.getContext('2d')
  if (!ctx) return []

  ctx.font = `${S * 0.7}px Nunito, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#000'
  ctx.fillText(glyph, S / 2, S / 2)

  const { data } = ctx.getImageData(0, 0, S, S)
  const points: { x: number; y: number }[] = []
  for (let y = 0; y < S; y += 2) {
    for (let x = 0; x < S; x += 2) {
      if (data[(y * S + x) * 4 + 3] > 128) points.push({ x: x / S, y: y / S })
    }
  }
  return points
}

/* --------------------------------------------------------------------- story */

export function StoryBoard({
  question,
  onComplete,
}: {
  question: StoryQuestion
  onComplete: () => void
}) {
  const [panel, setPanel] = useState(0)
  const [qIndex, setQIndex] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [wrong, setWrong] = useState(false)

  const readingPanels = panel < question.panels.length
  const current = question.panels[panel]
  const sub = question.questions[qIndex]

  useEffect(() => {
    if (readingPanels && current) speak(current.text)
  }, [readingPanels, current])

  if (readingPanels) {
    return (
      <div className="mt-8 text-center">
        {current.visual && <p className="text-6xl">{current.visual}</p>}
        <p className="mx-auto mt-4 max-w-md text-xl font-bold leading-relaxed text-ink-700">
          {current.text}
        </p>
        <div className="mt-6 flex items-center justify-center gap-2">
          {question.panels.map((_, i) => (
            <span
              key={i}
              className={`h-2 w-2 rounded-full ${i === panel ? 'bg-brand-500' : 'bg-cream-200'}`}
            />
          ))}
        </div>
        <button
          onClick={() => setPanel((p) => p + 1)}
          className={`${TILE} mt-6 border-brand-600 bg-brand-600 text-white`}
        >
          {panel === question.panels.length - 1 ? 'Jawab soalan' : 'Seterusnya'}
        </button>
      </div>
    )
  }

  function pick(option: string) {
    if (picked) return
    setPicked(option)
    if (option === sub.answer) {
      if (qIndex === question.questions.length - 1) {
        onComplete()
      } else {
        setTimeout(() => {
          setQIndex((i) => i + 1)
          setPicked(null)
        }, 600)
      }
    } else {
      setWrong(true)
      setTimeout(() => {
        setWrong(false)
        setPicked(null)
      }, 700)
    }
  }

  return (
    <div className="mt-8">
      <p className="text-center text-xl font-black text-ink-900">{sub.prompt}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {sub.options.map((opt) => (
          <button
            key={opt}
            onClick={() => pick(opt)}
            disabled={!!picked}
            className={`${TILE} ${
              picked === opt && !wrong
                ? 'border-green-400 bg-green-100'
                : wrong && picked === opt
                  ? 'animate-shake border-red-400 bg-red-100'
                  : 'border-cream-200 bg-white hover:bg-cream-50'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------- sort */

export function SortBoard({
  question,
  onComplete,
}: {
  question: SortQuestion
  onComplete: () => void
}) {
  const [placed, setPlaced] = useState<Record<string, string>>({})
  const [held, setHeld] = useState<string | null>(null)
  const [wrongBucket, setWrongBucket] = useState<string | null>(null)

  const remaining = question.items.filter((i) => !placed[i.label])

  function drop(bucketId: string) {
    if (!held) return
    const item = question.items.find((i) => i.label === held)
    if (!item) return

    if (item.bucket === bucketId) {
      const next = { ...placed, [held]: bucketId }
      setPlaced(next)
      setHeld(null)
      if (Object.keys(next).length === question.items.length) onComplete()
    } else {
      setWrongBucket(bucketId)
      setTimeout(() => setWrongBucket(null), 400)
      setHeld(null)
    }
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap justify-center gap-2">
        {remaining.map((item) => (
          <button
            key={item.label}
            onClick={() => setHeld(held === item.label ? null : item.label)}
            className={`${TILE} ${
              held === item.label
                ? 'border-brand-400 bg-brand-50'
                : 'border-cream-200 bg-white hover:bg-cream-50'
            }`}
          >
            {item.label}
          </button>
        ))}
        {remaining.length === 0 && (
          <p className="text-sm font-bold text-ink-300">Semua telah diasingkan</p>
        )}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {question.buckets.map((bucket) => (
          <button
            key={bucket.id}
            onClick={() => drop(bucket.id)}
            className={`${TILE} min-h-28 ${
              wrongBucket === bucket.id
                ? 'animate-shake border-red-400 bg-red-100'
                : held
                  ? 'border-brand-300 border-dashed bg-brand-50'
                  : 'border-cream-200 border-dashed bg-white'
            }`}
          >
            <span className="block font-black text-ink-900">
              {bucket.emoji} {bucket.label}
            </span>
            <span className="mt-2 flex flex-wrap justify-center gap-1">
              {question.items
                .filter((i) => placed[i.label] === bucket.id)
                .map((i) => (
                  <span
                    key={i.label}
                    className="rounded-lg bg-green-100 px-2 py-0.5 text-sm font-bold text-green-800"
                  >
                    {i.label}
                  </span>
                ))}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------- memory */

export function MemoryBoard({
  question,
  onComplete,
}: {
  question: MemoryQuestion
  onComplete: () => void
}) {
  const revealMs = question.revealMs ?? 2000
  const [phase, setPhase] = useState<'reveal' | 'input' | 'done'>('reveal')
  const [input, setInput] = useState<string[]>([])
  const [wrong, setWrong] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setPhase('input'), revealMs)
    return () => clearTimeout(t)
  }, [revealMs])

  // The choices are the sequence plus a couple of distractors, shuffled once.
  const choices = useMemo(() => {
    const extras = ['⭐', '🌙', '🍀'].filter((e) => !question.sequence.includes(e))
    const pool = [...question.sequence, ...extras.slice(0, 2)]
    // Deterministic shuffle so the board is stable across re-renders.
    return pool
      .map((item, i) => ({ item, key: (i * 2654435761) % 1000 }))
      .sort((a, b) => a.key - b.key)
      .map((x) => x.item)
  }, [question.sequence])

  function tap(item: string) {
    if (phase !== 'input') return
    const expected = question.sequence[input.length]
    if (item === expected) {
      const next = [...input, item]
      setInput(next)
      if (next.length === question.sequence.length) {
        setPhase('done')
        onComplete()
      }
    } else {
      setWrong(true)
      setTimeout(() => {
        setWrong(false)
        setInput([])
      }, 600)
    }
  }

  if (phase === 'reveal') {
    return (
      <div className="mt-10 text-center">
        <p className="text-sm font-bold uppercase tracking-wide text-ink-300">Ingat urutan ini</p>
        <div className="mt-4 flex justify-center gap-3">
          {question.sequence.map((item, i) => (
            <span
              key={i}
              className="animate-pop flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-b-4 border-brand-200 bg-white text-4xl"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mt-10 text-center">
      <p className="text-sm font-bold uppercase tracking-wide text-ink-300">
        Tekan mengikut urutan
      </p>
      <div className="mt-4 flex justify-center gap-3">
        {question.sequence.map((_, i) => (
          <span
            key={i}
            className={`flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-b-4 text-4xl ${
              input[i]
                ? 'border-green-400 bg-green-100'
                : 'border-cream-200 border-dashed bg-white'
            }`}
          >
            {input[i] ?? ''}
          </span>
        ))}
      </div>
      <div className={`mt-6 flex flex-wrap justify-center gap-3 ${wrong ? 'animate-shake' : ''}`}>
        {choices.map((item) => (
          <button
            key={item}
            onClick={() => tap(item)}
            className={`${TILE} h-20 w-20 text-4xl ${
              wrong ? 'border-red-400 bg-red-100' : 'border-cream-200 bg-white hover:bg-cream-50'
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  )
}
