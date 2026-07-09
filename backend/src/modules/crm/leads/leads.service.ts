import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../config/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { AutomationEngineService } from '../../automation/automation-engine.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { ScoreLeadDto } from './dto/score-lead.dto';

@Injectable()
export class LeadsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private automationEngine: AutomationEngineService,
  ) {}

  async create(dto: CreateLeadDto) {
    const defaultStage = await this.prisma.pipelineStage.findFirst({
      where: { code: 'new_lead' },
      orderBy: { stageOrder: 'asc' },
    });

    const scores = [
      parseInt(dto.requestType || dto.serviceType || '0'),
      parseInt(dto.clarityLevel || '0'),
      parseInt(dto.budgetLevel || '0'),
      parseInt(dto.opportunitySize || '0'),
    ];
    const totalScore = scores.reduce((a, b) => a + b, 0);
    let temperature: string;
    if (totalScore >= 8) temperature = 'hot';
    else if (totalScore >= 5) temperature = 'warm';
    else temperature = 'cold';

    let clientId: string | undefined;
    if (dto.clientName) {
      const existing = await this.prisma.client.findFirst({
        where: {
          OR: [
            { name: dto.clientName },
            ...(dto.phone ? [{ phone: dto.phone }] : []),
          ],
        },
      });
      if (existing) {
        clientId = existing.id;
      } else {
        const client = await this.prisma.client.create({
          data: {
            name: dto.clientName,
            company: dto.company,
            phone: dto.phone,
            status: 'active',
          },
        });
        clientId = client.id;
      }
    }

    const leadData: any = {
      clientName: dto.clientName || 'Unnamed Lead',
      source: dto.source || 'other',
      leadScore: totalScore > 0 ? totalScore : null,
      leadTemperature: totalScore > 0 ? (temperature as any) : null,
      stage: defaultStage?.id ? { connect: { id: defaultStage.id } } : undefined,
      client: clientId ? { connect: { id: clientId } } : undefined,
    };
    if (dto.company) leadData.company = dto.company;
    if (dto.email) leadData.email = dto.email;
    if (dto.phone) leadData.phone = dto.phone;
    if (dto.serviceType) leadData.serviceType = dto.serviceType;
    if (dto.clarityLevel) leadData.clarityLevel = dto.clarityLevel;
    if (dto.budgetLevel) leadData.budgetLevel = dto.budgetLevel;
    if (dto.opportunitySize) leadData.opportunitySize = dto.opportunitySize;
    if (dto.sopId) leadData.sop = { connect: { id: dto.sopId } };
    if (dto.assignedTo) leadData.assignee = { connect: { id: dto.assignedTo } };

    const lead = await this.prisma.lead.create({
      data: leadData,
      include: { stage: true, assignee: true },
    });

    this.automationEngine.fire({
      triggerType: 'lead_created',
      entityType: 'lead',
      entityId: lead.id,
      entity: lead as any,
      userId: dto.assignedTo || undefined,
    });

    if (totalScore > 0) {
      this.automationEngine.fire({
        triggerType: 'lead_scored',
        entityType: 'lead',
        entityId: lead.id,
        entity: lead as any,
        userId: dto.assignedTo || undefined,
        changes: { totalScore, temperature },
      });
    }

    return lead;
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    status?: string;
    source?: string;
    stageId?: string;
    assignedTo?: string;
    temperature?: string;
    search?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) where.status = query.status;
    else where.status = { not: 'archived' };
    if (query.source) where.source = query.source;
    if (query.stageId) where.stageId = query.stageId;
    if (query.assignedTo) where.assignedTo = query.assignedTo;
    if (query.temperature) where.leadTemperature = query.temperature;
    if (query.search) {
      where.OR = [
        { clientName: { contains: query.search, mode: 'insensitive' } },
        { company: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        skip,
        take: limit,
        include: { stage: true, assignee: true, _count: { select: { activities: true, meetings: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.lead.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        stage: true,
        assignee: true,
        activities: { include: { user: true }, orderBy: { createdAt: 'desc' } },
        meetings: true,
        leadScores: { include: { scorer: true }, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  async update(id: string, dto: any) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException('Lead not found');

    const data: any = {};
    for (const [key, value] of Object.entries(dto)) {
      if (value === '' || value === undefined) continue;
      if (key === 'nextActionDate' || key === 'followUpDate') data[key] = new Date(value as string);
      else data[key] = value;
    }
    if (data.followUpDate && !data.followUpStatus) {
      data.followUpStatus = 'pending';
    }

    return this.prisma.lead.update({
      where: { id },
      data,
      include: { stage: true, assignee: true },
    });
  }

  async remove(id: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException('Lead not found');

    return this.prisma.lead.update({
      where: { id },
      data: { status: 'archived' },
    });
  }

  async scoreLead(id: string, dto: ScoreLeadDto, userId?: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException('Lead not found');

    const totalScore =
      dto.serviceTypeScore + dto.clarityScore + dto.budgetScore + dto.opportunityScore;

    let temperature: string;
    if (totalScore >= 8) temperature = 'hot';
    else if (totalScore >= 5) temperature = 'warm';
    else temperature = 'cold';

    await this.prisma.leadScore.create({
      data: {
        leadId: id,
        serviceTypeScore: dto.serviceTypeScore,
        clarityScore: dto.clarityScore,
        budgetScore: dto.budgetScore,
        opportunityScore: dto.opportunityScore,
        totalScore,
        scoredBy: userId,
      },
    });

    await this.auditService.log('lead_scored', 'lead', id, userId, undefined, {
      serviceTypeScore: dto.serviceTypeScore,
      clarityScore: dto.clarityScore,
      budgetScore: dto.budgetScore,
      opportunityScore: dto.opportunityScore,
      totalScore,
      temperature,
    });

    const updated = await this.prisma.lead.update({
      where: { id },
      data: {
        leadScore: totalScore,
        leadTemperature: temperature as any,
        serviceType: String(dto.serviceTypeScore),
        clarityLevel: String(dto.clarityScore),
        budgetLevel: String(dto.budgetScore),
        opportunitySize: String(dto.opportunityScore),
      },
      include: { stage: true, assignee: true },
    });

    this.automationEngine.fire({
      triggerType: 'lead_scored',
      entityType: 'lead',
      entityId: id,
      entity: updated as any,
      userId,
      changes: { totalScore, temperature },
    });

    return updated;
  }

  async assignLead(id: string, userId: string, currentUserId?: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException('Lead not found');

    const updated = await this.prisma.lead.update({
      where: { id },
      data: { assignedTo: userId },
      include: { assignee: true },
    });

    await this.auditService.log('lead_assigned', 'lead', id, currentUserId, { previousAssignee: lead.assignedTo }, { newAssignee: userId });

    return updated;
  }

  async changeStage(id: string, stageId: string, userId?: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: { stage: true },
    });
    if (!lead) throw new NotFoundException('Lead not found');

    const targetStage = await this.prisma.pipelineStage.findUnique({
      where: { id: stageId },
    });
    if (!targetStage) throw new NotFoundException('Pipeline stage not found');

    const currentCode = (lead.stage as any)?.code || '';
    const targetCode = targetStage.code;

    if (targetCode === 'proposal_sent' && currentCode !== 'proposal_sent') {
      const now = new Date();
      const chainId = crypto.randomUUID();
      const intervals = [24, 48, 72];
      await this.prisma.leadFollowUp.createMany({
        data: intervals.map((hours, i) => ({
          leadId: id,
          title: 'Call client',
          dueDate: new Date(now.getTime() + hours * 60 * 60 * 1000),
          status: 'active',
          chainOrder: i + 1,
          chainId,
        })),
      });
    }

    const updated = await this.prisma.lead.update({
      where: { id },
      data: { stageId },
      include: { stage: true },
    });

    if (userId) {
      await this.prisma.activity.create({
        data: {
          leadId: id,
          userId,
          actionType: 'stage_change',
          description: `Stage changed from ${currentCode || 'none'} to ${targetCode}`,
          metadata: { fromStage: currentCode, toStage: targetCode },
        },
      });
    }

    await this.auditService.log('stage_changed', 'lead', id, userId, { from: currentCode }, { to: targetCode });

    this.automationEngine.fire({
      triggerType: 'stage_changed',
      entityType: 'lead',
      entityId: id,
      entity: updated as any,
      userId,
      changes: { fromStage: currentCode, toStage: targetCode },
    });

    return updated;
  }

  async createActivity(id: string, dto: any, userId?: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException('Lead not found');

    return this.prisma.activity.create({
      data: {
        leadId: id,
        userId,
        actionType: dto.actionType,
        description: dto.description,
        outcome: dto.outcome,
        nextStep: dto.nextStep,
        metadata: dto.metadata,
      },
      include: { user: true },
    });
  }

  async saveQualification(id: string, dto: any, userId: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException('Lead not found');

    const qualification = await this.prisma.leadQualification.upsert({
      where: { leadId: id },
      update: {
        serviceRequested: dto.serviceRequested,
        businessGoal: dto.businessGoal,
        budget: dto.budget,
        urgency: dto.urgency,
        previousAgency: dto.previousAgency,
        expectedTimeline: dto.expectedTimeline,
        decisionMaker: dto.decisionMaker,
        additionalNotes: dto.additionalNotes,
        qualifiedById: userId,
      },
      create: {
        leadId: id,
        serviceRequested: dto.serviceRequested,
        businessGoal: dto.businessGoal,
        budget: dto.budget,
        urgency: dto.urgency,
        previousAgency: dto.previousAgency,
        expectedTimeline: dto.expectedTimeline,
        decisionMaker: dto.decisionMaker,
        additionalNotes: dto.additionalNotes,
        qualifiedById: userId,
      },
    });

    const { totalScore, temperature } = await this.autoScoreFromQualification(id, qualification);

    await this.prisma.activity.create({
      data: {
        leadId: id,
        userId,
        actionType: 'qualification',
        description: 'Lead qualification completed',
        metadata: { qualificationId: qualification.id },
      },
    });

    // Auto-assign to current user if lead has no assignee
    if (!lead.assignedTo) {
      await this.prisma.lead.update({
        where: { id },
        data: { assignedTo: userId },
      });
      await this.prisma.activity.create({
        data: {
          leadId: id,
          userId,
          actionType: 'assignment',
          description: 'Lead auto-assigned',
          metadata: { assignedTo: userId },
        },
      });
    }

    // Auto-create follow-up task based on score
    const task = await this.autoCreateFollowUpTask(id, totalScore, qualification, userId);
    if (task) {
      await this.prisma.activity.create({
        data: {
          leadId: id,
          userId,
          actionType: 'task_created',
          description: `Task auto-created: ${task.title}`,
          metadata: { taskId: task.id, taskType: task.taskType },
        },
      });
    }

    // Create notification for assignee
    const assigneeId = lead.assignedTo || userId;
    await this.prisma.notification.create({
      data: {
        userId: assigneeId,
        title: 'Lead Qualification Complete',
        body: `Lead "${lead.clientName}" scored ${totalScore}/10 (${temperature})`,
        type: 'lead_qualified',
        referenceType: 'lead',
        referenceId: id,
      },
    });

    await this.auditService.log('qualification_saved', 'lead', id, userId, undefined, {
      totalScore,
      temperature,
      qualificationId: qualification.id,
    });

    this.automationEngine.fire({
      triggerType: 'lead_qualified',
      entityType: 'lead',
      entityId: id,
      entity: { ...(lead as any), leadScore: totalScore, leadTemperature: temperature },
      userId,
      changes: { totalScore, temperature },
    });

    this.automationEngine.fire({
      triggerType: 'lead_scored',
      entityType: 'lead',
      entityId: id,
      entity: { ...(lead as any), leadScore: totalScore, leadTemperature: temperature },
      userId,
      changes: { totalScore, temperature },
    });

    return qualification;
  }

  private async autoScoreFromQualification(leadId: string, qualification: any): Promise<{ totalScore: number; temperature: string }> {
    const serviceScoreMap: Record<string, number> = { full_service: 3, social_content: 2, video_design: 1, other: 0 };
    const budgetMap: Record<string, number> = { low: 0, medium: 1, high: 2 };
    const urgencyMap: Record<string, number> = { not_urgent: 0, next_quarter: 1, this_month: 2, immediate: 3 };
    const timelineMap: Record<string, number> = { '6_plus': 0, '3_6_months': 1, '2_3_months': 2, '1_month': 3 };

    let clarityScore = 0;

    const serviceTypeScore = serviceScoreMap[qualification.serviceRequested] ?? 0;

    const budgetScore = budgetMap[qualification.budget] ?? 0;
    const opportunityScore = budgetScore;

    const urgencyScore = urgencyMap[qualification.urgency] ?? 0;
    clarityScore = urgencyScore;

    const timelineScore = timelineMap[qualification.expectedTimeline] ?? 0;
    clarityScore = Math.max(clarityScore, timelineScore);

    if (qualification.decisionMaker === 'yes') {
      clarityScore = Math.min(clarityScore + 1, 3);
    }

    const totalScore = serviceTypeScore + clarityScore + budgetScore + opportunityScore;

    let temperature: string;
    if (totalScore >= 8) temperature = 'hot';
    else if (totalScore >= 5) temperature = 'warm';
    else temperature = 'cold';

    await this.prisma.leadScore.create({
      data: {
        leadId,
        serviceTypeScore,
        clarityScore,
        budgetScore,
        opportunityScore,
        totalScore,
        scoredBy: qualification.qualifiedById,
      },
    });

    await this.prisma.lead.update({
      where: { id: leadId },
      data: {
        leadScore: totalScore,
        leadTemperature: temperature as any,
        serviceType: String(serviceTypeScore),
        clarityLevel: String(clarityScore),
        budgetLevel: String(budgetScore),
        opportunitySize: String(opportunityScore),
        stageId: totalScore >= 5
          ? (await this.prisma.pipelineStage.findFirst({ where: { code: 'qualified' } }))?.id
          : undefined,
      },
    });

    return { totalScore, temperature };
  }

  async getQualification(id: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException('Lead not found');
    return this.prisma.leadQualification.findUnique({
      where: { leadId: id },
    });
  }

  async getAllTasks(query: { assigneeId?: string; status?: string; search?: string }) {
    const where: any = {};
    if (query.assigneeId) where.assignedTo = query.assigneeId;
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { lead: { clientName: { contains: query.search, mode: 'insensitive' } } },
        { lead: { company: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const tasks = await this.prisma.leadTask.findMany({
      where,
      include: {
        assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
        lead: { select: { id: true, clientName: true, company: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = tasks.map((t) => ({
      ...t,
      assignee: t.assignee ? { ...t.assignee, name: `${t.assignee.firstName} ${t.assignee.lastName}` } : null,
    }));

    return { data };
  }

  async createTask(id: string, dto: any, userId: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException('Lead not found');

    const task = await this.prisma.leadTask.create({
      data: {
        leadId: id,
        title: dto.title,
        description: dto.description,
        taskType: dto.taskType,
        priority: dto.priority || 'medium',
        assignedTo: dto.assignedTo,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        reminderAt: dto.reminderAt ? new Date(dto.reminderAt) : undefined,
      },
      include: { assignee: true },
    });

    if (dto.assignedTo) {
      await this.prisma.notification.create({
        data: {
          userId: dto.assignedTo,
          title: 'New Task Assigned',
          body: `Task: ${dto.title}`,
          type: 'task_assigned',
          referenceType: 'lead_task',
          referenceId: task.id,
        },
      });
    }

    await this.prisma.activity.create({
      data: {
        leadId: id,
        userId,
        actionType: 'task_created',
        description: `Task created: ${dto.title}`,
        metadata: { taskId: task.id },
      },
    });

    await this.auditService.log('task_created', 'lead_task', task.id, userId, undefined, {
      leadId: id,
      title: dto.title,
      taskType: dto.taskType,
      priority: dto.priority,
    });

    return task;
  }

  async getTasks(id: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException('Lead not found');
    return this.prisma.leadTask.findMany({
      where: { leadId: id },
      include: { assignee: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateTask(taskId: string, dto: any) {
    const task = await this.prisma.leadTask.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');

    const data: any = {};
    if (dto.status) {
      data.status = dto.status;
      if (dto.status === 'completed') data.completedAt = new Date();
    }
    if (dto.title) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.priority) data.priority = dto.priority;
    if (dto.assignedTo) data.assignedTo = dto.assignedTo;
    if (dto.dueDate) data.dueDate = new Date(dto.dueDate);
    if (dto.reminderAt) data.reminderAt = new Date(dto.reminderAt);
    if (dto.checklist !== undefined) data.checklist = dto.checklist;

    const updated = await this.prisma.leadTask.update({
      where: { id: taskId },
      data,
      include: { assignee: true },
    });

    if (dto.status === 'completed') {
      await this.maybeCreateNextChecklistTask(task.leadId);
      this.automationEngine.fire({
        triggerType: 'task_completed',
        entityType: 'lead_task',
        entityId: taskId,
        entity: { ...(updated as any), leadId: task.leadId },
        changes: { status: 'completed' },
      });
      if (task.chainId && task.chainOrder && task.chainTotal && task.chainOrder < task.chainTotal) {
        this.automationEngine.continueChain({
          id: taskId,
          chainId: task.chainId,
          chainOrder: task.chainOrder,
          chainTotal: task.chainTotal,
          chainBlueprint: task.chainBlueprint,
          leadId: task.leadId,
        }, dto.updatedBy || undefined);
      }
    }

    return updated;
  }

  async deleteTask(taskId: string) {
    const task = await this.prisma.leadTask.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');
    await this.prisma.leadTask.delete({ where: { id: taskId } });
    return { message: 'Task deleted' };
  }

  async archiveTask(taskId: string) {
    const task = await this.prisma.leadTask.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');
    await this.prisma.leadTask.update({
      where: { id: taskId },
      data: { status: 'cancelled' },
    });
    return { message: 'Task archived' };
  }

  async mergeTaskChains(taskIds: string[]) {
    if (!taskIds || taskIds.length < 2) {
      throw new BadRequestException('At least 2 tasks are required to merge');
    }

    const tasks = await this.prisma.leadTask.findMany({
      where: { id: { in: taskIds } },
    });

    if (tasks.length !== taskIds.length) {
      throw new NotFoundException('One or more tasks not found');
    }

    const leadIds = new Set(tasks.map(t => t.leadId));
    if (leadIds.size > 1) {
      throw new BadRequestException('All tasks must belong to the same lead');
    }

    const newChainId = `chain_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const total = tasks.length;

    const blueprints: any[] = [];
    for (const task of tasks) {
      if (task.chainBlueprint) {
        const bp = task.chainBlueprint as any;
        if (Array.isArray(bp)) {
          blueprints.push(...bp);
        } else if (bp.tasks) {
          blueprints.push(...bp.tasks);
        } else {
          blueprints.push({
            title: task.title,
            taskType: task.taskType,
            description: task.description,
            checklist: task.checklist,
          });
        }
      } else {
        blueprints.push({
          title: task.title,
          taskType: task.taskType,
          description: task.description,
          checklist: task.checklist,
        });
      }
    }

    const sorted = tasks.sort((a, b) => (a.chainOrder ?? 999) - (b.chainOrder ?? 999));

    const updates = sorted.map((task, index) =>
      this.prisma.leadTask.update({
        where: { id: task.id },
        data: {
          chainId: newChainId,
          chainOrder: index + 1,
          chainTotal: total,
          chainBlueprint: { tasks: blueprints },
        },
      })
    );

    const updated = await this.prisma.$transaction(updates);
    return { data: updated, chainId: newChainId, total };
  }

  private async maybeCreateNextChecklistTask(leadId: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      include: { sop: { include: { checklists: { orderBy: { sortOrder: 'asc' } } } } },
    });
    if (!lead?.sop?.checklists?.length) return;

    const existingTaskTitles = await this.prisma.leadTask.findMany({
      where: { leadId, status: 'completed' },
      select: { title: true },
    });
    const completedTitles = new Set(existingTaskTitles.map((t) => t.title));

    const nextItem = lead.sop.checklists.find((c) => !completedTitles.has(c.item));
    if (!nextItem) return;

    await this.prisma.leadTask.create({
      data: {
        leadId,
        title: nextItem.item,
        taskType: 'follow_up',
        priority: 'medium',
        assignedTo: lead.assignedTo,
      },
    });
  }

  async addAttachment(id: string, file: Express.Multer.File, userId: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException('Lead not found');

    return this.prisma.leadAttachment.create({
      data: {
        leadId: id,
        fileName: file.originalname,
        fileUrl: `/uploads/${file.filename}`,
        fileType: file.mimetype,
        fileSize: file.size,
        uploadedById: userId,
      },
    });
  }

  async addAttachments(id: string, files: Express.Multer.File[], userId: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException('Lead not found');

    const attachments = await Promise.all(
      files.map((file) =>
        this.prisma.leadAttachment.create({
          data: {
            leadId: id,
            fileName: file.originalname,
            fileUrl: `/uploads/${file.filename}`,
            fileType: file.mimetype,
            fileSize: file.size,
            uploadedById: userId,
          },
        }),
      ),
    );
    return attachments;
  }

  async getAttachments(id: string) {
    return this.prisma.leadAttachment.findMany({
      where: { leadId: id },
      include: { uploadedBy: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteAttachment(attachmentId: string) {
    const attachment = await this.prisma.leadAttachment.findUnique({ where: { id: attachmentId } });
    if (!attachment) throw new NotFoundException('Attachment not found');
    await this.prisma.leadAttachment.delete({ where: { id: attachmentId } });
    return { message: 'Attachment deleted' };
  }

  async getTimeline(id: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException('Lead not found');

    const [activities, leadScores, tasks, meetings] = await Promise.all([
      this.prisma.activity.findMany({
        where: { leadId: id },
        include: { user: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.leadScore.findMany({
        where: { leadId: id },
        include: { scorer: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.leadTask.findMany({
        where: { leadId: id },
        include: { assignee: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.meeting.findMany({
        where: { leadId: id },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      activities,
      leadScores,
      tasks,
      meetings,
    };
  }

  async getLeadsStats() {
    const [
      total,
      byStatus,
      bySource,
      byTemperature,
      totalDealValue,
      wonCount,
    ] = await Promise.all([
      this.prisma.lead.count(),
      this.prisma.lead.groupBy({ by: ['status'], _count: { id: true } }),
      this.prisma.lead.groupBy({ by: ['source'], _count: { id: true } }),
      this.prisma.lead.groupBy({ by: ['leadTemperature'], _count: { id: true } }),
      this.prisma.lead.aggregate({ _sum: { dealValue: true } }),
      this.prisma.lead.count({ where: { status: 'won' } }),
    ]);

    return {
      total,
      by_status: byStatus.map((s) => ({ status: s.status, count: s._count.id })),
      by_source: bySource.map((s) => ({ source: s.source, count: s._count.id })),
      by_temperature: byTemperature.map((t) => ({
        temperature: t.leadTemperature,
        count: t._count.id,
      })),
      total_deal_value: totalDealValue._sum.dealValue || 0,
      won_count: wonCount,
    };
  }

  async bulkAssign(ids: string[], userId: string, currentUserId?: string) {
    const result = await this.prisma.lead.updateMany({
      where: { id: { in: ids } },
      data: { assignedTo: userId },
    });

    for (const id of ids) {
      await this.auditService.log('lead_assigned', 'lead', id, currentUserId, {}, { newAssignee: userId });
    }

    return { message: `${result.count} leads assigned successfully` };
  }

  async bulkChangeStage(ids: string[], stageId: string, userId?: string) {
    const targetStage = await this.prisma.pipelineStage.findUnique({ where: { id: stageId } });
    if (!targetStage) throw new NotFoundException('Pipeline stage not found');

    const result = await this.prisma.lead.updateMany({
      where: { id: { in: ids }, status: { notIn: ['won', 'lost', 'archived'] } },
      data: { stageId },
    });

    for (const id of ids) {
      await this.prisma.activity.create({
        data: {
          leadId: id,
          userId,
          actionType: 'stage_change',
          description: `Bulk stage changed to ${targetStage.code}`,
          metadata: { toStage: targetStage.code },
        },
      });
    }

    return { message: `${result.count} leads moved to ${targetStage.name}` };
  }

  async permanentDelete(id: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException('Lead not found');
    await this.prisma.lead.delete({ where: { id } });
    return { message: 'Lead permanently deleted' };
  }

  async bulkDelete(ids: string[]) {
    const result = await this.prisma.lead.updateMany({
      where: { id: { in: ids } },
      data: { status: 'archived' },
    });
    return { message: `${result.count} leads archived` };
  }

  async checkDuplicates(query: { email?: string; phone?: string; company?: string }) {
    const conditions: any[] = [];
    if (query.email) conditions.push({ email: query.email });
    if (query.phone) conditions.push({ phone: query.phone });
    if (query.company) conditions.push({ company: { contains: query.company, mode: 'insensitive' } });

    if (conditions.length === 0) return { duplicates: [] };

    const duplicates = await this.prisma.lead.findMany({
      where: { OR: conditions, status: { not: 'archived' } },
      select: { id: true, clientName: true, company: true, email: true, phone: true, createdAt: true },
    });

    return { duplicates };
  }

  private async autoCreateFollowUpTask(leadId: string, totalScore: number, qualification: any, userId: string) {
    let taskType: string;
    let title: string;
    let priority: string;

    if (totalScore >= 8) {
      taskType = 'meeting';
      title = 'Schedule Discovery Meeting';
      priority = 'high';
    } else if (totalScore >= 5 && qualification.budget && qualification.decisionMaker) {
      taskType = 'proposal';
      title = 'Create Proposal';
      priority = 'high';
    } else if (totalScore >= 5) {
      taskType = 'call';
      title = 'Schedule Qualification Meeting';
      priority = 'medium';
    } else {
      taskType = 'follow_up';
      title = 'Low Priority Follow-up Call';
      priority = 'low';
    }

    const daysMap: Record<string, number> = {
      immediate: 1,
      this_month: 7,
      next_quarter: 14,
      not_urgent: 30,
    };
    const days = daysMap[qualification.urgency] || 7;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + days);

    const reminderAt = new Date(dueDate);
    reminderAt.setDate(reminderAt.getDate() - 1);

    return this.prisma.leadTask.create({
      data: {
        leadId,
        title,
        taskType,
        priority,
        dueDate,
        reminderAt,
        assignedTo: userId,
      },
    });
  }
}
