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
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('payments')
@UseGuards(JwtAuthGuard)
@Permissions('payments:view')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('invoiceId') invoiceId?: string,
  ) {
    return this.paymentsService.findAll({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      invoiceId,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Post()
  @Permissions('payments:create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: any) {
    return this.paymentsService.create(dto);
  }

  @Patch(':id')
  @Permissions('payments:edit')
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.paymentsService.update(id, dto);
  }
}
