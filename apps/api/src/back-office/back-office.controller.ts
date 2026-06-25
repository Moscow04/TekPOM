import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BackOfficeService } from './back-office.service';

@Controller('back-office')
@UseGuards(JwtAuthGuard)
export class BackOfficeController {
  constructor(private readonly backOfficeService: BackOfficeService) {}

  @Get('portfolio')
  getPortfolio() {
    return this.backOfficeService.getPortfolio();
  }

  @Get('portfolio/snapshots/:projectId')
  getPortfolioSnapshot(@Param('projectId') projectId: string) {
    return this.backOfficeService.getPortfolioSnapshot(projectId);
  }

  @Post('portfolio/compare')
  compareProjects(@Body() body: { projectIds: string[] }) {
    return this.backOfficeService.compareProjects(body.projectIds);
  }

  @Get('portfolio/launch-readiness/:projectId')
  getLaunchReadiness(@Param('projectId') projectId: string) {
    return this.backOfficeService.getLaunchReadiness(projectId);
  }

  @Get('audit-log')
  getAuditLog(@Query('entityType') entityType?: string, @Query('entityId') entityId?: string, @Query('actorId') actorId?: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.backOfficeService.getAuditLog({
      entityType,
      entityId,
      actorId,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }
}
