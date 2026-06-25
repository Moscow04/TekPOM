import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { defineAbilityFor } from '@tektariq/policy';
import { prisma } from '@tektariq/db';

@Injectable()
export class PoliciesGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) return false;

    const projectMembers = await prisma.projectMember.findMany({
      where: { userId: user.userId },
      select: { projectId: true, role: true },
    });

    request.ability = defineAbilityFor({
      id: user.userId,
      roles: user.roles,
      projectRoles: projectMembers.map((pm) => ({ projectId: pm.projectId, role: pm.role })),
    });

    return true;
  }
}
