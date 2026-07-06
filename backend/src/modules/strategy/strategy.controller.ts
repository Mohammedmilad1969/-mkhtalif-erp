import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { StrategyService } from './strategy.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('strategy')
@UseGuards(JwtAuthGuard)
@Permissions('strategy:view')
export class StrategyController {
  constructor(private strategyService: StrategyService) {}

  @Get('reports')
  async getReports(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('projectId') projectId?: string,
    @Query('status') status?: string,
  ) {
    return this.strategyService.getReports({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      projectId,
      status,
    });
  }

  @Post('reports')
  @Permissions('strategy:create')
  @HttpCode(HttpStatus.CREATED)
  async createReport(@Body() dto: any, @CurrentUser('id') userId: string) {
    return this.strategyService.createReport({ ...dto, createdById: userId });
  }

  @Get('reports/:id')
  async getReport(@Param('id') id: string) {
    return this.strategyService.getReport(id);
  }

  @Patch('reports/:id')
  @Permissions('strategy:edit')
  async updateReport(@Param('id') id: string, @Body() dto: any) {
    return this.strategyService.updateReport(id, dto);
  }

  @Delete('reports/:id')
  @Permissions('strategy:delete')
  @HttpCode(HttpStatus.OK)
  async deleteReport(@Param('id') id: string) {
    return this.strategyService.deleteReport(id);
  }

  @Get('blueprints')
  async getBlueprints(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('projectId') projectId?: string,
    @Query('status') status?: string,
  ) {
    return this.strategyService.getBlueprints({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      projectId,
      status,
    });
  }

  @Post('blueprints')
  @Permissions('strategy:create')
  @HttpCode(HttpStatus.CREATED)
  async createBlueprint(@Body() dto: any, @CurrentUser('id') userId: string) {
    return this.strategyService.createBlueprint({ ...dto, createdById: userId });
  }

  @Get('blueprints/:id')
  async getBlueprint(@Param('id') id: string) {
    return this.strategyService.getBlueprint(id);
  }

  @Patch('blueprints/:id')
  @Permissions('strategy:edit')
  async updateBlueprint(@Param('id') id: string, @Body() dto: any) {
    return this.strategyService.updateBlueprint(id, dto);
  }

  @Post('blueprints/:id/approve')
  @Permissions('strategy:edit')
  async approveBlueprint(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.strategyService.approveBlueprint(id, userId);
  }

  @Delete('blueprints/:id')
  @Permissions('strategy:delete')
  @HttpCode(HttpStatus.OK)
  async deleteBlueprint(@Param('id') id: string) {
    return this.strategyService.deleteBlueprint(id);
  }

  @Get('briefs')
  async getBriefs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('projectId') projectId?: string,
    @Query('status') status?: string,
  ) {
    return this.strategyService.getBriefs({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      projectId,
      status,
    });
  }

  @Post('briefs')
  @Permissions('strategy:create')
  @HttpCode(HttpStatus.CREATED)
  async createBrief(@Body() dto: any, @CurrentUser('id') userId: string) {
    return this.strategyService.createBrief({ ...dto, createdById: userId });
  }

  @Get('briefs/:id')
  async getBrief(@Param('id') id: string) {
    return this.strategyService.getBrief(id);
  }

  @Patch('briefs/:id')
  @Permissions('strategy:edit')
  async updateBrief(@Param('id') id: string, @Body() dto: any) {
    return this.strategyService.updateBrief(id, dto);
  }

  @Post('briefs/:id/approve')
  @Permissions('strategy:edit')
  async approveBrief(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.strategyService.approveBrief(id, userId);
  }

  @Delete('briefs/:id')
  @Permissions('strategy:delete')
  @HttpCode(HttpStatus.OK)
  async deleteBrief(@Param('id') id: string) {
    return this.strategyService.deleteBrief(id);
  }
}
