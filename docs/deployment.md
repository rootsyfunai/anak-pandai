# Deployment (Railway)

App ini dihoskan di **Railway** sebagai SPA statik dengan API same-origin dalam
`server/`. Dokumen ini merangkumi backend, pemboleh ubah persekitaran, CDN imej
dan senarai semak pelancaran.

## Pemboleh ubah persekitaran

Salin `.env.example` ke `.env.local` untuk pembangunan tempatan. Semua pemboleh
ubah di bawah dibaca oleh `server/` sahaja — jangan sekali-kali beri awalan
`VITE_` kecuali `VITE_IMAGE_CDN`, yang memang selamat dihantar ke pelayar.

| Pemboleh ubah | Guna |
| --- | --- |
| `DATABASE_URL` | Connection string Postgres Railway. Tidak pernah dihantar ke pelayar. |
| `R2_ENDPOINT` | Endpoint S3-compatible bucket Cloudflare R2. |
| `R2_ACCESS_KEY_ID` | Kunci akses R2. |
| `R2_SECRET_ACCESS_KEY` | Rahsia R2. |
| `R2_BUCKET` | Bucket resit pembayaran. |
| `RESEND_API_KEY` | E-mel transaksional untuk reset kata laluan. |
| `MAIL_FROM` | Alamat penghantar e-mel. |
| `APP_ORIGIN` | Origin app untuk pautan reset. |
| `VITE_IMAGE_CDN` | URL asas CDN imej, tanpa `/` di hujung. |

`DATABASE_URL`, R2 dan e-mel adalah pilihan semasa pembangunan: tanpanya app
berjalan dalam **mod demo tempatan** dan menyimpan data dalam pelayar.

## Sambung Railway Postgres

App menggunakan Railway Postgres melalui API same-origin dalam `server/`.
Connection string tidak pernah dihantar ke pelayar.

1. Tambah servis **Postgres** pada projek Railway.
2. Tetapkan `DATABASE_URL` pada servis app (reference `${{Postgres.DATABASE_URL}}`).
3. Jalankan migrasi:

   ```bash
   railway run npm run db:migrate
   ```

   Pelari migrasi (`db/migrate.mjs`) menjalankan fail dalam `db/migrations/`
   mengikut urutan nama, sekali sahaja, dalam transaksi, dan merekodkannya dalam
   `schema_migrations`. Selamat dijalankan pada setiap deploy.

4. Untuk resit pembayaran, sediakan bucket Cloudflare R2 dan tetapkan
   `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` dan `R2_BUCKET`
   (contoh: `payment-proofs`).
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
| `testimonials/*.jpg` | Gambar ibu bapa (lihat senarai semak di bawah) |

## Konfigurasi deployment

- `nixpacks.toml` — fasa install/build/start Railway. `NODE_ENV=development`
  dipin semasa install dan build kerana toolchain (TypeScript, Vite, Tailwind)
  berada dalam `devDependencies`; `NODE_ENV=production` hanya untuk fasa start.
  `npm ci` berjalan sekali sahaja di sini.
- `railway.json` — builder Nixpacks, command build/start, polisi restart dan
  healthcheck pada `/`.
- `npm run build` menghasilkan `dist/`; `npm run start` menghidangkan `dist/`
  dan `/api` dengan cache immutable untuk aset ber-hash.

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
