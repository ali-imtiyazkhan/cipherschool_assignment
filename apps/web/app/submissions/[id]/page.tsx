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

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <main style={{ flex: 1, maxWidth: 1200, width: "100%", margin: "0 auto", padding: "32px 24px" }}>
        {/* Navigation header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--text-muted)", fontSize: "0.88rem" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Problem Catalog
          </Link>

          {attempt && (
            <div style={{ display: "flex", gap: 12 }}>
              <Link
                href={`/attempts/${attempt.id}/history`}
                className="btn-secondary"
                style={{ fontSize: "0.85rem", padding: "8px 14px" }}
              >
                📜 View Attempt History
              </Link>
              <Link
                href={`/problems/${attempt.problemId}`}
                className="btn-primary"
                style={{ fontSize: "0.85rem", padding: "8px 16px" }}
              >
                🔄 Try Again / Refine Design
              </Link>
            </div>
          )}
        </div>

        {/* Loading / Evaluating State */}
        {(!submission || submission.status === "PENDING" || submission.status === "EVALUATING") && (
          <div className="glass-panel evaluating-card" style={{ padding: "60px 24px", textAlign: "center" }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
              margin: "0 auto 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 25px rgba(99, 102, 241, 0.6)",
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 2s linear infinite" }}>
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
              </svg>
            </div>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: 8, color: "#fff" }}>
              Evaluating Your Low-Level Design...
            </h2>
            <p style={{ maxWidth: 500, margin: "0 auto 16px", color: "var(--text-muted)", fontSize: "0.95rem" }}>
              Running dual-tier analysis: deterministic structural checks followed by LLM architectural rubric evaluation.
            </p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 9999, background: "rgba(99, 102, 241, 0.15)", color: "#a5b4fc", fontSize: "0.82rem" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#6366f1" }}></span>
              Submission ID: {resolvedParams.id}
            </div>
          </div>
        )}

        {/* Failed State */}
        {submission?.status === "FAILED" && (
          <div className="glass-panel" style={{ padding: 40, textAlign: "center", borderColor: "var(--danger-border)" }}>
            <div style={{ color: "var(--danger)", fontSize: "2rem", marginBottom: 12 }}>⚠️</div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--danger)", marginBottom: 8 }}>
              Evaluation Failed
            </h2>
            <p style={{ color: "var(--text-muted)", maxWidth: 500, margin: "0 auto 20px" }}>
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
            {/* Top Scorecard Summary Banner */}
            <div className="glass-panel" style={{ padding: 28, marginBottom: 28, border: "1px solid var(--border-highlight)", background: "linear-gradient(145deg, rgba(22, 32, 50, 0.9) 0%, rgba(10, 14, 23, 0.9) 100%)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span className="badge badge-easy">Evaluation Completed</span>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-faint)" }}>
                      Submitted {new Date(submission.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff", marginBottom: 8 }}>
                    Design Rubric Scorecard
                  </h1>
                  <p style={{ color: "var(--text-muted)", maxWidth: 650, fontSize: "0.95rem", lineHeight: 1.5 }}>
                    {activeEval?.overallSummary || "Comprehensive evaluation completed against standardized LLD rubric dimensions."}
                  </p>
                </div>

                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  padding: "16px 24px",
                  background: "rgba(10, 14, 23, 0.6)",
                  borderRadius: 16,
                  border: "1px solid var(--border-subtle)",
                }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "2.4rem", fontWeight: 800, color: "#6366f1", lineHeight: 1 }}>
                      {averageScore}
                      <span style={{ fontSize: "1.1rem", color: "var(--text-faint)" }}>/5</span>
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 4 }}>
                      Average Score
                    </div>
                  </div>

                  {activeEval?.confidence && (
                    <div style={{ borderLeft: "1px solid var(--border-subtle)", paddingLeft: 18, textAlign: "center" }}>
                      <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#10b981" }}>
                        {Math.round(activeEval.confidence * 100)}%
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Confidence
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20, borderBottom: "1px solid var(--border-subtle)", paddingBottom: 10 }}>
              <button
                onClick={() => setActiveTab("AI")}
                style={{
                  background: activeTab === "AI" ? "var(--bg-card)" : "transparent",
                  color: activeTab === "AI" ? "#fff" : "var(--text-muted)",
                  border: activeTab === "AI" ? "1px solid var(--border-highlight)" : "1px solid transparent",
                  padding: "8px 18px",
                  borderRadius: 8,
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                🤖 AI Rubric Analysis
                <span className="badge badge-info" style={{ fontSize: "0.7rem", padding: "1px 6px" }}>Nuance</span>
              </button>

              <button
                onClick={() => setActiveTab("DETERMINISTIC")}
                style={{
                  background: activeTab === "DETERMINISTIC" ? "var(--bg-card)" : "transparent",
                  color: activeTab === "DETERMINISTIC" ? "#fff" : "var(--text-muted)",
                  border: activeTab === "DETERMINISTIC" ? "1px solid var(--border-highlight)" : "1px solid transparent",
                  padding: "8px 18px",
                  borderRadius: 8,
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                ⚙️ Deterministic Checks
                <span className="badge badge-easy" style={{ fontSize: "0.7rem", padding: "1px 6px" }}>Fast Rule</span>
              </button>

              <button
                onClick={() => setActiveTab("DOC")}
                style={{
                  background: activeTab === "DOC" ? "var(--bg-card)" : "transparent",
                  color: activeTab === "DOC" ? "#fff" : "var(--text-muted)",
                  border: activeTab === "DOC" ? "1px solid var(--border-highlight)" : "1px solid transparent",
                  padding: "8px 18px",
                  borderRadius: 8,
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  marginLeft: "auto",
                }}
              >
                📄 Submitted Design Doc
              </button>
            </div>

            {/* Criteria Cards View */}
            {activeTab !== "DOC" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {activeEval?.criteria?.map((item, idx) => {
                  const scorePercent = (item.score / 5) * 100;
                  const scoreColor =
                    item.score >= 4 ? "#10b981" : item.score === 3 ? "#f59e0b" : "#f43f5e";

                  return (
                    <div
                      key={idx}
                      className="glass-panel"
                      style={{ padding: 22, transition: "border-color 0.2s" }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{
                            width: 26,
                            height: 26,
                            borderRadius: "50%",
                            background: "rgba(255, 255, 255, 0.05)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            color: "var(--text-muted)",
                          }}>
                            {idx + 1}
                          </span>
                          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>
                            {item.criterion}
                          </h3>
                        </div>

                        {/* Score Indicator */}
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 80, height: 6, background: "rgba(255, 255, 255, 0.1)", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ width: `${scorePercent}%`, height: "100%", background: scoreColor, borderRadius: 3 }}></div>
                          </div>
                          <span style={{ fontWeight: 800, fontSize: "1rem", color: scoreColor }}>
                            {item.score}<span style={{ fontSize: "0.8rem", color: "var(--text-faint)" }}>/5</span>
                          </span>
                        </div>
                      </div>

                      {/* Evidence Card */}
                      {item.evidence && (
                        <div style={{ background: "rgba(16, 185, 129, 0.06)", border: "1px solid rgba(16, 185, 129, 0.15)", borderRadius: 8, padding: "10px 14px", marginBottom: 10 }}>
                          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#34d399", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            Detected Evidence in Solution
                          </div>
                          <p style={{ fontSize: "0.88rem", color: "#e2e8f0", lineHeight: 1.4 }}>
                            {item.evidence}
                          </p>
                        </div>
                      )}

                      {/* Concern Card */}
                      {item.concern && (
                        <div style={{ background: "rgba(245, 158, 11, 0.06)", border: "1px solid rgba(245, 158, 11, 0.15)", borderRadius: 8, padding: "10px 14px", marginBottom: 10 }}>
                          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#fbbf24", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                            Identified Concern / Design Smell
                          </div>
                          <p style={{ fontSize: "0.88rem", color: "#fef3c7", lineHeight: 1.4 }}>
                            {item.concern}
                          </p>
                        </div>
                      )}

                      {/* Suggestion Card */}
                      {item.suggestion && (
                        <div style={{ background: "rgba(99, 102, 241, 0.06)", border: "1px solid rgba(99, 102, 241, 0.2)", borderRadius: 8, padding: "10px 14px" }}>
                          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>
                            Actionable Suggestion for Next Attempt
                          </div>
                          <p style={{ fontSize: "0.88rem", color: "#e0e7ff", lineHeight: 1.4 }}>
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
              <div className="glass-panel" style={{ padding: 24 }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: 14 }}>
                  Submitted Solution Content
                </h3>
                <pre style={{
                  background: "rgba(10, 14, 23, 0.8)",
                  padding: 20,
                  borderRadius: 8,
                  fontSize: "0.88rem",
                  fontFamily: 'Consolas, Monaco, monospace',
                  color: "#cbd5e1",
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.5,
                  overflowX: "auto",
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
