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
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
@Permissions('invoices:view')
export class InvoicesController {
  constructor(private invoicesService: InvoicesService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('clientId') clientId?: string,
  ) {
    return this.invoicesService.findAll({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      status,
      clientId,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }

  @Post()
  @Permissions('invoices:create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: any) {
    return this.invoicesService.create(dto);
  }

  @Patch(':id')
  @Permissions('invoices:edit')
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.invoicesService.update(id, dto);
  }

  @Post(':id/send')
  @Permissions('invoices:edit')
  @HttpCode(HttpStatus.OK)
  async send(@Param('id') id: string) {
    return this.invoicesService.send(id);
  }

  @Post(':id/remind')
  @Permissions('invoices:edit')
  @HttpCode(HttpStatus.OK)
  async remind(@Param('id') id: string) {
    return this.invoicesService.remind(id);
  }
}
