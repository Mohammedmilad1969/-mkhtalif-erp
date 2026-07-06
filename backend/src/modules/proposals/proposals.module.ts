import { Module } from '@nestjs/common';
import { AutomationModule } from '../automation/automation.module';
import { ProposalsService } from './proposals.service';
import { ProposalsController } from './proposals.controller';

@Module({
  imports: [AutomationModule],
  controllers: [ProposalsController],
  providers: [ProposalsService],
  exports: [ProposalsService],
})
export class ProposalsModule {}
