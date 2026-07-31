import { NextResponse } from "next/server";
import { query, type SessionRow } from "@/lib/db";

export async function GET() {
  try {
    const rows = await query<
      (SessionRow & { player_name: string })[]
    >(
      `SELECT
         s.id,
         s.subject,
         s.difficulty,
         s.total_questions,
         s.correct_answers,
         s.score,
         s.duration_seconds,
         s.created_at,
         COALESCE(u.name, s.guest_name, 'Guest') AS player_name
       FROM game_sessions s
       LEFT JOIN users u ON u.id = s.user_id
       WHERE s.subject = 'math'
       ORDER BY s.score DESC, s.created_at DESC
       LIMIT 20`,
    );

    return NextResponse.json({ scores: rows });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not load scores." }, { status: 500 });
  }
}
