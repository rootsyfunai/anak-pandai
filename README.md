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

Untuk Postgres, R2, CDN imej dan deployment, lihat
[docs/deployment.md](docs/deployment.md).

## Skrip

| Arahan | Fungsi |
|---|---|
| `npm run dev` | Pelayan pembangunan |
| `npm run build` | Semak jenis + bina untuk produksi |
| `npm run start` | Hidangkan `dist/` (produksi, untuk Railway) |
| `npm run test` | Jalankan ujian unit |
| `npm run lint` | Jalankan oxlint |
| `npm run db:migrate` | Jalankan migrasi Postgres |

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

## Struktur

```
index.html        Titik masuk Vite
vite.config.ts    Plugin React/Tailwind, chunk vendor, konfigurasi Vitest
nixpacks.toml     Fasa install/build/start Railway
railway.json      Tetapan deploy Railway
db/               Migrasi Postgres dan pelari migrasi
docs/             Deployment, seni bina dan nota operasi
public/           Chrome UI sahaja (ikon, manifest, service worker, QR)
scripts/          Penjana ikon PWA
server/           API same-origin, Postgres, R2, e-mel, sesi
src/              App React (components, data, games, lib, pages)
```

Dokumentasi lanjut:

- [docs/deployment.md](docs/deployment.md) — env vars, Postgres, R2, CDN imej, senarai semak pelancaran
- [docs/architecture.md](docs/architecture.md) — peraturan kos hosting Railway dan bajet bundle
