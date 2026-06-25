import { Controller, Get, Post, Query, Body, UseGuards, Req } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { createCommentSchema } from '@tektariq/shared';

@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  findByParent(@Query('parentType') parentType: string, @Query('parentId') parentId: string) {
    return this.commentsService.findByParent(parentType, parentId);
  }

  @Post()
  create(@Req() req: any, @Body() body: unknown) {
    const data = createCommentSchema.parse(body);
    return this.commentsService.create({ ...data, authorId: req.user.userId });
  }
}
