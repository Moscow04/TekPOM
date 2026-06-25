import { Module } from '@nestjs/common';
import { EngineeringController } from './engineering.controller';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [TasksModule],
  controllers: [EngineeringController],
})
export class EngineeringModule {}
