import { Router, Request, Response } from "express";
import { problemService, userService, attemptService, submissionService, evaluationService } from "../../domain/services";
import { EvaluationOrchestrator } from "../../domain/evaluators/EvaluationOrchestrator";
import { submissionRepository, attemptRepository, evaluationRepository } from "../../infrastructure/prisma/repositories";

const router = Router();

function getParam(req: Request, name: string): string {
  const value = req.params[name];
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

router.get("/problems", async (_req: Request, res: Response) => {
  const problems = await problemService.listAll();
  res.json(problems);
});

router.get("/problems/:id", async (req: Request, res: Response) => {
  const problem = await problemService.getById(getParam(req, "id"));
  if (!problem) return res.status(404).json({ error: "Problem not found" });
  res.json(problem);
});

router.get("/problems/:id/attempts", async (req: Request, res: Response) => {
  const problemId = getParam(req, "id");
  const attempts = await attemptRepository.findAllByProblem(problemId);
  res.json(attempts);
});

router.post("/problems", async (req: Request, res: Response) => {
  const { title, description, requirements, constraints, difficulty } = req.body;
  if (!title || !description || !requirements || !constraints) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const problem = await problemService.create({ title, description, requirements, constraints, difficulty });
  res.status(201).json(problem);
});

router.post("/attempts", async (req: Request, res: Response) => {
  const { problemId, userName } = req.body;
  if (!problemId || !userName) {
    return res.status(400).json({ error: "problemId and userName required" });
  }
  const user = await userService.getOrCreate(userName);
  const attempt = await attemptService.startAttempt(problemId, user.id);
  res.status(201).json(attempt);
});

router.get("/attempts/:id", async (req: Request, res: Response) => {
  const attempt = await attemptService.getAttempt(getParam(req, "id"));
  if (!attempt) return res.status(404).json({ error: "Attempt not found" });
  res.json(attempt);
});

router.post("/attempts/:id/submit", async (req: Request, res: Response) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: "Content required" });

  const attemptId = getParam(req, "id");
  const attempt = await attemptService.getAttempt(attemptId);
  if (!attempt) return res.status(404).json({ error: "Attempt not found" });

  await attemptService.submitAttempt(attempt.id);

  const submission = await submissionService.create(attempt.id, content);

  EvaluationOrchestrator.create(
    evaluationService,
    evaluationRepository,
    submissionRepository,
    process.env.OPENAI_API_KEY
  ).evaluateSubmission(submission.id);

  res.status(201).json({ submissionId: submission.id, status: "EVALUATING" });
});

router.get("/submissions/:id", async (req: Request, res: Response) => {
  const submission = await submissionService.getById(getParam(req, "id"));
  if (!submission) return res.status(404).json({ error: "Submission not found" });
  res.json(submission);
});

router.get("/submissions/:id/status", async (req: Request, res: Response) => {
  const submission = await submissionService.getById(getParam(req, "id"));
  if (!submission) return res.status(404).json({ error: "Submission not found" });
  res.json({ status: submission.status, failureReason: submission.failureReason });
});

router.get("/attempts/:id/history", async (req: Request, res: Response) => {
  const history = await attemptService.getHistory(getParam(req, "id"));
  if (!history) return res.status(404).json({ error: "Attempt not found" });
  res.json(history);
});

router.get("/evaluations/:submissionId", async (req: Request, res: Response) => {
  const evaluations = await evaluationService.getBySubmission(getParam(req, "submissionId"));
  res.json(evaluations);
});

export default router;