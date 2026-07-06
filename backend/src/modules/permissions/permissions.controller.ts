import { Controller, Get, Post, Patch, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PermissionsController {
  constructor(private permissionsService: PermissionsService) {}

  @Get()
  @Roles('su', 'admin', 'ceo')
  async findAll() {
    return this.permissionsService.findAll();
  }

  @Get('grouped')
  @Roles('su', 'admin', 'ceo')
  async findAllGrouped() {
    return this.permissionsService.findAllGrouped();
  }

  @Get('roles')
  @Roles('su', 'admin', 'ceo')
  async getRoles() {
    return this.permissionsService.getRoles();
  }

  @Get('roles/:id')
  @Roles('su', 'admin', 'ceo')
  async getRolePermissions(@Param('id') id: string) {
    return this.permissionsService.getRolePermissions(id);
  }

  @Patch('roles/:id')
  @Roles('su', 'admin')
  @HttpCode(HttpStatus.OK)
  async updateRolePermissions(@Param('id') id: string, @Body() body: { permissionIds: string[] }) {
    return this.permissionsService.updateRolePermissions(id, body.permissionIds);
  }

  @Post('seed')
  @Roles('su', 'admin')
  @HttpCode(HttpStatus.OK)
  async seed() {
    return this.permissionsService.seed();
  }
}
