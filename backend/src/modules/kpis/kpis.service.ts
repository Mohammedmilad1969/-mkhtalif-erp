import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class KpisService {
  constructor(private prisma: PrismaService) {}

  async create(dto: any) {
    return this.prisma.kpi.create({
      data: {
        name: dto.name,
        code: dto.code,
        description: dto.description,
        category: dto.category,
        formula: dto.formula,
        unit: dto.unit,
        targetValue: dto.targetValue,
        targetComparison: dto.targetComparison,
        dataSource: dto.dataSource,
        updateFrequency: dto.updateFrequency,
        departmentId: dto.departmentId,
        dashboardId: dto.dashboardId,
      },
    });
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    departmentId?: string;
    category?: string;
    dashboardId?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.departmentId) where.departmentId = query.departmentId;
    if (query.category) where.category = query.category;
    if (query.dashboardId) where.dashboardId = query.dashboardId;

    const [data, total] = await Promise.all([
      this.prisma.kpi.findMany({
        where,
        skip,
        take: limit,
        include: {
          department: { select: { id: true, name: true } },
          dashboard: { select: { id: true, name: true } },
          _count: { select: { values: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.kpi.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const kpi = await this.prisma.kpi.findUnique({
      where: { id },
      include: {
        department: true,
        dashboard: true,
        values: { orderBy: { periodStart: 'desc' }, take: 20 },
      },
    });
    if (!kpi) throw new NotFoundException('KPI not found');
    return kpi;
  }

  async update(id: string, dto: any) {
    const kpi = await this.prisma.kpi.findUnique({ where: { id } });
    if (!kpi) throw new NotFoundException('KPI not found');

    return this.prisma.kpi.update({
      where: { id },
      data: dto,
      include: { department: true, dashboard: true },
    });
  }

  async addValue(id: string, dto: any) {
    const kpi = await this.prisma.kpi.findUnique({ where: { id } });
    if (!kpi) throw new NotFoundException('KPI not found');

    return this.prisma.kpiValue.create({
      data: {
        kpiId: id,
        value: dto.value,
        periodStart: new Date(dto.periodStart),
        periodEnd: new Date(dto.periodEnd),
      },
    });
  }

  async getValues(id: string, startDate?: string, endDate?: string) {
    const kpi = await this.prisma.kpi.findUnique({ where: { id } });
    if (!kpi) throw new NotFoundException('KPI not found');

    const where: any = { kpiId: id };
    if (startDate) where.periodStart = { gte: new Date(startDate) };
    if (endDate) where.periodEnd = { lte: new Date(endDate) };

    return this.prisma.kpiValue.findMany({
      where,
      orderBy: { periodStart: 'asc' },
    });
  }

  async getDashboard(id: string) {
    const dashboard = await this.prisma.dashboard.findUnique({
      where: { id },
      include: {
        kpis: {
          include: {
            values: { orderBy: { periodStart: 'desc' }, take: 1 },
          },
        },
      },
    });
    if (!dashboard) throw new NotFoundException('Dashboard not found');
    return dashboard;
  }

  async createDashboard(dto: any) {
    return this.prisma.dashboard.create({
      data: {
        name: dto.name,
        type: dto.type,
        ownerId: dto.ownerId,
        config: dto.config,
        isDefault: dto.isDefault || false,
      },
    });
  }

  async findAllDashboards() {
    return this.prisma.dashboard.findMany({
      include: {
        owner: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { kpis: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneDashboard(id: string) {
    const dashboard = await this.prisma.dashboard.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true } },
        kpis: {
          include: {
            values: { orderBy: { periodStart: 'desc' }, take: 5 },
          },
        },
      },
    });
    if (!dashboard) throw new NotFoundException('Dashboard not found');
    return dashboard;
  }
}
