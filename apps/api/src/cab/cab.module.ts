import { Module } from '@nestjs/common';
import { CabController } from './cab.controller';
import { CabService } from './cab.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [CabController],
  providers: [CabService],
})
export class CabModule {}
