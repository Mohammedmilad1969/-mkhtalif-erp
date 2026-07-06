import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './config/prisma.module';
import { PrismaService } from './config/prisma.service';
import { S3Module } from './config/s3.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CrmModule } from './modules/crm/crm.module';
import { ClientsModule } from './modules/clients/clients.module';
import { MeetingsModule } from './modules/meetings/meetings.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { SprintsModule } from './modules/sprints/sprints.module';
import { DeliverablesModule } from './modules/deliverables/deliverables.module';
import { ApprovalsModule } from './modules/approvals/approvals.module';
import { UploadModule } from './modules/upload/upload.module';
import { ProposalsModule } from './modules/proposals/proposals.module';
import { ContractsModule } from './modules/contracts/contracts.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { KpisModule } from './modules/kpis/kpis.module';
import { KnowledgeModule } from './modules/knowledge/knowledge.module';
import { SystemHelpModule } from './modules/system-help/system-help.module';
import { AutomationModule } from './modules/automation/automation.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { TimeTrackingModule } from './modules/time-tracking/time-tracking.module';
import { AuditModule } from './modules/audit/audit.module';
import { StrategyModule } from './modules/strategy/strategy.module';
import { SearchModule } from './modules/search/search.module';
import { ReportsModule } from './modules/reports/reports.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { CommunicationsModule } from './modules/communications/communications.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { PortalModule } from './modules/portal/portal.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { PermissionsGuard } from './common/guards/permissions.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: { index: false },
    }),
    PrismaModule,
    S3Module,
    AuthModule,
    UsersModule,
    CrmModule,
    ClientsModule,
    MeetingsModule,
    ProjectsModule,
    TasksModule,
    SprintsModule,
    DeliverablesModule,
    ApprovalsModule,
    UploadModule,
    ProposalsModule,
    ContractsModule,
    InvoicesModule,
    PaymentsModule,
    CampaignsModule,
    KpisModule,
    KnowledgeModule,
    SystemHelpModule,
    AutomationModule,
    TemplatesModule,
    TimeTrackingModule,
    AuditModule,
    StrategyModule,
    SearchModule,
    ReportsModule,
    NotificationsModule,
    DashboardModule,
    CommunicationsModule,
    CalendarModule,
    PortalModule,
    PermissionsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule {}
