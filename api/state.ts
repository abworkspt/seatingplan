import { neon } from '@neondatabase/serverless';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const sql = neon(process.env.DATABASE_URL!);

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS seating_state (
      id INTEGER PRIMARY KEY DEFAULT 1,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      CHECK (id = 1)
    )
  `;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Simple auth via secret header
  const secret = process.env.APP_SECRET;
  if (secret && req.headers['x-app-secret'] !== secret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await ensureTable();

    if (req.method === 'GET') {
      const rows = await sql`SELECT data FROM seating_state WHERE id = 1`;
      if (rows.length === 0) return res.status(204).end();
      return res.status(200).json(rows[0].data);
    }

    if (req.method === 'POST') {
      const data = req.body;
      await sql`
        INSERT INTO seating_state (id, data, updated_at)
        VALUES (1, ${JSON.stringify(data)}::jsonb, NOW())
        ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
      `;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
