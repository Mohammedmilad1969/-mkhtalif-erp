import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class CalendarService {
  constructor(private prisma: PrismaService) {}

  async create(dto: any, userId: string) {
    return this.prisma.calendarEvent.create({
      data: {
        title: dto.title,
        description: dto.description,
        eventType: dto.eventType,
        startTime: new Date(dto.startTime),
        endTime: dto.endTime ? new Date(dto.endTime) : undefined,
        allDay: dto.allDay || false,
        location: dto.location,
        meetingUrl: dto.meetingUrl,
        leadId: dto.leadId,
        clientId: dto.clientId,
        projectId: dto.projectId,
        ownerId: userId,
        color: dto.color,
        isCompleted: dto.isCompleted || false,
        recurrence: dto.recurrence,
        reminders: dto.reminders,
      },
      include: { owner: true },
    });
  }

  async findAll(query: {
    startDate?: string;
    endDate?: string;
    ownerId?: string;
    leadId?: string;
    clientId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.ownerId) where.ownerId = query.ownerId;
    if (query.leadId) where.leadId = query.leadId;
    if (query.clientId) where.clientId = query.clientId;
    if (query.startDate || query.endDate) {
      where.startTime = {};
      if (query.startDate) where.startTime.gte = new Date(query.startDate);
      if (query.endDate) where.startTime.lte = new Date(query.endDate);
    }

    const [data, total] = await Promise.all([
      this.prisma.calendarEvent.findMany({
        where,
        skip,
        take: limit,
        include: { owner: true },
        orderBy: { startTime: 'asc' },
      }),
      this.prisma.calendarEvent.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const event = await this.prisma.calendarEvent.findUnique({
      where: { id },
      include: { owner: true, lead: true, client: true, project: true },
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async update(id: string, dto: any) {
    const event = await this.prisma.calendarEvent.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');

    const data: any = {};
    if (dto.title) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.eventType) data.eventType = dto.eventType;
    if (dto.startTime) data.startTime = new Date(dto.startTime);
    if (dto.endTime) data.endTime = new Date(dto.endTime);
    if (dto.allDay !== undefined) data.allDay = dto.allDay;
    if (dto.location !== undefined) data.location = dto.location;
    if (dto.color) data.color = dto.color;
    if (dto.isCompleted !== undefined) data.isCompleted = dto.isCompleted;

    return this.prisma.calendarEvent.update({
      where: { id },
      data,
      include: { owner: true },
    });
  }

  async remove(id: string) {
    const event = await this.prisma.calendarEvent.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    await this.prisma.calendarEvent.delete({ where: { id } });
    return { message: 'Event deleted' };
  }
}
