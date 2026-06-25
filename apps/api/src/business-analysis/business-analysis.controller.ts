import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { BusinessAnalysisService } from './business-analysis.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TasksService } from '../tasks/tasks.service';

@Controller('business-analysis')
@UseGuards(JwtAuthGuard)
export class BusinessAnalysisController {
  constructor(
    private readonly businessAnalysisService: BusinessAnalysisService,
    private readonly tasksService: TasksService,
  ) {}

  @Get('tasks')
  async getTasks(
    @Query('status') status?: string,
    @Query('assigneeId') assigneeId?: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.businessAnalysisService.getTasks({ status, assigneeId, projectId });
  }

  @Patch('tasks/:id/transition')
  async transitionTask(
    @Param('id') id: string,
    @Body() body: { action: string },
    @Req() req: any,
  ) {
    return this.tasksService.transition(id, body.action, req.user.userId);
  }

  @Get('deliverables')
  async getDeliverables(@Query('projectId') projectId?: string) {
    return this.businessAnalysisService.getDeliverables(projectId);
  }

  @Post('deliverables')
  async createDeliverable(@Body() body: {
    title: string;
    type: string;
    fileUrl?: string;
    externalLink?: string;
    taskId: string;
    projectId: string;
  }) {
    return this.businessAnalysisService.createDeliverable(body);
  }
}
