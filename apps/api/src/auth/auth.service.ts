import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { prisma } from '@tektariq/db';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { roles: { include: { role: true } } },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.passwordHash) {
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) throw new UnauthorizedException('Invalid credentials');
    }

    const roles = user.roles.map((ur) => ur.role.name);

    const payload = { sub: user.id, email: user.email, roles };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, name: user.name, roles },
    };
  }

  async refresh(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken);
      const user = await prisma.user.findUnique({
        where: { id: decoded.sub },
        include: { roles: { include: { role: true } } },
      });
      if (!user || !user.isActive) throw new UnauthorizedException();

      const roles = user.roles.map((ur) => ur.role.name);
      const payload = { sub: user.id, email: user.email, roles };
      return {
        accessToken: this.jwtService.sign(payload),
        refreshToken: this.jwtService.sign(payload, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }),
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: { include: { role: true } },
        projectMembers: true,
      },
    });
    if (!user) throw new UnauthorizedException();
    const { passwordHash, ...profile } = user;
    return {
      ...profile,
      roles: user.roles.map((ur) => ur.role.name),
    };
  }
}
