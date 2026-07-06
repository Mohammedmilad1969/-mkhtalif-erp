import { Module, Global } from '@nestjs/common';
import { AutomationService } from './automation.service';
import { AutomationController } from './automation.controller';
import { AutomationEngineService } from './automation-engine.service';

@Module({
  controllers: [AutomationController],
  providers: [AutomationService, AutomationEngineService],
  exports: [AutomationService, AutomationEngineService],
})
export class AutomationModule {}
