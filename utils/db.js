import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import { createClient } from './supabase/client';

const rawUrl = process.env.DATABASE_URL || process.env.NEXT_PUBLIC_DRIZZLE_DB_URL || '';
const isPlaceholder = !rawUrl || rawUrl.includes('your-project-id') || rawUrl.includes('your-password');

let drizzleDb;

if (!isPlaceholder && rawUrl.startsWith('postgres')) {
  try {
    const sql = neon(rawUrl);
    drizzleDb = drizzle(sql, { schema });
  } catch (err) {
    console.warn('Database initialization fallback:', err?.message);
    drizzleDb = null;
  }
}

// Fallback proxy to avoid throwing when database credentials have not yet been provided
const fallbackDb = {
  select: () => ({
    from: () => ({
      where: () => ({
        orderBy: () => Promise.resolve([]),
      }),
      orderBy: () => Promise.resolve([]),
    }),
  }),
  insert: () => ({
    values: () => ({
      returning: () => Promise.resolve([{ mockId: 'demo-' + Date.now() }]),
    }),
  }),
};

export const db = drizzleDb || fallbackDb;
export const getSupabase = () => createClient();