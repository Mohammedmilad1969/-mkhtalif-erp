import { Controller, Get, Patch, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { CrmService } from './crm.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('crm')
@UseGuards(JwtAuthGuard)
export class CrmController {
  constructor(private crmService: CrmService) {}

  @Get('pipeline-stats')
  async getPipelineStats() {
    return this.crmService.getPipelineStats();
  }

  @Get('lead-stats')
  async getLeadStats() {
    return this.crmService.getLeadStats();
  }

  @Get('follow-up-matrix')
  async getFollowUpMatrix() {
    return this.crmService.getFollowUpMatrix();
  }

  @Get('follow-ups/:leadId')
  async getLeadFollowUps(@Param('leadId') leadId: string) {
    return this.crmService.getLeadFollowUps(leadId);
  }

  @Patch('follow-ups/:id')
  @Permissions('leads:edit')
  @HttpCode(HttpStatus.OK)
  async updateFollowUp(@Param('id') id: string, @Body('status') status: string) {
    return this.crmService.updateFollowUp(id, status);
  }
}
