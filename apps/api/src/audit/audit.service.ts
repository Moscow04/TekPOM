import { Injectable } from '@nestjs/common';
import { prisma } from '@tektariq/db';

@Injectable()
export class AuditService {
  async log(params: { actorId: string; entityType: string; entityId: string; oldValue?: any; newValue?: any; ipAddress?: string }) {
    return prisma.auditLog.create({ data: params as any });
  }

  async findAll(filters: { entityType?: string; entityId?: string; actorId?: string; page?: number; limit?: number }) {
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
