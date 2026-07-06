import { Injectable, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class PortalService {
  constructor(private prisma: PrismaService) {}

  async generateToken(clientId: string, email: string) {
    const client = await this.prisma.client.findUnique({ where: { id: clientId } });
    if (!client) throw new NotFoundException('Client not found');

    const existing = await this.prisma.clientPortalAccess.findFirst({ where: { clientId } });
    if (existing) {
      return this.prisma.clientPortalAccess.update({
        where: { id: existing.id },
        data: { token: crypto.randomBytes(32).toString('hex'), isActive: true, email },
      });
    }

    return this.prisma.clientPortalAccess.create({
      data: {
        clientId,
        email,
        token: crypto.randomBytes(32).toString('hex'),
      },
    });
  }

  async validateToken(token: string) {
    const access = await this.prisma.clientPortalAccess.findUnique({
      where: { token },
      include: { client: true },
    });
    if (!access || !access.isActive) throw new UnauthorizedException('Invalid or inactive portal token');
    return access;
  }

  async getClientDashboard(clientId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      include: {
        projects: {
          include: {
            tasks: { where: { status: { not: 'cancelled' } } },
            campaigns: { include: { metrics: true } },
            deliverables: true,
          },
        },
        invoices: { include: { payments: true } },
        proposals: { where: { status: { in: ['sent', 'presented', 'accepted'] } } },
        contracts: true,
      },
    });
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  async revokeToken(token: string) {
    const access = await this.prisma.clientPortalAccess.findUnique({ where: { token } });
    if (!access) throw new NotFoundException('Portal access not found');
    return this.prisma.clientPortalAccess.update({
      where: { token },
      data: { isActive: false },
    });
  }
}
