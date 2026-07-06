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
} from '@nestjs/common';
import { DeliverablesService } from './deliverables.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('deliverables')
@UseGuards(JwtAuthGuard)
@Permissions('deliverables:view')
export class DeliverablesController {
  constructor(private deliverablesService: DeliverablesService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('projectId') projectId?: string,
    @Query('status') status?: string,
    @Query('ownerId') ownerId?: string,
  ) {
    return this.deliverablesService.findAll({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      projectId,
      status,
      ownerId,
    });
  }

  @Post()
  @Permissions('deliverables:create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: any) {
    return this.deliverablesService.create(dto);
  }

  @Patch(':id')
  @Permissions('deliverables:edit')
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.deliverablesService.update(id, dto);
  }

  @Post(':id/submit')
  @Permissions('deliverables:edit')
  @HttpCode(HttpStatus.OK)
  async submitForReview(@Param('id') id: string) {
    return this.deliverablesService.submitForReview(id);
  }

  @Get(':id/file')
  async getFile(@Param('id') id: string) {
    return this.deliverablesService.getSignedFileUrl(id);
  }

  @Delete(':id')
  @Permissions('deliverables:edit')
  async remove(@Param('id') id: string) {
    return this.deliverablesService.remove(id);
  }
}
