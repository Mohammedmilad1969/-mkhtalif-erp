'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend,
} from 'recharts';
import {
  TrendingUp, Download, DollarSign, Users, Target, Clock,
  FileText, Filter,
} from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function ReportsPage() {
  const [period, setPeriod] = useState('year');

  const { data: salesData } = useQuery({
    queryKey: ['report-sales', period],
    queryFn: () => get('/reports/sales', { period }),
  });

  const { data: financeData } = useQuery({
    queryKey: ['report-finance', period],
    queryFn: () => get('/reports/finance', { period }),
  });

  const { data: productionData } = useQuery({
    queryKey: ['report-production', period],
    queryFn: () => get('/reports/production', { period }),
  });

  const { data: executiveData } = useQuery({
    queryKey: ['report-executive', period],
    queryFn: () => get('/reports/executive', { period }),
  });

  const { data: profitabilityData } = useQuery({
    queryKey: ['report-profitability', period],
    queryFn: () => get('/reports/profitability', { period }),
  });

  const s: any = salesData || {};
  const f: any = financeData || {};
  const p: any = productionData || {};
  const e: any = executiveData || {};
  const profitData: any[] = (profitabilityData as any) || [];

  const revenueChartData = f.revenueByMonth
    ? Object.entries(f.revenueByMonth).map(([month, rev]) => ({
        month,
        revenue: (rev as any).revenue || 0,
        collection: (rev as any).collection || 0,
      }))
    : [];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground">Interactive dashboards across all departments</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={`$${Number(e.revenue || 0).toLocaleString()}`} icon={DollarSign} trend="up" />
        <StatCard title="Active Clients" value={String(e.newClients || 0)} icon={Users} />
        <StatCard title="Active Projects" value={String(e.activeProjects || 0)} icon={Target} />
        <StatCard title="Utilization" value={`${e.utilization || 0}%`} icon={Clock} />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Executive Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="production">Production</TabsTrigger>
          <TabsTrigger value="profitability">Profitability</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Revenue vs Collection</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
                    <Bar dataKey="collection" fill="#10b981" name="Collection" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <MetricRow label="Total Logged Hours" value={`${e.totalLoggedHours || 0}h`} />
                <MetricRow label="New Clients" value={String(e.newClients || 0)} />
                <MetricRow label="Active Users" value={String(e.activeUsers || 0)} />
                <MetricRow label="Utilization Rate" value={`${e.utilization || 0}%`} />
                <MetricRow label="Revenue per Client" value={`$${e.revenue && e.newClients ? Math.round(e.revenue / Math.max(e.newClients, 1)).toLocaleString() : '0'}`} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <MiniStatCard label="Total Leads" value={String(s.totalLeads || 0)} />
            <MiniStatCard label="Meetings" value={String(s.meetings || 0)} />
            <MiniStatCard label="Proposals" value={String(s.proposals || 0)} />
            <MiniStatCard label="Close Rate" value={`${s.closeRate || 0}%`} />
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sales Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { name: 'Leads', value: s.totalLeads || 0 },
                  { name: 'Meetings', value: s.meetings || 0 },
                  { name: 'Proposals', value: s.proposals || 0 },
                  { name: 'Won', value: s.won || 0 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                    {[0, 1, 2, 3].map((i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finance" className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <MiniStatCard label="Total Invoiced" value={`$${Number(f.totalInvoiced || 0).toLocaleString()}`} />
            <MiniStatCard label="Total Collected" value={`$${Number(f.totalCollected || 0).toLocaleString()}`} />
            <MiniStatCard label="Outstanding" value={`$${Number(f.outstanding || 0).toLocaleString()}`} />
            <MiniStatCard label="Overdue" value={`$${Number(f.overdueAmount || 0).toLocaleString()}`} />
          </div>
          {revenueChartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} name="Revenue" />
                    <Area type="monotone" dataKey="collection" stroke="#10b981" fill="#10b981" fillOpacity={0.1} name="Collection" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="production" className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <MiniStatCard label="Tasks Completed" value={String(p.tasksCompleted || 0)} />
            <MiniStatCard label="On-Time Rate" value={`${p.onTimeRate || 0}%`} />
            <MiniStatCard label="Deliverables" value={String(p.deliverablesCount || 0)} />
            <MiniStatCard label="Avg Revisions" value={String(p.avgRevisions || 0)} />
          </div>
        </TabsContent>

        <TabsContent value="profitability" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Client Profitability</CardTitle>
            </CardHeader>
            <CardContent>
              {profitData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No profitability data available</p>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={profitData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="clientName" width={150} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
                    <Bar dataKey="cost" fill="#ef4444" name="Cost" />
                    <Bar dataKey="profit" fill="#10b981" name="Profit" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend }: { title: string; value: string; icon: React.ElementType; trend?: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {trend && (
              <p className={`text-xs mt-1 ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {trend === 'up' ? '↑' : '↓'} {trend === 'up' ? '+12.5%' : '-3.2%'} vs last period
              </p>
            )}
          </div>
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MiniStatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
      </CardContent>
    </Card>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}
