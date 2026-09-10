import { Evaluator, EvaluationResult } from "./Evaluator";
import { Submission } from "../entities/Submission";
import { Problem } from "../entities/Problem";

interface AIConfig {
  apiKey: string;
  model?: string;
  baseUrl?: string;
}

export class AIEvaluator implements Evaluator {
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = { model: "gpt-4o-mini", baseUrl: "https://api.openai.com/v1", ...config };
  }

  async evaluate(submission: Submission): Promise<EvaluationResult> {
    if (!this.config.apiKey) {
      return this.mockEvaluation(submission);
    }

    const prompt = this.buildPrompt(submission);

    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            { role: "system", content: this.getSystemPrompt() },
            { role: "user", content: prompt },
          ],
          temperature: 0.2,
          response_format: { type: "json_object" },
        }),
      });

      const data: any = await response.json();
      const parsed = JSON.parse(data.choices[0].message.content);

      return {
        criteria: parsed.criteria || [],
        overallSummary: parsed.overallSummary || "AI evaluation completed",
        confidence: parsed.confidence ?? 0.7,
      };
    } catch (error) {
      console.error("AI evaluation failed:", error);
      return this.mockEvaluation(submission);
    }
  }

  private getSystemPrompt(): string {
    return `You are an expert Low-Level Design evaluator. Evaluate the candidate's LLD solution against a fixed rubric.

Return ONLY valid JSON with this exact shape:
{
  "criteria": [
    { "criterion": "string", "score": 1-5, "evidence": "string", "concern": "string|null", "suggestion": "string|null" }
  ],
  "overallSummary": "string",
  "confidence": 0-1
}

Rubric dimensions (score 1-5 each):
1. Requirement Understanding - Does the design address all stated requirements?
2. Class Responsibilities - Are classes focused, cohesive, with clear single responsibilities?
3. Coupling/Cohesion - Low coupling, high cohesion? Dependencies managed well?
4. Encapsulation & Interfaces - Proper information hiding? Interfaces over implementations?
5. Abstraction & Patterns - Appropriate use of abstraction, design patterns?
6. Extensibility - Easy to extend for new requirements? Open/Closed principle?
7. Edge Cases & Testability - Error handling, boundary conditions, testable design?
8. Explanation Quality - Clear reasoning for design decisions?

Be critical but fair. Point to SPECIFIC evidence in the submission.`;
  }

  private buildPrompt(submission: Submission): string {
    return `Evaluate this LLD solution:

---
${submission.content}
---

Return JSON per the schema.`;
  }

  private mockEvaluation(submission: Submission): EvaluationResult {
    const content = submission.content;
    const hasCode = /```|class |interface |function /i.test(content);
    const length = content.length;

    return {
      criteria: [
        {
          criterion: "Requirement Understanding",
          score: length > 500 ? 4 : 3,
          evidence: length > 500 ? "Detailed solution provided" : "Solution is brief",
          concern: length > 500 ? undefined : "May miss requirements",
          suggestion: length > 500 ? undefined : "Expand on how each requirement is addressed",
        },
        {
          criterion: "Class Responsibilities",
          score: hasCode ? 4 : 3,
          evidence: hasCode ? "Code structure shows class design" : "Design described in text",
          concern: hasCode ? undefined : "Responsibilities inferred, not explicit",
          suggestion: hasCode ? undefined : "Add explicit responsibility statements per class",
        },
        {
          criterion: "Coupling/Cohesion",
          score: 3,
          evidence: "Not deeply analyzable from submission",
          concern: "Coupling analysis requires more detail",
          suggestion: "Show dependency diagram or describe module boundaries",
        },
        {
          criterion: "Encapsulation & Interfaces",
          score: hasCode && /interface/i.test(content) ? 4 : 3,
          evidence: hasCode && /interface/i.test(content) ? "Interfaces used" : "No explicit interfaces",
          suggestion: hasCode && /interface/i.test(content) ? undefined : "Consider defining interfaces for key abstractions",
        },
        {
          criterion: "Abstraction & Patterns",
          score: 3,
          evidence: "Pattern usage not explicitly documented",
          suggestion: "Name patterns used (Strategy, Factory, Observer, etc.)",
        },
        {
          criterion: "Extensibility",
          score: 3,
          evidence: "Extensibility not explicitly addressed",
          suggestion: "Describe how new requirements would be added with minimal changes",
        },
        {
          criterion: "Edge Cases & Testability",
          score: 3,
          evidence: "Limited edge case discussion",
          suggestion: "List 3-5 key edge cases and how design handles them",
        },
        {
          criterion: "Explanation Quality",
          score: length > 800 ? 4 : 3,
          evidence: length > 800 ? "Thorough explanation" : "Brief explanation",
          suggestion: length > 800 ? undefined : "Add rationale for key design decisions",
        },
      ],
      overallSummary: `Mock AI evaluation (no API key). Solution length: ${length} chars. ${hasCode ? "Contains code." : "Text-only."} Provide OPENAI_API_KEY for real AI evaluation.`,
      confidence: 0.5,
    };
  }
}