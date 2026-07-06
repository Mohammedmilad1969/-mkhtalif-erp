import {
  Controller, Get, Post, Body, UseGuards,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('stats')
  @Permissions('dashboard:view')
  async getStats() {
    return this.dashboardService.getStats();
  }

  @Get('manager')
  @Permissions('dashboard:manager')
  async getManagerDashboard() {
    return this.dashboardService.getManagerDashboard();
  }

  @Get('widgets')
  async getWidgets(@CurrentUser('id') userId: string) {
    return this.dashboardService.getWidgets(userId);
  }

  @Post('widgets')
  async saveWidgets(@CurrentUser('id') userId: string, @Body() dto: { widgets: any[] }) {
    return this.dashboardService.saveWidgets(userId, dto.widgets);
  }
}
