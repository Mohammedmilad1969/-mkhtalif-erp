'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import RevenueChart from '@/components/charts/revenue-chart';
import PipelineChart from '@/components/charts/pipeline-chart';
import LeadsTable from '@/components/tables/leads-table';
import { useLeads, usePipelineStats, useDashboardStats, useTasks, useTimeTotals, useDashboardWidgets, useSaveDashboardWidgets } from '@/hooks/useApi';
import { Task } from '@/types';
import { motion } from 'framer-motion';
import { AnimatePage, StaggerContainer, StaggerItem, FadeIn, SlideUp, ScaleIn } from '@/components/ui/motion';
import { CountUp } from '@/hooks/useCountUp';
import { useCelebration, CelebrationOverlay } from '@/components/ui/celebration';
import { WidgetCustomizer } from '@/components/dashboard/widget-customizer';
import { getDefaultWidgets, getWidgetDef } from '@/components/dashboard/widget-registry';
import {
  UserPlus, TrendingUp, Users, Clock, Timer, Thermometer, Target, BarChart3, Settings2,
  Calendar, DollarSign, Phone, CheckCircle, Activity,
} from 'lucide-react';
import Link from 'next/link';



export default function DashboardPage() {
  const router = useRouter();
  const [startDate] = useState('');
  const [endDate] = useState('');
  const celebration = useCelebration();
  const [customizerOpen, setCustomizerOpen] = useState(false);

  const { data: dashboardStats, isLoading: dashLoading } = useDashboardStats();
  const { data: leadsData, isLoading: leadsLoading } = useLeads({ limit: 5 });
  const { data: pipelineStats, isLoading: pipelineLoading } = usePipelineStats();
  const { data: tasksData } = useTasks({ limit: 5 });
  const { data: timeTotals } = useTimeTotals({ startDate, endDate });
  const { data: widgetSettings, isLoading: widgetsLoading } = useDashboardWidgets();
  const saveWidgets = useSaveDashboardWidgets();

  const recentLeads = leadsData?.data || [];
  const myTasks = tasksData?.data || [];
  const s = dashboardStats || {};
  const pipelineData = (pipelineStats || []).map((p: any) => ({
    name: p.name || p.code,
    value: p._count?.leads || p.count || 0,
  }));

  const today = timeTotals?.today ? `${Math.floor(timeTotals.today / 3600)}h ${Math.floor((timeTotals.today % 3600) / 60)}m` : '0h';
  const week = timeTotals?.week ? `${Math.floor(timeTotals.week / 3600)}h ${Math.floor((timeTotals.week % 3600) / 60)}m` : '0h';

  const activeWidgets = widgetSettings && widgetSettings.length > 0
    ? widgetSettings.filter((w) => w.isVisible).sort((a, b) => a.sortOrder - b.sortOrder)
    : getDefaultWidgets().filter((w) => w.isVisible);

  const handleSaveWidgets = useCallback(async (items: { widgetType: string; title: string; isVisible: boolean; sortOrder: number }[]) => {
    await saveWidgets.mutateAsync(items);
    setCustomizerOpen(false);
  }, [saveWidgets]);

  const workflowColors: Record<string, string> = {
    new_lead: 'bg-blue-500',
    contacted: 'bg-yellow-500',
    meeting_scheduled: 'bg-orange-500',
    proposal_sent: 'bg-purple-500',
    negotiation: 'bg-pink-500',
    won: 'bg-green-500',
  };

  const widgetRenderers: Record<string, () => JSX.Element | null> = {
    stats_row: () => (
      <StaggerContainer key="stats_row">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StaggerItem><StatCard title="Total Leads" value={s.totalLeads ?? '0'} icon={Users} loading={dashLoading} /></StaggerItem>
          <StaggerItem><StatCard title="Avg Score" value={`${s.averageScore ?? '0'}/10`} icon={Target} loading={dashLoading} /></StaggerItem>
          <StaggerItem><StatCard title="Hot Leads" value={s.leadsByTemperature?.hot ?? '0'} icon={Thermometer} trend="hot" loading={dashLoading} /></StaggerItem>
          <StaggerItem><StatCard title="Conversion" value={s.conversionRate ? `${s.conversionRate}%` : '0%'} icon={TrendingUp} loading={dashLoading} /></StaggerItem>
        </div>
      </StaggerContainer>
    ),

    quick_actions: () => (
      <FadeIn key="quick_actions" delay={0.2}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <QuickActionCard title="New Lead" description="Add a sales lead" icon={UserPlus} onClick={() => router.push('/crm')} />
          <QuickActionCard title="Pipeline" description="Kanban board" icon={BarChart3} onClick={() => router.push('/crm')} />
          <QuickActionCard title="Analytics" description="Full reports" icon={TrendingUp} onClick={() => router.push('/analytics')} />
          <QuickActionCard title="Log Time" description="Record hours" icon={Clock} onClick={() => router.push('/time-tracking')} />
        </div>
      </FadeIn>
    ),

    sales_workflow: () => (
      <div key="sales_workflow">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Sales Workflow
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashLoading ? (
              <div className="space-y-3">{[1,2,3,4,5,6].map((i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
            ) : (
              (s.salesWorkflow || []).map((sw: any) => (
                <div key={sw.code} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${workflowColors[sw.code] || 'bg-gray-400'}`} />
                  <span className="flex-1 text-sm capitalize">{sw.code.replace(/_/g, ' ')}</span>
                  <span className="text-lg font-bold">{sw.count}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    ),

    crm_activity: () => (
      <div key="crm_activity">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              CRM Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashLoading ? (
              <div className="space-y-3">{[1,2,3,4,5,6,7].map((i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Upcoming Meetings</span>
                  <span className="text-lg font-bold">{s.upcomingMeetings ?? 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Daily Follow-ups</span>
                  <span className="text-lg font-bold">{s.dailyFollowups ?? 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">New Clients (Month)</span>
                  <span className="text-lg font-bold text-green-600">{s.newClientsThisMonth ?? 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Clients</span>
                  <span className="text-lg font-bold">{s.activeClients ?? 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Leads</span>
                  <span className="text-lg font-bold">{s.totalLeads ?? 0}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    ),

    revenue_stats: () => (
      <div key="revenue_stats">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Revenue & Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashLoading ? (
              <div className="space-y-3">{[1,2,3].map((i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Monthly Revenue (Invoices)</span>
                  <span className="text-lg font-bold text-green-600">
                    {Number(s.monthlyRevenue ?? 0).toLocaleString()} LYD
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Opportunities Expected Revenue</span>
                  <span className="text-lg font-bold text-blue-600">
                    {Number(s.opportunitiesRevenue ?? 0).toLocaleString()} LYD
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pipeline Value</span>
                  <span className="text-lg font-bold">
                    {Number(s.pipelineValue ?? 0).toLocaleString()} LYD
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    ),

    revenue_chart: () => (
      <div key="revenue_chart" className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={s.revenueByMonth || [{ month: 'No data', revenue: 0 }]} />
          </CardContent>
        </Card>
      </div>
    ),

    pipeline_chart: () => (
      <div key="pipeline_chart">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Pipeline Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pipelineLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : pipelineData.length > 0 ? (
              <PipelineChart data={pipelineData} />
            ) : (
              <p className="text-center text-muted-foreground py-12">No pipeline data</p>
            )}
          </CardContent>
        </Card>
      </div>
    ),

    lead_temperature: () => (
      <div key="lead_temperature">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-primary" />
              Lead Temperature
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashLoading ? (
              <div className="space-y-3">{[1,2,3].map((i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-red-500 font-medium">Hot</span>
                    <span>{s.leadsByTemperature?.hot ?? 0}</span>
                  </div>
                  <Progress value={s.totalLeads ? ((s.leadsByTemperature?.hot ?? 0) / s.totalLeads) * 100 : 0} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-orange-500 font-medium">Warm</span>
                    <span>{s.leadsByTemperature?.warm ?? 0}</span>
                  </div>
                  <Progress value={s.totalLeads ? ((s.leadsByTemperature?.warm ?? 0) / s.totalLeads) * 100 : 0} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-500 font-medium">Cold</span>
                    <span>{s.leadsByTemperature?.cold ?? 0}</span>
                  </div>
                  <Progress value={s.totalLeads ? ((s.leadsByTemperature?.cold ?? 0) / s.totalLeads) * 100 : 0} className="h-2" />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    ),

    qualification_stats: () => (
      <div key="qualification_stats">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Qualification Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashLoading ? (
              <div className="space-y-3">{[1,2,3].map((i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Qualified Leads</span>
                  <span className="text-lg font-bold">{s.totalQualified ?? 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Qualification Rate</span>
                  <span className="text-lg font-bold">{s.qualificationRate ?? '0'}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Tasks</span>
                  <span className="text-lg font-bold">{s.activeTasks ?? 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Overdue Tasks</span>
                  <span className="text-lg font-bold text-destructive">{s.overdueTasks ?? 0}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    ),

    time_summary: () => (
      <div key="time_summary">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Time Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Today</span>
              <span className="font-semibold">{today}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Week</span>
              <span className="font-semibold">{week}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Billable %</span>
              <span className="font-semibold">{timeTotals?.billablePercent ?? 0}%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    ),

    quick_stats: () => (
      <div key="quick_stats">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Won Leads</span>
              <span className="font-semibold text-green-600">{s.wonLeads ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lost Leads</span>
              <span className="font-semibold text-destructive">{s.lostLeads ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Meetings Scheduled</span>
              <span className="font-semibold">{s.meetingsScheduled ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Proposals Sent</span>
              <span className="font-semibold">{s.proposalsSent ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pipeline Value</span>
              <span className="font-semibold">{Number(s.pipelineValue ?? 0).toLocaleString()} LYD</span>
            </div>
          </CardContent>
        </Card>
      </div>
    ),

    recent_leads: () => (
      <div key="recent_leads">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Leads</CardTitle>
            <Link href="/crm" className="text-sm text-primary hover:underline">View all</Link>
          </CardHeader>
          <CardContent>
            <LeadsTable data={recentLeads} loading={leadsLoading} />
          </CardContent>
        </Card>
      </div>
    ),

    my_tasks: () => (
      <div key="my_tasks">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Timer className="h-4 w-4" />
              My Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {myTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No pending tasks</p>
            ) : (
              <div className="space-y-2">
                {myTasks.slice(0, 5).map((task: Task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer" onClick={() => router.push(`/projects/${task.projectId}`)}>
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${task.status === 'todo' ? 'bg-gray-400' : task.status === 'in_progress' ? 'bg-blue-500' : task.status === 'review' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                      <div>
                        <p className="text-sm font-medium">{task.title}</p>
                        <p className="text-xs text-muted-foreground">{task.project?.name}</p>
                      </div>
                    </div>
                    <Badge variant={task.priority === 'urgent' ? 'destructive' : task.priority === 'high' ? 'warning' : 'default'} className="capitalize text-xs">
                      {task.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    ),
  };

  return (
    <AnimatePage>
      <CelebrationOverlay active={celebration.active} onComplete={celebration.dismiss} />

      <div className="space-y-6">
        <SlideUp>
          <div className="page-header">
            <div>
              <h1 className="page-title">Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome back! Here is your executive overview.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCustomizerOpen(true)} disabled={widgetsLoading}>
                <Settings2 className="h-4 w-4 mr-1" />
                Customize
              </Button>
            </div>
          </div>
        </SlideUp>

        {activeWidgets.map((widget, idx) => {
          const renderer = widgetRenderers[widget.widgetType];
          if (!renderer) return null;

          const isChartRow = widget.widgetType === 'revenue_chart' || widget.widgetType === 'pipeline_chart';
          const isFullWidth = widget.widgetType === 'stats_row' || widget.widgetType === 'quick_actions';

          if (isChartRow) {
            const chartWidgets = activeWidgets.filter((w) =>
              w.widgetType === 'revenue_chart' || w.widgetType === 'pipeline_chart');
            const chartIndex = chartWidgets.findIndex((w) => w.widgetType === widget.widgetType);
            if (chartIndex === 0) {
              return (
                <div key={`chart-row`} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {chartWidgets.map((w) => {
                    const r = widgetRenderers[w.widgetType];
                    return r ? r() : null;
                  })}
                </div>
              );
            }
            return null;
          }

          if (isFullWidth) {
            return <div key={widget.widgetType}>{renderer()}</div>;
          }

          const isInsightSection =
            ['lead_temperature', 'qualification_stats', 'time_summary', 'quick_stats', 'sales_workflow', 'crm_activity', 'revenue_stats'].includes(widget.widgetType);
          if (isInsightSection) {
            const insightWidgets = activeWidgets.filter((w) =>
              ['lead_temperature', 'qualification_stats', 'time_summary', 'quick_stats', 'sales_workflow', 'crm_activity', 'revenue_stats'].includes(w.widgetType));
            const insightIndex = insightWidgets.findIndex((w) => w.widgetType === widget.widgetType);
            if (insightIndex === 0) {
              return (
                <div key="insights-row" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {insightWidgets.map((w) => {
                    const r = widgetRenderers[w.widgetType];
                    return r ? r() : null;
                  })}
                </div>
              );
            }
            return null;
          }

          const isDataSection =
            widget.widgetType === 'recent_leads' || widget.widgetType === 'my_tasks';
          if (isDataSection) {
            const dataWidgets = activeWidgets.filter((w) =>
              w.widgetType === 'recent_leads' || w.widgetType === 'my_tasks');
            const dataIndex = dataWidgets.findIndex((w) => w.widgetType === widget.widgetType);
            if (dataIndex === 0) {
              return (
                <div key="data-row" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {dataWidgets.map((w) => {
                    const r = widgetRenderers[w.widgetType];
                    return r ? r() : null;
                  })}
                </div>
              );
            }
            return null;
          }

          return <div key={widget.widgetType}>{renderer()}</div>;
        })}
      </div>

      <WidgetCustomizer
        open={customizerOpen}
        onOpenChange={setCustomizerOpen}
        widgets={widgetSettings && widgetSettings.length > 0
          ? widgetSettings
          : getDefaultWidgets()
        }
        onSave={handleSaveWidgets}
        saving={saveWidgets.isPending}
      />
    </AnimatePage>
  );
}

function StatCard({ title, value, icon: Icon, trend, loading }: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-5">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    );
  }

  const valueStr = String(value ?? '');
  const numMatch = valueStr.match(/^([\d.]+)/);
  const numVal = numMatch ? parseFloat(numMatch[1]) : NaN;
  const suffix = numMatch ? valueStr.slice(numMatch[1].length) : valueStr;
  const isNumeric = !isNaN(numVal) && valueStr !== '';

  return (
    <ScaleIn>
    <Card className="group hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">
              {isNumeric ? <CountUp target={numVal} suffix={suffix} /> : valueStr}
            </p>
            {trend && (
              <p className={`text-xs capitalize animate-pulse ${trend === 'hot' ? 'text-red-500' : trend === 'warm' ? 'text-orange-500' : ''}`}>
                {trend}
              </p>
            )}
          </div>
          <motion.div
            className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Icon className="h-5 w-5 text-primary" />
          </motion.div>
        </div>
      </CardContent>
    </Card>
    </ScaleIn>
  );
}

function QuickActionCard({ title, description, icon: Icon, onClick }: { title: string; description: string; icon: React.ElementType; onClick: () => void }) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
