import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard)
@Permissions('reports:view')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('sales')
  async getSalesReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getSalesReport(startDate, endDate);
  }

  @Get('production')
  async getProductionReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getProductionReport(startDate, endDate);
  }

  @Get('finance')
  async getFinanceReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getFinanceReport(startDate, endDate);
  }

  @Get('executive')
  async getExecutiveReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getExecutiveReport(startDate, endDate);
  }

  @Get('profitability')
  async getProfitabilityReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getProfitabilityReport(startDate, endDate);
  }

  @Get('time')
  async getTimeReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getTimeReport(startDate, endDate);
  }

  @Get('client/:clientId')
  async getClientReport(
    @Param('clientId') clientId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getClientReport(clientId, startDate, endDate);
  }
}
