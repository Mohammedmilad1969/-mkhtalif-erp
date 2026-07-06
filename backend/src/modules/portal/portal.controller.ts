import {
  Controller, Get, Post, Body, Param, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { PortalService } from './portal.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller()
export class PortalController {
  constructor(private service: PortalService) {}

  @Post('portal/generate-token')
  @UseGuards(JwtAuthGuard)
  async generateToken(@Body('clientId') clientId: string, @Body('email') email: string) {
    return this.service.generateToken(clientId, email);
  }

  @Post('portal/validate')
  async validateToken(@Body('token') token: string) {
    return this.service.validateToken(token);
  }

  @Get('portal/client/:clientId/dashboard')
  @UseGuards(JwtAuthGuard)
  async getClientDashboard(@Param('clientId') clientId: string) {
    return this.service.getClientDashboard(clientId);
  }

  @Post('portal/revoke')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async revokeToken(@Body('token') token: string) {
    return this.service.revokeToken(token);
  }
}
