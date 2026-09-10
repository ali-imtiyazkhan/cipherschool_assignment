import { ProblemRepository } from "../repositories/ProblemRepository";
import { Problem } from "../entities/Problem";

export class ProblemService {
  constructor(private problemRepo: ProblemRepository) {}

  async listAll(): Promise<Problem[]> {
    return this.problemRepo.findAll();
  }

  async getById(id: string): Promise<Problem | null> {
    return this.problemRepo.findById(id);
  }

  async create(data: { title: string; description: string; requirements: string[]; constraints: string[]; difficulty?: "EASY" | "MEDIUM" | "HARD" }): Promise<Problem> {
    return this.problemRepo.create(data);
  }
}