import { SubmissionRepository } from "../repositories/SubmissionRepository";
import { Submission } from "../entities/Submission";

export class SubmissionService {
  constructor(private submissionRepo: SubmissionRepository) {}

  async create(attemptId: string, content: string): Promise<Submission> {
    return this.submissionRepo.create({ attemptId, content });
  }

  async getById(id: string): Promise<(Submission & { evaluations: any[] }) | null> {
    return this.submissionRepo.findById(id);
  }

  async updateStatus(id: string, status: "PENDING" | "EVALUATING" | "COMPLETED" | "FAILED", failureReason?: string): Promise<Submission> {
    return this.submissionRepo.updateStatus(id, status, failureReason);
  }

  async getByAttempt(attemptId: string): Promise<(Submission & { evaluations: any[] })[]> {
    return this.submissionRepo.findByAttempt(attemptId);
  }
}