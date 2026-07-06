import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { AutomationEngineService } from '../automation/automation-engine.service';

@Injectable()
export class MeetingsService {
  constructor(
    private prisma: PrismaService,
    private automationEngine: AutomationEngineService,
  ) {}

  async create(dto: any) {
    return this.prisma.meeting.create({
      data: {
        leadId: dto.leadId,
        type: dto.type,
        scheduledAt: new Date(dto.scheduledAt),
        durationMinutes: dto.durationMinutes,
        status: dto.status || 'scheduled',
        notes: dto.notes,
        recordingUrl: dto.recordingUrl,
        outcome: dto.outcome,
        nextStep: dto.nextStep,
        ownerId: dto.ownerId,
      },
      include: { owner: true, lead: true },
    });
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    leadId?: string;
    userId?: string;
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.leadId) where.leadId = query.leadId;
    if (query.userId) where.ownerId = query.userId;
    if (query.type) where.type = query.type;
    if (query.status) where.status = query.status;
    if (query.startDate || query.endDate) {
      where.scheduledAt = {};
      if (query.startDate) where.scheduledAt.gte = new Date(query.startDate);
      if (query.endDate) where.scheduledAt.lte = new Date(query.endDate);
    }

    const [data, total] = await Promise.all([
      this.prisma.meeting.findMany({
        where,
        skip,
        take: limit,
        include: { owner: true, lead: true },
        orderBy: { scheduledAt: 'desc' },
      }),
      this.prisma.meeting.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id },
      include: { owner: true, lead: true },
    });
    if (!meeting) throw new NotFoundException('Meeting not found');
    return meeting;
  }

  async update(id: string, dto: any) {
    const meeting = await this.prisma.meeting.findUnique({ where: { id } });
    if (!meeting) throw new NotFoundException('Meeting not found');

    const updated = await this.prisma.meeting.update({
      where: { id },
      data: dto,
      include: { owner: true, lead: true },
    });

    if (dto.status === 'completed' || updated.status === 'completed') {
      this.automationEngine.fire({
        triggerType: 'meeting_completed',
        entityType: 'meeting',
        entityId: id,
        entity: updated as any,
        userId: updated.ownerId || undefined,
      });
    }

    return updated;
  }

  async remove(id: string) {
    const meeting = await this.prisma.meeting.findUnique({ where: { id } });
    if (!meeting) throw new NotFoundException('Meeting not found');

    await this.prisma.meeting.delete({ where: { id } });
    return { message: 'Meeting deleted successfully' };
  }
}
