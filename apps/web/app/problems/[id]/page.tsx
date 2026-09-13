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
        <div style={{ textAlign: "center", paddingTop: "10rem", color: "var(--text-muted)" }}>
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

      <main className="container" style={{ flex: 1, display: "flex", flexDirection: "column", paddingTop: "6rem", paddingBottom: "3rem" }}>
        {/* Top Bar */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.25rem",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}>
          <Link href="/" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "var(--text-muted)",
            fontSize: "0.875rem",
            fontWeight: 500,
            transition: "color 0.15s",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Problems
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.82rem", color: "var(--text-muted)" }}>
              <span>Learner:</span>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text)",
                  padding: "0.3rem 0.6rem",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.82rem",
                  width: 130,
                  fontFamily: "inherit",
                  outline: "none",
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
                  Evaluating...
                </>
              ) : (
                <>
                  Submit for Rubric Evaluation
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
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
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius-md)",
            marginBottom: "1rem",
            fontSize: "0.875rem",
          }}>
            {error}
          </div>
        )}

        {/* Two-column workspace */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "380px 1fr",
          gap: "1px",
          background: "var(--border)",
          border: "1px solid var(--border)",
          flex: 1,
          minHeight: 600,
        }}>
          {/* Left: Requirements Panel */}
          <div style={{ background: "var(--bg)", padding: "1.75rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <span className={badgeClass}>{problem.difficulty}</span>
                <span className="section-label">LLD Specification</span>
              </div>
              <h1 className="font-display" style={{ fontSize: "1.5rem", letterSpacing: "-0.02em", color: "var(--text)", marginBottom: "0.625rem" }}>
                {problem.title}
              </h1>
              <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.55 }}>
                {problem.description}
              </p>
            </div>

            <div>
              <h2 className="accent-left" style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.75rem" }}>
                Functional Requirements
              </h2>
              <ul style={{ paddingLeft: "1.1rem", fontSize: "0.82rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "0.35rem", listStyle: "disc" }}>
                {problem.requirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="accent-left" style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.75rem" }}>
                Architectural Constraints
              </h2>
              <ul style={{ paddingLeft: "1.1rem", fontSize: "0.82rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "0.35rem", listStyle: "disc" }}>
                {problem.constraints.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>

            {/* Rubric dimensions */}
            <div style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "1rem",
            }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--color-accent-400)", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Rubric Evaluation Dimensions
              </div>
              <ol style={{ paddingLeft: "1.1rem", fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.6, listStyle: "decimal" }}>
                <li>Requirement Understanding & Scope</li>
                <li>Class & Interface Responsibilities (SRP)</li>
                <li>Coupling & Cohesion</li>
                <li>Appropriate Abstraction & Patterns</li>
                <li>Extensibility & Edge Cases</li>
              </ol>
            </div>
          </div>

          {/* Right: Editor */}
          <div style={{ background: "var(--bg)", display: "flex", flexDirection: "column" }}>
            {/* Editor toolbar */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0.75rem 1.25rem",
              borderBottom: "1px solid var(--border)",
              flexWrap: "wrap",
              gap: "0.5rem",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                {/* Dots */}
                <span style={{ width: "0.5rem", height: "0.5rem", borderRadius: "50%", outline: "1px solid var(--color-base-600)" }}></span>
                <span style={{ width: "0.5rem", height: "0.5rem", borderRadius: "50%", outline: "1px solid var(--color-base-700)" }}></span>
                <span style={{ width: "0.5rem", height: "0.5rem", borderRadius: "50%", outline: "1px solid var(--color-base-800)" }}></span>
                <span style={{ fontSize: "0.78rem", fontWeight: 500, color: "var(--text-muted)", marginLeft: "0.5rem" }}>Design Doc Editor</span>
                <span className="tag" style={{ fontSize: "0.65rem", padding: "0.15rem 0.5rem" }}>Markdown + Code</span>
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setContent(STARTER_TEMPLATE)}
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: "0.72rem" }}
                >
                  Reload Template
                </button>
                <button
                  type="button"
                  onClick={() => setContent("")}
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: "0.72rem" }}
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Textarea */}
            <div style={{ flex: 1, position: "relative", minHeight: 400 }}>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Draft your Low-Level Design solution here..."
                style={{
                  width: "100%",
                  height: "100%",
                  background: "transparent",
                  color: "var(--text)",
                  border: "none",
                  padding: "1.25rem",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.875rem",
                  lineHeight: 1.65,
                  resize: "none",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Footer stats */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0.6rem 1.25rem",
              borderTop: "1px solid var(--border)",
              fontSize: "0.72rem",
              color: "var(--text-dim)",
            }}>
              <div>
                <span>{wordCount} words</span>
                <span style={{ margin: "0 0.5rem" }}>·</span>
                <span>{charCount} characters</span>
              </div>
              <div>
                Status: <span style={{ color: "var(--color-green-500)" }}>Draft autosaved</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
