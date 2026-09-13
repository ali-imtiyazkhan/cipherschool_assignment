# LLD Arena — Low-Level Design Practice & Evaluation Platform
## Combined Documentation: Project README + AI Usage Note

![LLD Arena Platform Preview](./image.png)

> **2-Day Engineering Assignment Deliverable**  
> A deliberate practice platform that helps learners practice Object-Oriented and Low-Level Design (LLD), submit solutions, receive explainable rubric-based feedback, and iteratively refine their architectural thinking.

---

## 🌐 Live Production Deployments

- 🚀 **Frontend (Vercel)**: [https://cipherschool-assignment-web.vercel.app/](https://cipherschool-assignment-web.vercel.app/)
- ⚡ **Backend API (Render)**: [https://lld-arena-backend.onrender.com](https://lld-arena-backend.onrender.com)
  - Health Endpoint: [https://lld-arena-backend.onrender.com/health](https://lld-arena-backend.onrender.com/health)
  - Problems API: [https://lld-arena-backend.onrender.com/api/problems](https://lld-arena-backend.onrender.com/api/problems)

---

## 📑 Table of Contents

1. [Key Features](#-key-features)
2. [Architecture & Domain Design](#️-architecture--domain-design)
3. [Core Domain Entities](#core-domain-entities)
4. [Getting Started & Local Setup](#-getting-started--how-to-run)
5. [Running Automated Tests](#-running-automated-tests)
6. [Architectural Change Tests](#-architectural-change-tests)
7. [AI Usage Note: Engineering Decisions & Trade-offs](#-ai-usage-note-engineering-decisions--trade-offs)
   - [Overview of AI Assistance](#1-overview-of-ai-assistance)
   - [Decision 1: Hybrid Evaluation vs Pure LLM](#decision-1-hybrid-deterministic--ai-evaluation-vs-pure-llm-scoring)
   - [Decision 2: Monolithic State Machine vs Message Queue](#decision-2-domain-schema--unified-submission-state-vs-distributed-message-queue)
   - [Decision 3: Structured Rubric with Evidence Citation](#decision-3-flexible-rubric-shape-with-evidence-citation)
   - [Decision 4: Repository Abstraction vs Direct ORM](#decision-4-repository-pattern-vs-direct-orm-calls-in-express-handlers)
   - [Summary of AI Impact](#3-summary-of-ai-impact)

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

---

# 🤖 AI Usage Note: Engineering Decisions & Trade-offs

> **Assignment Deliverable — LLD Practice Platform**  
> **Author:** Candidate  
> **Date:** September 2026  

---

## 1. Overview of AI Assistance

In developing this Low-Level Design Practice Platform, AI tools (ChatGPT / Claude / Copilot / Gemini) were utilized as collaborative architectural thought partners. Rather than blindly accepting AI-generated boilerplate, we systematically audited, accepted, modified, or rejected AI recommendations based on domain design integrity, assignment constraints, and UX requirements.

Below are **four meaningful AI-assisted decisions** detailing what was suggested, what was accepted or rejected, and the engineering rationale.

---

## 2. Meaningful AI-Assisted Decisions

### Decision 1: Hybrid Deterministic + AI Evaluation vs. Pure LLM Scoring

- **AI Suggestion**: The AI originally suggested routing all submissions directly to GPT-4 with a general prompt asking for a score out of 100, bullet points of critique, and suggested fixes.
- **Accepted / Rejected**: **REJECTED pure LLM scoring; ACCEPTED a structured two-tier hybrid architecture.**
- **Rationale**:
  - Pure LLM grading is notoriously non-deterministic: the exact same design submitted twice often yields fluctuating scores (e.g. 78 vs 89).
  - An LLM can also suffer from hallucinated praise, giving high marks to designs missing fundamental classes.
  - Instead, we designed a `DeterministicEvaluator` that checks structural completeness, class declarations, and edge-case mentions instantly, paired with an `AIEvaluator` that operates on a fixed 5-dimension rubric (1–5 scale) requiring cited evidence and explicit suggestions.

---

### Decision 2: Domain Schema — Unified Submission State vs. Distributed Message Queue

- **AI Suggestion**: When asked how to handle slow LLM evaluation, the AI suggested introducing Apache Kafka / RabbitMQ with separate microservices for submission ingestion and evaluator workers.
- **Accepted / Rejected**: **REJECTED the distributed message queue; ACCEPTED stateful database-backed async lifecycle.**
- **Rationale**:
  - The assignment guidelines explicitly warn against over-engineering: *"Do not turn the assignment into a distributed-systems project. A simple monolith is completely acceptable."*
  - Introducing Kafka or Redis queues adds infrastructure fragility without adding domain value for an MVP.
  - We implemented a database-backed state machine on the `Submission` entity (`PENDING` → `EVALUATING` → `COMPLETED` / `FAILED`). The client receives an immediate response and polls the status endpoint, delivering resilience and non-blocking UX within a clean, deployable monolith.

---

### Decision 3: Flexible Rubric Shape with Evidence Citation

- **AI Suggestion**: The AI suggested a rubric format containing only `{ category: string, score: number, comment: string }`.
- **Accepted / Rejected**: **MODIFIED & EXPANDED to include `evidence`, `concern`, and `suggestion`.**
- **Rationale**:
  - Generic comments like *"Good use of classes but consider decoupling"* are unhelpful to a learner trying to improve.
  - We engineered the evaluation schema to demand concrete proof:
    1. **`evidence`**: The exact class, method, or relationship detected in the learner's solution.
    2. **`concern`**: The specific architectural flaw or smell (e.g. violation of Open/Closed principle).
    3. **`suggestion`**: Actionable guidance for the learner's next attempt.
  - This transforms abstract feedback into high-leverage pedagogical insight.

---

### Decision 4: Repository Pattern vs. Direct ORM Calls in Express Handlers

- **AI Suggestion**: The AI suggested calling `prisma.attempt.create(...)` directly inside the Express route handlers (`app.post('/attempts', ...)`) to save time and lines of code.
- **Accepted / Rejected**: **REJECTED direct ORM calls in controllers; ACCEPTED Repository + Service abstraction layer.**
- **Rationale**:
  - Coupling HTTP routing directly to database queries creates brittle, untestable code.
  - By isolating domain repositories (`AttemptRepository`, `SubmissionRepository`, `EvaluationRepository`) and services (`AttemptService`, `EvaluationService`), the domain business logic and evaluators remain completely decoupled from Prisma/PostgreSQL.
  - This allowed us to write clean unit tests for the evaluators and orchestrator without needing a live database connection or complex mocking.

---

## 3. Summary of AI Impact

The strategic use of AI accelerated the generation of repetitive TypeScript types, initial seed data for classic LLD problems, and regex patterns for deterministic parsing. Crucially, human engineering judgement was maintained on **domain boundaries, architectural trade-offs, state machine guarantees, and user experience**.
