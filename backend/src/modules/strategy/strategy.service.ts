import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class StrategyService {
  constructor(private prisma: PrismaService) {}

  async createReport(dto: any) {
    const project = await this.prisma.project.findUnique({ where: { id: dto.projectId } });
    if (!project) throw new NotFoundException('Project not found');

    return this.prisma.researchReport.create({
      data: {
        projectId: dto.projectId,
        title: dto.title,
        businessAnalysis: dto.businessAnalysis,
        socialAnalysis: dto.socialAnalysis,
        marketAnalysis: dto.marketAnalysis,
        competitorAnalysis: dto.competitorAnalysis,
        audienceAnalysis: dto.audienceAnalysis,
        swot: dto.swot,
        keyFindings: dto.keyFindings,
        status: dto.status || 'draft',
        createdById: dto.createdById,
      },
      include: { project: { select: { id: true, name: true } }, createdBy: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  async getReports(query: { page?: number; limit?: number; projectId?: string; status?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.projectId) where.projectId = query.projectId;
    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      this.prisma.researchReport.findMany({
        where,
        skip,
        take: limit,
        include: { project: { select: { id: true, name: true } }, createdBy: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.researchReport.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getReport(id: string) {
    const report = await this.prisma.researchReport.findUnique({
      where: { id },
      include: { project: true, createdBy: true, blueprints: { select: { id: true, title: true } } },
    });
    if (!report) throw new NotFoundException('Research report not found');
    return report;
  }

  async updateReport(id: string, dto: any) {
    const report = await this.prisma.researchReport.findUnique({ where: { id } });
    if (!report) throw new NotFoundException('Research report not found');
    return this.prisma.researchReport.update({
      where: { id },
      data: dto,
      include: { project: { select: { id: true, name: true } }, createdBy: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  async deleteReport(id: string) {
    const report = await this.prisma.researchReport.findUnique({ where: { id } });
    if (!report) throw new NotFoundException('Research report not found');
    await this.prisma.researchReport.delete({ where: { id } });
    return { message: 'Research report deleted' };
  }

  async createBlueprint(dto: any) {
    const project = await this.prisma.project.findUnique({ where: { id: dto.projectId } });
    if (!project) throw new NotFoundException('Project not found');

    if (dto.reportId) {
      const report = await this.prisma.researchReport.findUnique({ where: { id: dto.reportId } });
      if (!report) throw new NotFoundException('Research report not found');
    }

    return this.prisma.strategicBlueprint.create({
      data: {
        projectId: dto.projectId,
        reportId: dto.reportId,
        title: dto.title,
        executiveSummary: dto.executiveSummary,
        situationAnalysis: dto.situationAnalysis,
        objectives: dto.objectives,
        targetAudience: dto.targetAudience,
        positioning: dto.positioning,
        messaging: dto.messaging,
        channelStrategy: dto.channelStrategy,
        creativeDirection: dto.creativeDirection,
        budget: dto.budget,
        timeline: dto.timeline,
        kpiFramework: dto.kpiFramework,
        strategicRecommendations: dto.strategicRecommendations,
        status: dto.status || 'draft',
        createdById: dto.createdById,
      },
      include: { project: { select: { id: true, name: true } }, createdBy: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  async getBlueprints(query: { page?: number; limit?: number; projectId?: string; status?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.projectId) where.projectId = query.projectId;
    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      this.prisma.strategicBlueprint.findMany({
        where,
        skip,
        take: limit,
        include: { project: { select: { id: true, name: true } }, createdBy: { select: { id: true, firstName: true, lastName: true } }, report: { select: { id: true, title: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.strategicBlueprint.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getBlueprint(id: string) {
    const bp = await this.prisma.strategicBlueprint.findUnique({
      where: { id },
      include: { project: true, createdBy: true, report: true, approvedBy: true, creativeBriefs: { select: { id: true, title: true } } },
    });
    if (!bp) throw new NotFoundException('Strategic blueprint not found');
    return bp;
  }

  async updateBlueprint(id: string, dto: any) {
    const bp = await this.prisma.strategicBlueprint.findUnique({ where: { id } });
    if (!bp) throw new NotFoundException('Strategic blueprint not found');
    return this.prisma.strategicBlueprint.update({
      where: { id },
      data: dto,
      include: { project: { select: { id: true, name: true } }, createdBy: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  async approveBlueprint(id: string, userId: string) {
    const bp = await this.prisma.strategicBlueprint.findUnique({ where: { id } });
    if (!bp) throw new NotFoundException('Strategic blueprint not found');
    return this.prisma.strategicBlueprint.update({
      where: { id },
      data: { status: 'approved', approvedById: userId },
    });
  }

  async deleteBlueprint(id: string) {
    const bp = await this.prisma.strategicBlueprint.findUnique({ where: { id } });
    if (!bp) throw new NotFoundException('Strategic blueprint not found');
    await this.prisma.strategicBlueprint.delete({ where: { id } });
    return { message: 'Strategic blueprint deleted' };
  }

  async createBrief(dto: any) {
    const project = await this.prisma.project.findUnique({ where: { id: dto.projectId } });
    if (!project) throw new NotFoundException('Project not found');

    if (dto.blueprintId) {
      const bp = await this.prisma.strategicBlueprint.findUnique({ where: { id: dto.blueprintId } });
      if (!bp) throw new NotFoundException('Strategic blueprint not found');
    }

    return this.prisma.creativeBrief.create({
      data: {
        projectId: dto.projectId,
        blueprintId: dto.blueprintId,
        title: dto.title,
        overview: dto.overview,
        objectives: dto.objectives,
        targetAudience: dto.targetAudience,
        keyMessage: dto.keyMessage,
        tone: dto.tone,
        deliverables: dto.deliverables,
        visualReferences: dto.visualReferences,
        brandGuidelines: dto.brandGuidelines,
        distribution: dto.distribution,
        successMetrics: dto.successMetrics,
        timeline: dto.timeline,
        status: dto.status || 'draft',
        createdById: dto.createdById,
      },
      include: { project: { select: { id: true, name: true } }, createdBy: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  async getBriefs(query: { page?: number; limit?: number; projectId?: string; status?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.projectId) where.projectId = query.projectId;
    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      this.prisma.creativeBrief.findMany({
        where,
        skip,
        take: limit,
        include: { project: { select: { id: true, name: true } }, createdBy: { select: { id: true, firstName: true, lastName: true } }, blueprint: { select: { id: true, title: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.creativeBrief.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getBrief(id: string) {
    const brief = await this.prisma.creativeBrief.findUnique({
      where: { id },
      include: { project: true, createdBy: true, blueprint: true, approvedBy: true },
    });
    if (!brief) throw new NotFoundException('Creative brief not found');
    return brief;
  }

  async updateBrief(id: string, dto: any) {
    const brief = await this.prisma.creativeBrief.findUnique({ where: { id } });
    if (!brief) throw new NotFoundException('Creative brief not found');
    return this.prisma.creativeBrief.update({
      where: { id },
      data: dto,
      include: { project: { select: { id: true, name: true } }, createdBy: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  async approveBrief(id: string, userId: string) {
    const brief = await this.prisma.creativeBrief.findUnique({ where: { id } });
    if (!brief) throw new NotFoundException('Creative brief not found');
    return this.prisma.creativeBrief.update({
      where: { id },
      data: { status: 'approved', approvedById: userId },
    });
  }

  async deleteBrief(id: string) {
    const brief = await this.prisma.creativeBrief.findUnique({ where: { id } });
    if (!brief) throw new NotFoundException('Creative brief not found');
    await this.prisma.creativeBrief.delete({ where: { id } });
    return { message: 'Creative brief deleted' };
  }
}
