import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../config/prisma.service';

@Injectable()
export class PipelineStagesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: any) {
    return this.prisma.pipelineStage.create({
      data: {
        name: dto.name,
        code: dto.code,
        stageOrder: dto.stageOrder,
        probabilityDefault: dto.probabilityDefault || 0,
        color: dto.color,
      },
    });
  }

  async findAll() {
    return this.prisma.pipelineStage.findMany({
      orderBy: { stageOrder: 'asc' },
      include: { _count: { select: { leads: true } } },
    });
  }

  async findOne(id: string) {
    const stage = await this.prisma.pipelineStage.findUnique({
      where: { id },
      include: { _count: { select: { leads: true } } },
    });
    if (!stage) throw new NotFoundException('Pipeline stage not found');
    return stage;
  }

  async update(id: string, dto: any) {
    const stage = await this.prisma.pipelineStage.findUnique({ where: { id } });
    if (!stage) throw new NotFoundException('Pipeline stage not found');

    return this.prisma.pipelineStage.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const stage = await this.prisma.pipelineStage.findUnique({ where: { id } });
    if (!stage) throw new NotFoundException('Pipeline stage not found');

    await this.prisma.pipelineStage.delete({ where: { id } });
    return { message: 'Pipeline stage deleted' };
  }

  async reorder(stages: { id: string; stageOrder: number }[]) {
    for (const stage of stages) {
      await this.prisma.pipelineStage.update({
        where: { id: stage.id },
        data: { stageOrder: stage.stageOrder },
      });
    }
    return this.findAll();
  }
}
