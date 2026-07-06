'use client';

import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useKpis } from '@/hooks/useApi';
import { Kpi } from '@/types';
import { TrendingUp, TrendingDown, DollarSign, Briefcase, Users, Target, Plus } from 'lucide-react';

const departments = [
  { id: 'executive', label: 'Executive' },
  { id: 'sales', label: 'Sales' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'production', label: 'Production' },
  { id: 'finance', label: 'Finance' },
  { id: 'operations', label: 'Operations' },
];

export default function KpisPage() {
  const { t } = useLanguage();
  const [activeDept, setActiveDept] = useState('executive');
  const { data, isLoading } = useKpis({ category: activeDept });
  const kpis = data?.data || [];

  const getKpiColor = (kpi: Kpi) => {
    const latestValue = kpi.values?.[kpi.values.length - 1];
    if (!latestValue || !kpi.targetValue) return 'bg-muted';
    const ratio = latestValue.value / kpi.targetValue;
    if (kpi.targetComparison === 'lower') {
      if (ratio <= 1) return 'bg-green-100 border-green-500 dark:bg-green-950';
      if (ratio <= 1.2) return 'bg-yellow-100 border-yellow-500 dark:bg-yellow-950';
      return 'bg-red-100 border-red-500 dark:bg-red-950';
    }
    if (ratio >= 1) return 'bg-green-100 border-green-500 dark:bg-green-950';
    if (ratio >= 0.8) return 'bg-yellow-100 border-yellow-500 dark:bg-yellow-950';
    return 'bg-red-100 border-red-500 dark:bg-red-950';
  };

  const getTrendIcon = (kpi: Kpi) => {
    const vals = kpi.values;
    if (!vals || vals.length < 2) return null;
    const trend = vals[vals.length - 1].value - vals[vals.length - 2].value;
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return null;
  };

  const getCurrentValue = (kpi: Kpi) => {
    const vals = kpi.values;
    if (!vals || vals.length === 0) return '-';
    return vals[vals.length - 1].value.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('kpis.title')}</h1>
          <p className="text-sm text-muted-foreground">Monitor key performance indicators</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-300" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('analytics.revenue')}</p>
              <p className="text-lg font-bold">$1.2M</p>
              <p className="text-xs text-green-600">+15% vs last month</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('dashboard.activeProjects')}</p>
              <p className="text-lg font-bold">24</p>
              <p className="text-xs text-blue-600">+3 this month</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <Users className="h-5 w-5 text-purple-600 dark:text-purple-300" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('clients.title')}</p>
              <p className="text-lg font-bold">48</p>
              <p className="text-xs text-purple-600">+2 this month</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
              <Target className="h-5 w-5 text-orange-600 dark:text-orange-300" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Satisfaction</p>
              <p className="text-lg font-bold">92%</p>
              <p className="text-xs text-orange-600">+2% vs target</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeDept} onValueChange={setActiveDept}>
        <TabsList className="flex-wrap">
          {departments.map((dept) => (
            <TabsTrigger key={dept.id} value={dept.id} className="capitalize">{dept.label}</TabsTrigger>
          ))}
        </TabsList>

        {departments.map((dept) => (
          <TabsContent key={dept.id} value={dept.id} className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : kpis.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>{t('kpis.noKpis')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {kpis.map((kpi) => (
                  <Card key={kpi.id} className={`border-l-4 ${getKpiColor(kpi)}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium">{kpi.name}</p>
                          <p className="text-xs text-muted-foreground">{kpi.code}</p>
                        </div>
                        {getTrendIcon(kpi)}
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold">{getCurrentValue(kpi)}</span>
                        <span className="text-sm text-muted-foreground">{kpi.unit}</span>
                      </div>
                      {kpi.targetValue && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">{t('kpis.target')}: {kpi.targetValue.toLocaleString()} {kpi.unit}</span>
                          <Badge variant={getKpiColor(kpi).includes('green') ? 'success' : getKpiColor(kpi).includes('yellow') ? 'warning' : 'destructive'} className="text-[10px] px-1.5 py-0">
                            {getKpiColor(kpi).includes('green') ? t('kpis.onTrack') : getKpiColor(kpi).includes('yellow') ? t('kpis.atRisk') : t('kpis.behind')}
                          </Badge>
                        </div>
                      )}
                      <div className="mt-3">
                        <Button variant="outline" size="sm" className="h-7 text-xs">
                          <Plus className="mr-1 h-3 w-3" /> {t('common.add')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
