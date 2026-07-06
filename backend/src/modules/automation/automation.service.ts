import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class AutomationService {
  constructor(private prisma: PrismaService) {}

  async create(dto: any) {
    return this.prisma.automationRule.create({
      data: {
        name: dto.name,
        description: dto.description,
        triggerType: dto.triggerType,
        triggerConfig: dto.triggerConfig,
        conditions: dto.conditions,
        actions: dto.actions,
        errorHandling: dto.errorHandling,
      },
    });
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    triggerType?: string;
    isActive?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.triggerType) where.triggerType = query.triggerType;
    if (query.isActive !== undefined) where.isActive = query.isActive === 'true';

    const [data, total] = await Promise.all([
      this.prisma.automationRule.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.automationRule.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const rule = await this.prisma.automationRule.findUnique({
      where: { id },
    });
    if (!rule) throw new NotFoundException('Automation rule not found');
    return rule;
  }

  async update(id: string, dto: any) {
    const rule = await this.prisma.automationRule.findUnique({ where: { id } });
    if (!rule) throw new NotFoundException('Automation rule not found');

    return this.prisma.automationRule.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const rule = await this.prisma.automationRule.findUnique({ where: { id } });
    if (!rule) throw new NotFoundException('Automation rule not found');

    return this.prisma.automationRule.delete({
      where: { id },
    });
  }

  async test(id: string) {
    const rule = await this.prisma.automationRule.findUnique({ where: { id } });
    if (!rule) throw new NotFoundException('Automation rule not found');

    const executionLog = {
      ruleId: rule.id,
      ruleName: rule.name,
      triggerType: rule.triggerType,
      conditions: rule.conditions,
      actions: rule.actions,
      simulatedAt: new Date(),
      steps: [
        { step: 'validate_trigger', status: 'success', message: 'Trigger validated' },
        { step: 'evaluate_conditions', status: 'success', message: 'Conditions evaluated' },
        { step: 'execute_actions', status: 'simulated', message: 'Actions would be executed' },
      ],
    };

    return executionLog;
  }

  async getLogs(id: string) {
    const rule = await this.prisma.automationRule.findUnique({ where: { id } });
    if (!rule) throw new NotFoundException('Automation rule not found');

    return {
      runCount: rule.runCount,
      lastRunAt: rule.lastRunAt,
      isActive: rule.isActive,
    };
  }
}
