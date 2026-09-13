# Research Note: Low-Level Design (LLD) Practice & Evaluation

**Assignment Deliverable — LLD Practice Platform**  
**Author:** Candidate  
**Date:** September 2026  

## 1. The Core Learner Problem in Low-Level Design

Mastering Low-Level Design (Object-Oriented Design, Schema & Interface Modeling, Design Patterns) is widely recognized as one of the most ambiguous hurdles in software engineering education and interview preparation. 

Unlike Data Structures & Algorithms (DSA), where correctness is binary (passes test cases within time/space constraints) and automated judge systems (LeetCode, Codeforces) provide instant feedback:
- **Design problems are inherently open-ended**: There is rarely a single "correct" answer. A Parking Lot or Elevator system can be structured effectively using distinct architectural patterns (e.g., State Pattern vs. Strategy Pattern vs. Event-driven Actor model).
- **Feedback is almost entirely absent**: A learner can spend hours writing class diagrams or drafting code, but has no mechanism to determine whether their class boundaries, responsibilities, abstractions, and coupling trade-offs are sound without paying for expensive human mock interviews.
- **Learners conflate implementation with design**: Beginners either jump straight into writing hundreds of lines of boilerplate code without defining clear abstractions, or produce hand-wavy bullet points without concrete class relationships and method signatures.
- **No iterative progression loop**: Without iterative critique, learners solve a problem once, check a reference solution on GitHub or YouTube, nod in agreement, and fail to internalize why alternative design choices were suboptimal.

---

## 2. Analysis of Existing Approaches & Tools

We researched existing platforms, resources, and tools used by engineers to practice LLD:

| Platform / Tool | Approach | Key Strengths | Critical Gaps |
| :--- | :--- | :--- | :--- |
| **Educative.io (Grokking LLD)** | Read-only curated course material with static text diagrams and reference code. | Comprehensive coverage of classic problems (Parking Lot, Movie Ticket Booking). | **Zero interactive evaluation**. Learners passively read solutions rather than practicing active recall or receiving critique on their own attempts. |
| **LeetCode / HackerRank** | DSA-oriented online judges requiring executable test suites. | Automated, deterministic, real-time feedback. | **Inapplicable to pure LLD**. Forces problems into artificial coding puzzles with rigid method signatures; fails to evaluate class design, separation of concerns, or architectural trade-offs. |
| **GitHub Repositories / YouTube** | Static community repositories containing sample Java/C++ implementations. | Shows practical code examples and patterns. | Subjective quality, inconsistent conventions, and completely non-interactive. |
| **Generic Chatbots (ChatGPT, Claude)** | Free-form prompt asking "Review my LLD design". | Can reason about object relationships and edge cases. | **Unstructured and inconsistent**. Hallucinates subjective scores, lacks a standardized rubric, fails to track attempt history or progression, and varies wildly between prompts. |

---

## 3. Key Gaps Identified

From this landscape analysis, four fundamental gaps emerge:

1. **Absence of a Standardized Rubric**: Feedback on LLD must not be a vague "looks good!" or arbitrary percentage. Learners need structured evaluation along proven design dimensions:
   - *Requirement Understanding* (Functional & non-functional coverage).
   - *Class & Interface Responsibilities* (Single Responsibility, cohesion).
   - *Coupling & Encapsulation* (Information hiding, dependency direction).
   - *Design Patterns & Abstraction* (Appropriate use vs. over-engineering).
   - *Extensibility & Edge Cases* (Behavior under change, concurrent/failure scenarios).
2. **Missing Evidence-Based Feedback**: When critique is given, it must anchor to concrete evidence in the candidate's submission (`"In class ParkingFloor, method processPayment() violates SRP because..."`) rather than general platitudes.
3. **The Practice-Review-Retry Loop**: True learning happens when a learner attempts a design, receives targeted feedback on recurring weaknesses, revises the design, and visually inspects their improvement across attempts.
4. **Deterministic vs. Generative Balance**: While LLMs excel at nuanced reasoning about trade-offs, deterministic rule checks are vital for baseline structural integrity, completeness, and consistent validation.

---

## 4. Product Direction & MVP Scope

Our product direction focuses on creating a **guided, deliberate practice gym** for Low-Level Design:

```
[Problem Catalog] 
       ↓ 
[Structured Practice Studio] (Guided Markdown/Code with explicit sections)
       ↓
[Dual-Engine Evaluation] (Deterministic Rubric + AI Nuance Reasoning)
       ↓
[Evidence-Based Feedback Scorecard] (Score 1-5, Detected Evidence, Concerns, Suggestions)
       ↓
[Attempt History & Progression] (Compare past attempts and iterate)
```

### Format Decision
For the MVP, we selected a **Structured Design Document format (Markdown + Interface/Class Specifications)**:
- **Rationale**: Text + Interface specifications capture requirements, class models, relationships, and trade-off rationales with high fidelity without forcing the user to fight syntax errors or build full boilerplate runners. It provides the highest signal-to-noise ratio for assessing architectural thinking in a 2-day prototype while keeping the door open for UML diagrams and executable code in future phases.
