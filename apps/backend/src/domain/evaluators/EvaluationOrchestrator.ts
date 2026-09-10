import { Evaluator } from "./Evaluator";
import { DeterministicEvaluator } from "./DeterministicEvaluator";
import { AIEvaluator } from "./AIEvaluator";
import { Submission } from "../entities/Submission";
import { EvaluationService } from "../services/EvaluationService";
import { EvaluationRepository } from "../repositories/EvaluationRepository";
import { SubmissionRepository } from "../repositories/SubmissionRepository";

export class EvaluationOrchestrator {
  constructor(
    private deterministicEvaluator: DeterministicEvaluator,
    private aiEvaluator: AIEvaluator,
    private evaluationService: EvaluationService,
    private evaluationRepo: EvaluationRepository,
    private submissionRepo: SubmissionRepository
  ) {}

  async evaluateSubmission(submissionId: string): Promise<void> {
    await this.submissionRepo.updateStatus(submissionId, "EVALUATING");

    const submission = await this.submissionRepo.findById(submissionId);
    if (!submission) {
      await this.submissionRepo.updateStatus(submissionId, "FAILED", "Submission not found");
      return;
    }

    try {
      const [detResult, aiResult] = await Promise.all([
        this.deterministicEvaluator.evaluate(submission),
        this.aiEvaluator.evaluate(submission),
      ]);

      await this.evaluationRepo.create({
        submissionId,
        evaluatorType: "DETERMINISTIC",
        criteria: detResult.criteria,
        overallSummary: detResult.overallSummary,
        confidence: detResult.confidence,
      });

      await this.evaluationRepo.create({
        submissionId,
        evaluatorType: "AI",
        criteria: aiResult.criteria,
        overallSummary: aiResult.overallSummary,
        confidence: aiResult.confidence,
      });

      await this.submissionRepo.updateStatus(submissionId, "COMPLETED");
    } catch (error) {
      console.error("Evaluation failed:", error);
      await this.submissionRepo.updateStatus(submissionId, "FAILED", String(error));
    }
  }

  static create(
    evaluationService: EvaluationService,
    evaluationRepo: EvaluationRepository,
    submissionRepo: SubmissionRepository,
    aiApiKey?: string
  ): EvaluationOrchestrator {
    return new EvaluationOrchestrator(
      new DeterministicEvaluator(),
      new AIEvaluator({ apiKey: aiApiKey || "" }),
      evaluationService,
      evaluationRepo,
      submissionRepo
    );
  }
}