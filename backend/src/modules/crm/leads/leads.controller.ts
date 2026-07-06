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
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { LeadsService } from './leads.service';
import { AiScoringService } from './ai-scoring.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { ScoreLeadDto } from './dto/score-lead.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('leads')
@UseGuards(JwtAuthGuard)
@Permissions('leads:view')
export class LeadsController {
  constructor(
    private leadsService: LeadsService,
    private aiScoringService: AiScoringService,
  ) {}

  @Get('stats')
  async getLeadsStats() {
    return this.leadsService.getLeadsStats();
  }

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('source') source?: string,
    @Query('stageId') stageId?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('temperature') temperature?: string,
    @Query('search') search?: string,
  ) {
    return this.leadsService.findAll({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      status,
      source,
      stageId,
      assignedTo,
      temperature,
      search,
    });
  }

  @Get('all-tasks')
  async getAllTasks(
    @Query('assigneeId') assigneeId?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.leadsService.getAllTasks({ assigneeId, status, search });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  @Post()
  @Permissions('leads:create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateLeadDto) {
    return this.leadsService.create(dto);
  }

  @Patch(':id')
  @Permissions('leads:edit')
  async update(@Param('id') id: string, @Body() dto: UpdateLeadDto) {
    return this.leadsService.update(id, dto);
  }

  @Delete(':id')
  @Permissions('leads:delete')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return this.leadsService.remove(id);
  }

  @Delete(':id/permanent')
  @Permissions('leads:delete')
  @HttpCode(HttpStatus.OK)
  async permanentDelete(@Param('id') id: string) {
    return this.leadsService.permanentDelete(id);
  }

  @Post(':id/score')
  @HttpCode(HttpStatus.OK)
  async scoreLead(
    @Param('id') id: string,
    @Body() dto: ScoreLeadDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.leadsService.scoreLead(id, dto, userId);
  }

  @Patch(':id/assign')
  @Permissions('leads:edit')
  @HttpCode(HttpStatus.OK)
  async assignLead(@Param('id') id: string, @Body('userId') userId: string, @CurrentUser('id') currentUserId: string) {
    return this.leadsService.assignLead(id, userId, currentUserId);
  }

  @Patch(':id/stage')
  @Permissions('leads:edit')
  @HttpCode(HttpStatus.OK)
  async changeStage(
    @Param('id') id: string,
    @Body('stageId') stageId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.leadsService.changeStage(id, stageId, userId);
  }

  @Post(':id/activities')
  @HttpCode(HttpStatus.CREATED)
  async createActivity(
    @Param('id') id: string,
    @Body() dto: any,
    @CurrentUser('id') userId: string,
  ) {
    return this.leadsService.createActivity(id, dto, userId);
  }

  @Post(':id/qualification')
  @HttpCode(HttpStatus.OK)
  async saveQualification(
    @Param('id') id: string,
    @Body() dto: any,
    @CurrentUser('id') userId: string,
  ) {
    return this.leadsService.saveQualification(id, dto, userId);
  }

  @Get(':id/qualification')
  async getQualification(@Param('id') id: string) {
    return this.leadsService.getQualification(id);
  }

  @Post(':id/tasks')
  @HttpCode(HttpStatus.CREATED)
  async createTask(
    @Param('id') id: string,
    @Body() dto: any,
    @CurrentUser('id') userId: string,
  ) {
    return this.leadsService.createTask(id, dto, userId);
  }

  @Get(':id/tasks')
  async getTasks(@Param('id') id: string) {
    return this.leadsService.getTasks(id);
  }

  @Patch('tasks/:taskId')
  async updateTask(
    @Param('taskId') taskId: string,
    @Body() dto: any,
    @CurrentUser('id') userId: string,
  ) {
    return this.leadsService.updateTask(taskId, { ...dto, updatedBy: userId });
  }

  @Delete('tasks/:taskId')
  @HttpCode(HttpStatus.OK)
  async deleteTask(@Param('taskId') taskId: string) {
    return this.leadsService.deleteTask(taskId);
  }

  @Patch('tasks/:taskId/archive')
  @HttpCode(HttpStatus.OK)
  async archiveTask(@Param('taskId') taskId: string) {
    return this.leadsService.archiveTask(taskId);
  }

  @Post('tasks/merge-chains')
  @Permissions('leads:edit')
  @HttpCode(HttpStatus.OK)
  async mergeTaskChains(@Body() dto: { taskIds: string[] }) {
    return this.leadsService.mergeTaskChains(dto.taskIds);
  }

  @Post(':id/attachments')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadAttachments(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser('id') userId: string,
  ) {
    return this.leadsService.addAttachments(id, files, userId);
  }

  @Get(':id/attachments')
  async getAttachments(@Param('id') id: string) {
    return this.leadsService.getAttachments(id);
  }

  @Delete('attachments/:attachmentId')
  @HttpCode(HttpStatus.OK)
  async deleteAttachment(@Param('attachmentId') attachmentId: string) {
    return this.leadsService.deleteAttachment(attachmentId);
  }

  @Get(':id/timeline')
  async getTimeline(@Param('id') id: string) {
    return this.leadsService.getTimeline(id);
  }

  @Post('bulk/assign')
  @Permissions('leads:edit')
  @HttpCode(HttpStatus.OK)
  async bulkAssign(@Body() dto: { ids: string[]; userId: string }, @CurrentUser('id') currentUserId: string) {
    return this.leadsService.bulkAssign(dto.ids, dto.userId, currentUserId);
  }

  @Post('bulk/stage')
  @Permissions('leads:edit')
  @HttpCode(HttpStatus.OK)
  async bulkChangeStage(@Body() dto: { ids: string[]; stageId: string }, @CurrentUser('id') userId: string) {
    return this.leadsService.bulkChangeStage(dto.ids, dto.stageId, userId);
  }

  @Post('bulk/delete')
  @Permissions('leads:delete')
  @HttpCode(HttpStatus.OK)
  async bulkDelete(@Body() dto: { ids: string[] }) {
    return this.leadsService.bulkDelete(dto.ids);
  }

  @Get('duplicates/check')
  async checkDuplicates(
    @Query('email') email?: string,
    @Query('phone') phone?: string,
    @Query('company') company?: string,
  ) {
    return this.leadsService.checkDuplicates({ email, phone, company });
  }

  @Post(':id/ai-score')
  @HttpCode(HttpStatus.OK)
  async aiScore(@Param('id') id: string) {
    return this.aiScoringService.scoreLead(id);
  }
}
