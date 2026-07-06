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
import { ClientsService } from './clients.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('clients')
@UseGuards(JwtAuthGuard)
@Permissions('clients:view')
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('accountManagerId') accountManagerId?: string,
    @Query('search') search?: string,
  ) {
    return this.clientsService.findAll({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      status,
      accountManagerId,
      search,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.clientsService.findOne(id);
  }

  @Post()
  @Permissions('clients:create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: any) {
    return this.clientsService.create(dto);
  }

  @Patch(':id')
  @Permissions('clients:edit')
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.clientsService.update(id, dto);
  }

  @Get(':id/projects')
  async getProjects(@Param('id') id: string) {
    return this.clientsService.getProjects(id);
  }

  @Get(':id/invoices')
  async getInvoices(@Param('id') id: string) {
    return this.clientsService.getInvoices(id);
  }
}
