import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/Button'
import { Logo } from '../components/Logo'
import { COMMISSION_MYR, PRICE_MYR, formatMYR } from '../lib/config'
import { buildAffiliateLink, normaliseCode } from '../lib/affiliate'

export default function Affiliate() {
  const [code, setCode] = useState('')
  const [copied, setCopied] = useState(false)

  const valid = normaliseCode(code)
  const link = valid ? buildAffiliateLink(valid) : ''

  async function copy() {
    if (!link) return
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 py-5">
        <Logo />
        <Link to="/" className="font-bold text-slate-500 hover:text-brand-700">
          Kembali
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-16">
        <div className="text-center">
          <h1 className="text-4xl font-black text-slate-900">Jadi Affiliate Anak Pandai</h1>
          <p className="mx-auto mt-3 max-w-xl text-slate-600">
            Kongsi pautan anda dengan ibu bapa lain. Setiap kali mereka beli, anda dapat{' '}
            <strong>{formatMYR(COMMISSION_MYR)}</strong> — itu 50% daripada harga{' '}
            {formatMYR(PRICE_MYR)}.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { emoji: '1️⃣', title: 'Daftar', body: 'Isi borang dan dapat kod unik anda.' },
            { emoji: '2️⃣', title: 'Kongsi', body: 'Sebar pautan di WhatsApp, TikTok atau Facebook.' },
            { emoji: '3️⃣', title: 'Dibayar', body: 'Komisen masuk selepas setiap jualan disahkan.' },
          ].map((s) => (
            <div key={s.title} className="card-3d text-center">
              <span className="text-3xl">{s.emoji}</span>
              <p className="mt-2 font-black text-slate-900">{s.title}</p>
              <p className="text-sm text-slate-600">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="card-3d mt-8">
          <h2 className="font-black text-slate-900">Cuba pautan anda</h2>
          <p className="mt-1 text-sm text-slate-600">
            Masukkan kod pilihan anda untuk lihat pautan yang akan dikongsi.
          </p>
          <div className="mt-3 flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Contoh: ALI2026"
              className="flex-1 rounded-xl border-2 border-slate-200 px-4 py-3 font-bold uppercase outline-none focus:border-brand-400"
            />
            <Button onClick={copy} disabled={!valid}>
              {copied ? 'Disalin ✓' : 'Salin'}
            </Button>
          </div>
          {code && !valid && (
            <p className="mt-2 text-sm font-bold text-red-600">
              Kod perlu 3-32 aksara: huruf, nombor, - atau _
            </p>
          )}
          {valid && (
            <p className="mt-3 break-all rounded-xl bg-slate-100 px-3 py-2 font-mono text-sm text-slate-700">
              {link}
            </p>
          )}
        </div>

        <div className="card-3d mt-6">
          <h2 className="font-black text-slate-900">Cara komisen dikira</h2>
          <table className="mt-3 w-full text-sm">
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-2 text-slate-600">Harga jualan</td>
                <td className="py-2 text-right font-bold">{formatMYR(PRICE_MYR)}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 text-slate-600">Kadar komisen</td>
                <td className="py-2 text-right font-bold">50%</td>
              </tr>
              <tr>
                <td className="py-2 font-black text-slate-900">Anda dapat</td>
                <td className="py-2 text-right font-black text-green-600">
                  {formatMYR(COMMISSION_MYR)}
                </td>
              </tr>
            </tbody>
          </table>
          <p className="mt-3 text-xs text-slate-500">
            Kod affiliate dijejak secara automatik melalui pautan — pembeli tidak perlu taip apa-apa.
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link to="/daftar">
            <Button className="px-10 py-4 text-lg">Daftar Sebagai Affiliate</Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
