import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getSalesReport(startDate?: string, endDate?: string) {
    const dateFilter = this.dateFilter(startDate, endDate);
    const where: any = dateFilter ? { createdAt: dateFilter } : {};

    const [totalLeads, totalMeetings, totalProposals, wonProposals, totalRevenue] = await Promise.all([
      this.prisma.lead.count({ where }),
      this.prisma.meeting.count({ where: dateFilter ? { createdAt: dateFilter } : {} }),
      this.prisma.proposal.count({ where }),
      this.prisma.proposal.count({ where: { ...where, status: 'accepted' } }),
      this.prisma.proposal.aggregate({ where: { ...where, status: 'accepted' }, _sum: { totalValue: true } }),
    ]);

    return {
      totalLeads,
      totalMeetings,
      totalProposals,
      wonDeals: wonProposals,
      revenue: Number(totalRevenue._sum.totalValue || 0),
      closeRate: totalProposals > 0 ? Math.round((wonProposals / totalProposals) * 10000) / 100 : 0,
    };
  }

  async getProductionReport(startDate?: string, endDate?: string) {
    const dateFilter = this.dateFilter(startDate, endDate);
    const taskWhere = dateFilter ? { createdAt: dateFilter } : {};

    const [totalTasks, completedTasks, deliverables, totalDeliverables] = await Promise.all([
      this.prisma.task.count({ where: taskWhere }),
      this.prisma.task.count({ where: { ...taskWhere, status: 'delivered' } }),
      this.prisma.deliverable.findMany({ where: dateFilter ? { createdAt: dateFilter } : {}, select: { revisionCount: true, status: true } }),
      this.prisma.deliverable.count({ where: dateFilter ? { createdAt: dateFilter } : {} }),
    ]);

    const avgRevisions = deliverables.length > 0
      ? Math.round((deliverables.reduce((sum, d) => sum + d.revisionCount, 0) / deliverables.length) * 100) / 100
      : 0;

    const approvedDeliverables = deliverables.filter(d => d.status === 'approved').length;

    return {
      totalTasks,
      completedTasks,
      onTimeRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 10000) / 100 : 0,
      deliverables: totalDeliverables,
      approvedDeliverables,
      averageRevisions: avgRevisions,
    };
  }

  async getFinanceReport(startDate?: string, endDate?: string) {
    const dateFilter = this.dateFilter(startDate, endDate);
    const where = dateFilter ? { createdAt: dateFilter } : {};
    const overdueWhere: any = dateFilter ? { ...where, status: 'overdue' } : { status: 'overdue' };

    const now = new Date();
    const [totalInvoiced, totalCollected, overdueInvoices, overdueAmount, invoices] = await Promise.all([
      this.prisma.invoice.aggregate({ where, _sum: { totalAmount: true } }),
      this.prisma.payment.aggregate({ where: dateFilter ? { createdAt: dateFilter } : {}, _sum: { amount: true } }),
      this.prisma.invoice.count({ where: overdueWhere as any }),
      this.prisma.invoice.aggregate({ where: overdueWhere, _sum: { totalAmount: true } }),
      this.prisma.invoice.findMany({
        where: dateFilter || {},
        select: { totalAmount: true, dueDate: true, paidAt: true, createdAt: true },
      }),
    ]);

    const aging = [30, 60, 90, 120];
    const arAging: { bucket: string; value: number }[] = [];
    for (const days of aging) {
      const cutoff = new Date(now);
      cutoff.setDate(cutoff.getDate() - days);
      const result = await this.prisma.invoice.aggregate({
        where: { status: 'overdue', dueDate: { lte: cutoff } } as any,
        _sum: { totalAmount: true },
      });
      arAging.push({ bucket: `${days}+ days`, value: Number(result._sum?.totalAmount || 0) });
    }

    const months: Record<string, { month: string; invoiced: number; collected: number }> = {};
    for (const inv of invoices) {
      const key = `${inv.createdAt.getFullYear()}-${String(inv.createdAt.getMonth() + 1).padStart(2, '0')}`;
      if (!months[key]) months[key] = { month: key, invoiced: 0, collected: 0 };
      months[key].invoiced += Number(inv.totalAmount);
      if (inv.paidAt) months[key].collected += Number(inv.totalAmount);
    }
    const revenueVsCollection = Object.values(months).sort((a, b) => a.month.localeCompare(b.month));

    return {
      totalInvoiced: Number(totalInvoiced._sum.totalAmount || 0),
      totalCollected: Number(totalCollected._sum.amount || 0),
      outstanding: Number(totalInvoiced._sum.totalAmount || 0) - Number(totalCollected._sum.amount || 0),
      overdueInvoices,
      overdueAmount: Number(overdueAmount._sum?.totalAmount || 0),
      arAging,
      revenueVsCollection,
    };
  }

  async getExecutiveReport(startDate?: string, endDate?: string) {
    const dateFilter = this.dateFilter(startDate, endDate);
    const where = dateFilter ? { createdAt: dateFilter } : {};

    const [revenue, newClients, activeProjects, users, timeEntries] = await Promise.all([
      this.prisma.invoice.aggregate({ where: { ...where, status: 'paid' }, _sum: { totalAmount: true } }),
      this.prisma.client.count({ where }),
      this.prisma.project.count({ where: { status: { in: ['onboarding', 'strategy', 'production', 'active'] } } }),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.timeEntry.aggregate({ where: dateFilter ? { date: dateFilter } : {}, _sum: { duration: true } }),
    ]);

    const totalHours = timeEntries._sum.duration || 0;

    return {
      revenue: revenue._sum.totalAmount || 0,
      newClients,
      activeProjects,
      activeUsers: users,
      totalLoggedHours: totalHours,
      utilizationRate: users > 0 ? Math.round((totalHours / (users * 160)) * 10000) / 100 : 0,
    };
  }

  async getProfitabilityReport(startDate?: string, endDate?: string) {
    const dateFilter = this.dateFilter(startDate, endDate);

    const clients = await this.prisma.client.findMany({
      include: {
        projects: {
          include: {
            tasks: {
              include: { timeEntries: true },
            },
          },
        },
        invoices: {
          where: dateFilter ? { createdAt: dateFilter } : {},
          select: { totalAmount: true },
        },
      },
    });

    return clients.map(client => {
      let totalCosts = 0;
      const hourlyRate = 50;

      for (const project of client.projects) {
        for (const task of project.tasks) {
          for (const entry of task.timeEntries) {
            totalCosts += (entry.duration / 60) * hourlyRate;
          }
        }
      }

      const revenue = client.invoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
      const profit = revenue - totalCosts;
      const margin = revenue > 0 ? Math.round((profit / revenue) * 10000) / 100 : 0;

      return {
        clientId: client.id,
        clientName: client.name,
        company: client.company,
        revenue: Math.round(revenue * 100) / 100,
        costs: Math.round(totalCosts * 100) / 100,
        profit: Math.round(profit * 100) / 100,
        margin,
      };
    });
  }

  async getTimeReport(startDate?: string, endDate?: string) {
    const dateFilter = this.dateFilter(startDate, endDate);
    const where = dateFilter ? { date: dateFilter } : {};

    const entries = await this.prisma.timeEntry.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, departmentId: true, department: { select: { id: true, name: true } } } },
        task: { select: { id: true, title: true, projectId: true, project: { select: { id: true, name: true } } } },
      },
    });

    const byProject: Record<string, { projectName: string; totalMinutes: number }> = {};
    const byUser: Record<string, { userName: string; totalMinutes: number }> = {};
    const byDepartment: Record<string, { departmentName: string; totalMinutes: number }> = {};

    for (const entry of entries) {
      const projectId = entry.task?.projectId || 'unknown';
      if (!byProject[projectId]) {
        byProject[projectId] = { projectName: entry.task?.project?.name || 'Unknown', totalMinutes: 0 };
      }
      byProject[projectId].totalMinutes += entry.duration;

      if (!byUser[entry.userId]) {
        byUser[entry.userId] = {
          userName: `${entry.user.firstName} ${entry.user.lastName}`,
          totalMinutes: 0,
        };
      }
      byUser[entry.userId].totalMinutes += entry.duration;

      const deptId = entry.user.departmentId || 'unknown';
      if (!byDepartment[deptId]) {
        byDepartment[deptId] = {
          departmentName: entry.user.department?.name || 'No Department',
          totalMinutes: 0,
        };
      }
      byDepartment[deptId].totalMinutes += entry.duration;
    }

    const totalMinutes = entries.reduce((sum, e) => sum + e.duration, 0);

    const toHours = (minutes: number) => Math.round((minutes / 60) * 100) / 100;

    return {
      totalHours: toHours(totalMinutes),
      byProject: Object.fromEntries(
        Object.entries(byProject).map(([k, v]) => [k, { ...v, totalHours: toHours(v.totalMinutes) }]),
      ),
      byUser: Object.fromEntries(
        Object.entries(byUser).map(([k, v]) => [k, { ...v, totalHours: toHours(v.totalMinutes) }]),
      ),
      byDepartment: Object.fromEntries(
        Object.entries(byDepartment).map(([k, v]) => [k, { ...v, totalHours: toHours(v.totalMinutes) }]),
      ),
    };
  }

  async getClientReport(clientId: string, startDate?: string, endDate?: string) {
    const dateFilter = this.dateFilter(startDate, endDate);

    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      include: {
        projects: {
          include: {
            tasks: {
              include: { timeEntries: true },
              where: dateFilter ? { createdAt: dateFilter } : {},
            },
            deliverables: dateFilter ? { where: { createdAt: dateFilter } } : true,
          },
        },
        invoices: {
          where: dateFilter ? { createdAt: dateFilter } : {},
          include: { payments: true },
        },
        proposals: {
          where: dateFilter ? { createdAt: dateFilter } : {},
        },
      },
    });

    if (!client) {
      return { error: 'Client not found' };
    }

    const totalInvoiced = client.invoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
    const totalCollected = client.invoices.reduce((sum, inv) => sum + inv.payments.reduce((s, p) => s + Number(p.amount), 0), 0);
    const totalProjects = client.projects.length;
    const totalProposals = client.proposals.length;

    return {
      clientId: client.id,
      clientName: client.name,
      totalInvoiced,
      totalCollected,
      outstanding: totalInvoiced - totalCollected,
      totalProjects,
      totalProposals,
      projects: client.projects.map(p => ({
        id: p.id,
        name: p.name,
        status: p.status,
        taskCount: p.tasks.length,
        deliverableCount: p.deliverables.length,
      })),
    };
  }

  private dateFilter(startDate?: string, endDate?: string): any {
    if (!startDate && !endDate) return undefined;
    const filter: any = {};
    if (startDate) filter.gte = new Date(startDate);
    if (endDate) filter.lte = new Date(endDate);
    return filter;
  }
}
