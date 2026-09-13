"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "./components/Navbar";
import { fetchProblems, Problem } from "./lib/api";

export default function HomePage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProblems().then((data) => {
      setProblems(data);
      setLoading(false);
    });
  }, []);

  const filteredProblems = selectedDifficulty === "ALL"
    ? problems
    : problems.filter((p) => p.difficulty === selectedDifficulty);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <main style={{ flex: 1, maxWidth: 1280, width: "100%", margin: "0 auto", padding: "40px 24px" }}>
        {/* Hero Section */}
        <section style={{
          textAlign: "center",
          padding: "50px 20px 60px",
          background: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.25), transparent)",
          borderRadius: 24,
          marginBottom: 48,
          border: "1px solid var(--border-subtle)",
        }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 14px",
            borderRadius: 9999,
            background: "rgba(99, 102, 241, 0.12)",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            color: "#a5b4fc",
            fontSize: "0.85rem",
            fontWeight: 600,
            marginBottom: 20,
          }}>
            ⚡ Continuous Feedback Practice Loop
          </div>

          <h1 style={{
            fontSize: "3rem",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1.15,
            marginBottom: 16,
            background: "linear-gradient(to right, #ffffff, #e2e8f0, #94a3b8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Master Low-Level Design with Real Critique
          </h1>

          <p style={{
            maxWidth: 680,
            margin: "0 auto 32px",
            fontSize: "1.1rem",
            color: "var(--text-muted)",
            lineHeight: 1.6,
          }}>
            Practice domain modeling, class hierarchies, and design patterns. Receive instant dual-tier feedback from rule-based checks and AI rubric reasoning.
          </p>

          {/* Workflow Steps */}
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 16,
            maxWidth: 860,
            margin: "0 auto",
          }}>
            {[
              { step: "1", title: "Choose Challenge", desc: "Select classic LLD problem" },
              { step: "2", title: "Design Architecture", desc: "Define classes & patterns" },
              { step: "3", title: "Instant Rubric", desc: "Deterministic + AI critique" },
              { step: "4", title: "Review & Refine", desc: "Iterate to level up" },
            ].map((item, idx) => (
              <div key={idx} style={{
                background: "rgba(22, 32, 50, 0.8)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 12,
                padding: "12px 18px",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: 12,
                minWidth: 190,
              }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "var(--accent-primary)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  flexShrink: 0,
                }}>
                  {item.step}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-main)" }}>{item.title}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Filter Bar */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 16,
        }}>
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.01em" }}>
              Practice Problems
            </h2>
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
              Select a system to begin your low-level design attempt
            </p>
          </div>

          {/* Difficulty Tabs */}
          <div style={{
            display: "flex",
            gap: 6,
            background: "var(--bg-card)",
            padding: 4,
            borderRadius: 10,
            border: "1px solid var(--border-subtle)",
          }}>
            {["ALL", "EASY", "MEDIUM", "HARD"].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  border: "none",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  background: selectedDifficulty === diff ? "var(--accent-primary)" : "transparent",
                  color: selectedDifficulty === diff ? "#ffffff" : "var(--text-muted)",
                  transition: "all 0.2s",
                }}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Problem Cards Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
            Loading problem catalog...
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
            gap: 24,
          }}>
            {filteredProblems.map((problem) => {
              const badgeClass =
                problem.difficulty === "EASY"
                  ? "badge badge-easy"
                  : problem.difficulty === "HARD"
                  ? "badge badge-hard"
                  : "badge badge-medium";

              return (
                <div
                  key={problem.id}
                  className="glass-panel"
                  style={{
                    padding: 24,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    transition: "transform 0.2s, border-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-highlight)";
                    e.currentTarget.style.transform = "translateY(-3px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-subtle)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span className={badgeClass}>{problem.difficulty}</span>
                      <span style={{ fontSize: "0.78rem", color: "var(--text-faint)" }}>5 Rubric Criteria</span>
                    </div>

                    <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: 8, color: "var(--text-main)" }}>
                      {problem.title}
                    </h3>

                    <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 16 }}>
                      {problem.description}
                    </p>

                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#cbd5e1", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                        Core Requirements:
                      </div>
                      <ul style={{ paddingLeft: 18, fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                        {problem.requirements.slice(0, 3).map((req, i) => (
                          <li key={i}>{req}</li>
                        ))}
                        {problem.requirements.length > 3 && (
                          <li style={{ color: "var(--accent-primary)" }}>
                            +{problem.requirements.length - 3} more requirements
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>

                  <div style={{ paddingTop: 16, borderTop: "1px solid var(--border-subtle)", display: "flex", gap: 12 }}>
                    <Link
                      href={`/problems/${problem.id}`}
                      className="btn-primary"
                      style={{ flex: 1, textDecoration: "none" }}
                    >
                      Start Practice
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
