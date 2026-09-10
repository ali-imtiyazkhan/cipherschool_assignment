import { Submission } from "../entities/Submission";

export interface SubmissionRepository {
  create(data: { attemptId: string; content: string }): Promise<Submission>;
  findById(id: string): Promise<(Submission & { evaluations: any[] }) | null>;
  updateStatus(id: string, status: "PENDING" | "EVALUATING" | "COMPLETED" | "FAILED", failureReason?: string): Promise<Submission>;
  findByAttempt(attemptId: string): Promise<(Submission & { evaluations: any[] })[]>;
}