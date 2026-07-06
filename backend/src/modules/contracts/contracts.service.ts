import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { AutomationEngineService } from '../automation/automation-engine.service';

@Injectable()
export class ContractsService {
  constructor(
    private prisma: PrismaService,
    private automationEngine: AutomationEngineService,
  ) {}

  private async generateContractNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const lastContract = await this.prisma.contract.findFirst({
      where: { contractNumber: { startsWith: `CTR-${year}-` } },
      orderBy: { contractNumber: 'desc' },
    });
    let nextNum = 1;
    if (lastContract) {
      const parts = lastContract.contractNumber.split('-');
      nextNum = parseInt(parts[2]) + 1;
    }
    return `CTR-${year}-${String(nextNum).padStart(4, '0')}`;
  }

  async create(dto: any) {
    const contractNumber = await this.generateContractNumber();
    return this.prisma.contract.create({
      data: {
        proposalId: dto.proposalId,
        clientId: dto.clientId,
        contractNumber,
        scopeOfWork: dto.scopeOfWork,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        totalValue: dto.totalValue,
        paymentTerms: dto.paymentTerms,
        specialTerms: dto.specialTerms,
      },
      include: { client: true, proposal: true },
    });
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    status?: string;
    clientId?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.clientId) where.clientId = query.clientId;

    const [data, total] = await Promise.all([
      this.prisma.contract.findMany({
        where,
        skip,
        take: limit,
        include: {
          client: true,
          proposal: true,
          _count: { select: { projects: true, invoices: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.contract.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
      include: {
        client: true,
        proposal: true,
        projects: true,
        invoices: true,
      },
    });
    if (!contract) throw new NotFoundException('Contract not found');
    return contract;
  }

  async update(id: string, dto: any) {
    const contract = await this.prisma.contract.findUnique({ where: { id } });
    if (!contract) throw new NotFoundException('Contract not found');

    return this.prisma.contract.update({
      where: { id },
      data: dto,
      include: { client: true, proposal: true },
    });
  }

  async sign(id: string) {
    const contract = await this.prisma.contract.findUnique({ where: { id } });
    if (!contract) throw new NotFoundException('Contract not found');

    const updated = await this.prisma.contract.update({
      where: { id },
      data: { status: 'signed', signedByClientAt: new Date() },
      include: { client: true, proposal: true },
    });

    this.automationEngine.fire({
      triggerType: 'contract_signed',
      entityType: 'contract',
      entityId: id,
      entity: updated as any,
    });

    return updated;
  }

  async getPdf(id: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
      include: { client: true, proposal: true },
    });
    if (!contract) throw new NotFoundException('Contract not found');

    return {
      message: 'PDF generation placeholder',
      contract,
    };
  }
}
