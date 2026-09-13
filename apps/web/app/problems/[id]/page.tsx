"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import { fetchProblem, startAttempt, submitSolution, Problem } from "../../lib/api";

const STARTER_TEMPLATE = `# 1. Requirements & Assumptions
- Support all vehicle types with designated spot sizes
- Handle concurrent entry/exit safely
- Assume single-process in-memory persistence

# 2. Core Classes & Interfaces
\`\`\`typescript
enum VehicleType {
  MOTORCYCLE,
  CAR,
  TRUCK
}

abstract class Vehicle {
  constructor(protected licensePlate: string, protected type: VehicleType) {}
  getType(): VehicleType { return this.type; }
}

class Car extends Vehicle {
  constructor(licensePlate: string) { super(licensePlate, VehicleType.CAR); }
}

class ParkingSpot {
  private occupied: boolean = false;
  private currentVehicle?: Vehicle;
  constructor(private id: string, private spotType: VehicleType) {}
  
  isAvailable(): boolean { return !this.occupied; }
  park(vehicle: Vehicle): boolean {
    if (this.occupied || vehicle.getType() !== this.spotType) return false;
    this.occupied = true;
    this.currentVehicle = vehicle;
    return true;
  }
  vacate(): void {
    this.occupied = false;
    this.currentVehicle = undefined;
  }
}

class ParkingLot {
  private spots: ParkingSpot[] = [];
  // Singleton instance
  private static instance: ParkingLot;
  private constructor() {}
  public static getInstance(): ParkingLot {
    if (!ParkingLot.instance) ParkingLot.instance = new ParkingLot();
    return ParkingLot.instance;
  }
}
\`\`\`

# 3. Class Responsibilities & Relationships
- ParkingLot: Aggregates floors and spots. Manages overall entry/exit workflow.
- ParkingSpot: Encapsulates occupancy state and vehicle assignment.
- Vehicle: Abstract base entity; extended by Car, Truck, Motorcycle (Polymorphism).

# 4. Design Patterns & Extensibility
- Singleton Pattern: Used for the main ParkingLot controller.
- Strategy Pattern: Can be plugged in for dynamic spot assignment (e.g. Nearest-to-Elevator vs Lowest-Floor).
- Extensibility: Adding ElectricVehicle requires adding a spot with charger without changing ParkingLot core logic.

# 5. Edge Cases & Concurrency
- Full lot rejection: Ticket cannot be issued if available spots count is zero.
- Race conditions on spot booking: Use mutex lock or synchronized block per floor.
`;

