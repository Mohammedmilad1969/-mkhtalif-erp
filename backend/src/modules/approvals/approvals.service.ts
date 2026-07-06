import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class ApprovalsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: any) {
    return this.prisma.approval.create({
      data: {
        deliverableId: dto.deliverableId,
        approverId: dto.approverId,
        type: dto.type,
        status: 'pending',
        comments: dto.comments,
      },
      include: { approver: true, deliverable: { select: { id: true, name: true } } },
    });
  }

  async findAll(query: { page?: number; limit?: number; status?: string; approverId?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.approverId) where.approverId = query.approverId;

    const [data, total] = await Promise.all([
      this.prisma.approval.findMany({
        where,
        skip,
        take: limit,
        include: { approver: true, deliverable: { select: { id: true, name: true, projectId: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.approval.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async approve(id: string, comments?: string) {
    const approval = await this.prisma.approval.findUnique({ where: { id } });
    if (!approval) throw new NotFoundException('Approval not found');

    return this.prisma.approval.update({
      where: { id },
      data: {
        status: 'approved',
        comments,
        decisionAt: new Date(),
      },
      include: { approver: true },
    });
  }

  async reject(id: string, comments?: string) {
    const approval = await this.prisma.approval.findUnique({ where: { id } });
    if (!approval) throw new NotFoundException('Approval not found');

    return this.prisma.approval.update({
      where: { id },
      data: {
        status: 'rejected',
        comments,
        decisionAt: new Date(),
      },
      include: { approver: true },
    });
  }

  async getPending(userId: string) {
    return this.prisma.approval.findMany({
      where: {
        approverId: userId,
        status: 'pending',
      },
      include: {
        approver: true,
        deliverable: { select: { id: true, name: true, projectId: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
