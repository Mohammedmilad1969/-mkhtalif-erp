'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  useExecutiveReport,
  useSalesReport,
  useProductionReport,
  useFinanceReport,
  useProfitabilityReport,
  useTimeReport,
} from '@/hooks/useApi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  DollarSign,
  Users,
  Briefcase,
  TrendingUp,
  Activity,
  BarChart3,
  Clock,
  Wallet,
  LineChart,
  Target,
} from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function AnalyticsPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tab, setTab] = useState('executive');

  const params = { startDate, endDate };

  const { data: executive, isLoading: execLoading } = useExecutiveReport(params);
  const { data: sales, isLoading: salesLoading } = useSalesReport(params);
  const { data: production, isLoading: prodLoading } = useProductionReport(params);
  const { data: finance, isLoading: finLoading } = useFinanceReport(params);
  const { data: profitability, isLoading: profLoading } = useProfitabilityReport(params);
  const { data: timeData, isLoading: timeLoading } = useTimeReport(params);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="text-sm text-muted-foreground">Comprehensive business intelligence dashboard</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-[180px]"
        />
        <Input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-[180px]"
        />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="executive">Executive</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="production">Production</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="profitability">Profitability</TabsTrigger>
          <TabsTrigger value="time">Time</TabsTrigger>
        </TabsList>

        <TabsContent value="executive" className="mt-4 space-y-6">
          {execLoading ? <SkeletonGrid count={4} /> : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Revenue" value={executive?.revenue ? `$${Number(executive.revenue).toLocaleString()}` : '$0'} icon={DollarSign} />
                <StatCard title="New Clients" value={executive?.newClients ?? 0} icon={Users} />
                <StatCard title="Active Projects" value={executive?.activeProjects ?? 0} icon={Briefcase} />
                <StatCard title="Utilization" value={executive?.utilization ? `${executive.utilization}%` : '0%'} icon={Activity} />
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Revenue Trend
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  {executive?.revenueTrend ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={executive.revenueTrend}>
                        <defs>
                          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="url(#revGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : <EmptyChart />}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    KPI Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-72">
                  {executive?.kpiComparison ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={executive.kpiComparison}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <EmptyChart />}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="sales" className="mt-4 space-y-6">
          {salesLoading ? <SkeletonGrid count={4} /> : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Leads" value={sales?.totalLeads ?? 0} icon={Users} />
                <StatCard title="Meetings" value={sales?.meetings ?? 0} icon={Briefcase} />
                <StatCard title="Proposals" value={sales?.proposals ?? 0} icon={LineChart} />
                <StatCard title="Won" value={sales?.won ?? 0} icon={Target} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sales Funnel</CardTitle>
                  </CardHeader>
                  <CardContent className="h-72">
                    {sales?.funnel ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sales.funnel} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" />
                          <Tooltip />
                          <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : <EmptyChart />}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Close Rate</CardTitle>
                  </CardHeader>
                  <CardContent className="h-72 flex items-center justify-center">
                    {sales?.closeRate != null ? (
                      <div className="text-center">
                        <div className="text-5xl font-bold text-primary">{sales.closeRate}%</div>
                        <p className="text-muted-foreground mt-2">Overall Close Rate</p>
                      </div>
                    ) : <EmptyChart />}
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Revenue by Month</CardTitle>
                </CardHeader>
                <CardContent className="h-72">
                  {sales?.revenueByMonth ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sales.revenueByMonth}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <EmptyChart />}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="production" className="mt-4 space-y-6">
          {prodLoading ? <SkeletonGrid count={4} /> : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Tasks Completed" value={production?.tasksCompleted ?? 0} icon={Activity} />
                <StatCard title="On-Time Rate" value={production?.onTimeRate ? `${production.onTimeRate}%` : '0%'} icon={TrendingUp} />
                <StatCard title="Deliverables" value={production?.deliverablesCount ?? 0} icon={Briefcase} />
                <StatCard title="Avg Revisions" value={production?.avgRevisions ?? 0} icon={BarChart3} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Tasks Completed Over Time</CardTitle>
                  </CardHeader>
                  <CardContent className="h-72">
                    {production?.tasksTrend ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={production.tasksTrend}>
                          <defs><linearGradient id="taskGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} /><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient></defs>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="period" />
                          <YAxis />
                          <Tooltip />
                          <Area type="monotone" dataKey="completed" stroke="#8b5cf6" fill="url(#taskGrad)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : <EmptyChart />}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">On-Time Delivery %</CardTitle>
                  </CardHeader>
                  <CardContent className="h-72">
                    {production?.onTimeRate != null ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={[
                            { name: 'On Time', value: production.onTimeRate },
                            { name: 'Delayed', value: 100 - production.onTimeRate },
                          ]} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label>
                            {COLORS.slice(0, 2).map((c, i) => <Cell key={i} fill={c} />)}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : <EmptyChart />}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="finance" className="mt-4 space-y-6">
          {finLoading ? <SkeletonGrid count={3} /> : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="Total Invoiced" value={finance?.totalInvoiced ? `$${Number(finance.totalInvoiced).toLocaleString()}` : '$0'} icon={Wallet} />
                <StatCard title="Total Collected" value={finance?.totalCollected ? `$${Number(finance.totalCollected).toLocaleString()}` : '$0'} icon={DollarSign} />
                <StatCard title="Overdue" value={finance?.overdue ? `$${Number(finance.overdue).toLocaleString()}` : '$0'} icon={Clock} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Revenue vs Collection</CardTitle>
                  </CardHeader>
                  <CardContent className="h-72">
                    {finance?.revenueVsCollection ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={finance.revenueVsCollection}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="invoiced" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="collected" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : <EmptyChart />}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">AR Aging</CardTitle>
                  </CardHeader>
                  <CardContent className="h-72">
                    {finance?.arAging ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={finance.arAging} cx="50%" cy="50%" outerRadius={100} dataKey="value" nameKey="bucket" label>
                            {finance.arAging.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : <EmptyChart />}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="profitability" className="mt-4 space-y-6">
          {profLoading ? <SkeletonGrid count={1} /> : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Client Profitability</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {profitability && profitability.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Client</th>
                            <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Revenue</th>
                            <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Cost</th>
                            <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Profit</th>
                            <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Margin</th>
                          </tr>
                        </thead>
                        <tbody>
                          {profitability.map((row: any, i: number) => (
                            <tr key={i} className="border-b last:border-0 hover:bg-muted/50">
                              <td className="py-3 px-4 text-sm font-medium">{row.clientName}</td>
                              <td className="py-3 px-4 text-sm text-right">${Number(row.revenue).toLocaleString()}</td>
                              <td className="py-3 px-4 text-sm text-right">${Number(row.cost).toLocaleString()}</td>
                              <td className="py-3 px-4 text-sm text-right">${Number(row.profit).toLocaleString()}</td>
                              <td className="py-3 px-4 text-sm text-right">
                                <Badge variant={row.margin >= 30 ? 'success' : row.margin >= 15 ? 'warning' : 'destructive'}>
                                  {row.margin}%
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">No profitability data available</div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Clients by Revenue</CardTitle>
                </CardHeader>
                <CardContent className="h-72">
                  {profitability && profitability.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={profitability.slice(0, 10)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="clientName" type="category" width={120} />
                        <Tooltip />
                        <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <EmptyChart />}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="time" className="mt-4 space-y-6">
          {timeLoading ? <SkeletonGrid count={1} /> : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Hours by Project</CardTitle>
                </CardHeader>
                <CardContent className="h-72">
                  {timeData && timeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={timeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="projectName" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="totalHours" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Total Hours" />
                        <Bar dataKey="billableHours" fill="#10b981" radius={[4, 4, 0, 0]} name="Billable Hours" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <EmptyChart />}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ title, value, icon: Icon }: { title: string; value: string | number; icon: React.ElementType }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SkeletonGrid({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-5">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-32 mb-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex items-center justify-center h-full text-muted-foreground">
      <p>No data available for this period</p>
    </div>
  );
}
