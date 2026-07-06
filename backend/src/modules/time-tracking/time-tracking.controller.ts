import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { TimeTrackingService } from './time-tracking.service';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('time-entries')
@UseGuards(JwtAuthGuard)
@Permissions('time:view')
export class TimeTrackingController {
  constructor(private timeTrackingService: TimeTrackingService) {}

  @Post()
  @Permissions('time:create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateTimeEntryDto, @CurrentUser('id') userId: string) {
    return this.timeTrackingService.create({ ...dto, userId } as any);
  }

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('taskId') taskId?: string,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('billable') billable?: string,
  ) {
    return this.timeTrackingService.findAll({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      taskId,
      userId,
      startDate,
      endDate,
      billable,
    });
  }

  @Get('totals')
  async getTotals(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('userId') userId?: string,
  ) {
    return this.timeTrackingService.getTotals({ startDate, endDate, userId });
  }

  @Get('user/:userId/summary')
  async getUserSummary(
    @Param('userId') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.timeTrackingService.getUserSummary(userId, startDate, endDate);
  }

  @Patch(':id')
  @Permissions('time:edit')
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.timeTrackingService.update(id, dto);
  }

  @Delete(':id')
  @Permissions('time:delete')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return this.timeTrackingService.delete(id);
  }
}
