/**
 * Shared server infrastructure: database pool, R2 storage, mail, request
 * parsing, session auth and rate limiting.
 *
 * Everything here runs on Railway only. None of it is imported by the browser
 * bundle, so Postgres and AWS SDK bytes never reach a child's device.
 */
import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import Busboy from 'busboy'
import { Pool } from 'pg'
import { S3Client } from '@aws-sdk/client-s3'

const scrypt = promisify(scryptCallback)

/**
 * Railway's internal URL (postgres.railway.internal) does not use TLS, while
 * public proxy URLs do. Forcing SSL on both breaks one of them, so follow the
 * URL: only enable SSL when the connection is not internal/local and the URL
 * does not explicitly disable it.
 */
export function poolOptions(connectionString) {
  const url = new URL(connectionString)
  const isInternal =
    url.hostname.endsWith('.railway.internal') ||
    url.hostname === 'localhost' ||
    url.hostname === '127.0.0.1'
  if (url.searchParams.get('sslmode') === 'disable' || isInternal) {
    return { connectionString }
  }
  return { connectionString, ssl: { rejectUnauthorized: false } }
}

export const pool = process.env.DATABASE_URL
  ? new Pool(poolOptions(process.env.DATABASE_URL))
  : null

const r2Configured = Boolean(
  process.env.R2_ENDPOINT && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY,
)

export const r2 = r2Configured
  ? new S3Client({
      endpoint: process.env.R2_ENDPOINT,
      region: 'auto',
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    })
  : null

export const R2_BUCKET = process.env.R2_BUCKET ?? null
export const isStorageConfigured = r2Configured && Boolean(R2_BUCKET)

const RESEND_API_KEY = process.env.RESEND_API_KEY
const MAIL_FROM = process.env.MAIL_FROM ?? 'Anak Pandai <noreply@anakpandai.my>'
const APP_ORIGIN = process.env.APP_ORIGIN?.replace(/\/$/, '') ?? null

export function json(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })
  res.end(JSON.stringify(body))
}

export function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
      if (body.length > 1_000_000) req.destroy(new Error('Request too large'))
    })
    req.on('end', () => {
      try {
        resolve(JSON.parse(body))
      } catch {
        reject(new Error('Format permintaan tidak sah.'))
      }
    })
    req.on('error', reject)
  })
}

export function readMultipart(req) {
  return new Promise((resolve, reject) => {
    const parser = Busboy({
      headers: req.headers,
      limits: { fileSize: 8 * 1024 * 1024, files: 1, fields: 3 },
    })
    const fields = {}
    let file = null
    parser.on('field', (name, value) => {
      fields[name] = value
    })
    parser.on('file', (name, stream, info) => {
      const chunks = []
      stream.on('data', (chunk) => chunks.push(chunk))
      stream.on('limit', () => reject(new Error('Fail resit terlalu besar.')))
      stream.on('end', () => {
        file = {
          data: Buffer.concat(chunks),
          filename: info.filename.replace(/[^\w.-]/g, '_'),
          mime: info.mimeType,
        }
      })
    })
    parser.on('finish', () => resolve({ fields, file }))
    parser.on('error', reject)
    req.pipe(parser)
  })
}

export function tokenHash(token) {
  return createHash('sha256').update(token).digest('hex')
}

export async function passwordHash(password) {
  const salt = randomBytes(16).toString('hex')
  const derived = await scrypt(password, salt, 64)
  return `scrypt:${salt}:${Buffer.from(derived).toString('hex')}`
}

export async function passwordMatches(password, encoded) {
  const [, salt, expected] = encoded.split(':')
  const actual = Buffer.from(await scrypt(password, salt, 64))
  const expectedBuffer = Buffer.from(expected, 'hex')
  return actual.length === expectedBuffer.length && timingSafeEqual(actual, expectedBuffer)
}

export function cookieToken(req) {
  const cookies = req.headers.cookie?.split(';').map((item) => item.trim()) ?? []
  const auth = cookies.find((item) => item.startsWith('ap_session='))
  return auth?.slice('ap_session='.length) ?? null
}

export async function authenticatedUser(req) {
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

export async function createSession(res, profileId) {
  const token = randomBytes(32).toString('base64url')
  await pool.query(
    `insert into sessions (token_hash, profile_id, expires_at)
     values ($1, $2, now() + interval '30 days')`,
    [tokenHash(token), profileId],
  )
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  res.setHeader(
    'Set-Cookie',
    `ap_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000${secure}`,
  )
}

export function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', 'ap_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0')
}

/**
 * In-memory sliding-window limiter. Railway runs this app as a single
 * instance, so a process-local map is enough to blunt password guessing
 * without adding a Redis dependency. It resets on deploy, which is an
 * acceptable trade at this scale.
 */
const attempts = new Map()

export function rateLimited(key, limit, windowMs) {
  const now = Date.now()
  const recent = (attempts.get(key) ?? []).filter((t) => now - t < windowMs)
  if (recent.length >= limit) {
    attempts.set(key, recent)
    return true
  }
  recent.push(now)
  attempts.set(key, recent)
  return false
}

export function clientIp(req) {
  return String(req.headers['x-forwarded-for'] ?? req.socket.remoteAddress ?? 'unknown')
    .split(',')[0]
    .trim()
}

setInterval(() => {
  const now = Date.now()
  for (const [key, times] of attempts) {
    if (!times.some((t) => now - t < 60 * 60 * 1000)) attempts.delete(key)
  }
}, 10 * 60 * 1000).unref()

const LEVEL_KEY = /^[A-Za-z0-9_-]{1,80}:\d{1,2}$/

/** Clamp and whitelist everything the browser sends for progress. */
export function sanitiseProgress(body) {
  const levels = Array.isArray(body.completedLevels) ? body.completedLevels : []
  return {
    childName: String(body.childName ?? 'Anak Saya').trim().slice(0, 40) || 'Anak Saya',
    xp: Math.max(0, Math.min(10_000_000, Math.trunc(Number(body.xp) || 0))),
    streakDays: Math.max(0, Math.min(100_000, Math.trunc(Number(body.streakDays) || 0))),
    lastPlayedOn: /^\d{4}-\d{2}-\d{2}$/.test(String(body.lastPlayedOn ?? ''))
      ? String(body.lastPlayedOn)
      : null,
    completedLevels: [
      ...new Set(levels.filter((k) => typeof k === 'string' && LEVEL_KEY.test(k))),
    ].slice(0, 5000),
  }
}

export async function hasPaidAccess(profile) {
  if (profile.is_admin) return true
  const { rows } = await pool.query(
    'select 1 from entitlements where parent_id = $1 and revoked_at is null limit 1',
    [profile.id],
  )
  return rows.length > 0
}

export function resetLinkFor(req, token) {
  const origin = APP_ORIGIN ?? `https://${req.headers.host ?? 'localhost'}`
  return `${origin}/reset?token=${encodeURIComponent(token)}`
}

export async function sendResetEmail(email, link) {
  if (!RESEND_API_KEY) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[dev] Password reset link for ${email}: ${link}`)
      return true
    }
    return false
  }
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: MAIL_FROM,
      to: email,
      subject: 'Set semula kata laluan Anak Pandai',
      html: `<p>Sesiapa sahaja yang meminta set semula kata laluan untuk akaun ini boleh klik pautan di bawah.</p>
             <p><a href="${link}">Set semula kata laluan</a></p>
             <p>Pautan ini sah selama 1 jam. Abaikan e-mel ini jika anda tidak memintanya.</p>`,
    }),
  })
  if (!response.ok) {
    console.error('Resend failed', response.status, await response.text())
    return false
  }
  return true
}
