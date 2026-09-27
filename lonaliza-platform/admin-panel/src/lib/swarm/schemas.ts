import { z } from "zod";

export const DecomposedStepSchema = z.object({
  stepNumber: z.number(),
  description: z.string(),
  assignedAgentId: z.string(),
  expectedOutcome: z.string(),
});

export const SupervisorPlanSchema = z.object({
  goal: z.string(),
  tacticalIntentAr: z.string(),
  decomposedSteps: z.array(DecomposedStepSchema),
  assignedAgents: z.array(z.string()),
  successCriteria: z.array(z.string()),
  budgetCeilingUsd: z.number().default(500),
  allowAutonomousExecution: z.boolean().default(false),
});

export type SupervisorPlan = z.infer<typeof SupervisorPlanSchema>;

export const DynamicToolExecutionSchema = z.object({
  toolKey: z.string(),
  reason: z.string(),
  inputPayload: z.record(z.unknown()).optional(),
  outputSummary: z.string(),
  status: z.enum(["success", "failed", "simulated"]),
  executedAt: z.string(),
});

export type DynamicToolExecution = z.infer<typeof DynamicToolExecutionSchema>;

export const AgentProposalSchema = z.object({
  agentId: z.string(),
  agentNameAr: z.string(),
  thoughtProcess: z.string(),
  toolExecutions: z.array(DynamicToolExecutionSchema).default([]),
  observationSummary: z.string(),
  actionType: z.string(),
  titleAr: z.string(),
  detailsAr: z.string(),
  projectedRoi: z.number().min(0).max(1000).default(25),
  targetAudienceAr: z.string().default("عملاء السياحة والسفر في الشرق الأوسط وتركيا"),
  estimatedCostUsd: z.number().default(0),
  confidenceScore: z.number().min(0).max(100).default(85),
  rawPayload: z.record(z.unknown()).default({}),
});

export type AgentProposal = z.infer<typeof AgentProposalSchema>;

export const AdversarialCritiqueSchema = z.object({
  criticAgentId: z.string(),
  criticRole: z.enum(["financial_auditor", "red_team_critic", "peer_reviewer"]),
  challenges: z.array(z.string()),
  riskLevel: z.enum(["low", "medium", "high", "critical"]),
  isApproved: z.boolean(),
  suggestedRemediation: z.string(),
  marginScore: z.number().min(0).max(100).default(80),
  timestamp: z.string(),
});

export type AdversarialCritique = z.infer<typeof AdversarialCritiqueSchema>;

export const ConsensusEvaluationSchema = z.object({
  consensusPercentage: z.number().min(0).max(100),
  unanimous: z.boolean(),
  votes: z.record(
    z.object({
      vote: z.enum(["approve", "reject", "revise"]),
      weight: z.number().min(0).max(1),
      rationale: z.string(),
    })
  ),
  recommendation: z.enum(["execute_autonomous", "escalate_to_human", "reiterate_deliberation"]),
  roundNumber: z.number(),
});

export type ConsensusEvaluation = z.infer<typeof ConsensusEvaluationSchema>;

export const FinalDeliberationSynthesisSchema = z.object({
  decisionId: z.string(),
  directive: z.string(),
  titleAr: z.string(),
  executiveSummaryAr: z.string(),
  strategicIntentAr: z.string(),
  actionType: z.string(),
  actionPayload: z.record(z.unknown()),
  requiresHumanApproval: z.boolean(),
  consensusScore: z.number(),
  auditSummary: z.string(),
  participatingAgents: z.array(z.string()),
  roundsExecuted: z.number(),
  completedAt: z.string(),
});

export type FinalDeliberationSynthesis = z.infer<typeof FinalDeliberationSynthesisSchema>;
