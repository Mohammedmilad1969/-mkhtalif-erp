import {
  Controller, Get, Post, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { CommunicationsService } from './communications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('communications')
@UseGuards(JwtAuthGuard)
export class CommunicationsController {
  constructor(private service: CommunicationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: any, @CurrentUser('id') userId: string) {
    return this.service.create(dto, userId);
  }

  @Get()
  async findAll(
    @Query('leadId') leadId?: string,
    @Query('clientId') clientId?: string,
    @Query('channel') channel?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.findAll({
      leadId, clientId, channel,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get('lead/:leadId')
  async findByLead(@Param('leadId') leadId: string) {
    return this.service.findByLead(leadId);
  }

  @Get('client/:clientId')
  async findByClient(@Param('clientId') clientId: string) {
    return this.service.findByClient(clientId);
  }
}
