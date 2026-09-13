import { describe, it, expect } from "bun:test";
import { EvaluationOrchestrator } from "../src/domain/evaluators/EvaluationOrchestrator";
import { DeterministicEvaluator } from "../src/domain/evaluators/DeterministicEvaluator";
import { AIEvaluator } from "../src/domain/evaluators/AIEvaluator";
import { EvaluationService } from "../src/domain/services/EvaluationService";
import { Submission } from "../src/domain/entities/Submission";
import { Evaluation } from "../src/domain/entities/Evaluation";
import { SubmissionRepository } from "../src/domain/repositories/SubmissionRepository";
import { EvaluationRepository } from "../src/domain/repositories/EvaluationRepository";

describe("EvaluationOrchestrator", () => {
  it("should evaluate submission and record both deterministic and AI evaluations", async () => {
    const savedEvaluations: Evaluation[] = [];
    let submissionStatus = "PENDING";
    let failureReason: string | undefined = undefined;

    const mockSubmission: Submission & { evaluations: any[] } = {
      id: "sub-123",
      attemptId: "att-123",
      content: `
# Requirements
- Multi vehicle parking
- Track spots

# Classes
class ParkingLot {
  private spots: Spot[];
}
class Spot {
  private occupied: boolean;
}

# Responsibilities
ParkingLot handles allocation. Spot tracks state.

# Edge Cases
- Full capacity
- Invalid vehicle size
      `,
      status: "PENDING",
      submittedAt: new Date(),
      evaluations: [],
    };

    const mockSubmissionRepo: SubmissionRepository = {
      create: async () => mockSubmission,
      findById: async (id: string) => mockSubmission,
      updateStatus: async (id: string, status: any, reason?: string) => {
        submissionStatus = status;
        failureReason = reason;
        return { ...mockSubmission, status, failureReason: reason };
      },
      findByAttempt: async () => [mockSubmission],
    };

    const mockEvaluationRepo: EvaluationRepository = {
      create: async (data: any) => {
        const item: Evaluation = {
          id: `eval-${savedEvaluations.length}`,
          createdAt: new Date(),
          ...data,
        };
        savedEvaluations.push(item);
        return item;
      },
      findBySubmission: async () => savedEvaluations,
    };

    const evaluationService = new EvaluationService(mockEvaluationRepo);
    const deterministicEvaluator = new DeterministicEvaluator();
    const aiEvaluator = new AIEvaluator({ apiKey: "" }); // Uses mock fallback

    const orchestrator = new EvaluationOrchestrator(
      deterministicEvaluator,
      aiEvaluator,
      evaluationService,
      mockEvaluationRepo,
      mockSubmissionRepo
    );

    await orchestrator.evaluateSubmission("sub-123");

    // Verification
    expect(submissionStatus).toBe("COMPLETED");
    expect(savedEvaluations.length).toBe(2);
    
    const detEval = savedEvaluations.find((e) => e.evaluatorType === "DETERMINISTIC");
    expect(detEval).toBeDefined();
    expect(detEval?.criteria.length).toBeGreaterThan(0);

    const aiEval = savedEvaluations.find((e) => e.evaluatorType === "AI");
    expect(aiEval).toBeDefined();
    expect(aiEval?.criteria.length).toBeGreaterThan(0);
    expect(aiEval?.confidence).toBeGreaterThan(0);
  });

  it("should handle evaluator failures gracefully and transition status to FAILED", async () => {
    let submissionStatus = "PENDING";
    let failureReason: string | undefined = undefined;

    const mockSubmission: Submission & { evaluations: any[] } = {
      id: "sub-err",
      attemptId: "att-err",
      content: "Sample content",
      status: "PENDING",
      submittedAt: new Date(),
      evaluations: [],
    };

    const mockSubmissionRepo: SubmissionRepository = {
      create: async () => mockSubmission,
      findById: async (id: string) => mockSubmission,
      updateStatus: async (id: string, status: any, reason?: string) => {
        submissionStatus = status;
        failureReason = reason;
        return { ...mockSubmission, status, failureReason: reason };
      },
      findByAttempt: async () => [mockSubmission],
    };

    const mockEvaluationRepo: EvaluationRepository = {
      create: async (data: any) => ({
        id: "eval-1",
        createdAt: new Date(),
        ...data,
      }),
      findBySubmission: async () => [],
    };

    const failingEvaluator = {
      evaluate: async () => {
        throw new Error("Simulated upstream evaluator crash");
      },
    } as any;

    const orchestrator = new EvaluationOrchestrator(
      failingEvaluator,
      failingEvaluator,
      new EvaluationService(mockEvaluationRepo),
      mockEvaluationRepo,
      mockSubmissionRepo
    );

    await orchestrator.evaluateSubmission("sub-err");

    expect(submissionStatus).toBe("FAILED");
    expect(String(failureReason)).toContain("Simulated upstream evaluator crash");
  });
});
