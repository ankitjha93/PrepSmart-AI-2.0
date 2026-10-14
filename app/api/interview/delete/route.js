import { NextResponse } from 'next/server';
import postgres from 'postgres';

export async function POST(request) {
  try {
    const { mockId } = await request.json();

    if (!mockId) {
      return NextResponse.json({ error: 'Missing mockId' }, { status: 400 });
    }

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return NextResponse.json({ error: 'DATABASE_URL not configured' }, { status: 500 });
    }

    const sql = postgres(databaseUrl, { prepare: false });

    try {
      // 1. Delete associated answers
      await sql`DELETE FROM "userAnswer" WHERE "mockId" = ${mockId};`;

      // 2. Delete mock interview record
      const deleted = await sql`DELETE FROM "mockInterview" WHERE "mockId" = ${mockId} RETURNING "id", "mockId";`;

      await sql.end();

      return NextResponse.json({
        success: true,
        deleted: deleted.length > 0,
        mockId,
      });
    } catch (dbErr) {
      await sql.end();
      console.error('Database delete error:', dbErr);
      return NextResponse.json({ error: dbErr.message }, { status: 500 });
    }
  } catch (err) {
    console.error('API delete error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
