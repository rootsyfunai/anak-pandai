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
- **Boleh dipasang sebagai app (PWA)** — ada manifest, ikon, dan service worker
- **Boleh guna offline** — shell app dan aset build dicache, jadi anak boleh
  terus belajar tanpa internet selepas lawatan pertama

## Mula

```bash
npm install
npm run dev
```

App berjalan dalam **mod demo tempatan** tanpa Railway Postgres — kemajuan disimpan dalam
`localStorage` dan pesanan disimpan dalam pelayar. Ini membolehkan anda cuba keseluruhan
aliran sebelum menyediakan backend.

## Sambung Railway Postgres

App menggunakan Railway Postgres melalui API same-origin dalam `server/`.
Connection string tidak pernah dihantar ke pelayar.

1. Tambah servis **Postgres** pada projek Railway.
2. Jalankan `db/migrations/0001_init.sql` pada database itu.
3. Tetapkan `DATABASE_URL` pada servis app.
4. Untuk resit pembayaran, sediakan bucket Cloudflare R2 dan tetapkan:

```
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=payment-proofs
```

5. Tandakan akaun anda sebagai admin:

```sql
update profiles set is_admin = true where email = 'anda@email.com';
```

## Imej (Cloudflare CDN)

**Jangan sekali-kali serve imej dari Railway** — egress akan membengkak kos.
Semua imej mesti datang dari Cloudflare.

1. Muat naik imej ke Cloudflare R2 atau Images.
2. Tetapkan `VITE_IMAGE_CDN` kepada URL asas CDN (tanpa `/` di hujung):

```
VITE_IMAGE_CDN=https://imej.anakpandai.my
```

3. Guna komponen `<CdnImage path="hero/keluarga.jpg" alt="..." />`. Ia membaca
   `VITE_IMAGE_CDN` dan memaparkan fallback CSS jika CDN belum diset, jadi
   pembangunan tempatan tetap berfungsi tanpa internet.

Imej yang perlu dimuat naik:

| Path CDN | Guna |
| --- | --- |
| `hero/keluarga-belajar.jpg` | Latar hero di halaman utama |
| `testimonials/*.jpg` | Gambar ibu bapa (lihat nota di bawah) |

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
| `npm run start` | Hidangkan `dist/` (produksi, untuk Railway) |
| `npm run test` | Jalankan ujian unit |
| `npm run lint` | Jalankan oxlint |

## Kos hosting (Railway)

Railway mengenakan bayaran untuk masa komputasi, memori dan **egress**. App ini
dibina supaya bil kekal rendah tanpa mengorbankan kualiti permainan.

**Peraturan utama:**

1. **Jangan sekali-kali hidangkan imej atau video dari Railway.**
   - Imej → **Cloudflare** (R2 atau Images). Sentiasa guna URL CDN.
   - Video → **YouTube** sahaja.
   - `public/` hanya untuk UI kecil (logo, favicon, QR).
2. **App ini SPA statik.** `server/index.mjs` hanya menghidangkan fail siap bina —
   tiada proses Node yang memegang memori terbuka.
3. **Bundle klien mesti kecil.** Setiap KB dimuat turun oleh setiap pelawat.
   - Route dipecah dengan `React.lazy` — lihat `src/App.tsx`.
   - Pakej Postgres, auth dan R2 hanya digunakan oleh `server/`, bukan
     bundle pelayar.
   - Selepas tambah sebarang pakej, semak saiz bundle.
4. **Cache agresif.** Fail ber-hash di-cache 1 tahun (`immutable`); HTML sentiasa
   divalidasi semula. Ini lever terbesar untuk egress — aset yang di-cache
   adalah percuma untuk dihidangkan semula.
5. **Jangan poll backend.** Tiada `setInterval` yang fetch. Pengguna idle
   sepatutnya kos ~sifar.

**Saiz muatan awal (landing page):**

| Fail | Saiz | Gzip |
|---|---|---|
| `react-*.js` | 258 KB | 82 KB |
| `index-*.js` | 23 KB | 8 KB |
| `index-*.css` | 27 KB | 6 KB |

Landing page memuatkan **4 fail sahaja**. API, Admin, Checkout dan Play
dimuatkan hanya apabila dilawati. Dengan Brotli, `react-*.js` turun dari 258 KB
ke 72 KB.

**Apa yang TIDAK boleh dikorbankan:** animasi maklum balas (betul/salah/
sambutan), imej, bunyi dan pertuturan. Kanak-kanak perlukan maklum balas itu —
ia adalah produknya. Optimumkan *penghantaran*, bukan *pengalaman*.

## Sebelum pelancaran

- [ ] Gantikan `public/qr-payment.svg` dengan kod QR DuitNow sebenar
- [ ] Kemas kini `PAYMENT` dalam `src/lib/config.ts` dengan nama akaun sebenar
- [ ] Muat naik imej ke Cloudflare dan tetapkan `VITE_IMAGE_CDN`
- [ ] **Gantikan testimoni palsu** dalam `TESTIMONIALS` (`src/pages/Landing.tsx`)
      dengan petikan sebenar, atau buang seksyen itu. Testimoni yang direka
      adalah risiko misrepresentasi di bawah undang-undang perlindungan
      pengguna Malaysia.
- [ ] Tambah halaman dasar privasi dan terma (keperluan PDPA)
- [ ] Sediakan proses pembayaran komisen affiliate
- [ ] Tambah lebih banyak pelajaran — 19 pelajaran adalah asas, bukan lengkap
- [ ] Sediakan Railway Postgres, jalankan migrasi, dan tetapkan `is_admin = true`

## Struktur

```
server/
  index.mjs     Pelayan HTTP: SPA, cache, mampatan
  api.mjs       Laluan /api/* (auth, progress, pesanan, admin)
  core.mjs      Pool Postgres, R2, e-mel, sesi, had kadar
src/
  components/   UI kongsi (Button, CdnImage, Hud, Logo, AccountButton)
  data/         Sukatan dan kandungan pelajaran
  games/        Enjin permainan (XP, nyawa, streak, bintang)
  lib/          API Railway, affiliate, config, progress, akses, speech, pwa
  pages/        Landing, Path, Play, Checkout, Affiliate, Admin, auth
public/         Chrome UI sahaja (ikon, manifest, service worker, QR)
scripts/        Penjana ikon PWA
db/
  migrations/   Skema Postgres (dijalankan sekali, direkod dalam schema_migrations)
  migrate.mjs   Pelari migrasi
```
