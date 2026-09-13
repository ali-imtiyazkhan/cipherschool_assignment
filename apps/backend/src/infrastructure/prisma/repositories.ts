import prisma from "./client";

// Default Seed Problems for instant prototype usability
const DEFAULT_PROBLEMS = [
  {
    id: "prob-1",
    title: "Parking Lot System",
    description: "Design a parking lot system that can accommodate different types of vehicles (cars, motorcycles, trucks) with multiple floors and spots.",
    requirements: [
      "Support multiple vehicle types with different spot sizes",
      "Track available spots per floor and vehicle type",
      "Handle entry/exit with ticket generation and payment calculation",
      "Support multiple payment methods (Cash, Credit Card, UPI)",
      "Admin can view occupancy and real-time revenue reports"
    ],
    constraints: [
      "Single process, no external services",
      "No external libraries for core domain logic",
      "Thread-safe concurrent entry/exit operations",
      "Extensible for new vehicle types (e.g., Electric Vehicles with chargers)"
    ],
    difficulty: "MEDIUM" as const,
    createdAt: new Date("2026-09-01T10:00:00Z"),
  },
  {
    id: "prob-2",
    title: "Elevator Control System",
    description: "Design an elevator control system for a modern multi-story commercial building with multiple elevator cars and floors.",
    requirements: [
      "Handle internal cabin requests and external floor up/down calls",
      "Optimize dispatching algorithm to minimize passenger wait time",
      "Support multiple elevator cars operating collaboratively",
      "Handle safety conditions: emergency stops, door obstruction, overload",
      "Priority override for emergency or VIP floors"
    ],
    constraints: [
      "Real-time dispatching responsiveness",
      "Starvation-free scheduling (fairness across all floors)",
      "Energy-efficient idle state and zone parking",
      "Extensible scheduling strategy interface (SCAN, LOOK, SSTF)"
    ],
    difficulty: "HARD" as const,
    createdAt: new Date("2026-09-02T10:00:00Z"),
  },
  {
    id: "prob-3",
    title: "Vending Machine",
    description: "Design a stateful vending machine that dispenses snacks and beverages, handles multiple payment forms, and tracks inventory.",
    requirements: [
      "Product selection by code, slot validation, and dispensing",
      "Accept multiple payment types (Coins, Cash notes, Cards, Mobile NFC)",
      "Calculate and dispense correct change using available coin denominations",
      "Real-time inventory decrement and low-stock alerts",
      "Support for promotional discounts and item cancellations"
    ],
    constraints: [
      "Strict state machine (Idle -> Selection -> Payment -> Dispensing -> ChangeReturn)",
      "Thread-safe balance and cash box operations",
      "Fault tolerance (jam detection, automatic refund on failure)",
      "Configurable item racks and shelf dimensions"
    ],
    difficulty: "EASY" as const,
    createdAt: new Date("2026-09-03T10:00:00Z"),
  },
  {
    id: "prob-4",
    title: "Library Management System",
    description: "Design a comprehensive library system for cataloging books, managing member memberships, loans, and reservations.",
    requirements: [
      "Book catalog with multi-attribute search (title, author, ISBN, category)",
      "Member registration, card generation, and membership tiers",
      "Book checkout/return with automatic due date computation and fine calculation",
      "Reservation queue for books currently checked out",
      "Analytics reports: overdue items, popular titles, member activity"
    ],
    constraints: [
      "Support multiple branch locations and inter-branch loans",
      "Concurrent checkout handling for limited book copies",
      "Strict data consistency for loan records and fine settlements",
      "Extensible for digital media (e-books, audiobooks, journals)"
    ],
    difficulty: "MEDIUM" as const,
    createdAt: new Date("2026-09-04T10:00:00Z"),
  },
  {
    id: "prob-5",
    title: "Online Food Ordering System",
    description: "Design a high-concurrency food delivery platform connecting hungry customers, restaurants, menus, and delivery partners.",
    requirements: [
      "Restaurant menu management with add-ons and inventory availability",
      "Cart management, order placement, and coupon application",
      "Order status state machine (Placed -> Accepted -> Preparing -> Out for Delivery -> Delivered)",
      "Intelligent delivery partner matching based on location proximity",
      "Customer reviews, ratings, and tip processing"
    ],
    constraints: [
      "High availability and concurrent order placement handling",
      "Eventual consistency for delivery tracking updates",
      "Pluggable payment gateways and notification dispatchers",
      "Extensible pricing strategy for surge pricing and delivery fees"
    ],
    difficulty: "HARD" as const,
    createdAt: new Date("2026-09-05T10:00:00Z"),
  },
];

