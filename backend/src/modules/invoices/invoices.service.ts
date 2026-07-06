import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  private async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const lastInvoice = await this.prisma.invoice.findFirst({
      where: { invoiceNumber: { startsWith: `INV-${year}-` } },
      orderBy: { invoiceNumber: 'desc' },
    });
    let nextNum = 1;
    if (lastInvoice) {
      const parts = lastInvoice.invoiceNumber.split('-');
      nextNum = parseInt(parts[2]) + 1;
    }
    return `INV-${year}-${String(nextNum).padStart(4, '0')}`;
  }

  async create(dto: any) {
    const invoiceNumber = await this.generateInvoiceNumber();
    return this.prisma.invoice.create({
      data: {
        invoiceNumber,
        contractId: dto.contractId,
        clientId: dto.clientId,
        totalAmount: dto.totalAmount,
        taxAmount: dto.taxAmount || 0,
        currency: dto.currency || 'LYD',
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        notes: dto.notes,
      },
      include: { client: true, contract: true },
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
      this.prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        include: {
          client: true,
          contract: true,
          _count: { select: { payments: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        client: true,
        contract: true,
        payments: true,
      },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async update(id: string, dto: any) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!invoice) throw new NotFoundException('Invoice not found');

    return this.prisma.invoice.update({
      where: { id },
      data: dto,
      include: { client: true, contract: true },
    });
  }

  async send(id: string) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!invoice) throw new NotFoundException('Invoice not found');

    return this.prisma.invoice.update({
      where: { id },
      data: { status: 'sent' },
      include: { client: true, contract: true, payments: true },
    });
  }

  async remind(id: string) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!invoice) throw new NotFoundException('Invoice not found');

    console.log(`Reminder sent for invoice ${invoice.invoiceNumber}`);
    return { message: 'Reminder logged', invoiceId: id };
  }
}
