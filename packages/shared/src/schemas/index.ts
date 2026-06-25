import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(8).optional(),
  roleNames: z.array(z.string()),
});

export const updateUserSchema = createUserSchema.partial().omit({ password: true }).extend({
  isActive: z.boolean().optional(),
});

export const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  targetStartDate: z.string().datetime().optional(),
  targetEndDate: z.string().datetime().optional(),
  templateId: z.string().optional(),
  budgetCents: z.number().int().optional(),
});

export const updateProjectSchema = createProjectSchema.partial().extend({
  status: z.enum(['DRAFT', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).optional(),
});

export const createTaskSchema = z.object({
  projectId: z.string(),
  module: z.enum(['PRODUCT', 'ENGINEERING', 'BRAND', 'BUSINESS_ANALYSIS']),
  discipline: z.enum(['FRONTEND', 'BACKEND', 'CLOUD_DEVOPS', 'QA']).optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  assigneeId: z.string().optional(),
  dueDate: z.string().datetime().optional(),
});

export const updateTaskSchema = createTaskSchema.partial().omit({ projectId: true, module: true }).extend({
  status: z.string().optional(),
  branchUrl: z.string().url().optional(),
  prUrl: z.string().url().optional(),
  commitSha: z.string().optional(),
});

export const transitionTaskSchema = z.object({
  action: z.string(),
});

export const approveTaskSchema = z.object({
  decision: z.enum(['APPROVED', 'REJECTED', 'REWORK_REQUESTED']),
  comment: z.string().optional(),
});

export const createCommentSchema = z.object({
  parentType: z.enum(['Task', 'Project']),
  parentId: z.string(),
  body: z.string().min(1),
});

export const createChangeRequestSchema = z.object({
  projectId: z.string(),
  type: z.enum(['SCOPE', 'TIMELINE', 'BUDGET', 'RESOURCE']),
  description: z.string().min(1),
  impactSummary: z.string().optional(),
  targetEndDate: z.string().datetime().optional(),
  budgetDelta: z.number().int().optional(),
  resourceDelta: z.string().optional(),
});

export const castVoteSchema = z.object({
  vote: z.enum(['APPROVE', 'REJECT', 'ABSTAIN']),
});

export const publishDecisionSchema = z.object({
  outcome: z.enum(['APPROVED', 'APPROVED_WITH_CONDITIONS', 'REJECTED', 'DEFERRED']),
  conditionsStructured: z.record(z.unknown()).optional(),
  conditionsText: z.string().optional(),
});
