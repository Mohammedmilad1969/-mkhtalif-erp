import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('activities')
@UseGuards(JwtAuthGuard)
@Permissions('leads:view')
export class ActivitiesController {
  constructor(private activitiesService: ActivitiesService) {}

  @Get()
  async findAll(@Query('leadId') leadId?: string) {
    return this.activitiesService.findAll(leadId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.activitiesService.findOne(id);
  }

  @Post()
  @Permissions('leads:create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: any) {
    return this.activitiesService.create(dto);
  }

  @Patch(':id')
  @Permissions('leads:edit')
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.activitiesService.update(id, dto);
  }

  @Delete(':id')
  @Permissions('leads:delete')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return this.activitiesService.remove(id);
  }
}
