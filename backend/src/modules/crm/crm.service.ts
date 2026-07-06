import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class CrmService {
  constructor(private prisma: PrismaService) {}

  async getPipelineStats() {
    const stages = await this.prisma.pipelineStage.findMany({
      orderBy: { stageOrder: 'asc' },
      include: {
        _count: { select: { leads: true } },
      },
    });

    return stages.map((stage) => ({
      id: stage.id,
      name: stage.name,
      code: stage.code,
      order: stage.stageOrder,
      count: stage._count.leads,
    }));
  }

  async getLeadStats() {
    const [bySource, byStage, byTemperature] = await Promise.all([
      this.prisma.lead.groupBy({
        by: ['source'],
        _count: { id: true },
      }),
      this.prisma.lead.groupBy({
        by: ['stageId'],
        _count: { id: true },
      }),
      this.prisma.lead.groupBy({
        by: ['leadTemperature'],
        _count: { id: true },
      }),
    ]);

    return {
      by_source: bySource.map((s) => ({ source: s.source, count: s._count.id })),
      by_stage: byStage.map((s) => ({ stageId: s.stageId, count: s._count.id })),
      by_temperature: byTemperature.map((t) => ({
        temperature: t.leadTemperature,
        count: t._count.id,
      })),
    };
  }

  async getFollowUpMatrix() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday.getTime() + 86400000);
    const startOfTomorrow = new Date(endOfToday);
    const endOfTomorrow = new Date(startOfTomorrow.getTime() + 86400000);
    const startOfWeek = new Date(now.getTime() + 7 * 86400000);
    startOfWeek.setHours(23, 59, 59, 999);

    const followUps = await this.prisma.leadFollowUp.findMany({
      where: {
        status: { not: 'done' },
      },
      include: {
        lead: {
          select: {
            id: true,
            clientName: true,
            company: true,
            email: true,
            phone: true,
            nextAction: true,
            assignee: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    const late: any[] = [];
    const today: any[] = [];
    const tomorrow: any[] = [];
    const thisWeek: any[] = [];

    for (const fuRaw of followUps) {
      const fu = fuRaw as any;
      if (!fu.dueDate) continue;
      const d = new Date(fu.dueDate);
      const item = {
        id: fu.id,
        followUpId: fu.id,
        leadId: fu.lead?.id,
        clientName: fu.lead?.clientName,
        company: fu.lead?.company,
        email: fu.lead?.email,
        phone: fu.lead?.phone,
        assignedTo: fu.lead?.assignee ? `${fu.lead.assignee.firstName} ${fu.lead.assignee.lastName}` : null,
        followUpDate: fu.dueDate,
        nextAction: fu.title,
        followUpStatus: fu.status,
        chainOrder: fu.chainOrder,
      };
      if (d < startOfToday) late.push(item);
      else if (d >= startOfToday && d < endOfToday) today.push(item);
      else if (d >= endOfToday && d < endOfTomorrow) tomorrow.push(item);
      else if (d >= endOfTomorrow && d <= startOfWeek) thisWeek.push(item);
      else thisWeek.push(item);
    }

    return { late, today, tomorrow, thisWeek };
  }

  async getLeadFollowUps(leadId: string) {
    return this.prisma.leadFollowUp.findMany({
      where: { leadId },
      orderBy: { dueDate: 'asc' },
    });
  }

  async updateFollowUp(id: string, status: string) {
    const fu = await this.prisma.leadFollowUp.findUnique({ where: { id } });
    if (!fu) throw new NotFoundException('Follow-up not found');

    const updated = await this.prisma.leadFollowUp.update({
      where: { id },
      data: { status: status as any },
    });

    if (status === 'done' && fu.chainId && fu.chainOrder === 1) {
      await this.prisma.leadFollowUp.updateMany({
        where: { chainId: fu.chainId, chainOrder: { gt: 1 }, status: { not: 'done' } },
        data: { status: 'done' },
      });
    }

    return updated;
  }
}
