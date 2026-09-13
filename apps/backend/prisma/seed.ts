let prisma: any;
try {
  const db = await import("@repo/db");
  prisma = db.prisma || db.default;
} catch {
  const { PrismaClient } = await import("@prisma/client");
  prisma = new PrismaClient();
}

const problems = [
  {
    title: "Parking Lot System",
    description: "Design a parking lot system that can accommodate different types of vehicles (cars, motorcycles, trucks) with multiple floors and spots.",
    requirements: [
      "Support multiple vehicle types with different spot sizes",
      "Track available spots per floor and vehicle type",
      "Handle entry/exit with ticket generation and payment",
      "Support multiple payment methods",
      "Admin can view occupancy and revenue reports"
    ],
    constraints: [
      "Single process, no external services",
      "No external libraries for core logic",
      "Must handle concurrent entry/exit",
      "Extensible for new vehicle types"
    ],
    difficulty: "MEDIUM" as const,
  },
  {
    title: "Elevator Control System",
    description: "Design an elevator control system for a building with multiple elevators and floors.",
    requirements: [
      "Handle up/down requests from floors",
      "Optimize elevator dispatching to minimize wait time",
      "Support multiple elevators working together",
      "Handle emergency stop and overload",
      "Priority for certain floors (e.g., executive floors)"
    ],
    constraints: [
      "Real-time constraints (respond within 100ms)",
      "Fairness - no floor starvation",
      "Energy efficiency consideration",
      "Extensible for new scheduling algorithms"
    ],
    difficulty: "HARD" as const,
  },
  {
    title: "Vending Machine",
    description: "Design a vending machine that sells snacks and drinks, accepts coins/notes/cards, and manages inventory.",
    requirements: [
      "Product selection and dispensing",
      "Multiple payment methods (cash, card, mobile)",
      "Change return for cash payments",
      "Inventory tracking and low-stock alerts",
      "Support for promotions/discounts"
    ],
    constraints: [
      "Thread-safe coin/cash handling",
      "Fault tolerance (jam detection, refund)",
      "Audit trail for all transactions",
      "Configurable product slots"
    ],
    difficulty: "EASY" as const,
  },
  {
    title: "Library Management System",
    description: "Design a library system for managing books, members, loans, and reservations.",
    requirements: [
      "Book catalog with search (title, author, ISBN, category)",
      "Member registration and membership tiers",
      "Loan/return with due dates and fines",
      "Reservation queue for unavailable books",
      "Reports: overdue, popular books, member activity"
    ],
    constraints: [
      "Support multiple library branches",
      "Concurrent loan/return operations",
      "Data integrity for financial transactions",
      "Extensible for digital media (ebooks, audiobooks)"
    ],
    difficulty: "MEDIUM" as const,
  },
  {
    title: "Online Food Ordering",
    description: "Design a food ordering system connecting customers, restaurants, and delivery partners.",
    requirements: [
      "Restaurant menu management",
      "Order placement with customization",
      "Real-time order tracking",
      "Delivery partner assignment and routing",
      "Ratings and reviews"
    ],
    constraints: [
      "High availability during peak hours",
      "Eventual consistency for order status",
      "Support for multiple cuisines/restaurant types",
      "Fraud detection for payments"
    ],
    difficulty: "HARD" as const,
  },
];

async function main() {
  console.log("Seeding database...");

  for (const problem of problems) {
    const existing = await prisma.problem.findFirst({ where: { title: problem.title } });
    if (!existing) {
      await prisma.problem.create({ data: problem });
      console.log(`Created: ${problem.title}`);
    } else {
      console.log(`Skipped (exists): ${problem.title}`);
    }
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });