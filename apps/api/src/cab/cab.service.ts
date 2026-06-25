import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { prisma } from '@tektariq/db';

@Injectable()
export class CabService {
  async createChangeRequest(data: { projectId: string; title: string; description?: string; requestedByUserId: string; targetEndDate?: string; budgetDelta?: number; priority?: string; category?: string }) {
    return prisma.changeRequest.create({
      data: {
        projectId: data.projectId,
        title: data.title,
        description: data.description,
        requestedByUserId: data.requestedByUserId,
        status: 'OPEN',
        targetEndDate: data.targetEndDate ? new Date(data.targetEndDate) : undefined,
        budgetDelta: data.budgetDelta,
        priority: data.priority || 'MEDIUM',
        category: data.category || 'SCOPE',
      },
    });
  }

  async getChangeRequests(filters: { status?: string; projectId?: string; page?: number; limit?: number }) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.projectId) where.projectId = filters.projectId;

    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.changeRequest.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.changeRequest.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getChangeRequest(id: string) {
    const cr = await prisma.changeRequest.findUnique({
      where: { id },
      include: { decisions: true },
    });
    if (!cr) throw new NotFoundException(`ChangeRequest ${id} not found`);
    return cr;
  }

  async createMeeting(data: { date: string; chairUserId: string; attendeeIds: string[] }) {
    return prisma.cABMeeting.create({
      data: {
        date: new Date(data.date),
        chairUserId: data.chairUserId,
        attendeeIds: data.attendeeIds,
      },
    });
  }

  async getMeetings() {
    return prisma.cABMeeting.findMany({ orderBy: { date: 'desc' } });
  }

  async castVote(decisionId: string, meetingId: string, voterId: string, vote: string) {
    const existing = await prisma.cABVote.findFirst({
      where: { decisionId, voterId },
    });
    if (existing) throw new BadRequestException('Voter has already cast a vote for this decision');

    return prisma.cABVote.create({
      data: { decisionId, meetingId, voterId, vote },
    });
  }

  async publishDecision(data: {
    changeRequestId: string;
    meetingId: string;
    outcome: string;
    conditionsStructured?: any;
    conditionsText?: string;
  }) {
    const cr = await prisma.changeRequest.findUnique({ where: { id: data.changeRequestId } });
    if (!cr) throw new NotFoundException(`ChangeRequest ${data.changeRequestId} not found`);

    const decision = await prisma.cABDecision.create({
      data: {
        changeRequestId: data.changeRequestId,
        meetingId: data.meetingId,
        outcome: data.outcome,
        conditionsStructured: data.conditionsStructured,
        conditionsText: data.conditionsText,
        publishedAt: new Date(),
      },
    });

    const updateData: any = { status: data.outcome === 'APPROVED' ? 'APPROVED' : 'DECIDED' };

    if (data.outcome === 'APPROVED') {
      if (cr.targetEndDate) {
        updateData.targetEndDate = cr.targetEndDate;
        await prisma.project.update({ where: { id: cr.projectId }, data: { targetEndDate: cr.targetEndDate } });
      }
      if (cr.budgetDelta) {
        const project = await prisma.project.findUnique({ where: { id: cr.projectId } });
        if (project) {
          await prisma.project.update({ where: { id: cr.projectId }, data: { budgetCents: project.budgetCents + cr.budgetDelta } });
        }
      }
    }

    if (data.outcome === 'APPROVED_WITH_CONDITIONS' && data.conditionsStructured) {
      const conds = data.conditionsStructured;
      if (conds.targetEndDate) {
        await prisma.project.update({ where: { id: cr.projectId }, data: { targetEndDate: new Date(conds.targetEndDate) } });
      }
      if (conds.budgetDelta) {
        const project = await prisma.project.findUnique({ where: { id: cr.projectId } });
        if (project) {
          await prisma.project.update({ where: { id: cr.projectId }, data: { budgetCents: project.budgetCents + conds.budgetDelta } });
        }
      }
      if (conds.scopeChange) {
        await prisma.risk.create({
          data: { projectId: cr.projectId, title: conds.scopeChange, type: 'cab-condition', status: 'OPEN' },
        });
      }
    }

    await prisma.changeRequest.update({ where: { id: data.changeRequestId }, data: updateData });

    return decision;
  }

  async getDecisions(filters: { changeRequestId?: string; meetingId?: string; page?: number; limit?: number }) {
    const where: any = {};
    if (filters.changeRequestId) where.changeRequestId = filters.changeRequestId;
    if (filters.meetingId) where.meetingId = filters.meetingId;

    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.cABDecision.findMany({ where, orderBy: { publishedAt: 'desc' }, skip, take: limit }),
      prisma.cABDecision.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
