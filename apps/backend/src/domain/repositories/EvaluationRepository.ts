import { Evaluation } from "../entities/Evaluation";

export interface EvaluationRepository {
  create(data: { submissionId: string; evaluatorType: "DETERMINISTIC" | "AI"; criteria: any; overallSummary: string; confidence?: number }): Promise<Evaluation>;
  findBySubmission(submissionId: string): Promise<Evaluation[]>;
}