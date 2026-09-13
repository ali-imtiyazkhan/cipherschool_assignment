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

      <main style={{ flex: 1, maxWidth: 1080, width: "100%", margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--text-muted)", fontSize: "0.88rem" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Problem Catalog
          </Link>

          {attempt && (
            <Link
              href={`/problems/${attempt.problemId}`}
              className="btn-primary"
              style={{ fontSize: "0.85rem", padding: "8px 16px" }}
            >
              🔄 Continue / Refine Design
            </Link>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-muted)" }}>
            Loading attempt history...
          </div>
        ) : !attempt ? (
          <div className="glass-panel" style={{ padding: 40, textAlign: "center" }}>
            <h2 style={{ fontSize: "1.3rem", marginBottom: 12 }}>Attempt Not Found</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: 20 }}>The specified attempt ID could not be loaded.</p>
            <Link href="/" className="btn-secondary">Return Home</Link>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="glass-panel" style={{ padding: 24, marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span className="badge badge-info">Attempt #{attempt.id.slice(-5)}</span>
                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  Started {new Date(attempt.startedAt).toLocaleDateString()} at {new Date(attempt.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <h1 style={{ fontSize: "1.7rem", fontWeight: 700, color: "#fff", marginBottom: 6 }}>
                Attempt Iteration History
              </h1>
              <p style={{ color: "var(--text-muted)", fontSize: "0.92rem" }}>
                Review how your low-level design solutions and rubric scores evolved across iterations.
              </p>
            </div>

            {/* Timeline of Submissions */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
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
                      className="glass-panel"
                      style={{ padding: 22, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}
                    >
                      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                        <div style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          background: "var(--bg-card)",
                          border: "1px solid var(--border-subtle)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: "1.1rem",
                          color: "var(--accent-primary)",
                        }}>
                          #{iterationNum}
                        </div>

                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <span style={{ fontWeight: 700, fontSize: "1rem", color: "#fff" }}>
                              Iteration {iterationNum}
                            </span>
                            <span className={sub.status === "COMPLETED" ? "badge badge-easy" : "badge badge-info"}>
                              {sub.status}
                            </span>
                          </div>
                          <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                            Submitted {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {sub.content.length} characters
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                        {avgScore && (
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#6366f1" }}>
                              {avgScore}<span style={{ fontSize: "0.85rem", color: "var(--text-faint)" }}>/5</span>
                            </div>
                            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                              Rubric Score
                            </div>
                          </div>
                        )}

                        <Link
                          href={`/submissions/${sub.id}`}
                          className="btn-secondary"
                          style={{ fontSize: "0.85rem", padding: "8px 16px" }}
                        >
                          View Scorecard
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </Link>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="glass-panel" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
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
