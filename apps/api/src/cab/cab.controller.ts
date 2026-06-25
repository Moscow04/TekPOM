import { Controller, Post, Get, Param, Body, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CabService } from './cab.service';

@Controller('cab')
@UseGuards(JwtAuthGuard)
export class CabController {
  constructor(private readonly cabService: CabService) {}

  @Post('change-requests')
  createChangeRequest(@Body() body: { projectId: string; title: string; description?: string; requestedByUserId: string; targetEndDate?: string; budgetDelta?: number; priority?: string; category?: string }) {
    return this.cabService.createChangeRequest(body);
  }

  @Get('change-requests')
  getChangeRequests(@Query('status') status?: string, @Query('projectId') projectId?: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.cabService.getChangeRequests({
      status,
      projectId,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('change-requests/:id')
  getChangeRequest(@Param('id') id: string) {
    return this.cabService.getChangeRequest(id);
  }

  @Post('meetings')
  createMeeting(@Body() body: { date: string; chairUserId: string; attendeeIds: string[] }) {
    return this.cabService.createMeeting(body);
  }

  @Get('meetings')
  getMeetings() {
    return this.cabService.getMeetings();
  }

  @Post('decisions/:decisionId/vote')
  castVote(@Param('decisionId') decisionId: string, @Body() body: { vote: string; meetingId: string }, @Query('voterId') voterId: string) {
    return this.cabService.castVote(decisionId, body.meetingId, voterId, body.vote);
  }

  @Post('decisions/publish')
  publishDecision(@Body() body: { changeRequestId: string; meetingId: string; outcome: string; conditionsStructured?: any; conditionsText?: string }) {
    return this.cabService.publishDecision(body);
  }

  @Get('decisions')
  getDecisions(@Query('changeRequestId') changeRequestId?: string, @Query('meetingId') meetingId?: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.cabService.getDecisions({
      changeRequestId,
      meetingId,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }
}
