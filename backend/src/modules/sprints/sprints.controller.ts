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
import { SprintsService } from './sprints.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('sprints')
@UseGuards(JwtAuthGuard)
export class SprintsController {
  constructor(private sprintsService: SprintsService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('projectId') projectId?: string,
    @Query('status') status?: string,
  ) {
    return this.sprintsService.findAll({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      projectId,
      status,
    });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: any) {
    return this.sprintsService.create(dto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.sprintsService.update(id, dto);
  }

  @Patch(':id/start')
  @HttpCode(HttpStatus.OK)
  async start(@Param('id') id: string) {
    return this.sprintsService.start(id);
  }

  @Patch(':id/complete')
  @HttpCode(HttpStatus.OK)
  async complete(@Param('id') id: string) {
    return this.sprintsService.complete(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.sprintsService.remove(id);
  }
}
