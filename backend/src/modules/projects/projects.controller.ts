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
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('projects')
@UseGuards(JwtAuthGuard)
@Permissions('projects:view')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('clientId') clientId?: string,
    @Query('accountManagerId') accountManagerId?: string,
    @Query('search') search?: string,
  ) {
    return this.projectsService.findAll({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      status,
      clientId,
      accountManagerId,
      search,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Get(':id/tasks')
  async getTasks(@Param('id') id: string) {
    return this.projectsService.getTasks(id);
  }

  @Get(':id/sprints')
  async getSprints(@Param('id') id: string) {
    return this.projectsService.getSprints(id);
  }

  @Get(':id/report')
  async getReport(@Param('id') id: string) {
    return this.projectsService.getReport(id);
  }

  @Post()
  @Permissions('projects:create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: any) {
    return this.projectsService.create(dto);
  }

  @Patch(':id')
  @Permissions('projects:edit')
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.projectsService.update(id, dto);
  }
}