// In-Memory Data Store (Active when Prisma DB is not running or as fast cache)
const memoryStore = {
  problems: [...DEFAULT_PROBLEMS],
  users: [
    { id: "user-default", name: "Guest Learner", createdAt: new Date() }
  ] as Array<{ id: string; name: string; createdAt: Date }>,
  attempts: [] as Array<any>,
  submissions: [] as Array<any>,
  evaluations: [] as Array<any>,
};

function generateId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

export const problemRepository = {
  findAll: async () => {
    if (prisma?.problem) {
      try { return await prisma.problem.findMany({ orderBy: { createdAt: "asc" } }); } catch {}
    }
    return memoryStore.problems;
  },
  findById: async (id: string) => {
    if (prisma?.problem) {
      try { return await prisma.problem.findUnique({ where: { id } }); } catch {}
    }
    return memoryStore.problems.find((p) => p.id === id) || null;
  },
  create: async (data: { title: string; description: string; requirements: string[]; constraints: string[]; difficulty?: "EASY" | "MEDIUM" | "HARD" }) => {
    if (prisma?.problem) {
      try { return await prisma.problem.create({ data }); } catch {}
    }
    const problem = {
      id: generateId("prob"),
      ...data,
      difficulty: data.difficulty || "MEDIUM",
      createdAt: new Date(),
    };
    memoryStore.problems.push(problem);
    return problem;
  },
};

export const userRepository = {
  findById: async (id: string) => {
    if (prisma?.user) {
      try { return await prisma.user.findUnique({ where: { id } }); } catch {}
    }
    return memoryStore.users.find((u) => u.id === id) || null;
  },
  create: async (name: string) => {
    if (prisma?.user) {
      try { return await prisma.user.create({ data: { name } }); } catch {}
    }
    const user = { id: generateId("usr"), name, createdAt: new Date() };
    memoryStore.users.push(user);
    return user;
  },
  getOrCreate: async (name: string) => {
    if (prisma?.user) {
      try {
        let user = await prisma.user.findFirst({ where: { name } });
        if (!user) user = await prisma.user.create({ data: { name } });
        return user;
      } catch {}
    }
    let user = memoryStore.users.find((u) => u.name.toLowerCase() === name.toLowerCase());
    if (!user) {
      user = { id: generateId("usr"), name, createdAt: new Date() };
      memoryStore.users.push(user);
    }
    return user;
  },
};

export const attemptRepository = {
  create: async (data: { problemId: string; userId: string }) => {
    if (prisma?.attempt) {
      try { return await prisma.attempt.create({ data }); } catch {}
    }
    const attempt = {
      id: generateId("att"),
      problemId: data.problemId,
      userId: data.userId,
      status: "IN_PROGRESS",
      startedAt: new Date(),
    };
    memoryStore.attempts.push(attempt);
    return attempt;
  },
  findById: async (id: string) => {
    if (prisma?.attempt) {
      try { return await prisma.attempt.findUnique({ where: { id } }); } catch {}
    }
    return memoryStore.attempts.find((a) => a.id === id) || null;
  },
  findByUserAndProblem: async (userId: string, problemId: string) => {
    if (prisma?.attempt) {
      try {
        return await prisma.attempt.findFirst({
          where: { userId, problemId },
          orderBy: { startedAt: "desc" },
        });
      } catch {}
    }
    return memoryStore.attempts
      .filter((a) => a.userId === userId && a.problemId === problemId)
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())[0] || null;
  },
  updateStatus: async (id: string, status: "IN_PROGRESS" | "SUBMITTED") => {
    if (prisma?.attempt) {
      try { return await prisma.attempt.update({ where: { id }, data: { status } }); } catch {}
    }
    const attempt = memoryStore.attempts.find((a) => a.id === id);
    if (attempt) attempt.status = status;
    return attempt;
  },
  findWithSubmissions: async (id: string) => {
    if (prisma?.attempt) {
      try {
        return await prisma.attempt.findUnique({
          where: { id },
          include: { submissions: { include: { evaluations: true }, orderBy: { submittedAt: "desc" } } },
        });
      } catch {}
    }
    const attempt = memoryStore.attempts.find((a) => a.id === id);
    if (!attempt) return null;
    const submissions = memoryStore.submissions
      .filter((s) => s.attemptId === id)
      .map((s) => ({
        ...s,
        evaluations: memoryStore.evaluations.filter((e) => e.submissionId === s.id),
      }))
      .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
    return { ...attempt, submissions };
  },
  findAllByProblem: async (problemId: string) => {
    return memoryStore.attempts
      .filter((a) => a.problemId === problemId)
      .map((a) => {
        const submissions = memoryStore.submissions
          .filter((s) => s.attemptId === a.id)
          .map((s) => ({
            ...s,
            evaluations: memoryStore.evaluations.filter((e) => e.submissionId === s.id),
          }));
        return { ...a, submissions };
      });
  },
};

