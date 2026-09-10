export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export interface Problem {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  constraints: string[];
  difficulty: Difficulty;
  createdAt: Date;
}