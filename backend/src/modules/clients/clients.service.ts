import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: any) {
    if (dto.leadId) {
      const lead = await this.prisma.lead.findUnique({
        where: { id: dto.leadId },
      });
      if (!lead) throw new NotFoundException('Lead not found');
      if (lead.status !== 'won') {
        throw new BadRequestException('Lead must be in won status to create a client');
      }
    }

    return this.prisma.client.create({
      data: {
        leadId: dto.leadId,
        name: dto.name,
        company: dto.company,
        email: dto.email,
        phone: dto.phone,
        website: dto.website,
        industry: dto.industry,
        accountManagerId: dto.accountManagerId,
        status: dto.status || 'active',
        acquiredAt: dto.acquiredAt ? new Date(dto.acquiredAt) : new Date(),
      },
      include: { accountManager: true, lead: true },
    });
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    status?: string;
    accountManagerId?: string;
    search?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.accountManagerId) where.accountManagerId = query.accountManagerId;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { company: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        skip,
        take: limit,
        include: { accountManager: true, _count: { select: { projects: true, invoices: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.client.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        accountManager: true,
        lead: true,
        projects: { include: { accountManager: true }, orderBy: { createdAt: 'desc' } },
        contracts: true,
        invoices: { orderBy: { createdAt: 'desc' } },
        opportunities: true,
        proposals: true,
      },
    });
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  async update(id: string, dto: any) {
    const client = await this.prisma.client.findUnique({ where: { id } });
    if (!client) throw new NotFoundException('Client not found');

    return this.prisma.client.update({
      where: { id },
      data: dto,
      include: { accountManager: true },
    });
  }

  async getProjects(id: string) {
    const client = await this.prisma.client.findUnique({ where: { id } });
    if (!client) throw new NotFoundException('Client not found');

    return this.prisma.project.findMany({
      where: { clientId: id },
      include: { accountManager: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getInvoices(id: string) {
    const client = await this.prisma.client.findUnique({ where: { id } });
    if (!client) throw new NotFoundException('Client not found');

    return this.prisma.invoice.findMany({
      where: { clientId: id },
      include: { payments: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
