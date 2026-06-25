import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@tektariq/db';

@Injectable()
export class LoansService {
  constructor(private readonly prisma: Prisma) {}

  async createRequest(analystId: string, toProjectId: string, fromProjectId: string | undefined, requestedBy: string) {
    return this.prisma.loanRequest.create({
      data: {
        analystId,
        toProjectId,
        fromProjectId,
        requestedBy,
        status: 'PENDING',
      },
    });
  }

  async approveRequest(id: string, approvedBy: string) {
    const loan = await this.prisma.loanRequest.findUnique({ where: { id } });
    if (!loan) throw new NotFoundException('Loan request not found');
    if (loan.status !== 'PENDING') throw new BadRequestException('Loan request is not in PENDING status');

    const userRoles = await this.prisma.userRole.findMany({
      where: { userId: loan.analystId },
      include: { role: true },
    });

    const roleName = userRoles.length > 0 ? userRoles[0].role.name : 'BUSINESS_ANALYST';

    await this.prisma.projectMember.create({
      data: {
        projectId: loan.toProjectId,
        userId: loan.analystId,
        role: roleName,
        isLoan: true,
      },
    });

    return this.prisma.loanRequest.update({
      where: { id },
      data: { status: 'APPROVED', approvedBy },
    });
  }

  async rejectRequest(id: string) {
    const loan = await this.prisma.loanRequest.findUnique({ where: { id } });
    if (!loan) throw new NotFoundException('Loan request not found');
    if (loan.status !== 'PENDING') throw new BadRequestException('Loan request is not in PENDING status');

    return this.prisma.loanRequest.update({
      where: { id },
      data: { status: 'REJECTED' },
    });
  }

  async getRequests(filters: { status?: string }) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    return this.prisma.loanRequest.findMany({ where, orderBy: { createdAt: 'desc' } });
  }
}
