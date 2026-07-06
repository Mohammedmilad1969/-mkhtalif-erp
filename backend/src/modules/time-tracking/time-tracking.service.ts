import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';

@Injectable()
export class TimeTrackingService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTimeEntryDto) {
    const task = await this.prisma.task.findUnique({
      where: { id: dto.taskId },
    });
    if (!task) throw new NotFoundException('Task not found');

    return this.prisma.timeEntry.create({
      data: {
        taskId: dto.taskId,
        userId: dto['userId'],
        description: dto.description,
        duration: dto.duration,
        date: new Date(dto.date),
        billable: dto.billable ?? true,
      },
      include: { task: { select: { id: true, title: true } }, user: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  async findAll(query: { page?: number; limit?: number; taskId?: string; userId?: string; startDate?: string; endDate?: string; billable?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.taskId) where.taskId = query.taskId;
    if (query.userId) where.userId = query.userId;
    if (query.billable) where.billable = query.billable === 'true';
    if (query.startDate || query.endDate) {
      where.date = {};
      if (query.startDate) where.date.gte = new Date(query.startDate);
      if (query.endDate) where.date.lte = new Date(query.endDate);
    }

    const [data, total] = await Promise.all([
      this.prisma.timeEntry.findMany({
        where,
        skip,
        take: limit,
        include: { task: { select: { id: true, title: true } }, user: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: { date: 'desc' },
      }),
      this.prisma.timeEntry.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async update(id: string, dto: any) {
    const entry = await this.prisma.timeEntry.findUnique({ where: { id } });
    if (!entry) throw new NotFoundException('Time entry not found');

    const data: any = {};
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.duration !== undefined) data.duration = dto.duration;
    if (dto.date !== undefined) data.date = new Date(dto.date);
    if (dto.billable !== undefined) data.billable = dto.billable;

    return this.prisma.timeEntry.update({
      where: { id },
      data,
      include: { task: { select: { id: true, title: true } }, user: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  async delete(id: string) {
    const entry = await this.prisma.timeEntry.findUnique({ where: { id } });
    if (!entry) throw new NotFoundException('Time entry not found');

    await this.prisma.timeEntry.delete({ where: { id } });
    return { message: 'Time entry deleted' };
  }

  async getTotals(query: { startDate?: string; endDate?: string; userId?: string }) {
    const where: any = {};
    if (query.userId) where.userId = query.userId;
    if (query.startDate || query.endDate) {
      where.date = {};
      if (query.startDate) where.date.gte = new Date(query.startDate);
      if (query.endDate) where.date.lte = new Date(query.endDate);
    }

    const entries = await this.prisma.timeEntry.findMany({ where, include: { task: true } });

    const byTask: Record<string, { taskName: string; totalMinutes: number }> = {};
    const byUser: Record<string, number> = {};
    const byDay: Record<string, number> = {};

    for (const entry of entries) {
      if (!byTask[entry.taskId]) {
        byTask[entry.taskId] = { taskName: entry.task?.title || 'Unknown', totalMinutes: 0 };
      }
      byTask[entry.taskId].totalMinutes += entry.duration;

      byUser[entry.userId] = (byUser[entry.userId] || 0) + entry.duration;

      const dayKey = entry.date.toISOString().split('T')[0];
      byDay[dayKey] = (byDay[dayKey] || 0) + entry.duration;
    }

    const totalMinutes = entries.reduce((sum, e) => sum + e.duration, 0);

    return {
      totalMinutes,
      totalHours: Math.round((totalMinutes / 60) * 100) / 100,
      byTask,
      byUser,
      byDay,
    };
  }

  async getUserSummary(userId: string, startDate?: string, endDate?: string) {
    const where: any = { userId };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const entries = await this.prisma.timeEntry.findMany({ where, orderBy: { date: 'asc' } });

    const byDay: Record<string, number> = {};
    let totalMinutes = 0;

    for (const entry of entries) {
      const dayKey = entry.date.toISOString().split('T')[0];
      byDay[dayKey] = (byDay[dayKey] || 0) + entry.duration;
      totalMinutes += entry.duration;
    }

    const weekTotals: Record<string, number> = {};
    for (const [day, minutes] of Object.entries(byDay)) {
      const d = new Date(day);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      weekTotals[weekKey] = (weekTotals[weekKey] || 0) + minutes;
    }

    return {
      userId,
      totalMinutes,
      totalHours: Math.round((totalMinutes / 60) * 100) / 100,
      byDay,
      byWeek: weekTotals,
    };
  }
}
