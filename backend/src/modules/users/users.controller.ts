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
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { PrismaService } from '../../config/prisma.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Permissions('users:view')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private prisma: PrismaService,
  ) {}

  @Get('roles')
  @Roles('su', 'ceo', 'hos', 'om', 'admin')
  @Permissions('users:view')
  async listRoles() {
    return this.prisma.role.findMany({ orderBy: { level: 'asc' } });
  }

  @Get('departments')
  @Roles('su', 'ceo', 'hos', 'om', 'admin')
  @Permissions('users:view')
  async listDepartments() {
    return this.prisma.department.findMany({ orderBy: { name: 'asc' } });
  }

  @Get()
  @Roles('su', 'ceo', 'hos', 'om', 'admin')
  @Permissions('users:view')
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('roleId') roleId?: string,
    @Query('departmentId') departmentId?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.usersService.findAll({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      search,
      roleId,
      departmentId,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    });
  }

  @Get('me/notifications')
  async getMyNotifications(@CurrentUser('id') userId: string) {
    return this.usersService.findNotifications(userId);
  }

  @Patch('me/notifications/:id/read')
  @Permissions('users:edit')
  @HttpCode(HttpStatus.OK)
  async markNotificationRead(@Param('id') id: string) {
    await this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    return { message: 'Notification marked as read' };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @Roles('su', 'ceo', 'admin')
  @Permissions('users:create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body(new ValidationPipe({ whitelist: false, forbidNonWhitelisted: false, transform: false })) dto: any) {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  @Permissions('users:edit')
  async update(@Param('id') id: string, @Body(new ValidationPipe({ whitelist: false, forbidNonWhitelisted: false, transform: false })) dto: any) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @Roles('su', 'ceo', 'admin')
  @Permissions('users:delete')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
