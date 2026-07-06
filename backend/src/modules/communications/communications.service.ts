import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class CommunicationsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: any, userId?: string) {
    return this.prisma.communicationLog.create({
      data: {
        leadId: dto.leadId,
        clientId: dto.clientId,
        channel: dto.channel || 'email',
        direction: dto.direction || 'outbound',
        subject: dto.subject,
        body: dto.body,
        fromAddress: dto.fromAddress,
        toAddress: dto.toAddress,
        ccAddresses: dto.ccAddresses || [],
        bccAddresses: dto.bccAddresses || [],
        attachments: dto.attachments,
        status: dto.status || 'sent',
        externalId: dto.externalId,
        metadata: dto.metadata,
        createdById: userId,
      },
      include: { createdBy: true },
    });
  }

  async findAll(query: {
    leadId?: string;
    clientId?: string;
    channel?: string;
    page?: number;
    limit?: number;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.leadId) where.leadId = query.leadId;
    if (query.clientId) where.clientId = query.clientId;
    if (query.channel) where.channel = query.channel;

    const [data, total] = await Promise.all([
      this.prisma.communicationLog.findMany({
        where,
        skip,
        take: limit,
        include: { createdBy: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.communicationLog.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const log = await this.prisma.communicationLog.findUnique({
      where: { id },
      include: { createdBy: true, lead: true, client: true },
    });
    if (!log) throw new NotFoundException('Communication log not found');
    return log;
  }

  async findByLead(leadId: string) {
    return this.prisma.communicationLog.findMany({
      where: { leadId },
      include: { createdBy: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByClient(clientId: string) {
    return this.prisma.communicationLog.findMany({
      where: { clientId },
      include: { createdBy: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
