import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { AutomationEngineService } from '../automation/automation-engine.service';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private automationEngine: AutomationEngineService,
  ) {}

  async create(dto: any) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: dto.invoiceId },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');

    const payment = await this.prisma.payment.create({
      data: {
        invoiceId: dto.invoiceId,
        amount: dto.amount,
        paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : undefined,
        paymentMethod: dto.paymentMethod,
        reference: dto.reference,
        status: dto.status || 'completed',
      },
      include: { invoice: true },
    });

    if (payment.status === 'completed') {
      const totalPaid = await this.prisma.payment.aggregate({
        where: { invoiceId: dto.invoiceId, status: 'completed' },
        _sum: { amount: true },
      });

      let invoicePaid = false;
      if (totalPaid._sum.amount && invoice.totalAmount) {
        const paid = Number(totalPaid._sum.amount);
        const total = Number(invoice.totalAmount);
        if (paid >= total) {
          await this.prisma.invoice.update({
            where: { id: dto.invoiceId },
            data: { status: 'paid', paidAt: new Date() },
          });
          invoicePaid = true;
        }
      }

      this.automationEngine.fire({
        triggerType: 'payment_received',
        entityType: 'payment',
        entityId: payment.id,
        entity: { ...(payment as any), invoicePaid },
        userId: dto.createdBy,
      });
    }

    return payment;
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    invoiceId?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.invoiceId) where.invoiceId = query.invoiceId;

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        include: { invoice: true },
        orderBy: { paymentDate: 'desc' },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: { invoice: true },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async update(id: string, dto: any) {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment) throw new NotFoundException('Payment not found');

    return this.prisma.payment.update({
      where: { id },
      data: dto,
      include: { invoice: true },
    });
  }
}
