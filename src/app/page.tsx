import Link from "next/link";

export default function HomePage() {
  return (
    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow">Math · Science · Grade levels</p>
        <h1>Niru Quest Lab</h1>
        <p className="lede">
          Jump into interactive math challenges by difficulty — or log in to save
          your progress. Guests welcome.
        </p>
        <div className="cta-row">
          <Link href="/play" className="btn-primary">
            Play now
          </Link>
          <Link href="/login" className="btn-ghost">
            Log in
          </Link>
        </div>
      </div>
      <div className="hero-visual" aria-hidden>
        <div className="hero-stage">
          <div className="hero-orbit" />
          <div className="hero-equation">12 × 8</div>
        </div>
      </div>
    </section>
  );
}
