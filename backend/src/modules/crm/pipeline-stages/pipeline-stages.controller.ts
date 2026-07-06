import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PipelineStagesService } from './pipeline-stages.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('pipeline-stages')
@UseGuards(JwtAuthGuard)
@Permissions('leads:view')
export class PipelineStagesController {
  constructor(private pipelineStagesService: PipelineStagesService) {}

  @Get()
  async findAll() {
    return this.pipelineStagesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.pipelineStagesService.findOne(id);
  }

  @Post()
  @Permissions('leads:create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: any) {
    return this.pipelineStagesService.create(dto);
  }

  @Patch(':id')
  @Permissions('leads:edit')
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.pipelineStagesService.update(id, dto);
  }

  @Delete(':id')
  @Permissions('leads:delete')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return this.pipelineStagesService.remove(id);
  }

  @Patch('reorder')
  @Permissions('leads:edit')
  @HttpCode(HttpStatus.OK)
  async reorder(@Body('stages') stages: { id: string; stageOrder: number }[]) {
    return this.pipelineStagesService.reorder(stages);
  }
}
