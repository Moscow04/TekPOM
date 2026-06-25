import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { prisma } from '@tektariq/db';

@Injectable()
export class UsersService {
  async findAll(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        include: { roles: { include: { role: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        roles: { include: { role: true } },
        projectMembers: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(data: { email: string; name: string; password?: string; roleNames: string[] }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = data.password ? await bcrypt.hash(data.password, 10) : undefined;

    const roles = await prisma.role.findMany({
      where: { name: { in: data.roleNames } as any },
    });

    return prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash,
        roles: {
          create: roles.map((r) => ({ roleId: r.id })),
        },
      },
      include: { roles: { include: { role: true } } },
    });
  }

  async update(id: string, data: { email?: string; name?: string; isActive?: boolean }) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    return prisma.user.update({
      where: { id },
      data,
      include: { roles: { include: { role: true } } },
    });
  }

  async deactivate(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    return prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
