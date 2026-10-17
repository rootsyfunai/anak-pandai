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
import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import Busboy from 'busboy'
import { Pool } from 'pg'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

const DIST = resolve(process.cwd(), 'dist')
const PORT = Number(process.env.PORT) || 3000
const DATABASE_URL = process.env.DATABASE_URL

/**
 * Railway's internal URL (postgres.railway.internal) does not use TLS, while
 * public proxy URLs do. Forcing SSL on both breaks one of them, so follow the
 * URL: only enable SSL when the connection is not internal/local and the URL
 * does not explicitly disable it.
 */
function poolOptions(connectionString) {
  const url = new URL(connectionString)
  const sslMode = url.searchParams.get('sslmode')
  const isInternal =
    url.hostname.endsWith('.railway.internal') ||
    url.hostname === 'localhost' ||
    url.hostname === '127.0.0.1'
  if (sslMode === 'disable' || isInternal) return { connectionString }
  return { connectionString, ssl: { rejectUnauthorized: false } }
}

const pool = DATABASE_URL ? new Pool(poolOptions(DATABASE_URL)) : null
const scrypt = promisify(scryptCallback)
const r2 = process.env.R2_ENDPOINT && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY
  ? new S3Client({
      endpoint: process.env.R2_ENDPOINT,
      region: 'auto',
      credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
    })
  : null

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

function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
  res.end(JSON.stringify(body))
}

function tokenHash(token) {
  return createHash('sha256').update(token).digest('hex')
}

async function passwordHash(password) {
  const salt = randomBytes(16).toString('hex')
  const derived = await scrypt(password, salt, 64)
  return `scrypt:${salt}:${Buffer.from(derived).toString('hex')}`
}

async function passwordMatches(password, encoded) {
  const [, salt, expected] = encoded.split(':')
  const actual = Buffer.from(await scrypt(password, salt, 64))
  const expectedBuffer = Buffer.from(expected, 'hex')
  return actual.length === expectedBuffer.length && timingSafeEqual(actual, expectedBuffer)
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
      if (body.length > 1_000_000) req.destroy(new Error('Request too large'))
    })
    req.on('end', () => {
      try { resolve(JSON.parse(body)) } catch { reject(new Error('O corpo da requisição tidak sah.')) }
    })
    req.on('error', reject)
  })
}

function cookieToken(req) {
  const cookies = req.headers.cookie?.split(';').map((item) => item.trim()) ?? []
  const auth = cookies.find((item) => item.startsWith('ap_session='))
  return auth?.slice('ap_session='.length) ?? null
}

async function authenticatedUser(req) {
  if (!pool) return null
  const token = cookieToken(req)
  if (!token) return null
  const { rows } = await pool.query(
    `select p.id, p.email, p.full_name, p.is_admin
     from sessions s join profiles p on p.id = s.profile_id
     where s.token_hash = $1 and s.expires_at > now()`,
    [tokenHash(token)],
  )
  return rows[0] ?? null
}

async function createSession(res, profileId) {
  const token = randomBytes(32).toString('base64url')
  await pool.query(
    `insert into sessions (token_hash, profile_id, expires_at) values ($1, $2, now() + interval '30 days')`,
    [tokenHash(token), profileId],
  )
  res.setHeader('Set-Cookie', `ap_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`)
}

