import { Attempt } from "../entities/Attempt";
import { Submission } from "../entities/Submission";

export interface AttemptRepository {
  create(data: { problemId: string; userId: string }): Promise<Attempt>;
  findById(id: string): Promise<Attempt | null>;
  findByUserAndProblem(userId: string, problemId: string): Promise<Attempt | null>;
  updateStatus(id: string, status: "IN_PROGRESS" | "SUBMITTED"): Promise<Attempt>;
  findWithSubmissions(id: string): Promise<(Attempt & { submissions: (Submission & { evaluations: any[] })[] }) | null>;
}