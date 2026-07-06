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
import { KpisService } from './kpis.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
@Permissions('kpis:view')
export class KpisController {
  constructor(private kpisService: KpisService) {}

  @Get('kpis')
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('departmentId') departmentId?: string,
    @Query('category') category?: string,
    @Query('dashboardId') dashboardId?: string,
  ) {
    return this.kpisService.findAll({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      departmentId,
      category,
      dashboardId,
    });
  }

  @Post('kpis')
  @Permissions('kpis:create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: any) {
    return this.kpisService.create(dto);
  }

  @Patch('kpis/:id')
  @Permissions('kpis:edit')
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.kpisService.update(id, dto);
  }

  @Get('kpis/:id')
  async findOne(@Param('id') id: string) {
    return this.kpisService.findOne(id);
  }

  @Get('kpis/:id/values')
  async getValues(
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.kpisService.getValues(id, startDate, endDate);
  }

  @Post('kpis/:id/values')
  @Permissions('kpis:create')
  @HttpCode(HttpStatus.CREATED)
  async addValue(@Param('id') id: string, @Body() dto: any) {
    return this.kpisService.addValue(id, dto);
  }

  @Get('dashboards')
  async findAllDashboards() {
    return this.kpisService.findAllDashboards();
  }

  @Post('dashboards')
  @Permissions('kpis:create')
  @HttpCode(HttpStatus.CREATED)
  async createDashboard(@Body() dto: any) {
    return this.kpisService.createDashboard(dto);
  }

  @Get('dashboards/:id')
  async findOneDashboard(@Param('id') id: string) {
    return this.kpisService.findOneDashboard(id);
  }
}
