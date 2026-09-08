import { readFile } from 'node:fs/promises'

const configPath = new URL('../wrangler.jsonc', import.meta.url)
const raw = await readFile(configPath, 'utf8')
const config = JSON.parse(raw)

const expectedWorkerName = 'max-tour-backend'
const expectedDatabaseName = 'max-tour-production'
const sentinelDatabaseId = '00000000-0000-0000-0000-000000000000'
const expectedOrigin = 'https://max-tour.viiversion.com'

const database = config.d1_databases?.find((item) => item.binding === 'DB')
const origins = String(config.vars?.ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean)

const errors = []

if (config.name !== expectedWorkerName) {
  errors.push(`Worker name must be ${expectedWorkerName}`)
}

if (!database) {
  errors.push('D1 binding DB is missing')
} else {
  if (database.database_name !== expectedDatabaseName) {
    errors.push(`D1 database_name must be ${expectedDatabaseName}`)
  }

  if (!database.database_id || database.database_id === sentinelDatabaseId) {
    errors.push('Real MAX TOUR D1 database_id is not configured')
  }
}

if (!origins.includes(expectedOrigin)) {
  errors.push(`CORS allowlist must include ${expectedOrigin}`)
}

if (errors.length > 0) {
  console.error('Production configuration check failed:')
  for (const error of errors) {
    console.error(`- ${error}`)
  }
  process.exit(1)
}

console.log('MAX TOUR production configuration check passed')
