'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCampaign, useLaunchCampaign } from '@/hooks/useApi';
import { Campaign } from '@/types';
import { ArrowLeft, BarChart3, Play, Pause, Eye, MousePointerClick, TrendingUp } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const statusVariants: Record<string, 'default' | 'secondary' | 'outline' | 'success' | 'warning'> = {
  planning: 'secondary',
  active: 'success',
  paused: 'warning',
  completed: 'outline',
  archived: 'default',
};

export default function CampaignDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id;
  const { data: campaign, isLoading, error } = useCampaign(id);
  const launchCampaign = useLaunchCampaign();

  const handleLaunch = async () => {
    try {
      await launchCampaign.mutateAsync(id);
      toast({ title: 'Campaign launched', description: 'Campaign is now active' });
    } catch {
      toast({ title: 'Error', description: 'Failed to launch campaign', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load campaign</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/campaigns')}>Back to Campaigns</Button>
      </div>
    );
  }

  const canLaunch = campaign.status === 'planning' || campaign.status === 'paused';
  const metrics = campaign.metrics || [];
  const chartData = metrics.map((m) => ({
    date: new Date(m.date).toLocaleDateString(),
    impressions: m.impressions,
    clicks: m.clicks,
    conversions: m.conversions,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/campaigns')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{campaign.name}</h1>
            <Badge variant={statusVariants[campaign.status] || 'secondary'} className="capitalize">
              {campaign.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{campaign.project?.name} • {campaign.objective}</p>
        </div>
        {canLaunch && (
          <Button onClick={handleLaunch}>
            <Play className="mr-2 h-4 w-4" /> {campaign.status === 'paused' ? 'Resume' : 'Launch'}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={Eye} label="Impressions" value={metrics.reduce((s, m) => s + m.impressions, 0).toLocaleString()} />
        <StatCard icon={MousePointerClick} label="Clicks" value={metrics.reduce((s, m) => s + m.clicks, 0).toLocaleString()} />
        <StatCard icon={BarChart3} label="CTR" value={metrics.length > 0 ? `${((metrics.reduce((s, m) => s + m.clicks, 0) / metrics.reduce((s, m) => s + m.impressions, 1)) * 100).toFixed(2)}%` : '-'} />
        <StatCard icon={TrendingUp} label="Conversions" value={metrics.reduce((s, m) => s + m.conversions, 0).toLocaleString()} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Campaign Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Objective</span>
              <p className="font-medium">{campaign.objective || '-'}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Budget</span>
              <p className="font-medium">{campaign.budget ? `$${campaign.budget.toLocaleString()}` : '-'}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Start Date</span>
              <p className="font-medium">{campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : '-'}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">End Date</span>
              <p className="font-medium">{campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : '-'}</p>
            </div>
          </div>
          {campaign.channels && campaign.channels.length > 0 && (
            <div>
              <span className="text-sm text-muted-foreground">Channels</span>
              <div className="flex gap-2 mt-1 flex-wrap">
                {campaign.channels.map((ch, i) => (
                  <Badge key={i} variant="secondary">{ch}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--card-foreground))',
                    }}
                  />
                  <Bar dataKey="impressions" fill="hsl(var(--primary))" name="Impressions" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="clicks" fill="#10b981" name="Clicks" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="conversions" fill="#f59e0b" name="Conversions" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {metrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Conversion Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--card-foreground))',
                    }}
                  />
                  <Line type="monotone" dataKey="conversions" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} name="Conversions" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
