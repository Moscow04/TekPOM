import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { BrandService } from './brand.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TasksService } from '../tasks/tasks.service';

@Controller('brand')
@UseGuards(JwtAuthGuard)
export class BrandController {
  constructor(
    private readonly brandService: BrandService,
    private readonly tasksService: TasksService,
  ) {}

  @Get('tasks')
  async getTasks(
    @Query('status') status?: string,
    @Query('assigneeId') assigneeId?: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.brandService.getTasks({ status, assigneeId, projectId });
  }

  @Patch('tasks/:id/transition')
  async transitionTask(
    @Param('id') id: string,
    @Body() body: { action: string },
    @Req() req: any,
  ) {
    return this.tasksService.transition(id, body.action, req.user.userId);
  }

  @Get('assets')
  async getAssets(
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('isFinal') isFinal?: string,
  ) {
    return this.brandService.getAssets({ search, type, isFinal });
  }

  @Post('assets')
  async createAsset(@Body() body: { taskId?: string; projectId?: string; title: string; type: string; fileUrl?: string }) {
    return this.brandService.createAsset(body);
  }

  @Patch('assets/:id/final')
  async markAssetFinal(@Param('id') id: string, @Body() body: { approvedBy: string }) {
    return this.brandService.markAssetFinal(id, body.approvedBy);
  }
}
