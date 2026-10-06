# Anak Pandai — Project Instructions

Malaysian digital education game app for children aged 1–12.
RM50 one-time purchase, 50% affiliate commission. Hosted on **Railway**.

---

## Hosting cost is a first-class constraint

Railway bills for **compute time, memory, and egress**. Every decision must be
weighed against that bill. The goal is a **medium-weight** app: rich enough that
the games feel good, lean enough that hosting stays cheap.

### Hard rules

1. **Never serve images or video from Railway.**
   - Images → **Cloudflare** (R2 or Images). Always use a CDN URL, never a local
     file in `public/` for content assets.
   - Video → **YouTube** embeds only. Never self-host video.
   - `public/` is for tiny UI chrome only (logo, favicon, placeholder QR).
   - **Always render images through `<CdnImage>`** (`src/components/CdnImage.tsx`).
     It reads the `VITE_IMAGE_CDN` env var and degrades to a CSS fallback when
     the CDN is unset, so local development works without network access.
     Never hardcode a CDN hostname in a component.

2. **The app is a static SPA.** It must build to static files and be served by a
   CDN. No server-side rendering, no Node server process holding memory open.
   Railway should serve static assets, not run a long-lived app server.

3. **Keep the client bundle small.** Every KB is downloaded by every user on
   every visit, and Railway pays for the egress.
   - Lazy-load routes with `React.lazy` + `Suspense`.
   - Lazy-load heavy libraries (framer-motion, chart libs) — never import them
     into the initial bundle.
   - Prefer CSS animations over JS animation libraries for simple effects.
   - Check bundle size after adding any dependency. If a dependency is >30KB
     gzipped and used in one place, lazy-load it or find a lighter alternative.

4. **Cache aggressively.** Static assets get long-lived immutable cache headers
   (hashed filenames make this safe). This is the single biggest lever on
   egress cost — a cached asset costs nothing to re-serve.

5. **Never poll the backend.** No `setInterval` fetching, no refetch-on-focus
   storms. Use React Query's cache and fetch on user action. Idle users must
   cost ~zero.

6. **Keep the database queries cheap.** Index anything filtered or sorted.
   Never `select *` on a large table. Paginate lesson content.

### What "medium" means — do not over-optimize

The app must still feel like a real game. Do **not**:
- Strip animations that give feedback (correct/wrong/celebration). Kids need
  that feedback; it is the product.
- Replace images with text or icons to save bytes.
- Remove sound or speech.
- Ship a bare-bones UI to chase a smaller bundle.

Optimize the *delivery* (CDN, caching, lazy-loading), not the *experience*.

### Before adding any dependency or asset, ask

- Does this ship to the client bundle? Can it be lazy-loaded?
- Is this asset on a CDN, or is Railway paying to serve it?
- Will this run on every page load, or only when the user acts?

### Environment variables

| Variable | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL. Unset ⇒ app runs in local demo mode. |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key. |
| `VITE_IMAGE_CDN` | Cloudflare image base URL, no trailing slash. Unset ⇒ `<CdnImage>` renders its CSS fallback. |

---

## Placeholder content that must be replaced before launch

These are deliberately fake and must not ship as-is:

- **Testimonials** in `src/pages/Landing.tsx` (`TESTIMONIALS`). Fabricated
  reviews are a misrepresentation risk under Malaysian consumer protection law.
  Replace with real quotes and real photos, or remove the section.
- **Hero image** `hero/keluarga-belajar.jpg` on the CDN. Until it is uploaded
  the hero falls back to a CSS gradient, which is fine but less compelling.
- **QR code** `public/qr-payment.svg` and `PAYMENT.payee` in `src/lib/config.ts`.

---

## Product rules

- **Malaysian only.** Content follows the real national curriculum:
  - Ages 1–3: no KPM framework (pre-formal). Simple, light-hearted baby games.
  - Ages 4–6: **KSPK** (six *tunjang*).
  - Ages 7–9: **KSSR Tahap 1** (Tahun 1–3).
  - Ages 10–12: **KSSR Tahap 2** (Tahun 4–6, adds Sejarah).
- **Pendidikan Islam and Pendidikan Moral are both included casually.** They are
  not sensitive and need no toggle or special handling.
- **Age-appropriate mechanics.** Hearts and streaks only for ages 7+. Ages 1–3
  get no failure state, no reading, no timers — audio and pictures only.
- **Language:** Bahasa Malaysia first. UI copy in Malay.

## Business rules

- Price: **RM50 one-time**. Not a subscription.
- Affiliate commission: **50%** of the sale.
- Affiliate code rides on the URL (`?ref=CODE`) and is auto-attached at
  checkout. The parent never types a code.
- Payment is **manual DuitNow QR** → receipt upload → admin approval.

## Code conventions

- React + Vite + TypeScript + Tailwind v4 + Supabase.
- Tailwind v4 uses `@import 'tailwindcss'` and `@theme` — there is no
  `tailwind.config.js`.
- `defineConfig` in `vite.config.ts` must be imported from `vitest/config`,
  not `vite`, or `tsc -b` fails.
- On Windows, use `npm.cmd` (not `npm`) — `npm.ps1` is blocked by execution
  policy.
- Run `npm.cmd run lint`, `npm.cmd test`, and `npm.cmd run build` before
  considering work done.
