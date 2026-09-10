import { AttemptRepository } from "../repositories/AttemptRepository";
import { Attempt } from "../entities/Attempt";

export class AttemptService {
  constructor(private attemptRepo: AttemptRepository) {}

  async startAttempt(problemId: string, userId: string): Promise<Attempt> {
    const existing = await this.attemptRepo.findByUserAndProblem(userId, problemId);
    if (existing && existing.status === "IN_PROGRESS") {
      return existing;
    }
    return this.attemptRepo.create({ problemId, userId });
  }

  async getAttempt(id: string): Promise<Attempt | null> {
    return this.attemptRepo.findById(id);
  }

  async submitAttempt(attemptId: string): Promise<Attempt> {
    return this.attemptRepo.updateStatus(attemptId, "SUBMITTED");
  }

  async getHistory(attemptId: string) {
    return this.attemptRepo.findWithSubmissions(attemptId);
  }
}