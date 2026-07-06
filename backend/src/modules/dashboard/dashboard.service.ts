import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getWidgets(userId: string) {
    const widgets = await this.prisma.dashboardWidget.findMany({
      where: { userId },
      orderBy: { sortOrder: 'asc' },
    });
    return widgets;
  }

  async saveWidgets(userId: string, widgets: any[]) {
    await this.prisma.dashboardWidget.deleteMany({ where: { userId } });

    if (widgets.length > 0) {
      await this.prisma.dashboardWidget.createMany({
        data: widgets.map((w, i) => ({
          userId,
          widgetType: w.widgetType,
          title: w.title,
          config: w.config || {},
          gridPosition: w.gridPosition || { x: 0, y: i, w: 1, h: 1 },
          isVisible: w.isVisible !== false,
          sortOrder: i,
        })),
      });
    }

    return this.prisma.dashboardWidget.findMany({
      where: { userId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getStats() {
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday.getTime() + 86400000);
    const startOfWeek = new Date(now.getTime() - now.getDay() * 86400000);
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek.getTime() + 7 * 86400000);

    const [
      totalLeads,
      newLeadsThisMonth,
      hotLeads,
      warmLeads,
      coldLeads,
      wonLeads,
      lostLeads,
      meetingsScheduled,
      proposalsSent,
      scoreAgg,
      activitiesLast7Days,
      bySource,
      pipelineValue,
      monthlyLeads,
      activeTasks,
      overdueTasks,
      totalQualified,
      totalQualificationAttempts,
      salesWorkflow,
      upcomingMeetings,
      dailyFollowups,
      newClientsThisMonth,
      activeClients,
      monthlyRevenue,
      opportunitiesRevenue,
      revenueByMonth,
    ] = await Promise.all([
      this.prisma.lead.count(),
      this.prisma.lead.count({ where: { createdAt: { gte: firstOfMonth } } }),
      this.prisma.lead.count({ where: { leadTemperature: 'hot' } }),
      this.prisma.lead.count({ where: { leadTemperature: 'warm' } }),
      this.prisma.lead.count({ where: { leadTemperature: 'cold' } }),
      this.prisma.lead.count({ where: { stage: { code: 'won' } } }),
      this.prisma.lead.count({ where: { stage: { code: 'lost' } } }),
      this.prisma.lead.count({ where: { stage: { code: 'meeting_scheduled' } } }),
      this.prisma.lead.count({ where: { stage: { code: 'proposal_sent' } } }),
      this.prisma.lead.aggregate({ _avg: { leadScore: true } }),
      this.prisma.activity.count({ where: { createdAt: { gte: new Date(Date.now() - 86400000 * 7) } } }),
      this.prisma.lead.groupBy({ by: ['source'], _count: { id: true } }),
      this.prisma.lead.aggregate({ _sum: { dealValue: true } }),
      this.prisma.lead.count({ where: { createdAt: { gte: new Date(Date.now() - 86400000 * 30) } } }),
      this.prisma.leadTask.count({ where: { status: { not: 'completed' } } }),
      this.prisma.leadTask.count({ where: { status: { not: 'completed' }, dueDate: { lt: now } } }),
      this.prisma.leadQualification.count(),
      this.prisma.lead.count({ where: { leadScore: { not: null } } }),
      this.getSalesWorkflow(),
      this.getUpcomingMeetings(now),
      this.getDailyFollowups(startOfToday, endOfToday),
      this.prisma.client.count({ where: { createdAt: { gte: firstOfMonth } } }),
      this.prisma.client.count({ where: { status: 'active' } }),
      this.getMonthlyRevenue(firstOfMonth, now),
      this.getOpportunitiesRevenue(),
      this.getRevenueByMonth(),
    ]);

    return {
      totalLeads,
      newLeadsThisMonth,
      leadsByTemperature: { hot: hotLeads, warm: warmLeads, cold: coldLeads },
      wonLeads,
      lostLeads,
      conversionRate: totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : '0',
      meetingsScheduled,
      proposalsSent,
      averageScore: scoreAgg._avg.leadScore?.toFixed(1) || '0',
      activitiesLast7Days,
      bySource,
      pipelineValue: pipelineValue._sum.dealValue || 0,
      monthlyNewLeads: monthlyLeads,
      activeTasks,
      overdueTasks,
      totalQualified,
      qualificationRate: totalLeads > 0 ? ((totalQualified / totalLeads) * 100).toFixed(1) : '0',
      hotToWonRate: hotLeads > 0 ? ((wonLeads / (hotLeads + warmLeads + coldLeads)) * 100).toFixed(1) : '0',
      salesWorkflow,
      upcomingMeetings,
      dailyFollowups,
      newClientsThisMonth,
      activeClients,
      monthlyRevenue,
      opportunitiesRevenue,
      revenueByMonth,
    };
  }

  private async getRevenueByMonth() {
    const months: { month: string; revenue: number }[] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = d.toLocaleString('en-US', { month: 'short' });
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const result = await this.prisma.invoice.aggregate({
        _sum: { totalAmount: true },
        where: { status: 'paid', paidAt: { gte: start, lt: end } },
      });
      months.push({ month: monthStr, revenue: result._sum.totalAmount?.toNumber() || 0 });
    }
    return months;
  }

  private async getSalesWorkflow() {
    const pipelineCodes = ['new_lead', 'contacted', 'meeting_scheduled', 'proposal_sent', 'negotiation', 'won'];
    const stages = await this.prisma.pipelineStage.findMany({
      where: { code: { in: pipelineCodes } },
      include: { _count: { select: { leads: true } } },
    });
    return pipelineCodes.map((code) => {
      const stage = stages.find((s) => s.code === code);
      return { code, count: stage?._count.leads || 0 };
    });
  }

  private async getUpcomingMeetings(now: Date) {
    return this.prisma.meeting.count({
      where: { scheduledAt: { gte: now }, status: 'scheduled' },
    });
  }

  private async getDailyFollowups(startOfToday: Date, endOfToday: Date) {
    return this.prisma.leadTask.count({
      where: {
        dueDate: { gte: startOfToday, lt: endOfToday },
        status: { not: 'completed' },
        taskType: 'follow_up',
      },
    });
  }

  private async getMonthlyRevenue(firstOfMonth: Date, now: Date) {
    const result = await this.prisma.invoice.aggregate({
      _sum: { totalAmount: true },
      where: {
        status: 'paid',
        paidAt: { gte: firstOfMonth, lte: now },
      },
    });
    return result._sum.totalAmount || 0;
  }

  private async getOpportunitiesRevenue() {
    const result = await this.prisma.opportunity.aggregate({
      _sum: { value: true },
    });
    return result._sum.value || 0;
  }

  async getManagerDashboard() {
    const stats = await this.getStats();

    const userPerformance = await this.prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        _count: {
          select: {
            assignedLeads: true,
            activities: true,
            leadScores: true,
            leadQualifications: true,
          },
        },
      },
    });

    const leadTrends = await this.prisma.lead.groupBy({
      by: ['createdAt'],
      _count: { id: true },
      orderBy: { createdAt: 'asc' },
    });

    const monthlyTrends: Record<string, number> = {};
    for (const lead of leadTrends) {
      const month = lead.createdAt.toISOString().slice(0, 7);
      monthlyTrends[month] = (monthlyTrends[month] || 0) + lead._count.id;
    }

    return {
      ...stats,
      userPerformance: userPerformance.map((u) => ({
        id: u.id,
        name: `${u.firstName} ${u.lastName}`,
        leads: u._count.assignedLeads,
        activities: u._count.activities,
        scores: u._count.leadScores,
        qualifications: u._count.leadQualifications,
      })),
      monthlyTrends,
    };
  }
}