export const submissionRepository = {
  create: async (data: { attemptId: string; content: string }) => {
    if (prisma?.submission) {
      try { return await prisma.submission.create({ data }); } catch {}
    }
    const submission = {
      id: generateId("sub"),
      attemptId: data.attemptId,
      content: data.content,
      status: "PENDING",
      submittedAt: new Date(),
      failureReason: null,
    };
    memoryStore.submissions.push(submission);
    return submission;
  },
  findById: async (id: string) => {
    if (prisma?.submission) {
      try { return await prisma.submission.findUnique({ where: { id }, include: { evaluations: true } }); } catch {}
    }
    const sub = memoryStore.submissions.find((s) => s.id === id);
    if (!sub) return null;
    const evaluations = memoryStore.evaluations.filter((e) => e.submissionId === id);
    return { ...sub, evaluations };
  },
  updateStatus: async (id: string, status: "PENDING" | "EVALUATING" | "COMPLETED" | "FAILED", failureReason?: string) => {
    if (prisma?.submission) {
      try { return await prisma.submission.update({ where: { id }, data: { status, failureReason } }); } catch {}
    }
    const sub = memoryStore.submissions.find((s) => s.id === id);
    if (sub) {
      sub.status = status;
      if (failureReason !== undefined) sub.failureReason = failureReason;
    }
    return sub;
  },
  findByAttempt: async (attemptId: string) => {
    if (prisma?.submission) {
      try {
        return await prisma.submission.findMany({
          where: { attemptId },
          orderBy: { submittedAt: "desc" },
          include: { evaluations: true },
        });
      } catch {}
    }
    return memoryStore.submissions
      .filter((s) => s.attemptId === attemptId)
      .map((s) => ({
        ...s,
        evaluations: memoryStore.evaluations.filter((e) => e.submissionId === s.id),
      }))
      .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  },
};

export const evaluationRepository = {
  create: async (data: {
    submissionId: string;
    evaluatorType: "DETERMINISTIC" | "AI";
    criteria: any;
    overallSummary: string;
    confidence?: number;
  }) => {
    if (prisma?.evaluation) {
      try { return await prisma.evaluation.create({ data }); } catch {}
    }
    const evaluation = {
      id: generateId("eval"),
      submissionId: data.submissionId,
      evaluatorType: data.evaluatorType,
      criteria: data.criteria,
      overallSummary: data.overallSummary,
      confidence: data.confidence ?? 0.85,
      createdAt: new Date(),
    };
    memoryStore.evaluations.push(evaluation);
    return evaluation;
  },
  findBySubmission: async (submissionId: string) => {
    if (prisma?.evaluation) {
      try {
        return await prisma.evaluation.findMany({
          where: { submissionId },
          orderBy: { createdAt: "asc" },
        });
      } catch {}
    }
    return memoryStore.evaluations
      .filter((e) => e.submissionId === submissionId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  },
};