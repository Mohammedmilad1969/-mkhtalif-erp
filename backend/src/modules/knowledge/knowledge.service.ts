import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class KnowledgeService {
  constructor(private prisma: PrismaService) {}

  async create(dto: any) {
    return this.prisma.knowledgeArticle.create({
      data: {
        title: dto.title,
        content: dto.content,
        articleType: dto.articleType,
        departmentId: dto.departmentId,
        sopId: dto.sopId,
        tags: dto.tags || [],
        authorId: dto.authorId,
        status: dto.status || 'draft',
      },
      include: {
        department: { select: { id: true, name: true } },
        sop: { select: { id: true, name: true } },
        author: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    departmentId?: string;
    articleType?: string;
    status?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.departmentId) where.departmentId = query.departmentId;
    if (query.articleType) where.articleType = query.articleType;
    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      this.prisma.knowledgeArticle.findMany({
        where,
        skip,
        take: limit,
        include: {
          department: { select: { id: true, name: true } },
          sop: { select: { id: true, name: true } },
          author: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.knowledgeArticle.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const article = await this.prisma.knowledgeArticle.findUnique({
      where: { id },
      include: {
        department: true,
        sop: true,
        author: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
    if (!article) throw new NotFoundException('Knowledge article not found');
    return article;
  }

  async update(id: string, dto: any) {
    const article = await this.prisma.knowledgeArticle.findUnique({ where: { id } });
    if (!article) throw new NotFoundException('Knowledge article not found');

    return this.prisma.knowledgeArticle.update({
      where: { id },
      data: dto,
      include: {
        department: { select: { id: true, name: true } },
        author: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async search(query: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const where: any = {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { tags: { hasSome: [query] } },
      ],
    };

    const [data, total] = await Promise.all([
      this.prisma.knowledgeArticle.findMany({
        where,
        skip,
        take: limit,
        include: {
          department: { select: { id: true, name: true } },
          author: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.knowledgeArticle.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
