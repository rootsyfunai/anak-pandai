/**
 * JSON API consumed by the SPA at /api/*.
 *
 * The browser never holds a database credential. Authorization is decided here:
 * a signed cookie identifies the parent, `is_admin` gates the review routes,
 * and `entitlements` decides whether the paid path is unlocked.
 */
import { randomBytes } from 'node:crypto'
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import {
  authenticatedUser,
  clearSessionCookie,
  clientIp,
  cookieToken,
  createSession,
  hasPaidAccess,
  isStorageConfigured,
  json,
  passwordHash,
  passwordMatches,
  pool,
  r2,
  R2_BUCKET,
  rateLimited,
  readJson,
  readMultipart,
  resetLinkFor,
  sanitiseProgress,
  sendResetEmail,
  tokenHash,
} from './core.mjs'

const FIFTEEN_MINUTES = 15 * 60 * 1000
const ONE_HOUR = 60 * 60 * 1000

export async function handleApi(req, res, pathname) {
  if (!pool) {
    return json(res, 503, { error: 'DATABASE_URL belum dikonfigurasi di Railway.' })
  }

  try {
    if (req.method === 'GET' && pathname === '/api/health') {
      await pool.query('select 1')
      return json(res, 200, { ok: true, storage: isStorageConfigured })
    }

    if (req.method === 'GET' && pathname === '/api/auth/me') {
      return json(res, 200, { user: await authenticatedUser(req) })
    }

    if (req.method === 'POST' && pathname === '/api/auth/logout') {
      const token = cookieToken(req)
      if (token) {
        await pool.query('delete from sessions where token_hash = $1', [tokenHash(token)])
      }
      clearSessionCookie(res)
      return json(res, 200, { ok: true })
    }

    if (req.method === 'POST' && pathname === '/api/auth/forgot') {
      if (rateLimited(`forgot:${clientIp(req)}`, 5, ONE_HOUR)) {
        return json(res, 429, { error: 'Terlalu banyak permintaan. Cuba lagi nanti.' })
      }
      const body = await readJson(req)
      const email = String(body.email ?? '').trim().toLowerCase()
      // Always answer the same way so this cannot be used to discover which
      // e-mails have an account.
      const generic = {
        ok: true,
        message: 'Jika e-mel itu berdaftar, pautan set semula telah dihantar.',
      }
      if (!email) return json(res, 200, generic)

      const { rows } = await pool.query('select id from profiles where email = $1', [email])
      if (!rows[0]) return json(res, 200, generic)

      const token = randomBytes(32).toString('base64url')
      await pool.query(
        `insert into password_resets (token_hash, profile_id, expires_at)
         values ($1, $2, now() + interval '1 hour')`,
        [tokenHash(token), rows[0].id],
      )
      if (!(await sendResetEmail(email, resetLinkFor(req, token)))) {
        return json(res, 503, {
          error: 'E-mel pemulihan belum dikonfigurasi. Hubungi sokongan.',
        })
      }
      return json(res, 200, generic)
    }

    if (req.method === 'POST' && pathname === '/api/auth/reset') {
      if (rateLimited(`reset:${clientIp(req)}`, 10, ONE_HOUR)) {
        return json(res, 429, { error: 'Terlalu banyak permintaan. Cuba lagi nanti.' })
      }
      const body = await readJson(req)
      const token = String(body.token ?? '')
      const password = String(body.password ?? '')
      if (password.length < 8) {
        return json(res, 400, { error: 'Kata laluan minimum 8 aksara diperlukan.' })
      }
      const { rows } = await pool.query(
        `select profile_id from password_resets
         where token_hash = $1 and used_at is null and expires_at > now()`,
        [tokenHash(token)],
      )
      if (!rows[0]) {
        return json(res, 400, {
          error: 'Pautan set semula tidak sah atau sudah tamat tempoh.',
        })
      }
      const profileId = rows[0].profile_id
      await pool.query('update profiles set password_hash = $1 where id = $2', [
        await passwordHash(password),
        profileId,
      ])
      await pool.query('update password_resets set used_at = now() where token_hash = $1', [
        tokenHash(token),
      ])
      // Changing a password signs out every existing device.
      await pool.query('delete from sessions where profile_id = $1', [profileId])
      return json(res, 200, { ok: true })
    }

    if (
      req.method === 'POST' &&
      (pathname === '/api/auth/signup' || pathname === '/api/auth/login')
    ) {
      if (rateLimited(`auth:${clientIp(req)}`, 20, FIFTEEN_MINUTES)) {
        return json(res, 429, {
          error: 'Terlalu banyak percubaan. Cuba lagi dalam 15 minit.',
        })
      }
      const body = await readJson(req)
      const email = String(body.email ?? '').trim().toLowerCase()
      const password = String(body.password ?? '')
      if (!email || password.length < 8) {
        return json(res, 400, {
          error: 'E-mel dan kata laluan minimum 8 aksara diperlukan.',
        })
      }

      if (pathname.endsWith('signup')) {
        const fullName = String(body.fullName ?? '').trim().slice(0, 120)
        const result = await pool.query(
          `insert into profiles (email, password_hash, full_name)
           values ($1, $2, $3)
           returning id, email, full_name, is_admin`,
          [email, await passwordHash(password), fullName],
        )
        await createSession(res, result.rows[0].id)
        return json(res, 201, { user: result.rows[0] })
      }

      if (rateLimited(`login:${email}`, 5, FIFTEEN_MINUTES)) {
        return json(res, 429, {
          error: 'Akaun ini dikunci sementara selepas terlalu banyak percubaan.',
        })
      }
      const result = await pool.query(
        `select id, email, full_name, is_admin, password_hash
         from profiles where email = $1`,
        [email],
      )
      const profile = result.rows[0]
      if (!profile || !(await passwordMatches(password, profile.password_hash))) {
        return json(res, 401, { error: 'E-mel atau kata laluan tidak betul.' })
      }
      delete profile.password_hash
      await createSession(res, profile.id)
      return json(res, 200, { user: profile })
    }

    if (req.method === 'GET' && pathname === '/api/access') {
      const user = await authenticatedUser(req)
      if (!user) return json(res, 200, { user: null, hasAccess: false, isAdmin: false })
      return json(res, 200, {
        user,
        hasAccess: await hasPaidAccess(user),
        isAdmin: user.is_admin,
      })
    }

    const user = await authenticatedUser(req)
    if (!user) return json(res, 401, { error: 'Sila masuk terlebih dahulu.' })

    if (pathname === '/api/progress') {
      if (req.method === 'GET') {
        const { rows } = await pool.query(
          `select child_name, xp, streak_days,
                  to_char(last_played_on, 'YYYY-MM-DD') as last_played_on,
                  completed_levels
           from progress where profile_id = $1`,
          [user.id],
        )
        const row = rows[0]
        return json(res, 200, {
          progress: row
            ? {
                childName: row.child_name,
                xp: row.xp,
                streakDays: row.streak_days,
                lastPlayedOn: row.last_played_on,
                completedLevels: row.completed_levels ?? [],
              }
            : null,
        })
      }

      if (req.method === 'PUT') {
        const progress = sanitiseProgress(await readJson(req))
        await pool.query(
          `insert into progress
             (profile_id, child_name, xp, streak_days, last_played_on, completed_levels, updated_at)
           values ($1, $2, $3, $4, $5::date, $6, now())
           on conflict (profile_id) do update set
             child_name = excluded.child_name,
             xp = excluded.xp,
             streak_days = excluded.streak_days,
             last_played_on = excluded.last_played_on,
             completed_levels = excluded.completed_levels,
             updated_at = now()`,
          [
            user.id,
            progress.childName,
            progress.xp,
            progress.streakDays,
            progress.lastPlayedOn,
            progress.completedLevels,
          ],
        )
        return json(res, 200, { progress })
      }
    }

    if (req.method === 'POST' && pathname === '/api/orders') {
      if (!isStorageConfigured) {
        return json(res, 503, {
          error: 'Penyimpanan resit R2 belum dikonfigurasi di Railway.',
        })
      }
      const parts = await readMultipart(req)
      if (!parts.file) {
        return json(res, 400, { error: 'Sila pilih gambar resit pembayaran.' })
      }
      const key = `payment-proofs/${user.id}/${randomBytes(16).toString('hex')}-${parts.file.filename}`
      await r2.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET,
          Key: key,
          Body: parts.file.data,
          ContentType: parts.file.mime,
        }),
      )
      const affiliateCode = parts.fields.affiliateCode || null
      const affiliate = affiliateCode
        ? (
            await pool.query(
              'select id from affiliates where lower(code) = lower($1) and is_active = true',
              [affiliateCode],
            )
          ).rows[0]
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
        `select o.id, o.parent_id, o.amount_myr, o.affiliate_code, o.reference_note,
                o.proof_path, o.status, o.created_at, p.email as parent_email
         from orders o join profiles p on p.id = o.parent_id
         order by o.created_at desc limit 200`,
      )
      return json(res, 200, { orders: rows })
    }

    const proof = pathname.match(/^\/api\/admin\/orders\/([0-9a-f-]+)\/proof$/)
    if (req.method === 'GET' && proof) {
      if (!user.is_admin) return json(res, 403, { error: 'Akses admin diperlukan.' })
      if (!isStorageConfigured) {
        return json(res, 503, { error: 'Penyimpanan resit R2 belum dikonfigurasi.' })
      }
      const { rows } = await pool.query('select proof_path from orders where id = $1', [
        proof[1],
      ])
      if (!rows[0]?.proof_path) return json(res, 404, { error: 'Resit tidak ditemui.' })
      // Redirect the admin's browser straight to R2 so the image bytes never
      // pass through Railway, which would bill egress for every review.
      const signed = await getSignedUrl(
        r2,
        new GetObjectCommand({ Bucket: R2_BUCKET, Key: rows[0].proof_path }),
        { expiresIn: 300 },
      )
      res.writeHead(302, { Location: signed, 'Cache-Control': 'no-store' })
      res.end()
      return
    }

    const decision = pathname.match(/^\/api\/admin\/orders\/([0-9a-f-]+)$/)
    if (req.method === 'PATCH' && decision) {
      if (!user.is_admin) return json(res, 403, { error: 'Akses admin diperlukan.' })
      const body = await readJson(req)
      if (!['approved', 'rejected'].includes(body.status)) {
        return json(res, 400, { error: 'Status tidak sah.' })
      }
      const { rows } = await pool.query(
        `update orders set
           status = $1,
           reviewed_by = $2,
           reviewed_at = now(),
           commission_myr = case
             when $1 = 'approved' and affiliate_id is not null then amount_myr * 0.5
             else null
           end
         where id = $3
         returning id, parent_id, amount_myr, affiliate_code, reference_note,
                   proof_path, status, created_at`,
        [body.status, user.id, decision[1]],
      )
      if (!rows[0]) return json(res, 404, { error: 'Pesanan tidak ditemui.' })
      if (body.status === 'approved') {
        await pool.query(
          `insert into entitlements (parent_id, order_id)
           values ($1, $2)
           on conflict (parent_id) where revoked_at is null do nothing`,
          [rows[0].parent_id, rows[0].id],
        )
      }
      return json(res, 200, { order: rows[0] })
    }

    return json(res, 404, { error: 'API route tidak ditemui.' })
  } catch (error) {
    console.error('API error', error)
    if (error?.code === '23505') {
      return json(res, 409, { error: 'E-mel itu sudah berdaftar.' })
    }
    return json(res, 500, { error: 'Ralat pelayan. Cuba lagi.' })
  }
}
