import { query, type SessionRow } from "@/lib/db";

export const dynamic = "force-dynamic";

type Score = SessionRow & { player_name: string };

async function getScores(): Promise<Score[]> {
  try {
    return await query<Score[]>(
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
  } catch {
    return [];
  }
}

export default async function ScoresPage() {
  const scores = await getScores();

  return (
    <div className="page">
      <div className="page-hero">
        <p className="eyebrow">Leaderboard</p>
        <h1>Top math runs</h1>
        <p className="lede">Guest and signed-in scores from recent rounds.</p>
      </div>

      {scores.length === 0 ? (
        <p className="lede">No scores yet — be the first on the board. (Or start MySQL and seed the DB.)</p>
      ) : (
        <table className="scores-table">
          <thead>
            <tr>
              <th>Player</th>
              <th>Level</th>
              <th>Correct</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((row) => (
              <tr key={row.id}>
                <td>{row.player_name}</td>
                <td>{String(row.difficulty).replace("_", " ")}</td>
                <td>
                  {row.correct_answers}/{row.total_questions}
                </td>
                <td>{row.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
