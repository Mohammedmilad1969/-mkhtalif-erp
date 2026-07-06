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
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
@Permissions('tasks:view')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('projectId') projectId?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('status') status?: string,
    @Query('sprintId') sprintId?: string,
  ) {
    return this.tasksService.findAll({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      projectId,
      assignedTo,
      status,
      sprintId,
    });
  }

  @Post()
  @Permissions('tasks:create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: any) {
    return this.tasksService.create(dto);
  }

  @Post('batch')
  @Permissions('tasks:create')
  @HttpCode(HttpStatus.CREATED)
  async batchCreate(@Body('tasks') tasks: any[]) {
    return this.tasksService.batchCreate(tasks);
  }

  @Patch(':id')
  @Permissions('tasks:edit')
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.tasksService.update(id, dto);
  }

  @Patch(':id/status')
  @Permissions('tasks:edit')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.tasksService.updateStatus(id, status);
  }

  @Delete(':id')
  @Permissions('tasks:edit')
  async remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}
