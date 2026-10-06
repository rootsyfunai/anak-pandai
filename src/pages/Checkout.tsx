import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/Button'
import { Logo } from '../components/Logo'
import { PAYMENT, PRICE_MYR, formatMYR } from '../lib/config'
import { getStoredRef } from '../lib/affiliate'
import { isSupabaseConfigured, loadSupabase } from '../lib/supabase'

type Step = 'pay' | 'upload' | 'done'

export default function Checkout() {
  const ref = getStoredRef()
  const [step, setStep] = useState<Step>('pay')
  const [file, setFile] = useState<File | null>(null)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    if (!file) {
      setError('Sila pilih gambar resit pembayaran.')
      return
    }
    setBusy(true)
    setError(null)

    if (!isSupabaseConfigured) {
      // Local-only mode: record the submission so the flow is testable
      // before a Supabase project exists.
      const pending = JSON.parse(localStorage.getItem('ap_pending_orders') ?? '[]')
      pending.push({
        id: crypto.randomUUID(),
        amount_myr: PRICE_MYR,
        affiliate_code: ref?.code ?? null,
        reference_note: note,
        file_name: file.name,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      localStorage.setItem('ap_pending_orders', JSON.stringify(pending))
      setBusy(false)
      setStep('done')
      return
    }

    try {
      const supabase = await loadSupabase()
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user
      if (!user) {
        setError('Sila daftar atau masuk terlebih dahulu.')
        setBusy(false)
        return
      }

      const path = `${user.id}/${crypto.randomUUID()}-${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(path, file)
      if (uploadError) throw uploadError

      let affiliateId: string | null = null
      if (ref?.code) {
        const { data } = await supabase
          .from('affiliates')
          .select('id')
          .ilike('code', ref.code)
          .maybeSingle()
        affiliateId = data?.id ?? null
      }

      const { error: insertError } = await supabase.from('orders').insert({
        parent_id: user.id,
        amount_myr: PRICE_MYR,
        proof_path: path,
        reference_note: note,
        affiliate_id: affiliateId,
        affiliate_code: ref?.code ?? null,
      })
      if (insertError) throw insertError

      setStep('done')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menghantar. Cuba lagi.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <header className="mx-auto flex max-w-2xl items-center justify-between px-4 py-5">
        <Logo />
        <Link to="/" className="font-bold text-ink-300 hover:text-brand-700">
          Kembali
        </Link>
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-16">
        {step === 'done' ? (
          <div className="card-3d text-center">
            <span className="text-6xl">⏳</span>
            <h1 className="mt-4 text-2xl font-black text-ink-900">Pembayaran dihantar</h1>
            <p className="mt-2 text-ink-500">
              Kami akan semak resit anda dalam masa 24 jam. Anda akan dapat akses penuh sebaik
              sahaja diluluskan.
            </p>
            <Link to="/main" className="mt-6 inline-block">
              <Button>Cuba Mod Percubaan</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="card-3d mb-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wide text-ink-300">
                    Jumlah bayaran
                  </p>
                  <p className="text-3xl font-black text-ink-900">{formatMYR(PRICE_MYR)}</p>
                </div>
                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-extrabold text-green-700">
                  Sekali sahaja
                </span>
              </div>
              {ref && (
                <p className="mt-3 rounded-xl bg-brand-50 px-3 py-2 text-sm font-bold text-brand-700">
                  Dirujuk oleh kod: {ref.code}
                </p>
              )}
            </div>

            <div className="card-3d mb-5">
              <h2 className="font-black text-ink-900">1. Bayar dengan {PAYMENT.method}</h2>
              <div className="mt-4 flex justify-center">
                <img
                  src={PAYMENT.qrImagePath}
                  alt="Kod QR pembayaran"
                  className="h-56 w-56 rounded-2xl border-2 border-cream-200 bg-white object-contain p-2"
                />
              </div>
              <p className="mt-3 text-center font-bold text-ink-700">
                {PAYMENT.payee} · {formatMYR(PRICE_MYR)}
              </p>
              <ol className="mt-4 space-y-2">
                {PAYMENT.instructions.map((line, i) => (
                  <li key={line} className="flex gap-2 text-sm text-ink-500">
                    <span className="font-black text-brand-600">{i + 1}.</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="card-3d">
              <h2 className="font-black text-ink-900">2. Muat naik resit</h2>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="mt-3 w-full rounded-xl border-2 border-dashed border-cream-200 p-4 text-sm"
              />
              {file && (
                <p className="mt-2 text-sm font-bold text-green-600">Dipilih: {file.name}</p>
              )}
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nota (pilihan) — contoh: nama anak, masa bayar"
                rows={3}
                className="mt-3 w-full rounded-xl border-2 border-cream-200 p-3 text-sm outline-none focus:border-brand-400"
              />
              {error && <p className="mt-3 text-sm font-bold text-red-600">{error}</p>}
              <Button onClick={submit} disabled={busy} className="mt-4 w-full py-4">
                {busy ? 'Menghantar…' : 'Hantar untuk semakan'}
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
