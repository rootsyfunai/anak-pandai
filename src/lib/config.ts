export const PRICE_MYR = 50
export const COMMISSION_RATE = 0.5
export const COMMISSION_MYR = PRICE_MYR * COMMISSION_RATE

export const APP_NAME = 'Anak Pandai'
export const SUPPORT_EMAIL = 'sokongan@anakpandai.my'

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