export default function ProblemPracticePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [content, setContent] = useState<string>(STARTER_TEMPLATE);
  const [userName, setUserName] = useState<string>("Alex Learner");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProblem(resolvedParams.id).then((p) => {
      setProblem(p);
      // Personalize default template based on problem title
      if (p && !p.title.toLowerCase().includes("parking")) {
        setContent(`# 1. Requirements & Assumptions
- Core functional requirements addressed
- System constraints & concurrency assumptions

# 2. Core Entities & Class Diagram
\`\`\`typescript
// Define your core classes and interfaces here
\`\`\`

# 3. Class Responsibilities & Coupling
- Explain SRP (Single Responsibility Principle) for each class
- Discuss encapsulation and loose coupling

# 4. Design Patterns Applied
- What patterns did you choose (Factory, Strategy, Observer, State)?
- Why are they appropriate here without over-engineering?

# 5. Edge Cases & Extensibility
- Handling failure modes, invalid inputs, or resource exhaustion
- How this design changes when new requirements are introduced
`);
      }
    });
  }, [resolvedParams.id]);

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError("Please write your design solution before submitting.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Create or retrieve attempt
      const attempt = await startAttempt(resolvedParams.id, userName);
      // 2. Submit solution
      const result = await submitSolution(attempt.id, content);
      // 3. Navigate to live evaluation page
      router.push(`/submissions/${result.submissionId}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to submit solution. Ensure backend is running.");
      setIsSubmitting(false);
    }
  };

  if (!problem) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Navbar />
        <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--text-muted)" }}>
          Loading problem workspace...
        </div>
      </div>
    );
  }

  const badgeClass =
    problem.difficulty === "EASY"
      ? "badge badge-easy"
      : problem.difficulty === "HARD"
      ? "badge badge-hard"
      : "badge badge-medium";

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.length;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <main style={{ flex: 1, display: "flex", flexDirection: "column", maxWidth: 1440, width: "100%", margin: "0 auto", padding: "20px 24px 32px" }}>
        {/* Top Breadcrumb & Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--text-muted)", fontSize: "0.88rem", fontWeight: 500 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Problems
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem", color: "var(--text-muted)" }}>
              <span>Learner:</span>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-main)",
                  padding: "4px 8px",
                  borderRadius: 6,
                  fontSize: "0.85rem",
                  width: 130,
                }}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? (
                <>
                  <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></span>
                  Submitting & Evaluating...
                </>
              ) : (
                <>
                  Submit for Rubric Evaluation
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            background: "var(--danger-bg)",
            border: "1px solid var(--danger-border)",
            color: "var(--danger)",
            padding: "12px 16px",
            borderRadius: 8,
            marginBottom: 16,
            fontSize: "0.9rem",
          }}>
            {error}
          </div>
        )}

        {/* Studio Workspace Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "400px 1fr", gap: 24, flex: 1, minHeight: 650 }}>
          {/* Left Column: Requirements & Guide */}
          <div className="glass-panel" style={{ padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span className={badgeClass}>{problem.difficulty}</span>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>LLD Specification</span>
              </div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-main)", marginBottom: 10 }}>
                {problem.title}
              </h1>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                {problem.description}
              </p>
            </div>

            <div>
              <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#e2e8f0", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
                Functional Requirements
              </h2>
              <ul style={{ paddingLeft: 18, fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: 6 }}>
                {problem.requirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>

            <div>
              <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#e2e8f0", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                Architectural Constraints
              </h2>
              <ul style={{ paddingLeft: 18, fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: 6 }}>
                {problem.constraints.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>

            {/* Rubric Evaluation Criteria Tip */}
            <div style={{ background: "rgba(99, 102, 241, 0.08)", border: "1px solid rgba(99, 102, 241, 0.2)", borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#a5b4fc", marginBottom: 6 }}>
                🎯 Rubric Evaluation Dimensions
              </div>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                Your solution will be rigorously scored (1–5) on:
              </p>
              <ol style={{ paddingLeft: 16, fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 6, lineHeight: 1.5 }}>
                <li>Requirement Understanding & Scope</li>
                <li>Class & Interface Responsibilities (SRP)</li>
                <li>Coupling & Cohesion</li>
                <li>Appropriate Abstraction & Patterns</li>
                <li>Extensibility & Edge Cases</li>
              </ol>
            </div>
          </div>

          {/* Right Column: Solution Editor */}
          <div className="glass-panel" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Editor Toolbar */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 18px",
              borderBottom: "1px solid var(--border-subtle)",
              background: "rgba(10, 14, 23, 0.5)",
              flexWrap: "wrap",
              gap: 8,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-muted)" }}>Design Doc Editor</span>
                <span style={{ fontSize: "0.75rem", background: "var(--bg-subtle)", padding: "2px 6px", borderRadius: 4, color: "var(--text-faint)" }}>Markdown + Code</span>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setContent(STARTER_TEMPLATE)}
                  style={{
                    background: "transparent",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-muted)",
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontSize: "0.78rem",
                    cursor: "pointer",
                  }}
                >
                  Reload Starter Template
                </button>
                <button
                  type="button"
                  onClick={() => setContent("")}
                  style={{
                    background: "transparent",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-muted)",
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontSize: "0.78rem",
                    cursor: "pointer",
                  }}
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Textarea */}
            <div style={{ flex: 1, position: "relative", minHeight: 450 }}>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Draft your Low-Level Design solution here (Classes, Responsibilities, Interfaces, Relationships, Edge cases)..."
                style={{
                  width: "100%",
                  height: "100%",
                  background: "transparent",
                  color: "#f8fafc",
                  border: "none",
                  padding: "18px 20px",
                  fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                  fontSize: "0.92rem",
                  lineHeight: 1.6,
                  resize: "none",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Editor Footer Info */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 18px",
              borderTop: "1px solid var(--border-subtle)",
              background: "rgba(10, 14, 23, 0.4)",
              fontSize: "0.78rem",
              color: "var(--text-faint)",
            }}>
              <div>
                <span>{wordCount} words</span>
                <span style={{ margin: "0 8px" }}>•</span>
                <span>{charCount} characters</span>
              </div>
              <div>
                Status: <span style={{ color: "#10b981" }}>Draft autosaved locally</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
