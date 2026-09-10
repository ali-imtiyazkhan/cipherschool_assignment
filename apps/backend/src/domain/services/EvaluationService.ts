import { EvaluationRepository } from "../repositories/EvaluationRepository";
import { Evaluation, Criterion } from "../entities/Evaluation";

export class EvaluationService {
  constructor(private evaluationRepo: EvaluationRepository) {}

  async save(evaluation: Omit<Evaluation, "id" | "createdAt">): Promise<Evaluation> {
    return this.evaluationRepo.create(evaluation as any);
  }

  async getBySubmission(submissionId: string): Promise<Evaluation[]> {
    return this.evaluationRepo.findBySubmission(submissionId);
  }

  static aggregateCriteria(evaluations: Evaluation[]): Criterion[] {
    const map = new Map<string, Criterion[]>();
    for (const evaluation of evaluations) {
      for (const c of evaluation.criteria) {
        if (!map.has(c.criterion)) map.set(c.criterion, []);
        map.get(c.criterion)!.push(c);
      }
    }
    const aggregated: Criterion[] = [];
    for (const [criterion, list] of map) {
      const avgScore = list.reduce((a, b) => a + b.score, 0) / list.length;
      aggregated.push({
        criterion,
        score: Math.round(avgScore * 10) / 10,
        evidence: list.map(l => l.evidence).join("; "),
        concern: list.map(l => l.concern).filter(Boolean).join("; "),
        suggestion: list.map(l => l.suggestion).filter(Boolean).join("; "),
      });
    }
    return aggregated;
  }
}