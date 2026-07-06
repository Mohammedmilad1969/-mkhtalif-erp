import { Module } from '@nestjs/common';
import { SystemHelpController } from './system-help.controller';
import { SystemHelpService } from './system-help.service';

@Module({
  controllers: [SystemHelpController],
  providers: [SystemHelpService],
  exports: [SystemHelpService],
})
export class SystemHelpModule {}
