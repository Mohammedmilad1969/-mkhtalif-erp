import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class SprintsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: any) {
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
    });
    if (!project) throw new NotFoundException('Project not found');

    return this.prisma.sprint.create({
      data: {
        projectId: dto.projectId,
        name: dto.name,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        status: dto.status || 'planning',
        goals: dto.goals,
      },
      include: { _count: { select: { tasks: true } } },
    });
  }

  async findAll(query: { page?: number; limit?: number; projectId?: string; status?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.projectId) where.projectId = query.projectId;
    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      this.prisma.sprint.findMany({
        where,
        skip,
        take: limit,
        include: { _count: { select: { tasks: true } }, project: { select: { id: true, name: true } } },
        orderBy: { startDate: 'asc' },
      }),
      this.prisma.sprint.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const sprint = await this.prisma.sprint.findUnique({
      where: { id },
      include: {
        project: true,
        tasks: { include: { assignee: true }, orderBy: { sortOrder: 'asc' } },
      },
    });
    if (!sprint) throw new NotFoundException('Sprint not found');
    return sprint;
  }

  async update(id: string, dto: any) {
    const sprint = await this.prisma.sprint.findUnique({ where: { id } });
    if (!sprint) throw new NotFoundException('Sprint not found');

    return this.prisma.sprint.update({
      where: { id },
      data: dto,
      include: { _count: { select: { tasks: true } } },
    });
  }

  async start(id: string) {
    const sprint = await this.prisma.sprint.findUnique({ where: { id } });
    if (!sprint) throw new NotFoundException('Sprint not found');

    return this.prisma.sprint.update({
      where: { id },
      data: {
        status: 'active',
        startDate: sprint.startDate || new Date(),
      },
      include: { _count: { select: { tasks: true } } },
    });
  }

  async complete(id: string) {
    const sprint = await this.prisma.sprint.findUnique({ where: { id } });
    if (!sprint) throw new NotFoundException('Sprint not found');

    return this.prisma.sprint.update({
      where: { id },
      data: {
        status: 'completed',
        endDate: sprint.endDate || new Date(),
      },
      include: { _count: { select: { tasks: true } } },
    });
  }

  async remove(id: string) {
    const sprint = await this.prisma.sprint.findUnique({ where: { id } });
    if (!sprint) throw new NotFoundException('Sprint not found');
    return this.prisma.sprint.delete({ where: { id } });
  }
}
