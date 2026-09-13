"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Navbar from "../../../components/Navbar";
import { fetchAttemptHistory } from "../../../lib/api";

export default function AttemptHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [attempt, setAttempt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttemptHistory(resolvedParams.id).then((data) => {
      setAttempt(data);
      setLoading(false);
    });
  }, [resolvedParams.id]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <main className="container" style={{ flex: 1, paddingTop: "6rem", paddingBottom: "4rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", fontSize: "0.875rem", transition: "color 0.15s" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Problem Catalog
          </Link>

          {attempt && (
            <Link href={`/problems/${attempt.problemId}`} className="btn-primary">
              Continue / Refine Design
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
            </Link>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", paddingTop: "4rem", color: "var(--text-muted)" }}>
            Loading attempt history...
          </div>
        ) : !attempt ? (
          <div style={{ border: "1px solid var(--border)", padding: "3rem", textAlign: "center" }}>
            <h2 className="font-display" style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>Attempt Not Found</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "1.25rem" }}>The specified attempt ID could not be loaded.</p>
            <Link href="/" className="btn-secondary">Return Home</Link>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div style={{
              border: "1px solid var(--border)",
              padding: "2rem",
              marginBottom: "1px",
              background: "var(--bg)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <span className="tag tag-accent">Attempt #{attempt.id.slice(-5)}</span>
                <span style={{ fontSize: "0.78rem", color: "var(--text-dim)" }}>
                  Started {new Date(attempt.startedAt).toLocaleDateString()} at {new Date(attempt.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <h1 className="font-display" style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>
                Attempt Iteration History
              </h1>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                Review how your low-level design solutions and rubric scores evolved across iterations.
              </p>
            </div>

            {/* Timeline of Submissions */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "1px",
              background: "var(--border)",
              border: "1px solid var(--border)",
              borderTop: "none",
            }}>
              {attempt.submissions && attempt.submissions.length > 0 ? (
                attempt.submissions.map((sub: any, idx: number) => {
                  const iterationNum = attempt.submissions.length - idx;
                  const aiEval = sub.evaluations?.find((e: any) => e.evaluatorType === "AI");
                  const avgScore = aiEval?.criteria?.length
                    ? (aiEval.criteria.reduce((a: any, b: any) => a + (b.score || 0), 0) / aiEval.criteria.length).toFixed(1)
                    : null;

                  return (
                    <div
                      key={sub.id}
                      style={{
                        background: "var(--bg)",
                        padding: "1.5rem 1.75rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "1rem",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "var(--bg-elevated)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "var(--bg)"; }}
                    >
                      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                        <span className="font-display" style={{
                          fontSize: "1.75rem",
                          color: "var(--color-accent-400)",
                          lineHeight: 1,
                          minWidth: "2.5rem",
                        }}>
                          {String(iterationNum).padStart(2, "0")}
                        </span>

                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                            <span style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--text)" }}>
                              Iteration {iterationNum}
                            </span>
                            <span className={sub.status === "COMPLETED" ? "badge badge-easy" : "badge badge-info"}>
                              {sub.status}
                            </span>
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "var(--text-dim)" }}>
                            Submitted {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {sub.content.length} chars
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                        {avgScore && (
                          <div style={{ textAlign: "right" }}>
                            <div className="font-display" style={{ fontSize: "1.5rem", color: "var(--color-accent-400)", lineHeight: 1 }}>
                              {avgScore}<span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>/5</span>
                            </div>
                            <div className="section-label">Rubric Score</div>
                          </div>
                        )}

                        <Link
                          href={`/submissions/${sub.id}`}
                          className="btn-secondary"
                        >
                          View Scorecard
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ background: "var(--bg)", padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                  No submissions recorded for this attempt yet.
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
