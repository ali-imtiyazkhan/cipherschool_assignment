export type SubmissionStatus = "PENDING" | "EVALUATING" | "COMPLETED" | "FAILED";

export interface Submission {
  id: string;
  attemptId: string;
  content: string;
  status: SubmissionStatus;
  submittedAt: Date;
  failureReason?: string;
}