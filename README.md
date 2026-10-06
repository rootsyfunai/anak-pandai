# Anak Pandai 🦉

Permainan pembelajaran digital untuk anak Malaysia, umur 1-12 tahun. Dibina mengikut
sukatan kebangsaan: **KSPK** (prasekolah) dan **KSSR** (Tahun 1-6).

Harga: **RM50 sekali bayar**. Komisen affiliate: **50% (RM25)** setiap jualan.

## Peringkat umur & sukatan

| Umur | Rangka | Subjek |
|---|---|---|
| 1-3 | Pembelajaran awal (bukan formal) | Diri & Keluarga, Seni & Muzik, Matematik |
| 4-6 | KSPK Prasekolah | BM, English, Matematik, Sains, Pendidikan Islam, Pendidikan Moral, Diri, Seni |
| 7-9 | KSSR Tahap 1 (Tahun 1-3) | BM, English, Matematik, Sains, Pendidikan Islam, Pendidikan Moral |
| 10-12 | KSSR Tahap 2 (Tahun 4-6) | + Sejarah |

**Mod bayi (1-3 tahun)** tiada nyawa, tiada streak, dan tiada bacaan — hanya audio dan
gambar. Nyawa dan streak hanya bermula umur 7 tahun ke atas.

## Ciri-ciri

- **Laluan pembelajaran gaya Duolingo** — nod pelajaran berturutan, kunci sehingga
  pelajaran sebelumnya selesai
- **XP, tahap, bintang, streak harian** — motivasi berterusan
- **Nyawa (hearts)** untuk umur 7+ sahaja
- **Soalan bercampur** — pilihan jawapan, padanan, dan dengar-bunyi
- **Bacaan audio** melalui Web Speech API untuk pra-pembaca
- **Kod affiliate dijejak automatik** melalui `?ref=CODE` — pembeli tidak perlu taip apa-apa
- **Pembayaran QR manual** dengan muat naik resit dan kelulusan admin
- **Papan pemuka admin** untuk semak pesanan dan kira komisen

## Mula

```bash
npm install
npm run dev
```

App berjalan dalam **mod demo tempatan** tanpa Supabase — kemajuan disimpan dalam
`localStorage` dan pesanan disimpan dalam pelayar. Ini membolehkan anda cuba keseluruhan
aliran sebelum menyediakan backend.

## Sambung Supabase

1. Cipta projek di [supabase.com](https://supabase.com)
2. Jalankan migrasi: `supabase/migrations/0001_init.sql`
3. Salin `.env.example` ke `.env.local` dan isi:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxx
```

4. Tandakan akaun anda sebagai admin:

```sql
update public.profiles set is_admin = true where email = 'anda@email.com';
```

## Aliran affiliate

1. Affiliate kongsi pautan: `https://anakpandai.my/?ref=ALI2026`
2. Kod ditangkap pada lawatan pertama dan disimpan (localStorage + cookie, 90 hari)
3. Semasa pembayaran, kod dipautkan secara automatik ke pesanan
4. Bila admin luluskan pesanan, komisen 50% dikira oleh trigger pangkalan data

## Aliran pembayaran

1. Ibu bapa daftar akaun
2. Imbas kod QR DuitNow dan bayar RM50
3. Muat naik gambar resit
4. Admin semak di `/admin` dan luluskan
5. Entitlement dicipta secara automatik — akses penuh dibuka

## Skrip

| Arahan | Fungsi |
|---|---|
| `npm run dev` | Pelayan pembangunan |
| `npm run build` | Semak jenis + bina untuk produksi |
| `npm run test` | Jalankan ujian unit |
| `npm run lint` | Jalankan oxlint |

## Sebelum pelancaran

- [ ] Gantikan `public/qr-payment.svg` dengan kod QR DuitNow sebenar
- [ ] Kemas kini `PAYMENT` dalam `src/lib/config.ts` dengan nama akaun sebenar
- [ ] Tambah `manifest.json` dan service worker untuk sokongan PWA/offline
- [ ] Tambah halaman dasar privasi dan terma (keperluan PDPA)
- [ ] Sediakan proses pembayaran komisen affiliate
- [ ] Tambah lebih banyak pelajaran — 19 pelajaran adalah asas, bukan lengkap

## Struktur

```
src/
  components/   UI kongsi (Button, Hud, Logo)
  data/         Sukatan dan kandungan pelajaran
  games/        Enjin permainan (XP, nyawa, streak, bintang)
  lib/          Supabase, affiliate, config, progress, speech
  pages/        Landing, Path, Play, Checkout, Affiliate, Admin, SignUp, SignIn
supabase/
  migrations/   Skema pangkalan data dan polisi RLS
```
