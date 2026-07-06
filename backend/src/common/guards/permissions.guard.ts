import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    let userId: string | undefined;

    if (request.user?.id) {
      userId = request.user.id;
    } else {
      const authHeader = request.headers?.authorization;
      if (authHeader) {
        try {
          const token = authHeader.replace('Bearer ', '');
          const payload = this.jwtService.verify(token, {
            secret: this.configService.get<string>('JWT_SECRET'),
          });
          userId = payload.sub;
        } catch {
          throw new UnauthorizedException('Invalid token');
        }
      }
    }

    if (!userId) {
      throw new UnauthorizedException('Authentication required');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { roleId: true },
    });

    if (!user?.roleId) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const rolePerms = await this.prisma.rolePermission.findMany({
      where: { roleId: user.roleId },
      include: { permission: true },
    });

    const userPerms = rolePerms.map((rp) => `${rp.permission.resource}:${rp.permission.action}`);

    const hasAll = requiredPermissions.every((perm) => userPerms.includes(perm));
    if (!hasAll) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
