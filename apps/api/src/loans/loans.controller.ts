import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { LoansService } from './loans.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('loans')
@UseGuards(JwtAuthGuard)
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post()
  async createRequest(@Body() body: { analystId: string; toProjectId: string; fromProjectId?: string; requestedBy: string }) {
    return this.loansService.createRequest(body.analystId, body.toProjectId, body.fromProjectId, body.requestedBy);
  }

  @Post(':id/approve')
  async approveRequest(@Param('id') id: string, @Body() body: { approvedBy: string }) {
    return this.loansService.approveRequest(id, body.approvedBy);
  }

  @Post(':id/reject')
  async rejectRequest(@Param('id') id: string) {
    return this.loansService.rejectRequest(id);
  }

  @Get()
  async getRequests(@Query('status') status?: string) {
    return this.loansService.getRequests({ status });
  }
}
