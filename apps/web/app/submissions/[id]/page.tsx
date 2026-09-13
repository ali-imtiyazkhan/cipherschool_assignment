"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import { fetchSubmission, fetchEvaluations, fetchAttemptHistory, Submission, Evaluation } from "../../lib/api";

export default function SubmissionEvaluationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [activeTab, setActiveTab] = useState<"AI" | "DETERMINISTIC" | "DOC">("AI");
  const [attempt, setAttempt] = useState<any>(null);
  const [pollCount, setPollCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      const sub = await fetchSubmission(resolvedParams.id);
      if (!isMounted) return;
      if (sub) {
        setSubmission(sub);

        if (sub.status === "COMPLETED" || sub.status === "FAILED") {
          // Load evaluations
          const evals = await fetchEvaluations(sub.id);
          if (isMounted) setEvaluations(evals);

          // Load parent attempt for "Try Again"
          if (sub.attemptId) {
            const att = await fetchAttemptHistory(sub.attemptId);
            if (isMounted) setAttempt(att);
          }
        }
      }
    }

    loadData();

    // Polling if still evaluating
    const interval = setInterval(() => {
      if (submission?.status !== "COMPLETED" && submission?.status !== "FAILED") {
        setPollCount((prev) => prev + 1);
        loadData();
      }
    }, 1500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [resolvedParams.id, submission?.status, pollCount]);

  const aiEval = evaluations.find((e) => e.evaluatorType === "AI");
  const detEval = evaluations.find((e) => e.evaluatorType === "DETERMINISTIC");
  const activeEval = activeTab === "AI" ? aiEval : detEval;

  // Compute average score for the active evaluation
  const averageScore = activeEval && activeEval.criteria && activeEval.criteria.length > 0
    ? (activeEval.criteria.reduce((acc, curr) => acc + (curr.score || 0), 0) / activeEval.criteria.length).toFixed(1)
    : "N/A";

  const tabStyle = (isActive: boolean) => ({
    padding: "0.4rem 1rem",
    borderRadius: "var(--radius-full)",
    border: "none",
    fontSize: "0.8rem",
    fontWeight: 500 as const,
    cursor: "pointer" as const,
    background: isActive ? "var(--color-base-800)" : "transparent",
    color: isActive ? "var(--text)" : "var(--text-muted)",
    transition: "all 0.2s",
    display: "inline-flex" as const,
    alignItems: "center" as const,
    gap: "0.4rem",
    fontFamily: "inherit",
  });

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <main className="container" style={{ flex: 1, paddingTop: "6rem", paddingBottom: "4rem" }}>
        {/* Navigation header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", fontSize: "0.875rem", transition: "color 0.15s" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Problem Catalog
          </Link>

          {attempt && (
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <Link href={`/attempts/${attempt.id}/history`} className="btn-secondary">
                View History
              </Link>
              <Link href={`/problems/${attempt.problemId}`} className="btn-primary">
                Try Again
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
              </Link>
            </div>
          )}
        </div>

        {/* Loading / Evaluating State */}
        {(!submission || submission.status === "PENDING" || submission.status === "EVALUATING") && (
          <div
            className="evaluating-card"
            style={{
              border: "1px solid var(--border)",
              padding: "4rem 1.5rem",
              textAlign: "center",
            }}
          >
            <div
              className="font-display"
              style={{
                fontSize: "clamp(2rem, 4vw, 3rem)",
                lineHeight: 1.2,
                marginBottom: "0.75rem",
              }}
            >
              Evaluating Your Design...
            </div>
            <p style={{ maxWidth: "30rem", margin: "0 auto 1.25rem", color: "var(--text-muted)", fontSize: "0.95rem" }}>
              Running dual-tier analysis: deterministic structural checks followed by LLM architectural rubric evaluation.
            </p>
            <div className="tag tag-accent" style={{ fontSize: "0.75rem" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-accent-500)", display: "inline-block" }} />
              Submission ID: {resolvedParams.id}
            </div>
          </div>
        )}

        {/* Failed State */}
        {submission?.status === "FAILED" && (
          <div style={{ border: "1px solid var(--danger-border)", padding: "3rem 1.5rem", textAlign: "center" }}>
            <div style={{ color: "var(--danger)", fontSize: "1.75rem", marginBottom: "0.75rem" }}>⚠️</div>
            <h2 className="font-display" style={{ fontSize: "1.5rem", color: "var(--danger)", marginBottom: "0.5rem" }}>
              Evaluation Failed
            </h2>
            <p style={{ color: "var(--text-muted)", maxWidth: "30rem", margin: "0 auto 1.5rem" }}>
              {submission.failureReason || "An unexpected error occurred during evaluation."}
            </p>
            <Link href="/" className="btn-secondary">
              Back to Problems
            </Link>
          </div>
        )}

        {/* Completed State: Scorecard & Breakdown */}
        {submission?.status === "COMPLETED" && (
          <div>
            {/* Top Scorecard Banner */}
            <div style={{
              border: "1px solid var(--border)",
              padding: "2rem 2rem",
              marginBottom: "1px",
              background: "var(--bg)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                    <span className="badge badge-easy">Evaluation Completed</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                      {new Date(submission.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h1 className="font-display" style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>
                    Design Rubric Scorecard
                  </h1>
                  <p style={{ color: "var(--text-muted)", maxWidth: "36rem", fontSize: "0.9rem", lineHeight: 1.55 }}>
                    {activeEval?.overallSummary || "Comprehensive evaluation completed against standardized LLD rubric dimensions."}
                  </p>
                </div>

                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1.25rem",
                  padding: "1.25rem 1.5rem",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                  background: "var(--bg-card)",
                }}>
                  <div style={{ textAlign: "center" }}>
                    <div className="font-display" style={{ fontSize: "2.5rem", color: "var(--color-accent-400)", lineHeight: 1 }}>
                      {averageScore}
                      <span style={{ fontSize: "1rem", color: "var(--text-dim)" }}>/5</span>
                    </div>
                    <div className="section-label" style={{ marginTop: "0.25rem" }}>Average Score</div>
                  </div>

                  {activeEval?.confidence && (
                    <div style={{ borderLeft: "1px solid var(--border-subtle)", paddingLeft: "1.25rem", textAlign: "center" }}>
                      <div style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-green-500)" }}>
                        {Math.round(activeEval.confidence * 100)}%
                      </div>
                      <div className="section-label">Confidence</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tab bar */}
            <div style={{
              display: "flex",
              gap: "0.25rem",
              padding: "0.75rem 1.5rem",
              border: "1px solid var(--border)",
              borderTop: "none",
              background: "var(--bg-card)",
              marginBottom: "1px",
            }}>
              <button onClick={() => setActiveTab("AI")} style={tabStyle(activeTab === "AI")}>
                🤖 AI Rubric
                <span className="badge badge-info" style={{ fontSize: "0.65rem", padding: "0.1rem 0.4rem" }}>Nuance</span>
              </button>
              <button onClick={() => setActiveTab("DETERMINISTIC")} style={tabStyle(activeTab === "DETERMINISTIC")}>
                ⚙️ Deterministic
                <span className="badge badge-easy" style={{ fontSize: "0.65rem", padding: "0.1rem 0.4rem" }}>Fast</span>
              </button>
              <button onClick={() => setActiveTab("DOC")} style={{ ...tabStyle(activeTab === "DOC"), marginLeft: "auto" }}>
                📄 Submitted Doc
              </button>
            </div>

            {/* Criteria cards */}
            {activeTab !== "DOC" ? (
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "1px",
                background: "var(--border)",
                border: "1px solid var(--border)",
                borderTop: "none",
              }}>
                {activeEval?.criteria?.map((item, idx) => {
                  const scorePercent = (item.score / 5) * 100;
                  const scoreColor =
                    item.score >= 4 ? "var(--color-green-500)" : item.score === 3 ? "var(--color-amber-500)" : "var(--color-red-500)";

                  return (
                    <div
                      key={idx}
                      style={{
                        background: "var(--bg)",
                        padding: "1.5rem 1.75rem",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "var(--bg-elevated)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "var(--bg)"; }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <span className="font-display" style={{ fontSize: "1.25rem", color: "var(--text-dim)", lineHeight: 1 }}>
                            {String(idx + 1).padStart(2, "0")}
                          </span>
                          <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text)" }}>
                            {item.criterion}
                          </h3>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div style={{ width: 72, height: 4, background: "var(--border-subtle)", borderRadius: 2, overflow: "hidden" }}>
                            <div style={{ width: `${scorePercent}%`, height: "100%", background: scoreColor, borderRadius: 2 }}></div>
                          </div>
                          <span className="font-display" style={{ fontSize: "1.25rem", color: scoreColor, lineHeight: 1 }}>
                            {item.score}<span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>/5</span>
                          </span>
                        </div>
                      </div>

                      {/* Evidence */}
                      {item.evidence && (
                        <div style={{
                          background: "var(--success-bg)",
                          border: "1px solid var(--success-border)",
                          borderRadius: "var(--radius-md)",
                          padding: "0.75rem 1rem",
                          marginBottom: "0.5rem",
                        }}>
                          <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--success)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.25rem" }}>
                            Detected Evidence
                          </div>
                          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.45 }}>
                            {item.evidence}
                          </p>
                        </div>
                      )}

                      {/* Concern */}
                      {item.concern && (
                        <div style={{
                          background: "var(--warning-bg)",
                          border: "1px solid var(--warning-border)",
                          borderRadius: "var(--radius-md)",
                          padding: "0.75rem 1rem",
                          marginBottom: "0.5rem",
                        }}>
                          <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--warning)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.25rem" }}>
                            Identified Concern
                          </div>
                          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.45 }}>
                            {item.concern}
                          </p>
                        </div>
                      )}

                      {/* Suggestion */}
                      {item.suggestion && (
                        <div style={{
                          background: "var(--info-bg)",
                          border: "1px solid var(--info-border)",
                          borderRadius: "var(--radius-md)",
                          padding: "0.75rem 1rem",
                        }}>
                          <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--info)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.25rem" }}>
                            Suggestion
                          </div>
                          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.45 }}>
                            {item.suggestion}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Submitted Document View */
              <div style={{
                border: "1px solid var(--border)",
                borderTop: "none",
                background: "var(--bg)",
                padding: "1.5rem",
              }}>
                <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "1rem" }}>
                  Submitted Solution Content
                </h3>
                <pre style={{
                  background: "var(--bg-card)",
                  padding: "1.25rem",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.82rem",
                  fontFamily: "var(--font-mono)",
                  color: "var(--text-muted)",
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.55,
                  overflowX: "auto",
                  border: "1px solid var(--border-subtle)",
                }}>
                  {submission.content}
                </pre>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
