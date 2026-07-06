import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: any) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = dto.password
      ? await bcrypt.hash(dto.password, 12)
      : undefined;

    const data: any = {
      email: dto.email,
      passwordHash: passwordHash || '',
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      roleId: dto.roleId,
      departmentId: dto.departmentId,
      isActive: dto.isActive ?? true,
    };
    if (dto.moduleAccess) data.moduleAccess = dto.moduleAccess;

    return this.prisma.user.create({
      data,
      include: { role: true, department: true },
    });
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    roleId?: string;
    departmentId?: string;
    isActive?: boolean;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.roleId) where.roleId = query.roleId;
    if (query.departmentId) where.departmentId = query.departmentId;
    if (query.isActive !== undefined) where.isActive = query.isActive;

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: { role: true, department: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    const sanitized = data.map(({ passwordHash, ...rest }) => rest);

    return {
      data: sanitized,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true, department: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { passwordHash, ...result } = user;
    return result;
  }

  async update(id: string, dto: any) {
    console.log('UPDATE DTO:', JSON.stringify(dto));
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const data: any = {};
    if (dto.firstName !== undefined) data.firstName = dto.firstName;
    if (dto.lastName !== undefined) data.lastName = dto.lastName;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.roleId !== undefined) data.roleId = dto.roleId;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.moduleAccess !== undefined) data.moduleAccess = dto.moduleAccess;
    if (dto.password) {
      data.passwordHash = await bcrypt.hash(dto.password, 12);
    }

    console.log('UPDATE DATA:', JSON.stringify(data));

    try {
      const updated = await this.prisma.user.update({
        where: { id },
        data,
        include: { role: true },
      });

      const { passwordHash, ...result } = updated;
      return result;
    } catch (error) {
      console.error('PRISMA UPDATE ERROR:', error);
      throw error;
    }
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'User deactivated successfully' };
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { role: true, department: true },
    });
  }

  async findNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
