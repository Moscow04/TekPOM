import { Injectable } from '@nestjs/common';
import { prisma } from '@tektariq/db';

@Injectable()
export class BackOfficeService {
  async getPortfolio() {
    const projects = await prisma.project.findMany({
      include: {
        _count: { select: { tasks: true, members: true } },
      },
    });

    return Promise.all(projects.map(async (project) => {
      const now = new Date();
      const totalTasks = project._count.tasks;
      const completedTasks = await prisma.task.count({ where: { projectId: project.id, status: 'DONE' } });
      const overdueTasks = await prisma.task.count({ where: { projectId: project.id, dueDate: { lt: now }, status: { not: 'DONE' } } });
      const onTimePct = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      const overduePct = totalTasks > 0 ? (overdueTasks / totalTasks) * 100 : 0;
      const healthScore = Math.round(Math.max(0, 100 - overduePct * 1.5));

      return {
        id: project.id,
        name: project.name,
        status: project.status,
        healthScore,
        taskCount: totalTasks,
        memberCount: project._count.members,
        onTimePct: Math.round(onTimePct),
        overduePct: Math.round(overduePct),
      };
    }));
  }

  async getPortfolioSnapshot(projectId: string) {
    const snapshots = await prisma.portfolioSnapshot.findMany({
      where: { projectId },
      orderBy: { capturedAt: 'desc' },
    });
    return snapshots;
  }

  async compareProjects(projectIds: string[]) {
    const projects = await prisma.project.findMany({
      where: { id: { in: projectIds } },
      include: {
        _count: { select: { tasks: true, members: true } },
      },
    });

    return Promise.all(projects.map(async (project) => {
      const now = new Date();
      const totalTasks = project._count.tasks;
      const completedTasks = await prisma.task.count({ where: { projectId: project.id, status: 'DONE' } });
      const overdueTasks = await prisma.task.count({ where: { projectId: project.id, dueDate: { lt: now }, status: { not: 'DONE' } } });
      const onTimePct = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      const overduePct = totalTasks > 0 ? (overdueTasks / totalTasks) * 100 : 0;
      const budget = await prisma.budget.findUnique({ where: { projectId: project.id } });

      return {
        id: project.id,
        name: project.name,
        status: project.status,
        taskCount: totalTasks,
        memberCount: project._count.members,
        completedTasks,
        overdueTasks,
        onTimePct: Math.round(onTimePct),
        overduePct: Math.round(overduePct),
        budgetCents: budget?.budgetCents ?? 0,
        spentCents: budget?.spentCents ?? 0,
      };
    }));
  }

  async getLaunchReadiness(projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        _count: { select: { tasks: true, members: true } },
      },
    });
    if (!project) throw new Error(`Project ${projectId} not found`);

    const now = new Date();
    const totalTasks = project._count.tasks;
    const completedTasks = await prisma.task.count({ where: { projectId: project.id, status: 'DONE' } });
    const overdueTasks = await prisma.task.count({ where: { projectId: project.id, dueDate: { lt: now }, status: { not: 'DONE' } } });
    const totalApprovals = await prisma.approval.count({ where: { projectId: project.id } });
    const approvedApprovals = await prisma.approval.count({ where: { projectId: project.id, status: 'APPROVED' } });
    const risks = await prisma.risk.findMany({ where: { projectId: project.id } });
    const budget = await prisma.budget.findUnique({ where: { projectId: project.id } });

    const onTimePct = totalTasks > 0 ? completedTasks / totalTasks : 0;
    const overduePct = totalTasks > 0 ? overdueTasks / totalTasks : 0;
    const approvalCompleteness = totalApprovals > 0 ? approvedApprovals / totalApprovals : 0;
    const riskScore = risks.length > 0 ? risks.reduce((sum, r) => {
      const severity = r.severity === 'CRITICAL' ? 100 : r.severity === 'HIGH' ? 75 : r.severity === 'MEDIUM' ? 50 : 25;
      return sum + severity;
    }, 0) / risks.length : 0;
    const budgetHealth = budget && budget.budgetCents > 0 ? 1 - ((budget.spentCents || 0) / budget.budgetCents) : 1;
    const budgetHealthClamped = Math.max(0, Math.min(1, budgetHealth)) * 100;

    const score = Math.round(
      0.30 * (onTimePct * 100) +
      0.25 * (100 - overduePct * 100) +
      0.20 * (approvalCompleteness * 100) +
      0.15 * (100 - riskScore) +
      0.10 * budgetHealthClamped
    );

    let recommendation: string;
    if (score >= 75) recommendation = 'Launch';
    else if (score >= 45) recommendation = 'Hold';
    else recommendation = 'Kill';

    return {
      projectId: project.id,
      score,
      recommendation,
      components: {
        onTimePct: Math.round(onTimePct * 100),
        overduePct: Math.round(overduePct * 100),
        approvalCompleteness: Math.round(approvalCompleteness * 100),
        riskScore: Math.round(riskScore),
        budgetHealth: Math.round(budgetHealthClamped),
      },
    };
  }

  async getAuditLog(filters: { entityType?: string; entityId?: string; actorId?: string; page?: number; limit?: number }) {
    const where: any = {};
    if (filters.entityType) where.entityType = filters.entityType;
    if (filters.entityId) where.entityId = filters.entityId;
    if (filters.actorId) where.actorId = filters.actorId;

    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit, include: { actor: { select: { id: true, name: true, email: true } } } }),
      prisma.auditLog.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
