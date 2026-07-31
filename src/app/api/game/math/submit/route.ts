import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { execute } from "@/lib/db";
import { scoreRound, type Difficulty } from "@/lib/math-engine";

const answerSchema = z.object({
  prompt: z.string(),
  correctAnswer: z.union([z.number(), z.string()]),
  userAnswer: z.union([z.number(), z.string()]),
  isCorrect: z.boolean(),
  timeMs: z.number().int().nonnegative().optional(),
});

const schema = z.object({
  difficulty: z.enum(["simple", "medium", "hard", "very_hard"]),
  guestName: z.string().max(120).optional().nullable(),
  durationSeconds: z.number().int().nonnegative().optional(),
  answers: z.array(answerSchema).min(1),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const user = await getSessionUser();
    const correct = body.answers.filter((a) => a.isCorrect).length;
    const total = body.answers.length;
    const difficulty = body.difficulty as Difficulty;
    const score = scoreRound(correct, total, difficulty);

    const result = await execute(
      `INSERT INTO game_sessions
        (user_id, guest_name, subject, difficulty, total_questions, correct_answers, score, duration_seconds)
       VALUES
        (:userId, :guestName, 'math', :difficulty, :total, :correct, :score, :duration)`,
      {
        userId: user?.id ?? null,
        guestName: user ? null : body.guestName?.trim() || "Guest",
        difficulty,
        total,
        correct,
        score,
        duration: body.durationSeconds ?? null,
      },
    );

    const sessionId = result.insertId;

    for (const answer of body.answers) {
      await execute(
        `INSERT INTO game_answers
          (session_id, question_text, correct_answer, user_answer, is_correct, time_ms)
         VALUES
          (:sessionId, :prompt, :correctAnswer, :userAnswer, :isCorrect, :timeMs)`,
        {
          sessionId,
          prompt: answer.prompt,
          correctAnswer: String(answer.correctAnswer),
          userAnswer: String(answer.userAnswer),
          isCorrect: answer.isCorrect ? 1 : 0,
          timeMs: answer.timeMs ?? null,
        },
      );
    }

    return NextResponse.json({
      sessionId,
      correct,
      total,
      score,
      savedAs: user ? "account" : "guest",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid score payload." }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Could not save score." }, { status: 500 });
  }
}
