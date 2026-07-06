import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class CampaignsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: any) {
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
    });
    if (!project) throw new NotFoundException('Project not found');

    return this.prisma.campaign.create({
      data: {
        projectId: dto.projectId,
        name: dto.name,
        objective: dto.objective,
        budget: dto.budget,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        channels: dto.channels,
        targetAudience: dto.targetAudience,
        kpiTargets: dto.kpiTargets,
      },
      include: { project: true },
    });
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    projectId?: string;
    status?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.projectId) where.projectId = query.projectId;
    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      this.prisma.campaign.findMany({
        where,
        skip,
        take: limit,
        include: {
          project: { select: { id: true, name: true } },
          _count: { select: { metrics: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.campaign.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: {
        project: true,
        metrics: { orderBy: { date: 'desc' } },
      },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  async update(id: string, dto: any) {
    const campaign = await this.prisma.campaign.findUnique({ where: { id } });
    if (!campaign) throw new NotFoundException('Campaign not found');

    return this.prisma.campaign.update({
      where: { id },
      data: dto,
      include: { project: true },
    });
  }

  async launch(id: string) {
    const campaign = await this.prisma.campaign.findUnique({ where: { id } });
    if (!campaign) throw new NotFoundException('Campaign not found');

    return this.prisma.campaign.update({
      where: { id },
      data: { status: 'active', startDate: new Date() },
      include: { project: true, metrics: true },
    });
  }

  async pause(id: string) {
    const campaign = await this.prisma.campaign.findUnique({ where: { id } });
    if (!campaign) throw new NotFoundException('Campaign not found');

    return this.prisma.campaign.update({
      where: { id },
      data: { status: 'paused' },
      include: { project: true, metrics: true },
    });
  }

  async getMetrics(id: string) {
    const campaign = await this.prisma.campaign.findUnique({ where: { id } });
    if (!campaign) throw new NotFoundException('Campaign not found');

    return this.prisma.campaignMetric.findMany({
      where: { campaignId: id },
      orderBy: { date: 'desc' },
    });
  }

  async addMetric(id: string, dto: any) {
    const campaign = await this.prisma.campaign.findUnique({ where: { id } });
    if (!campaign) throw new NotFoundException('Campaign not found');

    return this.prisma.campaignMetric.create({
      data: {
        campaignId: id,
        date: new Date(dto.date),
        impressions: dto.impressions || 0,
        reach: dto.reach || 0,
        clicks: dto.clicks || 0,
        ctr: dto.ctr,
        cpm: dto.cpm,
        spend: dto.spend,
        leads: dto.leads || 0,
        conversions: dto.conversions || 0,
        conversionRate: dto.conversionRate,
        costPerConversion: dto.costPerConversion,
        revenue: dto.revenue,
        roas: dto.roas,
      },
    });
  }
}
