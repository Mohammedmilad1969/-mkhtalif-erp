import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('campaigns')
@UseGuards(JwtAuthGuard)
@Permissions('campaigns:view')
export class CampaignsController {
  constructor(private campaignsService: CampaignsService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('projectId') projectId?: string,
    @Query('status') status?: string,
  ) {
    return this.campaignsService.findAll({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      projectId,
      status,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.campaignsService.findOne(id);
  }

  @Get(':id/metrics')
  async getMetrics(@Param('id') id: string) {
    return this.campaignsService.getMetrics(id);
  }

  @Post()
  @Permissions('campaigns:create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: any) {
    return this.campaignsService.create(dto);
  }

  @Post(':id/metrics')
  @Permissions('campaigns:create')
  @HttpCode(HttpStatus.CREATED)
  async addMetric(@Param('id') id: string, @Body() dto: any) {
    return this.campaignsService.addMetric(id, dto);
  }

  @Patch(':id')
  @Permissions('campaigns:edit')
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.campaignsService.update(id, dto);
  }

  @Patch(':id/launch')
  @Permissions('campaigns:edit')
  @HttpCode(HttpStatus.OK)
  async launch(@Param('id') id: string) {
    return this.campaignsService.launch(id);
  }

  @Patch(':id/pause')
  @Permissions('campaigns:edit')
  @HttpCode(HttpStatus.OK)
  async pause(@Param('id') id: string) {
    return this.campaignsService.pause(id);
  }
}
