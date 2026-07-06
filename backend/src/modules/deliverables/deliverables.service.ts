import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { S3Service } from '../../config/s3.service';

@Injectable()
export class DeliverablesService {
  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
  ) {}

  async create(dto: any) {
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
    });
    if (!project) throw new NotFoundException('Project not found');

    return this.prisma.deliverable.create({
      data: {
        projectId: dto.projectId,
        taskId: dto.taskId,
        name: dto.name,
        type: dto.type,
        status: dto.status || 'draft',
        fileUrl: dto.fileUrl,
        ownerId: dto.ownerId,
      },
      include: { project: true, owner: true },
    });
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    projectId?: string;
    status?: string;
    ownerId?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.projectId) where.projectId = query.projectId;
    if (query.status) where.status = query.status;
    if (query.ownerId) where.ownerId = query.ownerId;

    const [data, total] = await Promise.all([
      this.prisma.deliverable.findMany({
        where,
        skip,
        take: limit,
        include: { project: { select: { id: true, name: true } }, owner: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.deliverable.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const deliverable = await this.prisma.deliverable.findUnique({
      where: { id },
      include: { project: true, owner: true, approvals: { include: { approver: true } } },
    });
    if (!deliverable) throw new NotFoundException('Deliverable not found');
    return deliverable;
  }

  async update(id: string, dto: any) {
    const deliverable = await this.prisma.deliverable.findUnique({ where: { id } });
    if (!deliverable) throw new NotFoundException('Deliverable not found');

    return this.prisma.deliverable.update({
      where: { id },
      data: dto,
      include: { project: true, owner: true },
    });
  }

  async submitForReview(id: string) {
    const deliverable = await this.prisma.deliverable.findUnique({ where: { id } });
    if (!deliverable) throw new NotFoundException('Deliverable not found');

    return this.prisma.deliverable.update({
      where: { id },
      data: {
        status: 'internal_review',
        submittedForReviewAt: new Date(),
      },
      include: { project: true, owner: true },
    });
  }

  async getSignedFileUrl(id: string) {
    const deliverable = await this.prisma.deliverable.findUnique({ where: { id } });
    if (!deliverable) throw new NotFoundException('Deliverable not found');
    if (!deliverable.fileUrl) throw new NotFoundException('No file attached');

    const signedUrl = await this.s3Service.getSignedUrl(deliverable.fileUrl);
    return { signedUrl, filename: deliverable.fileUrl };
  }

  async remove(id: string) {
    const deliverable = await this.prisma.deliverable.findUnique({ where: { id } });
    if (!deliverable) throw new NotFoundException('Deliverable not found');
    return this.prisma.deliverable.delete({ where: { id } });
  }
}
