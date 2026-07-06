import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: any) {
    const client = await this.prisma.client.findUnique({
      where: { id: dto.clientId },
    });
    if (!client) throw new NotFoundException('Client not found');

    return this.prisma.project.create({
      data: {
        clientId: dto.clientId,
        contractId: dto.contractId,
        name: dto.name,
        description: dto.description,
        status: dto.status || 'onboarding',
        priority: dto.priority || 'medium',
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        targetEndDate: dto.targetEndDate ? new Date(dto.targetEndDate) : dto.deadline ? new Date(dto.deadline) : undefined,
        accountManagerId: dto.accountManagerId,
        strategicLeadId: dto.strategicLeadId,
        productionManagerId: dto.productionManagerId,
        budget: dto.budget,
        hourlyRate: dto.hourlyRate,
        estimatedHours: dto.estimatedHours,
        sopId: dto.sopId,
        teamId: dto.teamId,
      },
      include: { client: true, accountManager: true },
    });
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    status?: string;
    clientId?: string;
    accountManagerId?: string;
    search?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    const validStatuses = ['onboarding', 'strategy', 'production', 'active', 'on_hold', 'completed', 'cancelled'];
    if (query.status && validStatuses.includes(query.status)) where.status = query.status;
    if (query.clientId) where.clientId = query.clientId;
    if (query.accountManagerId) where.accountManagerId = query.accountManagerId;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip,
        take: limit,
        include: {
          client: true,
          accountManager: true,
          _count: { select: { tasks: true, sprints: true, deliverables: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        client: true,
        accountManager: true,
        strategicLead: true,
        productionManager: true,
        team: { include: { members: { include: { user: true } } } },
        tasks: {
          orderBy: { sortOrder: 'asc' },
          include: { assignee: true, sprint: true },
        },
        sprints: { orderBy: { startDate: 'asc' } },
        deliverables: { orderBy: { createdAt: 'desc' } },
        contract: true,
        sop: true,
      },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async update(id: string, dto: any) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');

    return this.prisma.project.update({
      where: { id },
      data: dto,
      include: { client: true, accountManager: true, sop: true },
    });
  }

  async getTasks(id: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');

    return this.prisma.task.findMany({
      where: { projectId: id },
      include: { assignee: true, sprint: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getSprints(id: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');

    return this.prisma.sprint.findMany({
      where: { projectId: id },
      include: { _count: { select: { tasks: true } } },
      orderBy: { startDate: 'asc' },
    });
  }

  async getReport(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        client: true,
        accountManager: true,
        _count: { select: { tasks: true, sprints: true, deliverables: true } },
      },
    });
    if (!project) throw new NotFoundException('Project not found');

    const taskStats = await this.prisma.task.groupBy({
      by: ['status'],
      where: { projectId: id },
      _count: { id: true },
    });

    const totalTasks = taskStats.reduce((acc, s) => acc + s._count.id, 0);
    const completedTasks =
      taskStats.find((s) => s.status === 'delivered')?._count.id || 0;

    return {
      project,
      task_stats: taskStats,
      progress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    };
  }
}
