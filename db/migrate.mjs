/**
 * Applies SQL files in db/migrations in filename order.
 *
 * Each file runs once, inside a transaction, and is recorded in
 * `schema_migrations`. Safe to run on every deploy: already-applied files are
 * skipped, so a restart never re-runs a migration.
 *
 * Usage:
 *   DATABASE_URL=... npm run db:migrate
 *   railway run npm run db:migrate
 */
import { readdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Pool } from 'pg'

const MIGRATIONS_DIR = join(dirname(fileURLToPath(import.meta.url)), 'migrations')
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error('DATABASE_URL is not set. On Railway, reference ${{Postgres.DATABASE_URL}}.')
  process.exit(1)
}

const url = new URL(connectionString)
const isInternal =
  url.hostname.endsWith('.railway.internal') ||
  url.hostname === 'localhost' ||
  url.hostname === '127.0.0.1'
const pool = new Pool(
  url.searchParams.get('sslmode') === 'disable' || isInternal
    ? { connectionString }
    : { connectionString, ssl: { rejectUnauthorized: false } },
)

try {
  await pool.query(`
    create table if not exists schema_migrations (
      filename text primary key,
      applied_at timestamptz not null default now()
    )
  `)

  const files = (await readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith('.sql')).sort()
  const { rows } = await pool.query('select filename from schema_migrations')
  const applied = new Set(rows.map((r) => r.filename))

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`skip  ${file}`)
      continue
    }
    const sql = await readFile(join(MIGRATIONS_DIR, file), 'utf8')
    const client = await pool.connect()
    try {
      await client.query('begin')
      await client.query(sql)
      await client.query('insert into schema_migrations (filename) values ($1)', [file])
      await client.query('commit')
      console.log(`apply ${file}`)
    } catch (error) {
      await client.query('rollback')
      throw error
    } finally {
      client.release()
    }
  }
  console.log('Migrations up to date.')
} finally {
  await pool.end()
}
