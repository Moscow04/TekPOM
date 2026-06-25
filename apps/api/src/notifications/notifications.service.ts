import { Injectable } from '@nestjs/common';
import { prisma } from '@tektariq/db';

@Injectable()
export class NotificationsService {
  async create(data: { userId: string; type: string; payload?: any }) {
    return prisma.notification.create({ data: data as any });
  }

  async findAll(userId: string, options: { unreadOnly?: boolean; page?: number; limit?: number } = {}) {
    const where: any = { userId };
    if (options.unreadOnly) where.readAt = null;

    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.notification.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async markRead(id: string, userId: string) {
    return prisma.notification.updateMany({ where: { id, userId }, data: { readAt: new Date() } });
  }

  async markAllRead(userId: string) {
    return prisma.notification.updateMany({ where: { userId, readAt: null }, data: { readAt: new Date() } });
  }

  async getPreferences(userId: string) {
    return prisma.notificationPreference.findMany({ where: { userId } });
  }

  async upsertPreference(userId: string, data: { eventType: string; channel: string; enabled: boolean; quietHoursStart?: string; quietHoursEnd?: string }) {
    return prisma.notificationPreference.upsert({
      where: { userId_eventType_channel: { userId, eventType: data.eventType as any, channel: data.channel as any } },
      update: { enabled: data.enabled, quietHoursStart: data.quietHoursStart, quietHoursEnd: data.quietHoursEnd },
      create: { userId, eventType: data.eventType as any, channel: data.channel as any, enabled: data.enabled, quietHoursStart: data.quietHoursStart, quietHoursEnd: data.quietHoursEnd },
    });
  }
}
