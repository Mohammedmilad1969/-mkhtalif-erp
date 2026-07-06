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
import { KnowledgeService } from './knowledge.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('knowledge')
@UseGuards(JwtAuthGuard)
@Permissions('knowledge:view')
export class KnowledgeController {
  constructor(private knowledgeService: KnowledgeService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('departmentId') departmentId?: string,
    @Query('articleType') articleType?: string,
    @Query('status') status?: string,
  ) {
    return this.knowledgeService.findAll({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      departmentId,
      articleType,
      status,
    });
  }

  @Get('search')
  async search(
    @Query('q') q: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.knowledgeService.search(
      q,
      page ? parseInt(page) : undefined,
      limit ? parseInt(limit) : undefined,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.knowledgeService.findOne(id);
  }

  @Post()
  @Permissions('knowledge:create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: any) {
    return this.knowledgeService.create(dto);
  }

  @Patch(':id')
  @Permissions('knowledge:edit')
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.knowledgeService.update(id, dto);
  }
}
