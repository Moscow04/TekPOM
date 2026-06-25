import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { createTaskSchema } from '@tektariq/shared';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(
    @Query('projectId') projectId?: string,
    @Query('module') module?: string,
    @Query('status') status?: string,
    @Query('assigneeId') assigneeId?: string,
    @Query('discipline') discipline?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.tasksService.findAll({
      projectId,
      module,
      status,
      assigneeId,
      discipline,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.tasksService.findById(id);
  }

  @Post()
  create(@Body() data: any) {
    const parsed = createTaskSchema.parse(data);
    return this.tasksService.create(parsed);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.tasksService.update(id, data);
  }

  @Post(':id/transition')
  transition(
    @Param('id') id: string,
    @Body('action') action: string,
    @Req() req: any,
  ) {
    return this.tasksService.transition(id, action, req.user.userId);
  }

  @Post(':id/approve')
  addApproval(
    @Param('id') id: string,
    @Body('decision') decision: string,
    @Body('comment') comment: string,
    @Req() req: any,
  ) {
    return this.tasksService.addApproval(
      id,
      req.user.userId,
      'LEAD',
      decision,
      comment,
    );
  }

  @Get(':id/dependencies')
  getDependencies(@Param('id') id: string) {
    return this.tasksService.getDependencies(id);
  }

  @Post(':id/dependencies')
  addDependency(
    @Param('id') id: string,
    @Body('dependsOnTaskId') dependsOnTaskId: string,
    @Body('type') type: string,
  ) {
    return this.tasksService.addDependency(id, dependsOnTaskId, type);
  }
}
