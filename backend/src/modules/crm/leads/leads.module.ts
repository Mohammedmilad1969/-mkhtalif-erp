import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { AutomationModule } from '../../automation/automation.module';
import { LeadsService } from './leads.service';
import { AiScoringService } from './ai-scoring.service';
import { LeadsController } from './leads.controller';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads'),
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
    AutomationModule,
  ],
  controllers: [LeadsController],
  providers: [LeadsService, AiScoringService],
  exports: [LeadsService],
})
export class LeadsModule {}
