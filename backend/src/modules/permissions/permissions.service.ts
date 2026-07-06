import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

const MODULE_ACTIONS = ['view', 'create', 'edit', 'delete'] as const;

export const ALL_MODULES: { resource: string; label: string; group: string; groupLabel: string; actions: string[] }[] = [
  { resource: 'dashboard', label: 'Dashboard', group: 'overview', groupLabel: 'Overview', actions: ['view'] },
  { resource: 'analytics', label: 'Analytics', group: 'overview', groupLabel: 'Overview', actions: ['view'] },
  { resource: 'reports', label: 'Reports', group: 'overview', groupLabel: 'Overview', actions: ['view'] },
  { resource: 'leads', label: 'CRM Pipeline', group: 'sales', groupLabel: 'Sales', actions: [...MODULE_ACTIONS] },
  { resource: 'clients', label: 'Clients', group: 'sales', groupLabel: 'Sales', actions: [...MODULE_ACTIONS] },
  { resource: 'proposals', label: 'Proposals', group: 'sales', groupLabel: 'Sales', actions: [...MODULE_ACTIONS] },
  { resource: 'contracts', label: 'Contracts', group: 'sales', groupLabel: 'Sales', actions: [...MODULE_ACTIONS] },
  { resource: 'invoices', label: 'Invoices', group: 'sales', groupLabel: 'Sales', actions: [...MODULE_ACTIONS] },
  { resource: 'tasks', label: 'Tasks', group: 'sales', groupLabel: 'Sales', actions: [...MODULE_ACTIONS] },
  { resource: 'projects', label: 'Projects', group: 'operations', groupLabel: 'Operations', actions: [...MODULE_ACTIONS] },
  { resource: 'campaigns', label: 'Campaigns', group: 'operations', groupLabel: 'Operations', actions: [...MODULE_ACTIONS] },
  { resource: 'deliverables', label: 'Deliverables', group: 'operations', groupLabel: 'Operations', actions: [...MODULE_ACTIONS] },
  { resource: 'meetings', label: 'Meetings', group: 'operations', groupLabel: 'Operations', actions: [...MODULE_ACTIONS] },
  { resource: 'time', label: 'Time Tracking', group: 'operations', groupLabel: 'Operations', actions: [...MODULE_ACTIONS] },
  { resource: 'strategy', label: 'Strategy', group: 'intelligence', groupLabel: 'Intelligence', actions: [...MODULE_ACTIONS] },
  { resource: 'kpis', label: 'KPIs', group: 'intelligence', groupLabel: 'Intelligence', actions: [...MODULE_ACTIONS] },
  { resource: 'knowledge', label: 'Knowledge Base', group: 'intelligence', groupLabel: 'Intelligence', actions: [...MODULE_ACTIONS] },
  { resource: 'communications', label: 'Communications', group: 'communications', groupLabel: 'Communications', actions: [...MODULE_ACTIONS] },
  { resource: 'calendar', label: 'Calendar', group: 'communications', groupLabel: 'Communications', actions: [...MODULE_ACTIONS] },
  { resource: 'notifications', label: 'Notifications', group: 'communications', groupLabel: 'Communications', actions: ['view'] },
  { resource: 'automation', label: 'Automation', group: 'system', groupLabel: 'System', actions: [...MODULE_ACTIONS] },
  { resource: 'audit', label: 'Audit Log', group: 'system', groupLabel: 'System', actions: ['view'] },
  { resource: 'users', label: 'Users', group: 'system', groupLabel: 'System', actions: [...MODULE_ACTIONS] },
  { resource: 'portal', label: 'Client Portal', group: 'system', groupLabel: 'System', actions: ['view'] },
];

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.permission.findMany({ orderBy: [{ resource: 'asc' }, { action: 'asc' }] });
  }

  async findAllGrouped() {
    const all = await this.findAll();
    const grouped: Record<string, { resource: string; label: string; group: string; groupLabel: string; permissions: { id: string; action: string; description: string | null }[] }> = {};

    const moduleMap = new Map(ALL_MODULES.map((m) => [m.resource, m]));

    for (const perm of all) {
      const info = moduleMap.get(perm.resource);
      if (!grouped[perm.resource]) {
        grouped[perm.resource] = {
          resource: perm.resource,
          label: info?.label || perm.resource,
          group: info?.group || 'other',
          groupLabel: info?.groupLabel || 'Other',
          permissions: [],
        };
      }
      grouped[perm.resource].permissions.push({
        id: perm.id,
        action: perm.action,
        description: perm.description,
      });
    }

    return Object.values(grouped).sort((a, b) => {
      const order = ['overview', 'sales', 'operations', 'intelligence', 'communications', 'system', 'other'];
      const ai = order.indexOf(a.group);
      const bi = order.indexOf(b.group);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
  }

  async getRolePermissions(roleId: string) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw new NotFoundException('Role not found');

    const perms = await this.prisma.rolePermission.findMany({
      where: { roleId },
      include: { permission: true },
    });

    return {
      role,
      permissions: perms.map((rp) => ({
        id: rp.permission.id,
        resource: rp.permission.resource,
        action: rp.permission.action,
      })),
      permissionIds: perms.map((rp) => rp.permission.id),
    };
  }

  async updateRolePermissions(roleId: string, permissionIds: string[]) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw new NotFoundException('Role not found');

    await this.prisma.rolePermission.deleteMany({ where: { roleId } });

    if (permissionIds.length > 0) {
      const existingPerms = await this.prisma.permission.findMany({
        where: { id: { in: permissionIds } },
      });
      if (existingPerms.length !== permissionIds.length) {
        throw new NotFoundException('One or more permissions not found');
      }
      await this.prisma.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({ roleId, permissionId })),
      });
    }

    return this.getRolePermissions(roleId);
  }

  async seed() {
    let created = 0;
    const allPermIds: string[] = [];

    for (const mod of ALL_MODULES) {
      for (const action of mod.actions) {
        const perm = await this.prisma.permission.upsert({
          where: { resource_action: { resource: mod.resource, action } },
          update: {},
          create: {
            resource: mod.resource,
            action,
            description: `Can ${action} ${mod.label}`,
          },
        });
        allPermIds.push(perm.id);
        created++;
      }
    }

    const fullAccessRoles = await this.prisma.role.findMany({
      where: { code: { in: ['su', 'admin', 'ceo'] } },
    });

    for (const role of fullAccessRoles) {
      const existing = await this.prisma.rolePermission.findMany({
        where: { roleId: role.id },
        select: { permissionId: true },
      });
      const existingIds = existing.map((e) => e.permissionId);
      const newPermIds = allPermIds.filter((id) => !existingIds.includes(id));
      if (newPermIds.length > 0) {
        await this.prisma.rolePermission.createMany({
          data: newPermIds.map((permissionId) => ({ roleId: role.id, permissionId })),
        });
      }
    }

    return { message: `Seeded ${created} permissions and assigned all to su, admin, ceo roles` };
  }

  async getRoles() {
    return this.prisma.role.findMany({ orderBy: { level: 'asc' } });
  }
}
