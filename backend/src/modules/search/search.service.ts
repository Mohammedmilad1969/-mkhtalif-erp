import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(query: string, entityTypes?: string[]) {
    if (!query || query.trim().length === 0) {
      return { results: {} };
    }

    const q = query.trim();
    const types = entityTypes && entityTypes.length > 0 ? entityTypes : ['lead', 'client', 'project', 'proposal', 'knowledge', 'sop'];
    const results: Record<string, any[]> = {};

    if (types.includes('lead')) {
      results.leads = await this.prisma.lead.findMany({
        where: {
          OR: [
            { clientName: { contains: q, mode: 'insensitive' } },
            { company: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: { id: true, clientName: true, company: true, email: true, status: true, createdAt: true },
        take: 10,
      });
    }

    if (types.includes('client')) {
      results.clients = await this.prisma.client.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { company: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: { id: true, name: true, company: true, email: true, status: true, createdAt: true },
        take: 10,
      });
    }

    if (types.includes('project')) {
      results.projects = await this.prisma.project.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: { id: true, name: true, description: true, status: true, createdAt: true },
        take: 10,
      });
    }

    if (types.includes('proposal')) {
      results.proposals = await this.prisma.proposal.findMany({
        where: { title: { contains: q, mode: 'insensitive' } },
        select: { id: true, title: true, status: true, totalValue: true, createdAt: true },
        take: 10,
      });
    }

    if (types.includes('knowledge')) {
      results.knowledge = await this.prisma.knowledgeArticle.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { tags: { has: q } },
          ],
        },
        select: { id: true, title: true, tags: true, status: true, createdAt: true },
        take: 10,
      });
    }

    if (types.includes('sop')) {
      results.sops = await this.prisma.sop.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { purpose: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: { id: true, name: true, code: true, purpose: true, status: true, createdAt: true },
        take: 10,
      });
    }

    return { results };
  }
}
