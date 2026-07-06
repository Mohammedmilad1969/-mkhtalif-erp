import { Module } from '@nestjs/common';
import { CrmService } from './crm.service';
import { CrmController } from './crm.controller';
import { LeadsModule } from './leads/leads.module';
import { PipelineStagesModule } from './pipeline-stages/pipeline-stages.module';
import { ActivitiesModule } from './activities/activities.module';

@Module({
  imports: [LeadsModule, PipelineStagesModule, ActivitiesModule],
  controllers: [CrmController],
  providers: [CrmService],
  exports: [CrmService],
})
export class CrmModule {}
