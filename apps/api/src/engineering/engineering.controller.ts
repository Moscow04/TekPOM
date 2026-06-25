import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TasksService } from '../tasks/tasks.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('engineering')
@UseGuards(JwtAuthGuard)
export class EngineeringController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('tasks')
  findTasks(
    @Query('projectId') projectId?: string,
    @Query('discipline') discipline?: string,
    @Query('status') status?: string,
    @Query('assigneeId') assigneeId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.tasksService.findAll({
      projectId,
      module: 'ENGINEERING',
      discipline,
      status,
      assigneeId,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('tasks/:id')
  findTask(@Param('id') id: string) {
    return this.tasksService.findById(id);
  }

  @Patch('tasks/:id/transition')
  transition(
    @Param('id') id: string,
    @Body('action') action: string,
    @Req() req: any,
  ) {
    return this.tasksService.transition(id, action, req.user.userId);
  }

  @Get('board')
  async getBoard(
    @Query('projectId') projectId: string,
    @Query('discipline') discipline?: string,
  ) {
    const tasks = await this.tasksService.findAll({
      projectId,
      module: 'ENGINEERING',
      discipline,
    });

    const grouped: Record<string, any[]> = {};
    for (const task of tasks.items) {
      const status = task.status || 'UNKNOWN';
      if (!grouped[status]) grouped[status] = [];
      grouped[status].push(task);
    }

    return grouped;
  }
}
