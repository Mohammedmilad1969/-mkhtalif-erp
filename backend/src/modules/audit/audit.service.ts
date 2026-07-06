import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(
    action: string,
    entity: string,
    entityId?: string,
    userId?: string,
    oldValue?: any,
    newValue?: any,
    metadata?: any,
    ipAddress?: string,
  ) {
    return this.prisma.auditLog.create({
      data: {
        action,
        entity,
        entityId,
        userId,
        oldValue: oldValue || undefined,
        newValue: newValue || undefined,
        metadata: metadata || undefined,
        ipAddress,
      },
    });
  }

  async findAll(query: { page?: number; limit?: number; userId?: string; entity?: string; entityId?: string; action?: string; startDate?: string; endDate?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.userId) where.userId = query.userId;
    if (query.entity) where.entity = query.entity;
    if (query.entityId) where.entityId = query.entityId;
    if (query.action) where.action = query.action;
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const log = await this.prisma.auditLog.findUnique({
      where: { id },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });
    if (!log) throw new NotFoundException('Audit log not found');
    return log;
  }
}
