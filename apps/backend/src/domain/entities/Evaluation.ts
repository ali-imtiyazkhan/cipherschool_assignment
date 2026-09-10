export type EvaluatorType = "DETERMINISTIC" | "AI";

export interface Criterion {
  criterion: string;
  score: number; // 1-5
  evidence: string;
  concern?: string;
  suggestion?: string;
}

export interface Evaluation {
  id: string;
  submissionId: string;
  evaluatorType: EvaluatorType;
  criteria: Criterion[];
  overallSummary: string;
  confidence?: number;
  createdAt: Date;
}