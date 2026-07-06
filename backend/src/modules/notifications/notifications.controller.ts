import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  async findByUser(@CurrentUser('id') userId: string) {
    return this.notificationsService.findByUser(userId);
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.notificationsService.markAsRead(id, userId);
  }

  @Post()
  @Permissions('notifications:create')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: { userId: string; title: string; body?: string; type?: string; referenceType?: string; referenceId?: string },
  ) {
    return this.notificationsService.create(dto);
  }
}
