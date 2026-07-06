import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { AutomationEngineService } from '../automation/automation-engine.service';
import { CreateProposalDto } from './dto/create-proposal.dto';

@Injectable()
export class ProposalsService {
  constructor(
    private prisma: PrismaService,
    private automationEngine: AutomationEngineService,
  ) {}

  async create(dto: CreateProposalDto) {
    return this.prisma.proposal.create({
      data: {
        opportunityId: dto.opportunityId,
        clientId: dto.clientId,
        title: dto.title,
        technicalContent: dto.technicalContent,
        financialContent: dto.financialContent,
        scopeOfWork: dto.scopeOfWork,
        totalValue: dto.totalValue,
        currency: dto.currency || 'LYD',
        validityDays: dto.validityDays || 7,
      },
      include: { opportunity: true, client: true },
    });
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    status?: string;
    clientId?: string;
    ownerId?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.clientId) where.clientId = query.clientId;
    if (query.ownerId) where.ownerId = query.ownerId;

    const [data, total] = await Promise.all([
      this.prisma.proposal.findMany({
        where,
        skip,
        take: limit,
        include: {
          opportunity: true,
          client: true,
          owner: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.proposal.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id },
      include: {
        opportunity: true,
        client: true,
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
    if (!proposal) throw new NotFoundException('Proposal not found');
    return proposal;
  }

  async update(id: string, dto: any) {
    const proposal = await this.prisma.proposal.findUnique({ where: { id } });
    if (!proposal) throw new NotFoundException('Proposal not found');

    return this.prisma.proposal.update({
      where: { id },
      data: dto,
      include: { opportunity: true, client: true },
    });
  }

  async send(id: string) {
    const proposal = await this.prisma.proposal.findUnique({ where: { id } });
    if (!proposal) throw new NotFoundException('Proposal not found');

    return this.prisma.proposal.update({
      where: { id },
      data: { status: 'sent', sentAt: new Date() },
      include: { opportunity: true, client: true },
    });
  }

  async approve(id: string) {
    const proposal = await this.prisma.proposal.findUnique({ where: { id } });
    if (!proposal) throw new NotFoundException('Proposal not found');

    const updated = await this.prisma.proposal.update({
      where: { id },
      data: { status: 'accepted', acceptedAt: new Date() },
      include: { opportunity: true, client: true },
    });

    this.automationEngine.fire({
      triggerType: 'proposal_accepted',
      entityType: 'proposal',
      entityId: id,
      entity: updated as any,
      userId: updated.ownerId || undefined,
    });

    return updated;
  }

  async reject(id: string, reason: string) {
    const proposal = await this.prisma.proposal.findUnique({ where: { id } });
    if (!proposal) throw new NotFoundException('Proposal not found');

    return this.prisma.proposal.update({
      where: { id },
      data: { status: 'rejected', rejectedAt: new Date(), rejectionReason: reason },
      include: { opportunity: true, client: true },
    });
  }
}
