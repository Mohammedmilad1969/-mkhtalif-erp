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
import { ProposalsService } from './proposals.service';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('proposals')
@UseGuards(JwtAuthGuard)
@Permissions('proposals:view')
export class ProposalsController {
  constructor(private proposalsService: ProposalsService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('clientId') clientId?: string,
    @Query('ownerId') ownerId?: string,
  ) {
    return this.proposalsService.findAll({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      status,
      clientId,
      ownerId,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.proposalsService.findOne(id);
  }

  @Post()
  @Permissions('proposals:create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateProposalDto) {
    return this.proposalsService.create(dto);
  }

  @Patch(':id')
  @Permissions('proposals:edit')
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.proposalsService.update(id, dto);
  }

  @Post(':id/send')
  @Permissions('proposals:edit')
  @HttpCode(HttpStatus.OK)
  async send(@Param('id') id: string) {
    return this.proposalsService.send(id);
  }

  @Post(':id/approve')
  @Permissions('proposals:edit')
  @HttpCode(HttpStatus.OK)
  async approve(@Param('id') id: string) {
    return this.proposalsService.approve(id);
  }

  @Post(':id/reject')
  @Permissions('proposals:edit')
  @HttpCode(HttpStatus.OK)
  async reject(@Param('id') id: string, @Body('reason') reason: string) {
    return this.proposalsService.reject(id, reason);
  }
}
