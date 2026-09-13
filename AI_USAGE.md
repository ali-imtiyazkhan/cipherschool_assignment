# AI Usage Note: Engineering Decisions & Trade-offs

**Assignment Deliverable — LLD Practice Platform**  
**Author:** Candidate  
**Date:** September 2026  

---

## 1. Overview of AI Assistance

In developing this Low-Level Design Practice Platform, AI tools (ChatGPT / Claude / Copilot) were utilized as collaborative architectural thought partners. Rather than blindly accepting AI-generated boilerplate, we systematically audited, accepted, modified, or rejected AI recommendations based on domain design integrity, assignment constraints, and UX requirements.

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
