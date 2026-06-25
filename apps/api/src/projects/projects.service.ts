import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@tektariq/db';

@Injectable()
export class ProjectsService {
  async findAll(filters: { status?: string; page?: number; limit?: number }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.status) {
      where.status = filters.status;
    }

    const [data, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        include: {
          productOwner: { select: { id: true, name: true, email: true } },
          _count: { select: { tasks: true, members: true, risks: true, milestones: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.project.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        productOwner: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        tasks: { select: { id: true, title: true, status: true, module: true, assigneeId: true } },
        milestones: true,
        risks: true,
      },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async create(data: {
    name: string;
    description?: string;
    targetStartDate?: string;
    targetEndDate?: string;
    templateId?: string;
    budgetCents?: number;
  }, userId: string) {
    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        targetStartDate: data.targetStartDate ? new Date(data.targetStartDate) : undefined,
        targetEndDate: data.targetEndDate ? new Date(data.targetEndDate) : undefined,
        templateId: data.templateId,
        budgetCents: data.budgetCents,
        productOwnerId: userId,
        members: {
          create: {
            userId,
            role: 'PRODUCT_OWNER',
          },
        },
      },
      include: {
        productOwner: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });
    return project;
  }

  async update(id: string, data: any) {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');

    const updateData: any = { ...data };
    if (data.targetStartDate) updateData.targetStartDate = new Date(data.targetStartDate);
    if (data.targetEndDate) updateData.targetEndDate = new Date(data.targetEndDate);

    return prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        productOwner: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });
  }

  async getMembers(projectId: string) {
    const members = await prisma.projectMember.findMany({
      where: { projectId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    return members;
  }

  async addMember(projectId: string, data: {
    userId: string;
    role: string;
    isLoan?: boolean;
    allocationPct?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    return prisma.projectMember.create({
      data: {
        projectId,
        userId: data.userId,
        role: data.role as any,
        isLoan: data.isLoan ?? false,
        allocationPct: data.allocationPct ?? 100,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  async removeMember(projectId: string, memberId: string) {
    const member = await prisma.projectMember.findFirst({
      where: { id: memberId, projectId },
    });
    if (!member) throw new NotFoundException('Project member not found');

    return prisma.projectMember.delete({ where: { id: memberId } });
  }

  async getTimeline(projectId: string) {
    const milestones = await prisma.milestone.findMany({
      where: { projectId },
      orderBy: { dueDate: 'asc' },
    });
    return milestones;
  }

  async getRisks(projectId: string) {
    const risks = await prisma.risk.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
    return risks;
  }

  async getHealthScore(projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        _count: { select: { tasks: true, risks: true, milestones: true } },
        risks: { select: { severity: true, status: true } },
        milestones: { select: { completedAt: true } },
        tasks: { select: { status: true } },
      },
    });
    if (!project) throw new NotFoundException('Project not found');

    const totalRisks = project._count.risks;
    const openRisks = project.risks.filter((r) => r.status === 'OPEN').length;
    const riskScore = totalRisks === 0 ? 100 : ((totalRisks - openRisks) / totalRisks) * 100;

    const totalMilestones = project._count.milestones;
    const completedMilestones = project.milestones.filter((m) => m.completedAt).length;
    const milestoneScore = totalMilestones === 0 ? 100 : (completedMilestones / totalMilestones) * 100;

    const totalTasks = project._count.tasks;
    const doneStatuses = ['DONE', 'CPO_APPROVED', 'CTO_APPROVED', 'CBO_APPROVED', 'COO_APPROVED'];
    const completedTasks = project.tasks.filter((t) => doneStatuses.includes(t.status)).length;
    const taskScore = totalTasks === 0 ? 100 : (completedTasks / totalTasks) * 100;

    const score = Math.round(riskScore * 0.3 + milestoneScore * 0.3 + taskScore * 0.4);

    return {
      score,
      breakdown: {
        riskScore: Math.round(riskScore),
        milestoneScore: Math.round(milestoneScore),
        taskScore: Math.round(taskScore),
      },
      totals: {
        risks: totalRisks,
        openRisks,
        milestones: totalMilestones,
        completedMilestones,
        tasks: totalTasks,
        completedTasks,
      },
    };
  }
}
