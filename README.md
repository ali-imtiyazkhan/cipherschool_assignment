# LLD Arena — Low-Level Design Practice & Evaluation Platform

> **2-Day Engineering Assignment Deliverable**  
> A deliberate practice platform that helps learners practice Object-Oriented and Low-Level Design (LLD), submit solutions, receive explainable rubric-based feedback, and iteratively refine their architectural thinking.

---

## 🌟 Key Features

- **Problem Catalog**: Curated real-world LLD problems (Parking Lot, Elevator Control System, Vending Machine, Library Management, Online Food Ordering) with explicit functional requirements and architectural constraints.
- **Structured Practice Studio**: Dedicated markdown and code workspace pre-configured with design doc scaffolding (Assumptions, Class Diagram/Interfaces, Class Responsibilities, Design Patterns, Edge Cases & Concurrency).
- **Dual-Tier Hybrid Evaluation Engine**:
  - **Deterministic Evaluator**: Fast, reproducible rule-based analysis of structural completeness, class hierarchies, SOLID principles, and edge case mentions.
  - **AI Rubric Evaluator**: LLM-driven architectural nuance analysis across 5 dimensions, requiring cited **Evidence**, identified **Concerns**, and actionable **Suggestions**.
  - **Resilient Fallback**: Operates out-of-the-box in offline/mock mode if no OpenAI API key is configured.
- **Live Evaluation Scorecard**: Real-time evaluation status polling (`PENDING` ➔ `EVALUATING` ➔ `COMPLETED`), overall score out of 5, confidence rating, and side-by-side comparison between AI reasoning and deterministic checks.
- **Attempt History & Progression**: Tracks multiple iterations per problem so learners can review feedback, iterate on their design, and observe their score improve across attempts.

---

## 📑 Assignment Deliverables Index

| Deliverable | Description | File Link |
| :--- | :--- | :--- |
| **Research Note** | 1–2 pages analyzing the learner problem in LLD, existing tools (LeetCode, Educative, etc.), key gaps, and product direction. | [RESEARCH_NOTE.md](file:///d:/projects/cipherSchool_assignment/RESEARCH_NOTE.md) |
| **Design Note** | Concise architecture note: MVP scope, class/domain model, hybrid evaluation strategy, Change Tests A & B, and scaling trade-offs. | [DESIGN_NOTE.md](file:///d:/projects/cipherSchool_assignment/DESIGN_NOTE.md) |
| **AI Usage Note** | 3–5 meaningful AI-assisted decisions: what AI suggested, what was accepted or rejected, and why. | [AI_USAGE.md](file:///d:/projects/cipherSchool_assignment/AI_USAGE.md) |
| **Working Prototype** | Full-stack monorepo: Next.js frontend (`apps/web`) + Express backend (`apps/backend`) with domain model and evaluators. | [apps/web](file:///d:/projects/cipherSchool_assignment/apps/web) & [apps/backend](file:///d:/projects/cipherSchool_assignment/apps/backend) |
| **Automated Tests** | Comprehensive test suite covering evaluators, orchestrator failure handling, and API endpoints. | [apps/backend/tests](file:///d:/projects/cipherSchool_assignment/apps/backend/tests) |

---

## 🏗️ Architecture & Domain Design

```
                     ┌────────────────────────────────┐
                     │    Next.js Modern Frontend     │
                     │          (apps/web)            │
                     └───────────────┬────────────────┘
                                     │ HTTP REST
                                     ▼
                     ┌────────────────────────────────┐
                     │    Express API Gateway         │
                     │        (apps/backend)          │
                     └───────────────┬────────────────┘
                                     │
                 ┌───────────────────┴───────────────────┐
                 │                                       │
                 ▼                                       ▼
    ┌───────────────────────────┐           ┌──────────────────────────┐
    │   EvaluationOrchestrator  │           │   Domain Services &      │
    └────────────┬──────────────┘           │   Repositories           │
                 │                          └────────────┬─────────────┘
        ┌────────┴────────┐                              │
        ▼                 ▼                              ▼
 ┌───────────────┐ ┌─────────────┐             ┌───────────────────┐
 │ Deterministic │ │ AI Rubric   │             │ In-Memory /       │
 │ Evaluator     │ │ Evaluator   │             │ Prisma PostgreSQL │
 └───────────────┘ └─────────────┘             └───────────────────┘
```

### Core Domain Entities

1. **`Problem`**: Owns title, requirements, constraints, and difficulty (`EASY`, `MEDIUM`, `HARD`).
2. **`User`**: Learner identity.
3. **`Attempt`**: Represents a practice session for a problem. Transitions from `IN_PROGRESS` to `SUBMITTED`.
4. **`Submission`**: Immutable snapshot of the learner's design doc. Owns its evaluation lifecycle (`PENDING` ➔ `EVALUATING` ➔ `COMPLETED` / `FAILED`).
5. **`Evaluation`**: Structured, evidence-based feedback record. One submission can have multiple evaluations (`DETERMINISTIC` and `AI`).

---

## 🚀 Getting Started & How to Run

### Prerequisites
- [Bun](https://bun.com) (v1.3+ recommended) or Node.js (v20+)

### 1. Clone & Install Dependencies
```bash
bun install
```

### 2. Environment Configuration (Optional)
The project works out of the box with zero configuration! If you want live OpenAI evaluations:
In `apps/backend/.env`:
```env
PORT=3001
OPENAI_API_KEY=sk-your-openai-key-here
# DATABASE_URL=postgresql://user:password@localhost:5432/lld_practice
```
*(If no OpenAI key or PostgreSQL database is provided, the platform automatically uses the built-in deterministic heuristic fallback and in-memory store pre-seeded with all 5 problems).*

### 3. Run Both Frontend and Backend

In separate terminal tabs:

**Terminal 1 (Backend API):**
```bash
cd apps/backend
bun run start
# Server starts on http://localhost:3001
```

**Terminal 2 (Frontend Web App):**
```bash
cd apps/web
bun run dev
# Web app starts on http://localhost:3000
```

Open your browser at **`http://localhost:3000`** to experience the full practice loop.

---

## 🧪 Running Automated Tests

Run the full test suite with Bun:
```bash
bun test apps/backend/tests
```

This runs 11 automated unit and integration tests across 3 suites:
1. `apps/backend/tests/evaluator.test.ts`: Deterministic rubric scoring and submission status state machine.
2. `apps/backend/tests/orchestrator.test.ts`: Evaluation orchestrator workflow and upstream failure resilience.
3. `apps/backend/tests/api.test.ts`: Express API endpoints, validation logic, and error handling.

---

## 💡 Architectural Change Tests

- **Change Test A (Text to Class Diagrams)**:
  `Submission.content` acts as a generic payload container. Supporting class diagrams requires implementing a new `DiagramEvaluator` that satisfies the existing `Evaluator` interface. Zero domain schema changes required.
- **Change Test B (Pluggable Evaluators & Human Mentorship)**:
  Submissions already support one-to-many `Evaluation` records. Adding a rule-based evaluator or human review queue requires registering another evaluator in `EvaluationOrchestrator` without modifying existing learner flows.
