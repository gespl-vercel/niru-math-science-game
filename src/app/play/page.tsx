import Link from "next/link";
import { MATH_MODE_META } from "@/lib/math-engine";

export default function PlayPage() {
  return (
    <div className="page">
      <div className="page-hero">
        <p className="eyebrow">Choose a quest</p>
        <h1>Subjects & games</h1>
        <p className="lede">
          Start with Math — MCQ or type-your-answer. Login is optional; play as a
          guest anytime.
        </p>
      </div>

      <div className="subject-grid" style={{ marginBottom: "2rem" }}>
        <Link href="/play/math?mode=mcq" className="subject-card math">
          <h2>Math · {MATH_MODE_META.mcq.label}</h2>
          <p>{MATH_MODE_META.mcq.description}</p>
          <span className="tag">Ready to play</span>
        </Link>
        <Link href="/play/math?mode=type" className="subject-card math type-mode">
          <h2>Math · {MATH_MODE_META.type.label}</h2>
          <p>{MATH_MODE_META.type.description}</p>
          <span className="tag">Ready to play</span>
        </Link>
        <div className="subject-card science">
          <h2>Science</h2>
          <p>Quiz worlds for living things, matter, and more — coming soon.</p>
          <span className="tag">Coming soon</span>
        </div>
      </div>
    </div>
  );
}
