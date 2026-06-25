import { Controller, Get, Post, Query, Body, UseGuards, Req } from '@nestjs/common';
import { AttachmentsService } from './attachments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('attachments')
@UseGuards(JwtAuthGuard)
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Get()
  findByParent(@Query('parentType') parentType: string, @Query('parentId') parentId: string) {
    return this.attachmentsService.findByParent(parentType, parentId);
  }

  @Post()
  create(@Req() req: any, @Body() body: { parentType: string; parentId: string; fileUrl: string; fileType: string }) {
    return this.attachmentsService.create({ ...body, uploadedById: req.user.userId });
  }
}
