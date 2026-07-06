import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../config/prisma.service';

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: any) {
    return this.prisma.activity.create({
      data: {
        leadId: dto.leadId,
        userId: dto.userId,
        actionType: dto.actionType,
        description: dto.description,
        outcome: dto.outcome,
        nextStep: dto.nextStep,
        metadata: dto.metadata,
      },
      include: { user: true },
    });
  }

  async findAll(leadId?: string) {
    const where: any = {};
    if (leadId) where.leadId = leadId;

    return this.prisma.activity.findMany({
      where,
      include: { user: true, lead: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
      include: { user: true, lead: true },
    });
    if (!activity) throw new NotFoundException('Activity not found');
    return activity;
  }

  async update(id: string, dto: any) {
    const activity = await this.prisma.activity.findUnique({ where: { id } });
    if (!activity) throw new NotFoundException('Activity not found');

    return this.prisma.activity.update({
      where: { id },
      data: dto,
      include: { user: true },
    });
  }

  async remove(id: string) {
    const activity = await this.prisma.activity.findUnique({ where: { id } });
    if (!activity) throw new NotFoundException('Activity not found');

    await this.prisma.activity.delete({ where: { id } });
    return { message: 'Activity deleted successfully' };
  }
}
