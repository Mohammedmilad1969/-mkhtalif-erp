import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: any) {
    return this.prisma.template.create({
      data: {
        name: dto.name,
        type: dto.type,
        content: dto.content,
        fileUrl: dto.fileUrl,
        category: dto.category,
        departmentId: dto.departmentId,
      },
      include: {
        department: { select: { id: true, name: true } },
      },
    });
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    type?: string;
    departmentId?: string;
    category?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.type) where.type = query.type;
    if (query.departmentId) where.departmentId = query.departmentId;
    if (query.category) where.category = query.category;

    const [data, total] = await Promise.all([
      this.prisma.template.findMany({
        where,
        skip,
        take: limit,
        include: {
          department: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.template.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const template = await this.prisma.template.findUnique({
      where: { id },
      include: { department: true },
    });
    if (!template) throw new NotFoundException('Template not found');
    return template;
  }

  async update(id: string, dto: any) {
    const template = await this.prisma.template.findUnique({ where: { id } });
    if (!template) throw new NotFoundException('Template not found');

    return this.prisma.template.update({
      where: { id },
      data: dto,
      include: { department: true },
    });
  }
}
