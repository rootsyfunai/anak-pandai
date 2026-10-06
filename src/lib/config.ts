export const PRICE_MYR = 50
export const COMMISSION_RATE = 0.5
export const COMMISSION_MYR = PRICE_MYR * COMMISSION_RATE

export const APP_NAME = 'Anak Pandai'
export const SUPPORT_EMAIL = 'sokongan@anakpandai.my'

/**
 * Base URL for the image CDN (Cloudflare).
 *
 * Every image must be served from here, never from Railway: Railway bills
 * egress and a single hero photo served per visit would dwarf the cost of
 * the app itself. Cloudflare's free tier covers this comfortably.
 *
 * Set VITE_IMAGE_CDN in the Railway environment. When it is unset the app
 * falls back to local placeholders so development still works offline.
 */
export const IMAGE_CDN = (import.meta.env.VITE_IMAGE_CDN as string | undefined)?.replace(/\/$/, '') ?? ''

/**
 * Builds a CDN image URL. Returns null when no CDN is configured, which lets
 * callers render a CSS-only fallback instead of a broken image.
 */
export function cdnImage(path: string): string | null {
  if (!IMAGE_CDN) return null
  return `${IMAGE_CDN}/${path.replace(/^\//, '')}`
}

/** Manual QR payment details, shown at checkout. */
export const PAYMENT = {
  method: 'DuitNow QR',
  payee: 'Anak Pandai',
  /** Replace with the real merchant QR image before launch. */
  qrImagePath: '/qr-payment.svg',
  instructions: [
    'Buka aplikasi bank atau e-wallet anda.',
    'Pilih "DuitNow QR" dan imbas kod di atas.',
    'Masukkan jumlah RM50.00 dan sahkan pembayaran.',
    'Simpan resit, kemudian muat naik di bawah.',
  ],
} as const

export function formatMYR(amount: number): string {
  return `RM${amount.toFixed(2)}`
}
