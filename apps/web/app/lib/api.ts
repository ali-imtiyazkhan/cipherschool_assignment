// API helper for LLD Practice Platform

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export interface Problem {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  constraints: string[];
  difficulty: "EASY" | "MEDIUM" | "HARD";
  createdAt: string;
}

export interface Attempt {
  id: string;
  problemId: string;
  userId: string;
  status: "IN_PROGRESS" | "SUBMITTED";
  startedAt: string;
  submissions?: Submission[];
}

export interface EvaluationCriterion {
  criterion: string;
  score: number;
  evidence: string;
  concern: string | null;
  suggestion: string | null;
}

export interface Evaluation {
  id: string;
  submissionId: string;
  evaluatorType: "DETERMINISTIC" | "AI";
  criteria: EvaluationCriterion[];
  overallSummary: string;
  confidence?: number;
  createdAt: string;
}

export interface Submission {
  id: string;
  attemptId: string;
  content: string;
  status: "PENDING" | "EVALUATING" | "COMPLETED" | "FAILED";
  failureReason?: string | null;
  submittedAt: string;
  evaluations?: Evaluation[];
}

export async function fetchProblems(): Promise<Problem[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/problems`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch problems");
    return await res.json();
  } catch (error) {
    console.error("fetchProblems error, using fallback:", error);
    // Fallback seed data if backend is offline during static build
    return [
      {
        id: "prob-1",
        title: "Parking Lot System",
        description: "Design a parking lot system that can accommodate different types of vehicles (cars, motorcycles, trucks) with multiple floors and spots.",
        requirements: [
          "Support multiple vehicle types with different spot sizes",
          "Track available spots per floor and vehicle type",
          "Handle entry/exit with ticket generation and payment calculation",
          "Support multiple payment methods (Cash, Credit Card, UPI)",
          "Admin can view occupancy and real-time revenue reports"
        ],
        constraints: [
          "Single process, no external services",
          "No external libraries for core domain logic",
          "Thread-safe concurrent entry/exit operations",
          "Extensible for new vehicle types (e.g., Electric Vehicles with chargers)"
        ],
        difficulty: "MEDIUM",
        createdAt: "2026-09-01T10:00:00Z",
      },
      {
        id: "prob-2",
        title: "Elevator Control System",
        description: "Design an elevator control system for a modern multi-story commercial building with multiple elevator cars and floors.",
        requirements: [
          "Handle internal cabin requests and external floor up/down calls",
          "Optimize dispatching algorithm to minimize passenger wait time",
          "Support multiple elevator cars operating collaboratively",
          "Handle safety conditions: emergency stops, door obstruction, overload",
          "Priority override for emergency or VIP floors"
        ],
        constraints: [
          "Real-time dispatching responsiveness",
          "Starvation-free scheduling (fairness across all floors)",
          "Energy-efficient idle state and zone parking",
          "Extensible scheduling strategy interface (SCAN, LOOK, SSTF)"
        ],
        difficulty: "HARD",
        createdAt: "2026-09-02T10:00:00Z",
      },
      {
        id: "prob-3",
        title: "Vending Machine",
        description: "Design a stateful vending machine that dispenses snacks and beverages, handles multiple payment forms, and tracks inventory.",
        requirements: [
          "Product selection by code, slot validation, and dispensing",
          "Accept multiple payment types (Coins, Cash notes, Cards, Mobile NFC)",
          "Calculate and dispense correct change using available coin denominations",
          "Real-time inventory decrement and low-stock alerts",
          "Support for promotional discounts and item cancellations"
        ],
        constraints: [
          "Strict state machine (Idle -> Selection -> Payment -> Dispensing -> ChangeReturn)",
          "Thread-safe balance and cash box operations",
          "Fault tolerance (jam detection, automatic refund on failure)",
          "Configurable item racks and shelf dimensions"
        ],
        difficulty: "EASY",
        createdAt: "2026-09-03T10:00:00Z",
      },
      {
        id: "prob-4",
        title: "Library Management System",
        description: "Design a comprehensive library system for cataloging books, managing member memberships, loans, and reservations.",
        requirements: [
          "Book catalog with multi-attribute search (title, author, ISBN, category)",
          "Member registration, card generation, and membership tiers",
          "Book checkout/return with automatic due date computation and fine calculation",
          "Reservation queue for books currently checked out",
          "Analytics reports: overdue items, popular titles, member activity"
        ],
        constraints: [
          "Support multiple branch locations and inter-branch loans",
          "Concurrent checkout handling for limited book copies",
          "Strict data consistency for loan records and fine settlements",
          "Extensible for digital media (e-books, audiobooks, journals)"
        ],
        difficulty: "MEDIUM",
        createdAt: "2026-09-04T10:00:00Z",
      },
      {
        id: "prob-5",
        title: "Online Food Ordering System",
        description: "Design a high-concurrency food delivery platform connecting hungry customers, restaurants, menus, and delivery partners.",
        requirements: [
          "Restaurant menu management with add-ons and inventory availability",
          "Cart management, order placement, and coupon application",
          "Order status state machine (Placed -> Accepted -> Preparing -> Out for Delivery -> Delivered)",
          "Intelligent delivery partner matching based on location proximity",
          "Customer reviews, ratings, and tip processing"
        ],
        constraints: [
          "High availability and concurrent order placement handling",
          "Eventual consistency for delivery tracking updates",
          "Pluggable payment gateways and notification dispatchers",
          "Extensible pricing strategy for surge pricing and delivery fees"
        ],
        difficulty: "HARD",
        createdAt: "2026-09-05T10:00:00Z",
      }
    ];
  }
}

export async function fetchProblem(id: string): Promise<Problem | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/problems/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    const all = await fetchProblems();
    return all.find((p) => p.id === id) || null;
  }
}

export async function startAttempt(problemId: string, userName: string = "Learner"): Promise<Attempt> {
  const res = await fetch(`${BACKEND_URL}/attempts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ problemId, userName }),
  });
  if (!res.ok) throw new Error("Failed to start attempt");
  return await res.json();
}

export async function submitSolution(attemptId: string, content: string): Promise<{ submissionId: string; status: string }> {
  const res = await fetch(`${BACKEND_URL}/attempts/${attemptId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error("Failed to submit solution");
  return await res.json();
}

export async function fetchSubmission(submissionId: string): Promise<Submission | null> {
  const res = await fetch(`${BACKEND_URL}/submissions/${submissionId}`, { cache: "no-store" });
  if (!res.ok) return null;
  return await res.json();
}

export async function fetchEvaluations(submissionId: string): Promise<Evaluation[]> {
  const res = await fetch(`${BACKEND_URL}/evaluations/${submissionId}`, { cache: "no-store" });
  if (!res.ok) return [];
  return await res.json();
}

export async function fetchAttemptHistory(attemptId: string): Promise<Attempt | null> {
  const res = await fetch(`${BACKEND_URL}/attempts/${attemptId}/history`, { cache: "no-store" });
  if (!res.ok) return null;
  return await res.json();
}

export async function fetchProblemAttempts(problemId: string): Promise<Attempt[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/problems/${problemId}/attempts`, { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}
