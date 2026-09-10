import { ProblemService } from "./ProblemService";
import { UserService } from "./UserService";
import { AttemptService } from "./AttemptService";
import { SubmissionService } from "./SubmissionService";
import { EvaluationService } from "./EvaluationService";
import { problemRepository, userRepository, attemptRepository, submissionRepository, evaluationRepository } from "../../infrastructure/prisma/repositories";

export const problemService = new ProblemService(problemRepository);
export const userService = new UserService(userRepository);
export const attemptService = new AttemptService(attemptRepository);
export const submissionService = new SubmissionService(submissionRepository);
export const evaluationService = new EvaluationService(evaluationRepository);