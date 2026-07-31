"use client";

import { FormEvent, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import type { Difficulty, MathMode } from "@/lib/math-engine";
import { DIFFICULTY_META, MATH_MODE_META } from "@/lib/math-engine";

type Question = {
  id: string;
  prompt: string;
  choices: number[];
  answer: number;
  operation: string;
  difficulty: Difficulty;
};

type AnswerRecord = {
  prompt: string;
  correctAnswer: number;
  userAnswer: number | string;
  isCorrect: boolean;
  timeMs: number;
};

type Props = {
  difficulty: Difficulty;
  mode: MathMode;
};

type Phase = "intro" | "playing" | "result";

export function MathGame({ difficulty, mode }: Props) {
  const meta = DIFFICULTY_META[difficulty];
  const modeMeta = MATH_MODE_META[mode];
  const [phase, setPhase] = useState<Phase>("intro");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [guestName, setGuestName] = useState("");
  const [scoreData, setScoreData] = useState<{
    correct: number;
    total: number;
    score: number;
  } | null>(null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const startedAt = useRef<number>(0);
  const questionStarted = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("niru_guest_name");
    if (saved) setGuestName(saved);
  }, []);

  useEffect(() => {
    if (phase === "playing" && mode === "type" && !feedback) {
      inputRef.current?.focus();
    }
  }, [phase, mode, index, feedback]);

  function startRound() {
    setError("");
    startTransition(async () => {
      try {
        const res = await fetch("/api/game/math/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ difficulty }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to start");
        setQuestions(data.questions);
        setIndex(0);
        setAnswers([]);
        setFeedback(null);
        setTypedAnswer("");
        setScoreData(null);
        startedAt.current = Date.now();
        questionStarted.current = Date.now();
        setPhase("playing");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not start game");
      }
    });
  }

  function submitValue(value: number | string) {
    if (feedback || !questions[index]) return;
    const q = questions[index];
    const numeric =
      typeof value === "number" ? value : Number(String(value).trim());
    const isCorrect =
      Number.isFinite(numeric) && numeric === q.answer;
    const record: AnswerRecord = {
      prompt: q.prompt,
      correctAnswer: q.answer,
      userAnswer: Number.isFinite(numeric) ? numeric : String(value).trim() || "—",
      isCorrect,
      timeMs: Date.now() - questionStarted.current,
    };
    const nextAnswers = [...answers, record];
    setAnswers(nextAnswers);
    setFeedback(isCorrect ? "correct" : "wrong");

    window.setTimeout(() => {
      if (index + 1 >= questions.length) {
        finishRound(nextAnswers);
      } else {
        setIndex((i) => i + 1);
        setFeedback(null);
        setTypedAnswer("");
        questionStarted.current = Date.now();
      }
    }, 700);
  }

  function pickChoice(value: number) {
    submitValue(value);
  }

  function onTypeSubmit(e: FormEvent) {
    e.preventDefault();
    if (typedAnswer.trim() === "" || feedback) return;
    submitValue(typedAnswer);
  }

  async function finishRound(finalAnswers: AnswerRecord[]) {
    if (guestName.trim()) {
      localStorage.setItem("niru_guest_name", guestName.trim());
    }
    const durationSeconds = Math.round((Date.now() - startedAt.current) / 1000);
    try {
      const res = await fetch("/api/game/math/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          difficulty,
          guestName: guestName.trim() || "Guest",
          durationSeconds,
          answers: finalAnswers,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setScoreData({
        correct: data.correct,
        total: data.total,
        score: data.score,
      });
    } catch {
      const correct = finalAnswers.filter((a) => a.isCorrect).length;
      setScoreData({
        correct,
        total: finalAnswers.length,
        score: correct * 10,
      });
    }
    setPhase("result");
  }

  const current = questions[index];
  const progress = questions.length
    ? Math.round((index / questions.length) * 100)
    : 0;

  return (
    <div className="game-shell">
      {phase === "intro" && (
        <section className="game-card intro-card">
          <p className="eyebrow">
            Math · {modeMeta.label} · {meta.grades}
          </p>
          <h1>{meta.label}</h1>
          <p className="lede">{modeMeta.description}</p>
          <p className="meta-line">
            {meta.description} · {meta.questions} questions
          </p>
          <label className="field">
            <span>Your name (optional if logged in)</span>
            <input
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Player name"
              maxLength={120}
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <div className="cta-row">
            <button
              type="button"
              className="btn-primary"
              onClick={startRound}
              disabled={pending}
            >
              {pending ? "Loading…" : "Start round"}
            </button>
            <Link href={`/play/math?mode=${mode}`} className="btn-ghost">
              Change level
            </Link>
            <Link href="/play" className="btn-ghost">
              All games
            </Link>
          </div>
        </section>
      )}

      {phase === "playing" && current && (
        <section className={`game-card play-card ${feedback ?? ""}`}>
          <div className="progress-track" aria-hidden>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="q-count">
            Question {index + 1} of {questions.length}
          </p>
          <h2 className="prompt">{current.prompt}</h2>

          {mode === "mcq" ? (
            <div className="choices">
              {current.choices.map((choice) => (
                <button
                  key={`${current.id}-${choice}`}
                  type="button"
                  className="choice-btn"
                  onClick={() => pickChoice(choice)}
                  disabled={Boolean(feedback)}
                >
                  {choice}
                </button>
              ))}
            </div>
          ) : (
            <form className="type-answer" onSubmit={onTypeSubmit}>
              <label className="field">
                <span>Your answer</span>
                <input
                  ref={inputRef}
                  className="answer-input"
                  type="number"
                  inputMode="numeric"
                  value={typedAnswer}
                  onChange={(e) => setTypedAnswer(e.target.value)}
                  placeholder="Type the number"
                  disabled={Boolean(feedback)}
                  autoComplete="off"
                />
              </label>
              <button
                type="submit"
                className="btn-primary"
                disabled={Boolean(feedback) || typedAnswer.trim() === ""}
              >
                Check
              </button>
            </form>
          )}

          {feedback && (
            <p className={`flash ${feedback}`}>
              {feedback === "correct" ? "Nice!" : `Answer was ${current.answer}`}
            </p>
          )}
        </section>
      )}

      {phase === "result" && scoreData && (
        <section className="game-card result-card">
          <p className="eyebrow">Round complete · {modeMeta.label}</p>
          <h1>
            {scoreData.correct}/{scoreData.total} correct
          </h1>
          <p className="score-big">{scoreData.score} pts</p>
          <p className="lede">
            {scoreData.correct === scoreData.total
              ? "Perfect run — stellar work."
              : "Keep going — each round sharpens the skills."}
          </p>
          <div className="cta-row">
            <button type="button" className="btn-primary" onClick={startRound}>
              Play again
            </button>
            <Link href="/scores" className="btn-ghost">
              Leaderboard
            </Link>
            <Link href="/play" className="btn-ghost">
              Other games
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
