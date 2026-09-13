"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "./components/Navbar";
import { fetchProblems, Problem } from "./lib/api";

const WORKFLOW_STEPS = [
  { num: "01", title: "Choose Challenge", desc: "Select a classic LLD system design problem" },
  { num: "02", title: "Design Architecture", desc: "Define classes, interfaces & patterns" },
  { num: "03", title: "Instant Rubric", desc: "Deterministic + AI evaluation critique" },
  { num: "04", title: "Review & Refine", desc: "Iterate on feedback to level up" },
];

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

      <main style={{ flex: 1, position: "relative", zIndex: 10 }}>
        {/* ============ Hero Section ============ */}
        <section
          className="bg-gradient-hero"
          style={{
            paddingTop: "10rem",
            paddingBottom: "5rem",
            textAlign: "center",
          }}
        >
          <div className="container" style={{ maxWidth: "52rem" }}>
            {/* Tag */}
            <div
              className="tag tag-accent fade-up"
              style={{ marginBottom: "1.5rem" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              Continuous Feedback Practice Loop
            </div>

            {/* Main heading - EB Garamond serif display */}
            <h1
              className="font-display text-balance fade-up fade-up-delay-1"
              style={{
                fontSize: "clamp(2.5rem, 6vw, 4rem)",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                marginBottom: "1.25rem",
                color: "var(--text)",
              }}
            >
              Master Low-Level Design with Real Critique
            </h1>

            <p
              className="text-pretty fade-up fade-up-delay-2"
              style={{
                fontSize: "1.125rem",
                color: "var(--text-muted)",
                maxWidth: "38rem",
                margin: "0 auto 2.5rem",
                lineHeight: 1.65,
              }}
            >
              Practice domain modeling, class hierarchies, and design patterns. Receive instant dual-tier feedback from rule-based checks and AI rubric reasoning.
            </p>

            {/* CTA buttons */}
            <div
              className="fade-up fade-up-delay-3"
              style={{ display: "flex", justifyContent: "center", gap: "0.75rem", marginBottom: "3.5rem" }}
            >
              <a href="#problems" className="btn-primary" style={{ height: "2.75rem", padding: "0 1.5rem", fontSize: "1rem" }}>
                Start Practicing
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
              <a href="#workflow" className="btn btn-ghost btn-lg">
                How It Works
              </a>
            </div>
          </div>
        </section>

        {/* ============ Workflow Steps ============ */}
        <section id="workflow" className="container" style={{ paddingBottom: "4rem" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "1px",
              background: "var(--border)",
              border: "1px solid var(--border)",
            }}
          >
            {WORKFLOW_STEPS.map((step, idx) => (
              <div
                key={idx}
                className={`fade-up fade-up-delay-${idx + 1}`}
                style={{
                  background: "var(--bg)",
                  padding: "2rem 1.5rem",
                }}
              >
                <div
                  className="font-display"
                  style={{
                    fontSize: "clamp(2rem, 4vw, 3rem)",
                    color: "var(--color-accent-500)",
                    lineHeight: 1,
                    marginBottom: "0.75rem",
                  }}
                >
                  {step.num}
                </div>
                <div
                  style={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    color: "var(--text)",
                    marginBottom: "0.35rem",
                  }}
                >
                  {step.title}
                </div>
                <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                  {step.desc}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ============ Problems Section ============ */}
        <section id="problems" className="container" style={{ paddingBottom: "6rem" }}>
          {/* Section header */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "2rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}>
            <div>
              <div className="section-label" style={{ marginBottom: "0.5rem" }}>Practice Problems</div>
              <h2
                className="font-display"
                style={{
                  fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                }}
              >
                Choose Your System Design Challenge
              </h2>
            </div>

            {/* Difficulty Tabs — pill style */}
            <div style={{
              display: "flex",
              gap: "0.25rem",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-full)",
              padding: "0.25rem",
              background: "var(--bg-card)",
            }}>
              {["ALL", "EASY", "MEDIUM", "HARD"].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  style={{
                    padding: "0.35rem 1rem",
                    borderRadius: "var(--radius-full)",
                    border: "none",
                    fontSize: "0.8rem",
                    fontWeight: 500,
                    cursor: "pointer",
                    background: selectedDifficulty === diff ? "var(--color-base-800)" : "transparent",
                    color: selectedDifficulty === diff ? "var(--text)" : "var(--text-muted)",
                    transition: "all 0.2s",
                    fontFamily: "inherit",
                  }}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-muted)" }}>
              Loading problem catalog...
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: "1px",
              background: "var(--border)",
              border: "1px solid var(--border)",
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
                    style={{
                      background: "var(--bg)",
                      padding: "1.75rem",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      transition: "background 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.background = "var(--bg-elevated)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.background = "var(--bg)";
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                        <span className={badgeClass}>{problem.difficulty}</span>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>5 Rubric Criteria</span>
                      </div>

                      <h3 style={{
                        fontSize: "1.125rem",
                        fontWeight: 600,
                        marginBottom: "0.5rem",
                        color: "var(--text)",
                        letterSpacing: "-0.01em",
                      }}>
                        {problem.title}
                      </h3>

                      <p style={{
                        fontSize: "0.875rem",
                        color: "var(--text-muted)",
                        lineHeight: 1.55,
                        marginBottom: "1rem",
                      }}>
                        {problem.description}
                      </p>

                      <div style={{ marginBottom: "1rem" }}>
                        <div style={{
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          color: "var(--text-dim)",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          marginBottom: "0.4rem",
                        }}>
                          Core Requirements
                        </div>
                        <ul style={{ paddingLeft: "1rem", fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6, listStyle: "disc" }}>
                          {problem.requirements.slice(0, 3).map((req, i) => (
                            <li key={i}>{req}</li>
                          ))}
                          {problem.requirements.length > 3 && (
                            <li style={{ color: "var(--color-accent-400)" }}>
                              +{problem.requirements.length - 3} more
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>

                    <div style={{ paddingTop: "1rem", borderTop: "1px solid var(--border-subtle)" }}>
                      <Link
                        href={`/problems/${problem.id}`}
                        className="btn-primary"
                        style={{ width: "100%", justifyContent: "center" }}
                      >
                        Start Practice
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ============ Bottom CTA ============ */}
        <section
          className="container"
          style={{ paddingBottom: "6rem" }}
        >
          <div
            style={{
              border: "1px solid var(--border)",
              padding: "3rem 2rem",
              textAlign: "center",
            }}
          >
            <h2
              className="font-display"
              style={{
                fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                letterSpacing: "-0.02em",
                marginBottom: "0.75rem",
              }}
            >
              Ready to Level Up Your Design Skills?
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "1rem", maxWidth: "30rem", margin: "0 auto 1.5rem" }}>
              Deliberate practice with instant architectural feedback is the fastest path to design mastery.
            </p>
            <a href="#problems" className="btn-accent" style={{ height: "2.75rem", padding: "0 2rem", fontSize: "1rem" }}>
              Choose a Problem →
            </a>
          </div>
        </section>
      </main>

      {/* ============ Footer ============ */}
      <footer style={{
        position: "relative",
        zIndex: 10,
        borderTop: "1px solid var(--border)",
        padding: "2.5rem 1rem",
      }}>
        <div className="container" style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
            LLD Arena · Low-Level Design Practice Platform
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
            Built with deliberate practice methodology
          </div>
        </div>
      </footer>
    </div>
  );
}
