import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/Button'
import { Logo } from '../components/Logo'
import { AGE_BANDS, AGE_BAND_ORDER, SUBJECTS } from '../data/curriculum'
import { LESSONS } from '../data/lessons'
import { COMMISSION_MYR, PRICE_MYR, formatMYR } from '../lib/config'
import { getStoredRef, type CapturedRef } from '../lib/affiliate'

const FEATURES = [  {
    emoji: '🇲🇾',
    title: 'Ikut Sukatan Malaysia',
    body: 'Kandungan dibina mengikut KSPK (prasekolah) dan KSSR (Tahun 1-6). Bukan sukatan luar negara.',
  },
  {
    emoji: '🎮',
    title: 'Belajar Macam Main Game',
    body: 'Setiap topik jadi pengembaraan pendek 2-3 minit. Dapat XP, bintang dan streak setiap hari.',
  },
  {
    emoji: '👶',
    title: 'Umur 1 Hingga 12 Tahun',
    body: 'Mod bayi untuk 1-3 tahun, dan mod penuh dengan nyawa serta streak untuk 7 tahun ke atas.',
  },
  {
    emoji: '📊',
    title: 'Ibu Bapa Nampak Kemajuan',
    body: 'Laporan markah, ketepatan dan topik yang perlu diberi perhatian.',
  },
  {
    emoji: '🚫',
    title: 'Tiada Iklan',
    body: 'Bayar sekali sahaja. Tiada iklan, tiada langganan bulanan, tiada pembelian dalam app.',
  },
  {
    emoji: '📱',
    title: 'Boleh Guna Offline',
    body: 'Selepas muat turun, anak boleh belajar walaupun tanpa internet.',
  },
]

const CURRENT_YEAR = new Date().getFullYear()

export default function Landing() {
  const [ref, setRef] = useState<CapturedRef | null>(null)
  const lessonCount = LESSONS.length

  // Read the captured affiliate code after mount; localStorage is not
  // available during the initial render.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRef(getStoredRef())
  }, [])

  return (
    <div className="min-h-screen bg-cream-50">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
        <Logo />
        <nav className="flex items-center gap-3">
          <Link to="/affiliate" className="hidden font-bold text-ink-500 hover:text-brand-700 sm:block">
            Jadi Affiliate
          </Link>
          <Link to="/masuk">
            <Button variant="neutral" className="px-4 py-2 text-sm">
              Masuk
            </Button>
          </Link>
        </nav>
      </header>

      {ref && (
        <div className="mx-auto max-w-5xl px-4">
          <p className="rounded-xl bg-green-100 px-4 py-2 text-center text-sm font-bold text-green-800">
            Kod affiliate <span className="font-black">{ref.code}</span> telah disimpan. Ia akan
            dipautkan secara automatik semasa pembayaran.
          </p>
        </div>
      )}

      <section className="relative overflow-hidden">
        {/* Soft brand glow behind the hero. Pure CSS, so it costs no bytes
            and no extra request. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-40 h-96 bg-[radial-gradient(60%_60%_at_50%_50%,var(--color-brand-200),transparent_70%)] opacity-70"
        />
        <div className="relative mx-auto max-w-5xl px-4 pt-12 pb-16 text-center">
          <span className="inline-block rounded-full border-2 border-brand-200 bg-white px-4 py-1 text-sm font-extrabold text-brand-700">
            Untuk anak Malaysia · 1-12 tahun
          </span>
          <h1 className="mt-5 text-4xl font-black leading-[1.1] text-ink-900 sm:text-6xl">
            Belajar Sambil Bermain,
            <br />
            <span className="text-brand-600">Cara Anak Malaysia</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-ink-500">
            {lessonCount} pengembaraan pembelajaran mengikut sukatan KSPK dan KSSR. Bahasa Melayu,
            English, Matematik, Sains dan Sejarah — semuanya dalam satu app.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/daftar">
              <Button className="w-full px-10 py-4 text-lg sm:w-auto">
                Mula Sekarang — {formatMYR(PRICE_MYR)}
              </Button>
            </Link>
            <Link to="/main">
              <Button variant="neutral" className="w-full px-8 py-4 text-lg sm:w-auto">
                Cuba Dulu
              </Button>
            </Link>
          </div>
          <p className="mt-3 text-sm font-semibold text-ink-300">
            Bayaran sekali sahaja · Akses seumur hidup · Tiada langganan
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16">
        <h2 className="text-center text-2xl font-black text-ink-900">
          Satu app, empat peringkat umur
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {AGE_BAND_ORDER.map((bandId) => {
            const band = AGE_BANDS[bandId]
            return (
              <div key={bandId} className="card-3d">
                <p className="text-lg font-black text-brand-700">{band.label}</p>
                <p className="mt-1 text-sm font-semibold text-ink-300">{band.framework}</p>
                <ul className="mt-3 space-y-1">
                  {band.subjects.slice(0, 4).map((s) => (
                    <li key={s} className="text-sm text-ink-500">
                      {SUBJECTS[s].emoji} {SUBJECTS[s].name}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-2xl font-black text-ink-900">
            Kenapa ibu bapa pilih Anak Pandai
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="card-3d">
                <span className="text-3xl">{f.emoji}</span>
                <h3 className="mt-2 font-black text-ink-900">{f.title}</h3>
                <p className="mt-1 text-sm text-ink-500">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-3xl border-4 border-brand-200 bg-white p-8 text-center">
          <p className="text-sm font-extrabold uppercase tracking-widest text-brand-600">
            Harga Pelancaran
          </p>
          <p className="mt-3 text-6xl font-black text-ink-900">{formatMYR(PRICE_MYR)}</p>
          <p className="mt-2 font-bold text-ink-300">Bayar sekali. Guna selamanya.</p>
          <ul className="mx-auto mt-6 max-w-sm space-y-2 text-left">
            {[
              'Semua peringkat umur 1-12 tahun',
              'Semua subjek KSPK & KSSR',
              'Sehingga 4 profil anak',
              'Laporan kemajuan untuk ibu bapa',
              'Kemas kini kandungan percuma',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-ink-700">
                <span className="text-green-500">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <Link to="/daftar" className="mt-8 inline-block">
            <Button className="px-10 py-4 text-lg">Daftar & Bayar</Button>
          </Link>
        </div>
      </section>

      <section className="bg-brand-700 py-16 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-black">Jana pendapatan sebagai affiliate</h2>
          <p className="mt-3 text-brand-100">
            Kongsi pautan anda. Dapat komisen {formatMYR(COMMISSION_MYR)} untuk setiap jualan —
            itu 50% daripada harga.
          </p>
          <Link to="/affiliate" className="mt-6 inline-block">
            <Button variant="gold" className="px-8 py-4 text-lg">
              Jadi Affiliate
            </Button>
          </Link>
        </div>
      </section>

      <footer className="mx-auto max-w-5xl px-4 py-10 text-center text-sm text-ink-300">
        <Logo />
        <p className="mt-3">© {CURRENT_YEAR} Anak Pandai. Dibina di Malaysia 🇲🇾</p>
      </footer>
    </div>
  )
}
