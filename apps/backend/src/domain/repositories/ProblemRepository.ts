import { Problem } from "../entities/Problem";

export interface ProblemRepository {
  findAll(): Promise<Problem[]>;
  findById(id: string): Promise<Problem | null>;
  create(data: { title: string; description: string; requirements: string[]; constraints: string[]; difficulty?: "EASY" | "MEDIUM" | "HARD" }): Promise<Problem>;
}