# Seni bina & kos hosting

Railway mengenakan bayaran untuk masa komputasi, memori dan **egress**. App ini
dibina supaya bil kekal rendah tanpa mengorbankan kualiti permainan. Dokumen ini
menerangkan struktur kod dan peraturan yang menjaga kos itu.

## Struktur projek

```
index.html        Titik masuk Vite
vite.config.ts    Plugin React/Tailwind, chunk vendor, konfigurasi Vitest
nixpacks.toml     Fasa install/build/start Railway
railway.json      Tetapan deploy Railway
db/
  migrations/     Skema Postgres (sekali sahaja, direkod dalam schema_migrations)
  migrate.mjs     Pelari migrasi
docs/             Deployment, seni bina dan nota operasi
public/           Chrome UI sahaja (ikon, manifest, service worker, QR)
scripts/          Penjana ikon PWA
server/
  index.mjs       Pelayan HTTP: SPA, cache, mampatan
  api.mjs         Laluan /api/* (auth, progress, pesanan, admin)
  core.mjs        Pool Postgres, R2, e-mel, sesi, had kadar
src/
  components/     UI kongsi (Button, CdnImage, Hud, Logo, AccountButton)
  data/           Sukatan dan kandungan pelajaran
  games/          Enjin permainan (XP, nyawa, streak, bintang)
  lib/            API Railway, affiliate, config, progress, akses, speech, pwa
  pages/          Landing, Path, Play, Checkout, Affiliate, Admin, auth
```

## Peraturan hosting

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

## Saiz muatan awal (landing page)

| Fail | Saiz | Gzip |
| --- | --- | --- |
| `react-*.js` | 258 KB | 82 KB |
| `index-*.js` | 23 KB | 8 KB |
| `index-*.css` | 27 KB | 6 KB |

Landing page memuatkan **4 fail sahaja**. API, Admin, Checkout dan Play
dimuatkan hanya apabila dilawati. Dengan Brotli, `react-*.js` turun dari 258 KB
ke 72 KB.

**Apa yang TIDAK boleh dikorbankan:** animasi maklum balas (betul/salah/
sambutan), imej, bunyi dan pertuturan. Kanak-kanak perlukan maklum balas itu —
ia adalah produknya. Optimumkan *penghantaran*, bukan *pengalaman*.
