import { NextResponse } from "next/server";
import { z } from "zod";
import { generateMathRound, DIFFICULTY_META } from "@/lib/math-engine";

const schema = z.object({
  difficulty: z.enum(["simple", "medium", "hard", "very_hard"]),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const questions = generateMathRound(body.difficulty).map((q) => ({
      id: q.id,
      prompt: q.prompt,
      choices: q.choices,
      operation: q.operation,
      difficulty: q.difficulty,
      // answer kept server-side only via submit route — still include for
      // client validation fallback when offline scoring is used; submit
      // re-checks with submitted answer list.
      answer: q.answer,
    }));

    return NextResponse.json({
      difficulty: body.difficulty,
      meta: DIFFICULTY_META[body.difficulty],
      questions,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid difficulty." }, { status: 400 });
    }
    return NextResponse.json({ error: "Could not start round." }, { status: 500 });
  }
}
