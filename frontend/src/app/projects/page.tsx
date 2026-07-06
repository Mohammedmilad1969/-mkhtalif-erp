'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import DataTable from '@/components/tables/data-table';
import { Card, CardContent } from '@/components/ui/card';
import { useProjects } from '@/hooks/useApi';
import { Project, ProjectStatus, ProjectPriority } from '@/types';
import { Plus, Search } from 'lucide-react';

const statusVariants: Record<string, 'default' | 'secondary' | 'outline' | 'info' | 'success' | 'warning' | 'destructive'> = {
  onboarding: 'info',
  strategy: 'default',
  production: 'warning',
  active: 'success',
  on_hold: 'secondary',
  completed: 'outline',
};

const priorityVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'warning'> = {
  low: 'secondary',
  medium: 'default',
  high: 'destructive',
  urgent: 'destructive',
};

export default function ProjectsPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const { data, isLoading } = useProjects({ search, status: statusFilter, priority: priorityFilter });
  const projects = data?.data || [];

  const columns = [
    {
      key: 'name',
      label: t('projects.projectName'),
      sortable: true,
      render: (p: Project) => <span className="font-medium">{p.name}</span>,
    },
    {
      key: 'client',
      label: t('projects.client'),
      render: (p: Project) => p.client?.name || '-',
    },
    {
      key: 'status',
      label: t('common.status'),
      render: (p: Project) => (
        <Badge variant={statusVariants[p.status] || 'secondary'} className="capitalize">
          {p.status.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'priority',
      label: t('common.priority'),
      render: (p: Project) => (
        <Badge variant={priorityVariants[p.priority] || 'secondary'} className="capitalize">
          {p.priority}
        </Badge>
      ),
    },
    {
      key: 'accountManager',
      label: t('projects.teamMembers'),
      render: (p: Project) => p.accountManager?.name || '-',
    },
    {
      key: 'targetEndDate',
      label: t('projects.deadline'),
      render: (p: Project) => p.targetEndDate ? new Date(p.targetEndDate).toLocaleDateString() : '-',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('projects.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('projects.noProjectsDesc')}</p>
        </div>
        <Button onClick={() => router.push('/projects/new')}>
          <Plus className="mr-2 h-4 w-4" />
          {t('projects.createProject')}
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder={t('common.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('projects.allStatuses')}</SelectItem>
            {Object.values(ProjectStatus).map((s) => (
              <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder={t('common.priority')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            {Object.values(ProjectPriority).map((p) => (
              <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={projects}
            onRowClick={(p) => router.push(`/projects/${p.id}`)}
            loading={isLoading}
            emptyMessage={t('projects.noProjects')}
          />
        </CardContent>
      </Card>
    </div>
  );
}
