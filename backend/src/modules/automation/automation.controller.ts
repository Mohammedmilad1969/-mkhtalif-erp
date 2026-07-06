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
import { AutomationService } from './automation.service';
import { UpdateAutomationDto } from './dto/update-automation.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('automations')
@UseGuards(JwtAuthGuard)
@Permissions('automation:view')
export class AutomationController {
  constructor(private automationService: AutomationService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('triggerType') triggerType?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.automationService.findAll({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      triggerType,
      isActive,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.automationService.findOne(id);
  }

  @Get(':id/logs')
  async getLogs(@Param('id') id: string) {
    return this.automationService.getLogs(id);
  }

  @Post()
  @Permissions('automation:manage')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: any) {
    return this.automationService.create(dto);
  }

  @Post(':id/test')
  @Permissions('automation:manage')
  @HttpCode(HttpStatus.OK)
  async test(@Param('id') id: string) {
    return this.automationService.test(id);
  }

  @Patch(':id')
  @Permissions('automation:manage')
  async update(@Param('id') id: string, @Body() dto: UpdateAutomationDto) {
    return this.automationService.update(id, dto);
  }

  @Delete(':id')
  @Permissions('automation:manage')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return this.automationService.remove(id);
  }
}
