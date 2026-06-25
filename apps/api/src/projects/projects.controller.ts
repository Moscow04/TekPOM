import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards, Req } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { createProjectSchema, updateProjectSchema } from '@tektariq/shared';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.projectsService.findAll({
      status,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.projectsService.findById(id);
  }

  @Post()
  create(@Body() body: unknown, @Req() req: any) {
    return this.projectsService.create(createProjectSchema.parse(body), req.user.userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: unknown) {
    return this.projectsService.update(id, updateProjectSchema.parse(body));
  }

  @Get(':id/members')
  getMembers(@Param('id') id: string) {
    return this.projectsService.getMembers(id);
  }

  @Post(':id/members')
  addMember(@Param('id') id: string, @Body() body: any) {
    return this.projectsService.addMember(id, body);
  }

  @Delete(':id/members/:memberId')
  removeMember(@Param('id') id: string, @Param('memberId') memberId: string) {
    return this.projectsService.removeMember(id, memberId);
  }

  @Get(':id/timeline')
  getTimeline(@Param('id') id: string) {
    return this.projectsService.getTimeline(id);
  }

  @Get(':id/risks')
  getRisks(@Param('id') id: string) {
    return this.projectsService.getRisks(id);
  }

  @Get(':id/health')
  getHealthScore(@Param('id') id: string) {
    return this.projectsService.getHealthScore(id);
  }
}
