import { Injectable } from '@nestjs/common';
import { prisma } from '@tektariq/db';

@Injectable()
export class CommentsService {
  async findByParent(parentType: string, parentId: string) {
    return prisma.comment.findMany({
      where: { parentType, parentId },
      include: { author: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(data: { parentType: string; parentId: string; authorId: string; body: string }) {
    const mentionedUserIds = this.extractMentions(data.body);
    return prisma.comment.create({
      data: { ...data, mentionedUserIds: mentionedUserIds.length > 0 ? JSON.stringify(mentionedUserIds) : undefined } as any,
      include: { author: { select: { id: true, name: true, email: true } } },
    });
  }

  private extractMentions(body: string): string[] {
    const matches = body.match(/@([a-zA-Z0-9._-]+)/g);
    return matches ? matches.map(m => m.slice(1)) : [];
  }
}
