import { MathGame } from "@/components/MathGame";
import type { Difficulty, MathMode } from "@/lib/math-engine";
import { DIFFICULTY_META, MATH_MODE_META } from "@/lib/math-engine";
import Link from "next/link";

type Props = {
  searchParams: Promise<{ level?: string; mode?: string }>;
};

function isDifficulty(value: string | undefined): value is Difficulty {
  return Boolean(value && value in DIFFICULTY_META);
}

function isMode(value: string | undefined): value is MathMode {
  return value === "mcq" || value === "type";
}

export default async function MathPlayPage({ searchParams }: Props) {
  const params = await searchParams;
  const mode = isMode(params.mode) ? params.mode : null;
  const level = isDifficulty(params.level) ? params.level : null;

  if (!mode) {
    return (
      <div className="page">
        <div className="page-hero">
          <p className="eyebrow">Math Quest</p>
          <h1>Pick a math game</h1>
          <p className="lede">
            Multiple choice with options, or type the answer yourself with no
            hints.
          </p>
        </div>
        <div className="subject-grid">
          <Link href="/play/math?mode=mcq" className="subject-card math">
            <h2>{MATH_MODE_META.mcq.label}</h2>
            <p>{MATH_MODE_META.mcq.description}</p>
            <span className="tag">4 options</span>
          </Link>
          <Link href="/play/math?mode=type" className="subject-card math type-mode">
            <h2>{MATH_MODE_META.type.label}</h2>
            <p>{MATH_MODE_META.type.description}</p>
            <span className="tag">Enter number</span>
          </Link>
        </div>
      </div>
    );
  }

  if (!level) {
    return (
      <div className="page">
        <div className="page-hero">
          <p className="eyebrow">Math · {MATH_MODE_META[mode].label}</p>
          <h1>Choose difficulty</h1>
          <p className="lede">{MATH_MODE_META[mode].description}</p>
        </div>
        <div className="level-grid">
          {(Object.keys(DIFFICULTY_META) as Difficulty[]).map((key) => (
            <Link
              key={key}
              href={`/play/math?mode=${mode}&level=${key}`}
              className="level-card"
            >
              <h2>{DIFFICULTY_META[key].label}</h2>
              <p>{DIFFICULTY_META[key].grades}</p>
              <p style={{ marginTop: "0.5rem" }}>
                {DIFFICULTY_META[key].description}
              </p>
            </Link>
          ))}
        </div>
        <p className="form-foot" style={{ marginTop: "1.5rem" }}>
          <Link href="/play/math">← Change game type</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="page">
      <MathGame difficulty={level} mode={mode} />
    </div>
  );
}
