import { Submission } from "../entities/Submission";
import { Evaluation, Criterion } from "../entities/Evaluation";

export interface Evaluator {
  evaluate(submission: Submission): Promise<EvaluationResult>;
}

export interface EvaluationResult {
  criteria: Criterion[];
  overallSummary: string;
  confidence?: number;
}