export type AttemptStatus = "IN_PROGRESS" | "SUBMITTED";

export interface Attempt {
  id: string;
  problemId: string;
  userId: string;
  status: AttemptStatus;
  startedAt: Date;
}