import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@tektariq/db';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: Prisma) {}

  async findAll(filters: {
    projectId?: string;
    module?: string;
    status?: string;
    assigneeId?: string;
    discipline?: string;
    page?: number;
    limit?: number;
  }) {
    const { projectId, module, status, assigneeId, discipline, page = 1, limit = 10 } = filters;
    const where: any = {};

    if (projectId) where.projectId = projectId;
    if (module) where.module = module;
    if (status) where.status = status;
    if (assigneeId) where.assigneeId = assigneeId;
    if (discipline) where.discipline = discipline;

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take: limit,
        include: { assignee: true, project: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.task.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        assignee: true,
        project: true,
        approvals: true,
        assignments: true,
        comments: { include: { author: true } },
        dependencies: { include: { dependsOn: true } },
        dependents: { include: { task: true } },
      },
    });

    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async create(data: any) {
    return this.prisma.task.create({
      data: {
        ...data,
        status: data.module === 'ENGINEERING' ? 'BACKLOG' : 'DRAFT',
      },
    });
  }

  async update(id: string, data: any) {
    const task = await this.findById(id);
    return this.prisma.task.update({ where: { id }, data });
  }

  async transition(id: string, action: string, userId: string) {
    const task = await this.findById(id);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const roles = user.roles || [];
    const transitions = this.getTransitions(task.module);

    const valid = transitions.find(
      (t) => t.action === action && t.from === task.status,
    );

    if (!valid) {
      throw new BadRequestException(
        `Invalid transition: cannot '${action}' from status '${task.status}' for module '${task.module}'`,
      );
    }

    if (valid.check && !valid.check(roles, task)) {
      throw new BadRequestException('Not authorized for this transition');
    }

    const updated = await this.prisma.task.update({
      where: { id },
      data: { status: valid.to },
    });

    if (valid.approvalLevel) {
      await this.addApproval(id, userId, valid.approvalLevel, 'APPROVED', action);
    }

    return updated;
  }

  private getTransitions(module: string) {
    if (module === 'PRODUCT') {
      return [
        { action: 'assign', from: 'DRAFT', to: 'ASSIGNED', check: (roles: string[]) => roles.includes('PRODUCT_MANAGER') || roles.includes('PRODUCT_OWNER') },
        { action: 'start', from: 'ASSIGNED', to: 'IN_PROGRESS', check: (_roles: string[], task: any) => task.assigneeId === '' },
        { action: 'submit', from: 'IN_PROGRESS', to: 'SUBMITTED_FOR_REVIEW', check: (_roles: string[], task: any) => task.assigneeId === '' },
        { action: 'lead-approve', from: 'SUBMITTED_FOR_REVIEW', to: 'LEAD_APPROVED', approvalLevel: 'LEAD' },
        { action: 'lead-reject', from: 'SUBMITTED_FOR_REVIEW', to: 'REJECTED' },
        { action: 'lead-rework', from: 'SUBMITTED_FOR_REVIEW', to: 'REWORK' },
        { action: 'cpo-approve', from: 'LEAD_APPROVED', to: 'CPO_APPROVED', approvalLevel: 'CPO' },
        { action: 'cpo-reject', from: 'LEAD_APPROVED', to: 'REJECTED' },
        { action: 'complete', from: 'CPO_APPROVED', to: 'DONE' },
        { action: 'acknowledge', from: 'REJECTED', to: 'REWORK' },
        { action: 'resume', from: 'REWORK', to: 'IN_PROGRESS' },
      ];
    }

    if (module === 'ENGINEERING') {
      return [
        { action: 'assign', from: 'BACKLOG', to: 'ASSIGNED' },
        { action: 'start', from: 'ASSIGNED', to: 'IN_PROGRESS' },
        { action: 'submit', from: 'IN_PROGRESS', to: 'READY_FOR_REVIEW' },
        { action: 'lead-approve', from: 'READY_FOR_REVIEW', to: 'LEAD_APPROVED', approvalLevel: 'LEAD' },
        { action: 'lead-rework', from: 'READY_FOR_REVIEW', to: 'REWORK_REQUESTED' },
        { action: 'cto-approve', from: 'LEAD_APPROVED', to: 'CTO_APPROVED', approvalLevel: 'CTO' },
        { action: 'cto-reject', from: 'LEAD_APPROVED', to: 'REWORK_REQUESTED' },
        { action: 'complete', from: 'CTO_APPROVED', to: 'DONE' },
        { action: 'file-bug', from: 'DONE', to: 'REOPENED' },
        { action: 'resume', from: 'REOPENED', to: 'IN_PROGRESS' },
      ];
    }

    return [];
  }

  async addApproval(
    taskId: string,
    approverId: string,
    level: string,
    decision: string,
    comment?: string,
  ) {
    return this.prisma.taskApproval.create({
      data: { taskId, approverId, level, decision, comment },
    });
  }

  async getDependencies(taskId: string) {
    return this.prisma.taskDependency.findMany({
      where: { taskId },
      include: { dependsOn: true },
    });
  }

  async addDependency(taskId: string, dependsOnTaskId: string, type: string) {
    return this.prisma.taskDependency.create({
      data: { taskId, dependsOnTaskId, type },
    });
  }
}
