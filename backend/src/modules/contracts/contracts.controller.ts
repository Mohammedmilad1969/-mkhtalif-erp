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
import { ContractsService } from './contracts.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('contracts')
@UseGuards(JwtAuthGuard)
@Permissions('contracts:view')
export class ContractsController {
  constructor(private contractsService: ContractsService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('clientId') clientId?: string,
  ) {
    return this.contractsService.findAll({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      status,
      clientId,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.contractsService.findOne(id);
  }

  @Get(':id/pdf')
  async getPdf(@Param('id') id: string) {
    return this.contractsService.getPdf(id);
  }

  @Post()
  @Permissions('contracts:create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: any) {
    return this.contractsService.create(dto);
  }

  @Patch(':id')
  @Permissions('contracts:edit')
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.contractsService.update(id, dto);
  }

  @Post(':id/sign')
  @Permissions('contracts:edit')
  @HttpCode(HttpStatus.OK)
  async sign(@Param('id') id: string) {
    return this.contractsService.sign(id);
  }
}
