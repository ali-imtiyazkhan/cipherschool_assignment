import Link from "next/link";

export default function Navbar() {
  return (
    <header className="glass-nav" style={{ position: "sticky", top: 0, zIndex: 50, padding: "16px 24px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 15px rgba(99, 102, 241, 0.4)",
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "1.15rem", letterSpacing: "-0.02em", background: "linear-gradient(to right, #ffffff, #cbd5e1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              LLD Arena
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Low-Level Design Gym
            </div>
          </div>
        </Link>

        <nav style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Link href="/" style={{ color: "var(--text-main)", fontSize: "0.92rem", fontWeight: 500, transition: "color 0.2s" }}>
            Problem Catalog
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: "0.85rem",
              color: "var(--text-muted)",
              padding: "6px 12px",
              borderRadius: 8,
              border: "1px solid var(--border-subtle)",
              background: "var(--bg-subtle)",
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", display: "inline-block" }}></span>
            Evaluator Engine Active
          </a>
        </nav>
      </div>
    </header>
  );
}
