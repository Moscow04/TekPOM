import { Injectable } from '@nestjs/common';
import { Prisma } from '@tektariq/db';
import { TasksService } from '../tasks/tasks.service';

@Injectable()
export class BusinessAnalysisService {
  constructor(
    private readonly prisma: Prisma,
    private readonly tasksService: TasksService,
  ) {}

  async getTasks(filters: { status?: string; assigneeId?: string; projectId?: string }) {
    return this.tasksService.findAll({ ...filters, module: 'BUSINESS_ANALYSIS' });
  }

  async getDeliverables(projectId?: string) {
    const where: any = {};
    if (projectId) where.projectId = projectId;
    return this.prisma.deliverable.findMany({ where, orderBy: { id: 'asc' } });
  }

  async createDeliverable(data: {
    title: string;
    type: string;
    fileUrl?: string;
    externalLink?: string;
    taskId: string;
    projectId: string;
  }) {
    return this.prisma.deliverable.create({ data });
  }
}
