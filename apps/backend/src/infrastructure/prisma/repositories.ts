import prisma from "./client";

export const problemRepository = {
  findAll: () => prisma.problem.findMany({ orderBy: { createdAt: "asc" } }),
  findById: (id: string) => prisma.problem.findUnique({ where: { id } }),
  create: (data: { title: string; description: string; requirements: string[]; constraints: string[]; difficulty?: "EASY" | "MEDIUM" | "HARD" }) =>
    prisma.problem.create({ data }),
};

export const userRepository = {
  findById: (id: string) => prisma.user.findUnique({ where: { id } }),
  create: (name: string) => prisma.user.create({ data: { name } }),
  getOrCreate: async (name: string) => {
    let user = await prisma.user.findFirst({ where: { name } });
    if (!user) user = await prisma.user.create({ data: { name } });
    return user;
  },
};

export const attemptRepository = {
  create: (data: { problemId: string; userId: string }) =>
    prisma.attempt.create({ data }),
  findById: (id: string) => prisma.attempt.findUnique({ where: { id } }),
  findByUserAndProblem: (userId: string, problemId: string) =>
    prisma.attempt.findFirst({ where: { userId, problemId }, orderBy: { startedAt: "desc" } }),
  updateStatus: (id: string, status: "IN_PROGRESS" | "SUBMITTED") =>
    prisma.attempt.update({ where: { id }, data: { status } }),
  findWithSubmissions: (id: string) =>
    prisma.attempt.findUnique({
      where: { id },
      include: { submissions: { include: { evaluations: true }, orderBy: { submittedAt: "desc" } } },
    }),
};

export const submissionRepository = {
  create: (data: { attemptId: string; content: string }) =>
    prisma.submission.create({ data }),
  findById: (id: string) =>
    prisma.submission.findUnique({ where: { id }, include: { evaluations: true } }),
  updateStatus: (id: string, status: "PENDING" | "EVALUATING" | "COMPLETED" | "FAILED", failureReason?: string) =>
    prisma.submission.update({ where: { id }, data: { status, failureReason } }),
  findByAttempt: (attemptId: string) =>
    prisma.submission.findMany({ where: { attemptId }, orderBy: { submittedAt: "desc" }, include: { evaluations: true } }),
};

export const evaluationRepository = {
  create: (data: { submissionId: string; evaluatorType: "DETERMINISTIC" | "AI"; criteria: any; overallSummary: string; confidence?: number }) =>
    prisma.evaluation.create({ data }),
  findBySubmission: (submissionId: string) =>
    prisma.evaluation.findMany({ where: { submissionId }, orderBy: { createdAt: "asc" } }),
};