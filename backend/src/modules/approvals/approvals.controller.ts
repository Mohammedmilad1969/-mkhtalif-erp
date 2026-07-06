import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApprovalsService } from './approvals.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('approvals')
@UseGuards(JwtAuthGuard)
export class ApprovalsController {
  constructor(private approvalsService: ApprovalsService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('approverId') approverId?: string,
  ) {
    return this.approvalsService.findAll({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      status,
      approverId,
    });
  }

  @Get('pending')
  async getPending(@CurrentUser('id') userId: string) {
    return this.approvalsService.getPending(userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: any) {
    return this.approvalsService.create(dto);
  }

  @Patch(':id/approve')
  @HttpCode(HttpStatus.OK)
  async approve(
    @Param('id') id: string,
    @Body('comments') comments?: string,
  ) {
    return this.approvalsService.approve(id, comments);
  }

  @Patch(':id/reject')
  @HttpCode(HttpStatus.OK)
  async reject(
    @Param('id') id: string,
    @Body('comments') comments?: string,
  ) {
    return this.approvalsService.reject(id, comments);
  }
}
