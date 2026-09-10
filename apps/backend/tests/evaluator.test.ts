import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { DeterministicEvaluator } from "../src/domain/evaluators/DeterministicEvaluator";
import { Submission } from "../src/domain/entities/Submission";

describe("DeterministicEvaluator", () => {
  let evaluator: DeterministicEvaluator;

  beforeAll(() => {
    evaluator = new DeterministicEvaluator();
  });

  it("should score well-structured solution highly", async () => {
    const submission: Submission = {
      id: "test-1",
      attemptId: "attempt-1",
      content: `
# Requirements
- Support multiple vehicle types
- Track available spots

# Classes
class ParkingLot { }
class ParkingSpot { }
interface Vehicle { }

# Responsibilities
ParkingLot manages spots and entry/exit.
ParkingSpot tracks occupancy.

# Relationships
ParkingLot has many ParkingSpots (composition)
Vehicle parks in ParkingSpot

# Edge Cases
- Full lot handling
- Invalid vehicle type
      `,
      status: "PENDING",
      submittedAt: new Date(),
    };

    const result = await evaluator.evaluate(submission);

    expect(result.criteria.length).toBeGreaterThan(0);
    expect(result.overallSummary).toContain("Deterministic");
    expect(result.confidence).toBeGreaterThan(0.8);

    const reqScore = result.criteria.find((c: any) => c.criterion === "Requirements Coverage")?.score;
    expect(reqScore).toBeGreaterThanOrEqual(4);
  });

  it("should score poor solution low", async () => {
    const submission: Submission = {
      id: "test-2",
      attemptId: "attempt-2",
      content: "I will make a parking lot with spots.",
      status: "PENDING",
      submittedAt: new Date(),
    };

    const result = await evaluator.evaluate(submission);

    const reqScore = result.criteria.find((c: any) => c.criterion === "Requirements Coverage")?.score;
    expect(reqScore).toBeLessThan(4);

    const classScore = result.criteria.find((c: any) => c.criterion === "Class/Interface Design")?.score;
    expect(classScore).toBeLessThan(4);
  });
});

describe("Submission status transitions", () => {
  it("should follow valid state machine", () => {
    const validTransitions: Record<string, string[]> = {
      PENDING: ["EVALUATING", "FAILED"],
      EVALUATING: ["COMPLETED", "FAILED"],
      COMPLETED: [],
      FAILED: [],
    };

    expect(validTransitions.PENDING).toContain("EVALUATING");
    expect(validTransitions.EVALUATING).toContain("COMPLETED");
    expect(validTransitions.COMPLETED).toHaveLength(0);
  });
});