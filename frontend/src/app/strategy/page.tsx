'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import DataTable from '@/components/tables/data-table';
import { useResearchReports, useStrategicBlueprints, useCreativeBriefs } from '@/hooks/useApi';
import { ResearchReport, StrategicBlueprint, CreativeBrief } from '@/types';
import { Plus, FileText, BookOpen, PenLine } from 'lucide-react';

const reportStatusVariants: Record<string, 'default' | 'secondary' | 'outline' | 'info' | 'success' | 'warning'> = {
  draft: 'secondary',
  in_review: 'warning',
  completed: 'success',
  archived: 'outline',
};

export default function StrategyPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [tab, setTab] = useState('reports');

  const { data: reportsData, isLoading: reportsLoading } = useResearchReports();
  const { data: blueprintsData, isLoading: blueprintsLoading } = useStrategicBlueprints();
  const { data: briefsData, isLoading: briefsLoading } = useCreativeBriefs();

  const reports = reportsData?.data || [];
  const blueprints = blueprintsData?.data || [];
  const briefs = briefsData?.data || [];

  const reportColumns = [
    { key: 'title', label: t('common.name'), sortable: true, render: (r: ResearchReport) => <span className="font-medium">{r.title}</span> },
    { key: 'project', label: t('deliverables.project'), render: (r: ResearchReport) => r.project?.name || '-' },
    { key: 'status', label: t('common.status'), render: (r: ResearchReport) => (
      <Badge variant={reportStatusVariants[r.status] || 'secondary'} className="capitalize">
        {r.status.replace('_', ' ')}
      </Badge>
    )},
    { key: 'createdBy', label: t('common.name'), render: (r: ResearchReport) => r.createdBy?.name || '-' },
    { key: 'createdAt', label: t('common.createdAt'), sortable: true, render: (r: ResearchReport) => new Date(r.createdAt).toLocaleDateString() },
  ];

  const blueprintColumns = [
    { key: 'title', label: t('common.name'), sortable: true, render: (b: StrategicBlueprint) => <span className="font-medium">{b.title}</span> },
    { key: 'project', label: t('deliverables.project'), render: (b: StrategicBlueprint) => b.project?.name || '-' },
    { key: 'status', label: t('common.status'), render: (b: StrategicBlueprint) => (
      <Badge variant={reportStatusVariants[b.status] || 'secondary'} className="capitalize">
        {b.status.replace('_', ' ')}
      </Badge>
    )},
    { key: 'createdAt', label: t('common.createdAt'), sortable: true, render: (b: StrategicBlueprint) => new Date(b.createdAt).toLocaleDateString() },
  ];

  const briefColumns = [
    { key: 'title', label: t('common.name'), sortable: true, render: (c: CreativeBrief) => <span className="font-medium">{c.title}</span> },
    { key: 'project', label: t('deliverables.project'), render: (c: CreativeBrief) => c.project?.name || '-' },
    { key: 'status', label: t('common.status'), render: (c: CreativeBrief) => (
      <Badge variant={reportStatusVariants[c.status] || 'secondary'} className="capitalize">
        {c.status.replace('_', ' ')}
      </Badge>
    )},
    { key: 'createdAt', label: t('common.createdAt'), sortable: true, render: (c: CreativeBrief) => new Date(c.createdAt).toLocaleDateString() },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('strategy.title')}</h1>
          <p className="text-sm text-muted-foreground">Research reports, strategic blueprints, and creative briefs</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {t('strategy.reports')}
          </TabsTrigger>
          <TabsTrigger value="blueprints" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            {t('strategy.blueprints')}
          </TabsTrigger>
          <TabsTrigger value="briefs" className="flex items-center gap-2">
            <PenLine className="h-4 w-4" />
            {t('strategy.briefs')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => router.push('/strategy/reports/new')}>
              <Plus className="mr-2 h-4 w-4" />
              {t('strategy.createReport')}
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <DataTable
                columns={reportColumns}
                data={reports}
                onRowClick={(r) => router.push(`/strategy/reports/${r.id}`)}
                loading={reportsLoading}
                emptyMessage={t('common.noData')}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blueprints" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => router.push('/strategy/blueprints/new')}>
              <Plus className="mr-2 h-4 w-4" />
              {t('strategy.createBlueprint')}
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <DataTable
                columns={blueprintColumns}
                data={blueprints}
                onRowClick={(b) => router.push(`/strategy/blueprints/${b.id}`)}
                loading={blueprintsLoading}
                emptyMessage={t('common.noData')}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="briefs" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => router.push('/strategy/briefs/new')}>
              <Plus className="mr-2 h-4 w-4" />
              {t('strategy.createBrief')}
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <DataTable
                columns={briefColumns}
                data={briefs}
                onRowClick={(c) => router.push(`/strategy/briefs/${c.id}`)}
                loading={briefsLoading}
                emptyMessage={t('common.noData')}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
