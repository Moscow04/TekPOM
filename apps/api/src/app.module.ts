import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CabModule } from './cab/cab.module';
import { BackOfficeModule } from './back-office/back-office.module';
import { AuditModule } from './audit/audit.module';
import { BrandModule } from './brand/brand.module';
import { EngineeringModule } from './engineering/engineering.module';
import { BusinessAnalysisModule } from './business-analysis/business-analysis.module';
import { CommentsModule } from './comments/comments.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { LoansModule } from './loans/loans.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    AuthModule,
    UsersModule,
    ProjectsModule,
    TasksModule,
    NotificationsModule,
    CabModule,
    BackOfficeModule,
    AuditModule,
    BrandModule,
    EngineeringModule,
    BusinessAnalysisModule,
    CommentsModule,
    AttachmentsModule,
    LoansModule,
  ],
})
export class AppModule {}
