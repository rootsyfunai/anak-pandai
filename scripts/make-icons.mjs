/**
 * One-off icon generator. Produces the PNG app icons the PWA manifest needs
 * from a single vector description, so the icons stay in sync with the brand
 * colour and no binary blobs are hand-edited.
 *
 * Run with: node scripts/make-icons.mjs
 *
 * PNG encoding is done by hand with zlib rather than pulling in a rasteriser
 * dependency: the artwork is simple enough (rounded square, circles, triangle)
 * that a few hundred lines of maths beats adding sharp or canvas to the
 * dependency tree.
 */
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons')

const BRAND = [124, 58, 237] // #7c3aed
const BRAND_DARK = [91, 33, 182] // #5b21b6
const CREAM = [253, 250, 247] // #fdfaf7
const GOLD = [251, 191, 36] // #fbbf24

/** Signed distance from a point to a rounded rectangle. Negative is inside. */
function roundedRectDistance(x, y, cx, cy, halfW, halfH, radius) {
  const dx = Math.abs(x - cx) - (halfW - radius)
  const dy = Math.abs(y - cy) - (halfH - radius)
  const outside = Math.hypot(Math.max(dx, 0), Math.max(dy, 0))
  return outside + Math.min(Math.max(dx, dy), 0) - radius
}

/** Signed distance from a point to a circle. Negative is inside. */
function circleDistance(x, y, cx, cy, radius) {
  return Math.hypot(x - cx, y - cy) - radius
}

/** Signed distance from a point to a triangle. Negative is inside. */
function triangleDistance(x, y, ax, ay, bx, by, cx, cy) {
  const edge = (px, py, qx, qy) => (qx - px) * (y - py) - (qy - py) * (x - px)
  const d1 = edge(ax, ay, bx, by)
  const d2 = edge(bx, by, cx, cy)
  const d3 = edge(cx, cy, ax, ay)
  const inside = (d1 >= 0 && d2 >= 0 && d3 >= 0) || (d1 <= 0 && d2 <= 0 && d3 <= 0)

  const distToSegment = (px, py, qx, qy) => {
    const vx = qx - px
    const vy = qy - py
    const t = Math.max(0, Math.min(1, ((x - px) * vx + (y - py) * vy) / (vx * vx + vy * vy)))
    return Math.hypot(x - (px + t * vx), y - (py + t * vy))
  }

  const nearest = Math.min(
    distToSegment(ax, ay, bx, by),
    distToSegment(bx, by, cx, cy),
    distToSegment(cx, cy, ax, ay),
  )
  return inside ? -nearest : nearest
}

/** Antialias a signed distance into a 0..1 coverage value. */
function coverage(distance, feather = 1) {
  return Math.max(0, Math.min(1, 0.5 - distance / feather))
}

/** Blend `top` over `bottom` with the given alpha. */
function over(bottom, top, alpha) {
  return [
    Math.round(bottom[0] + (top[0] - bottom[0]) * alpha),
    Math.round(bottom[1] + (top[1] - bottom[1]) * alpha),
    Math.round(bottom[2] + (top[2] - bottom[2]) * alpha),
  ]
}

/**
 * Draws the Anak Pandai mark: a rounded brand tile with a cream owl face and
 * a gold beak. `inset` shrinks the artwork for maskable icons, which Android
 * crops to a circle and would otherwise clip the edges.
 */
function renderIcon(size, { inset = 0 } = {}) {
  const pixels = Buffer.alloc(size * size * 4)
  const s = size
  const pad = s * inset
  const inner = s - pad * 2

  // Owl geometry, expressed as fractions of the inner box.
  const eyeR = inner * 0.115
  const eyeY = pad + inner * 0.42
  const eyeLX = pad + inner * 0.34
  const eyeRX = pad + inner * 0.66
  const pupilR = eyeR * 0.45
  const beakHalf = inner * 0.075
  const beakTop = pad + inner * 0.56
  const beakBottom = pad + inner * 0.72
  const faceR = inner * 0.34
  const faceCx = pad + inner * 0.5
  const faceCy = pad + inner * 0.47

  for (let y = 0; y < s; y++) {
    for (let x = 0; x < s; x++) {
      const px = x + 0.5
      const py = y + 0.5

      // Background. Maskable icons fill the whole square so the platform can
      // crop to any shape without revealing transparent corners.
      let colour
      if (inset > 0) {
        colour = BRAND
      } else {
        const tile = roundedRectDistance(px, py, s / 2, s / 2, s / 2, s / 2, s * 0.22)
        colour = over(CREAM, BRAND, coverage(tile))
      }

      // Cream face disc.
      const face = circleDistance(px, py, faceCx, faceCy, faceR)
      colour = over(colour, CREAM, coverage(face))

      // Eyes: brand-dark ring with a brand-dark pupil.
      for (const eyeX of [eyeLX, eyeRX]) {
        const ring = Math.abs(circleDistance(px, py, eyeX, eyeY, eyeR)) - eyeR * 0.22
        colour = over(colour, BRAND_DARK, coverage(ring))
        const pupil = circleDistance(px, py, eyeX, eyeY, pupilR)
        colour = over(colour, BRAND_DARK, coverage(pupil))
      }

      // Gold beak.
      const beak = triangleDistance(
        px,
        py,
        faceCx - beakHalf,
        beakTop,
        faceCx + beakHalf,
        beakTop,
        faceCx,
        beakBottom,
      )
      colour = over(colour, GOLD, coverage(beak))

      const i = (y * s + x) * 4
      pixels[i] = colour[0]
      pixels[i + 1] = colour[1]
      pixels[i + 2] = colour[2]
      pixels[i + 3] = 255
    }
  }

  return encodePng(pixels, s, s)
}

/** Minimal PNG encoder: 8-bit RGBA, no interlacing, single IDAT. */
function encodePng(rgba, width, height) {
  const stride = width * 4 + 1
  const raw = Buffer.alloc(stride * height)
  for (let y = 0; y < height; y++) {
    raw[y * stride] = 0 // filter type: none
    rgba.copy(raw, y * stride + 1, y * width * 4, (y + 1) * width * 4)
  }

  const chunk = (type, data) => {
    const length = Buffer.alloc(4)
    length.writeUInt32BE(data.length)
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
    const crc = Buffer.alloc(4)
    crc.writeUInt32BE(crc32(body) >>> 0)
    return Buffer.concat([length, body, crc])
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // colour type: RGBA
  ihdr[10] = 0 // compression
  ihdr[11] = 0 // filter
  ihdr[12] = 0 // interlace

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

let crcTable = null
function crc32(buf) {
  if (!crcTable) {
    crcTable = new Int32Array(256)
    for (let n = 0; n < 256; n++) {
      let c = n
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      crcTable[n] = c
    }
  }
  let crc = -1
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff]
  return crc ^ -1
}

mkdirSync(OUT_DIR, { recursive: true })

const targets = [
  ['icon-192.png', 192, {}],
  ['icon-512.png', 512, {}],
  // Maskable icons are cropped to a circle by Android, so the artwork is
  // inset to keep the owl inside the safe zone.
  ['maskable-512.png', 512, { inset: 0.14 }],
  ['apple-touch-icon.png', 180, {}],
]

for (const [name, size, options] of targets) {
  const png = renderIcon(size, options)
  writeFileSync(resolve(OUT_DIR, name), png)
  console.log(`${name}  ${size}x${size}  ${(png.length / 1024).toFixed(1)} KB`)
}
