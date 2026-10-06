/**
 * Minimal static file server for Railway.
 *
 * Why not `serve` or `http-server`: both pull in a dependency tree that
 * includes a vulnerable `compression` version, and neither is needed. This
 * app serves pre-built static files with no runtime logic, so a ~100 line
 * server with zero dependencies is smaller, faster to boot, and has no
 * supply-chain surface.
 *
 * Caching is the point here. Railway bills for egress, and a cached asset
 * costs nothing to re-serve, so hashed assets get a one-year immutable
 * cache while the HTML shell is always revalidated.
 */
import { createServer } from 'node:http'
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { extname, join, normalize, resolve } from 'node:path'
import { createGzip, createBrotliCompress, constants } from 'node:zlib'

const DIST = resolve(process.cwd(), 'dist')
const PORT = Number(process.env.PORT) || 3000

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
}

// Vite emits content-hashed filenames, so these can be cached forever: a
// changed file always produces a new URL and can never serve stale content.
const IMMUTABLE = /^\/assets\/.+-[A-Za-z0-9_-]{8,}\.(js|css|woff2|png|jpg|jpeg|webp|avif|svg)$/

const COMPRESSIBLE = /^(text\/|application\/(javascript|json|manifest\+json)|image\/svg)/

function cacheControl(pathname) {
  if (IMMUTABLE.test(pathname)) return 'public, max-age=31536000, immutable'
  if (pathname === '/' || pathname.endsWith('.html')) return 'public, max-age=0, must-revalidate'
  // The service worker must never be served stale, or a fix to the caching
  // logic itself could take up to a day to reach users.
  if (pathname === '/sw.js') return 'public, max-age=0, must-revalidate'
  return 'public, max-age=86400'
}

async function resolveFile(pathname) {
  // Block path traversal: normalise then confirm the result stays in DIST.
  const safe = normalize(pathname).replace(/^(\.\.[/\\])+/, '')
  const candidate = join(DIST, safe)
  if (!candidate.startsWith(DIST)) return null

  try {
    const info = await stat(candidate)
    if (info.isFile()) return { file: candidate, size: info.size }
  } catch {
    // fall through to SPA fallback
  }
  return null
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`)
  let pathname = decodeURIComponent(url.pathname)

  let found = await resolveFile(pathname)

  // SPA fallback: unknown paths serve the app shell so deep links and
  // refreshes work with client-side routing.
  if (!found) {
    pathname = '/index.html'
    found = await resolveFile(pathname)
  }

  if (!found) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Not found')
    return
  }

  const type = MIME[extname(found.file)] ?? 'application/octet-stream'
  const headers = {
    'Content-Type': type,
    'Cache-Control': cacheControl(pathname),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  }

  // The service worker must be allowed to control the whole origin, including
  // the root scope, or offline navigation would not be intercepted.
  if (pathname === '/sw.js') headers['Service-Worker-Allowed'] = '/'

  // Compress text responses. This cuts egress roughly 3-4x on JS/CSS, which
  // is the bulk of what Railway bills for.
  const accept = req.headers['accept-encoding'] ?? ''
  const compressible = COMPRESSIBLE.test(type) && found.size > 1024

  if (compressible && /\bbr\b/.test(accept)) {
    headers['Content-Encoding'] = 'br'
    headers['Vary'] = 'Accept-Encoding'
    res.writeHead(200, headers)
    createReadStream(found.file)
      .pipe(createBrotliCompress({ params: { [constants.BROTLI_PARAM_QUALITY]: 5 } }))
      .pipe(res)
    return
  }

  if (compressible && /\bgzip\b/.test(accept)) {
    headers['Content-Encoding'] = 'gzip'
    headers['Vary'] = 'Accept-Encoding'
    res.writeHead(200, headers)
    createReadStream(found.file).pipe(createGzip({ level: 6 })).pipe(res)
    return
  }

  headers['Content-Length'] = String(found.size)
  res.writeHead(200, headers)
  if (req.method === 'HEAD') {
    res.end()
    return
  }
  createReadStream(found.file).pipe(res)
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Anak Pandai serving dist/ on port ${PORT}`)
})
