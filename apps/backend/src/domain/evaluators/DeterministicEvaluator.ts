import { Evaluator, EvaluationResult } from "./Evaluator";
import { Submission } from "../entities/Submission";
import { Criterion } from "../entities/Evaluation";

export class DeterministicEvaluator implements Evaluator {
  async evaluate(submission: Submission): Promise<EvaluationResult> {
    const content = submission.content;
    const criteria: Criterion[] = [];

    const hasRequirements = /requirements?/i.test(content);
    const hasClasses = /class\s+\w+|interface\s+\w+/i.test(content);
    const hasResponsibilities = /responsib(ilit)?y|responsible for/i.test(content);
    const hasRelationships = /extends|implements|uses|depends on|composition|aggregation|association/i.test(content);
    const hasEdgeCases = /edge case|null|empty|invalid|error/i.test(content);
    const hasPatterns = /pattern|strategy|factory|observer|singleton|builder/i.test(content);

    criteria.push({
      criterion: "Requirements Coverage",
      score: hasRequirements ? 4 : 2,
      evidence: hasRequirements ? "Requirements section present" : "No explicit requirements section found",
      concern: hasRequirements ? undefined : "Missing requirements analysis",
      suggestion: hasRequirements ? undefined : "Add a Requirements section listing functional/non-functional needs",
    });

    criteria.push({
      criterion: "Class/Interface Design",
      score: hasClasses ? 4 : 1,
      evidence: hasClasses ? "Classes or interfaces defined" : "No class/interface definitions found",
      concern: hasClasses ? undefined : "Design lacks structural elements",
      suggestion: hasClasses ? undefined : "Define core classes and interfaces with clear names",
    });

    criteria.push({
      criterion: "Responsibility Assignment",
      score: hasResponsibilities ? 4 : 2,
      evidence: hasResponsibilities ? "Responsibilities mentioned" : "Responsibilities not clearly stated",
      concern: hasResponsibilities ? undefined : "Unclear what each class does",
      suggestion: hasResponsibilities ? undefined : "Add responsibility statements per class (CRC cards style)",
    });

    criteria.push({
      criterion: "Relationships & Coupling",
      score: hasRelationships ? 4 : 2,
      evidence: hasRelationships ? "Relationships between types shown" : "No explicit relationships described",
      concern: hasRelationships ? undefined : "Coupling/cohesion not addressed",
      suggestion: hasRelationships ? undefined : "Show inheritance, composition, or dependency relationships",
    });

    criteria.push({
      criterion: "Edge Cases & Testability",
      score: hasEdgeCases ? 4 : 2,
      evidence: hasEdgeCases ? "Edge cases considered" : "No edge cases mentioned",
      concern: hasEdgeCases ? undefined : "Design may not handle boundary conditions",
      suggestion: hasEdgeCases ? undefined : "List key edge cases and how design handles them",
    });

    criteria.push({
      criterion: "Pattern Application",
      score: hasPatterns ? 3 : 2,
      evidence: hasPatterns ? "Design patterns referenced" : "No patterns explicitly used",
      suggestion: hasPatterns ? undefined : "Consider naming applicable patterns (Strategy, Factory, etc.)",
    });

    const avgScore = criteria.reduce((a, b) => a + b.score, 0) / criteria.length;
    const overallSummary = `Deterministic evaluation: ${avgScore.toFixed(1)}/5 average. ${criteria.filter(c => c.score >= 4).length}/${criteria.length} criteria met.`;

    return {
      criteria,
      overallSummary,
      confidence: 0.9,
    };
  }
}