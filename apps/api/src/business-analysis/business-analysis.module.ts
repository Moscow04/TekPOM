import { Module } from '@nestjs/common';
import { BusinessAnalysisController } from './business-analysis.controller';
import { BusinessAnalysisService } from './business-analysis.service';
import { AuthModule } from '../auth/auth.module';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [AuthModule, TasksModule],
  controllers: [BusinessAnalysisController],
  providers: [BusinessAnalysisService],
})
export class BusinessAnalysisModule {}
