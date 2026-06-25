import { Module } from '@nestjs/common';
import { BrandController } from './brand.controller';
import { BrandService } from './brand.service';
import { AuthModule } from '../auth/auth.module';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [AuthModule, TasksModule],
  controllers: [BrandController],
  providers: [BrandService],
})
export class BrandModule {}
