import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@tektariq/db';
import { TasksService } from '../tasks/tasks.service';

@Injectable()
export class BrandService {
  constructor(
    private readonly prisma: Prisma,
    private readonly tasksService: TasksService,
  ) {}

  async getTasks(filters: { status?: string; assigneeId?: string; projectId?: string }) {
    return this.tasksService.findAll({ ...filters, module: 'BRAND' });
  }

  async getAssets(filters: { search?: string; type?: string; isFinal?: string }) {
    const where: any = {};

    if (filters.search) {
      where.title = { contains: filters.search, mode: 'insensitive' };
    }
    if (filters.type) {
      where.type = filters.type;
    }
    if (filters.isFinal !== undefined) {
      where.isFinal = filters.isFinal === 'true';
    }

    return this.prisma.asset.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async createAsset(data: { taskId?: string; projectId?: string; title: string; type: string; fileUrl?: string }) {
    return this.prisma.asset.create({
      data: {
        title: data.title,
        type: data.type,
        taskId: data.taskId,
        projectId: data.projectId,
        fileUrl: data.fileUrl,
      },
    });
  }

  async markAssetFinal(assetId: string, approvedBy: string) {
    const asset = await this.prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) throw new NotFoundException('Asset not found');

    return this.prisma.asset.update({
      where: { id: assetId },
      data: { isFinal: true, approvedBy },
    });
  }
}
