import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard)
@Permissions('audit:view')
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('userId') userId?: string,
    @Query('entity') entity?: string,
    @Query('entityId') entityId?: string,
    @Query('action') action?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.auditService.findAll({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      userId,
      entity,
      entityId,
      action,
      startDate,
      endDate,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.auditService.findOne(id);
  }
}