async function handleApi(req, res, pathname) {
  if (!pool) return json(res, 503, { error: 'DATABASE_URL belum dikonfigurasi di Railway.' })
  try {
    if (req.method === 'GET' && pathname === '/api/auth/me') {
      return json(res, 200, { user: await authenticatedUser(req) })
    }
    if (req.method === 'POST' && (pathname === '/api/auth/signup' || pathname === '/api/auth/login')) {
      const body = await readJson(req)
      const email = String(body.email ?? '').trim().toLowerCase()
      const password = String(body.password ?? '')
      if (!email || password.length < 8) return json(res, 400, { error: 'E-mel dan kata laluan minimum 8 aksara diperlukan.' })
      if (pathname.endsWith('signup')) {
        const fullName = String(body.fullName ?? '').trim().slice(0, 120)
        const result = await pool.query(
          'insert into profiles (email, password_hash, full_name) values ($1, $2, $3) returning id, email, full_name, is_admin',
          [email, await passwordHash(password), fullName],
        )
        await createSession(res, result.rows[0].id)
        return json(res, 201, { user: result.rows[0] })
      }
      const result = await pool.query('select id, email, full_name, is_admin, password_hash from profiles where email = $1', [email])
      const profile = result.rows[0]
      if (!profile || !(await passwordMatches(password, profile.password_hash))) return json(res, 401, { error: 'E-mel atau kata laluan tidak betul.' })
      delete profile.password_hash
      await createSession(res, profile.id)
      return json(res, 200, { user: profile })
    }

    const user = await authenticatedUser(req)
    if (!user) return json(res, 401, { error: 'Sila masuk terlebih dahulu.' })

    if (req.method === 'POST' && pathname === '/api/orders') {
      if (!r2 || !process.env.R2_BUCKET) return json(res, 503, { error: 'Penyimpanan resit R2 belum dikonfigurasi di Railway.' })
      const parts = await readMultipart(req)
      if (!parts.file) return json(res, 400, { error: 'Sila pilih gambar resit pembayaran.' })
      const key = `payment-proofs/${user.id}/${randomBytes(16).toString('hex')}-${parts.file.filename}`
      await r2.send(new PutObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: key,
        Body: parts.file.data,
        ContentType: parts.file.mime,
      }))
      const affiliateCode = parts.fields.affiliateCode || null
      const affiliate = affiliateCode
        ? (await pool.query('select id from affiliates where lower(code) = lower($1) and is_active = true', [affiliateCode])).rows[0]
        : null
      await pool.query(
        `insert into orders (parent_id, proof_path, reference_note, affiliate_id, affiliate_code)
         values ($1, $2, $3, $4, $5)`,
        [user.id, key, parts.fields.referenceNote ?? '', affiliate?.id ?? null, affiliateCode],
      )
      return json(res, 201, { ok: true })
    }

    if (req.method === 'GET' && pathname === '/api/admin/orders') {
      if (!user.is_admin) return json(res, 403, { error: 'Akses admin diperlukan.' })
      const { rows } = await pool.query(
        `select id, parent_id, amount_myr, affiliate_code, reference_note, proof_path, status, created_at
         from orders order by created_at desc limit 200`,
      )
      return json(res, 200, { orders: rows })
    }

    const decision = pathname.match(/^\/api\/admin\/orders\/([0-9a-f-]+)$/)
    if (req.method === 'PATCH' && decision) {
      if (!user.is_admin) return json(res, 403, { error: 'Akses admin diperlukan.' })
      const body = await readJson(req)
      if (!['approved', 'rejected'].includes(body.status)) return json(res, 400, { error: 'Status tidak sah.' })
      const { rows } = await pool.query(
        `update orders set status = $1, reviewed_by = $2, reviewed_at = now(),
         commission_myr = case when $1 = 'approved' and affiliate_id is not null then amount_myr * 0.5 else null end
         where id = $3 returning id, parent_id, amount_myr, affiliate_code, reference_note, proof_path, status, created_at`,
        [body.status, user.id, decision[1]],
      )
      if (!rows[0]) return json(res, 404, { error: 'Pesanan tidak ditemui.' })
      if (body.status === 'approved') {
        await pool.query(
          `insert into entitlements (parent_id, order_id)
           values ($1, $2) on conflict (parent_id) where revoked_at is null do nothing`,
          [rows[0].parent_id, rows[0].id],
        )
      }
      return json(res, 200, { order: rows[0] })
    }
    return json(res, 404, { error: 'API route tidak ditemui.' })
  } catch (error) {
    console.error('API error', error)
    if (error?.code === '23505') return json(res, 409, { error: 'E-mel itu sudah berdaftar.' })
    return json(res, 500, { error: 'Ralat pelayan. Cuba lagi.' })
  }
}

function readMultipart(req) {
  return new Promise((resolve, reject) => {
    const parser = Busboy({ headers: req.headers, limits: { fileSize: 8 * 1024 * 1024, files: 1, fields: 3 } })
    const fields = {}
    let file = null
    parser.on('field', (name, value) => { fields[name] = value })
    parser.on('file', (name, stream, info) => {
      const chunks = []
      stream.on('data', (chunk) => chunks.push(chunk))
      stream.on('limit', () => reject(new Error('Fail resit terlalu besar.')))
      stream.on('end', () => { file = { data: Buffer.concat(chunks), filename: info.filename.replace(/[^\w.-]/g, '_'), mime: info.mimeType } })
    })
    parser.on('finish', () => resolve({ fields, file }))
    parser.on('error', reject)
    req.pipe(parser)
  })
}

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

  if (pathname.startsWith('/api/')) {
    await handleApi(req, res, pathname)
    return
  }

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
