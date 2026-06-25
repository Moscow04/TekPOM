import { Injectable } from '@nestjs/common';
import { prisma } from '@tektariq/db';

@Injectable()
export class AttachmentsService {
  async findByParent(parentType: string, parentId: string) {
    return prisma.attachment.findMany({ where: { parentType, parentId }, include: { uploader: { select: { id: true, name: true } } } });
  }

  async create(data: { parentType: string; parentId: string; fileUrl: string; fileType: string; uploadedById: string }) {
    return prisma.attachment.create({ data: data as any, include: { uploader: { select: { id: true, name: true } } } });
  }
}
