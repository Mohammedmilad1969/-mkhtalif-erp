import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(dto: any) {
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
    });
    if (!project) throw new NotFoundException('Project not found');

    return this.prisma.task.create({
      data: {
        projectId: dto.projectId,
        parentTaskId: dto.parentTaskId,
        title: dto.title,
        description: dto.description,
        taskType: dto.taskType,
        status: dto.status || 'todo',
        priority: dto.priority || 'medium',
        assignedTo: dto.assignedTo,
        estimatedHours: dto.estimatedHours,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
        sprintId: dto.sprintId,
        sortOrder: dto.sortOrder,
      },
      include: { assignee: true, sprint: true, project: true },
    });
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    projectId?: string;
    assignedTo?: string;
    status?: string;
    sprintId?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.projectId) where.projectId = query.projectId;
    if (query.assignedTo) where.assignedTo = query.assignedTo;
    if (query.status) where.status = query.status;
    if (query.sprintId) where.sprintId = query.sprintId;

    const [data, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take: limit,
        include: { assignee: true, sprint: true, project: { select: { id: true, name: true } } },
        orderBy: { sortOrder: 'asc' },
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        assignee: true,
        sprint: true,
        project: true,
        childTasks: { include: { assignee: true } },
      },
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async update(id: string, dto: any) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');

    return this.prisma.task.update({
      where: { id },
      data: dto,
      include: { assignee: true, sprint: true },
    });
  }

  async updateStatus(id: string, status: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');

    const data: any = { status };
    if (status === 'delivered') {
      data.completedAt = new Date();
    }

    return this.prisma.task.update({
      where: { id },
      data,
      include: { assignee: true, sprint: true },
    });
  }

  async batchCreate(tasks: any[]) {
    const created: any[] = [];
    for (const dto of tasks) {
      const project = await this.prisma.project.findUnique({
        where: { id: dto.projectId },
      });
      if (!project) throw new NotFoundException(`Project ${dto.projectId} not found`);
      const task = await this.prisma.task.create({
        data: {
          projectId: dto.projectId,
          title: dto.title,
          description: dto.description,
          taskType: dto.taskType,
          status: dto.status || 'todo',
          priority: dto.priority || 'medium',
          assignedTo: dto.assignedTo,
          estimatedHours: dto.estimatedHours,
          deadline: dto.deadline ? new Date(dto.deadline) : undefined,
          sprintId: dto.sprintId,
        },
      });
      created.push(task);
    }
    return created;
  }

  async remove(id: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    return this.prisma.task.delete({ where: { id } });
  }
}
