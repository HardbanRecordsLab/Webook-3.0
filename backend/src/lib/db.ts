import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('Missing DATABASE_URL env var')
}

const pool = new Pool({
  connectionString,
  ssl: process.env.PGSSL === 'require' ? { rejectUnauthorized: false } : undefined,
})

export const db = {
  query: (text: string, params?: any[]) => pool.query(text, params),
}
