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
import { useCampaigns } from '@/hooks/useApi';
import { Campaign } from '@/types';
import { Plus, Search } from 'lucide-react';

const statusVariants: Record<string, 'default' | 'secondary' | 'outline' | 'success' | 'destructive' | 'warning'> = {
  planning: 'secondary',
  active: 'success',
  paused: 'warning',
  completed: 'outline',
  archived: 'default',
};

const statuses = ['planning', 'active', 'paused', 'completed', 'archived'];

export default function CampaignsPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useCampaigns({ search, status: statusFilter });
  const campaigns = data?.data || [];

  const columns = [
    {
      key: 'name',
      label: t('campaigns.campaignName'),
      sortable: true,
      render: (c: Campaign) => <span className="font-medium">{c.name}</span>,
    },
    {
      key: 'project',
      label: t('deliverables.project'),
      render: (c: Campaign) => c.project?.name || '-',
    },
    {
      key: 'objective',
      label: t('common.description'),
      render: (c: Campaign) => c.objective || '-',
    },
    {
      key: 'status',
      label: t('common.status'),
      render: (c: Campaign) => (
        <Badge variant={statusVariants[c.status] || 'secondary'} className="capitalize">
          {c.status}
        </Badge>
      ),
    },
    {
      key: 'budget',
      label: t('campaigns.budget'),
      sortable: true,
      render: (c: Campaign) => (c.budget ? `$${c.budget.toLocaleString()}` : '-'),
    },
    {
      key: 'startDate',
      label: t('campaigns.startDate'),
      render: (c: Campaign) => c.startDate ? new Date(c.startDate).toLocaleDateString() : '-',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('campaigns.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('campaigns.noCampaignsDesc')}</p>
        </div>
        <Button onClick={() => router.push('/campaigns/new')}>
          <Plus className="mr-2 h-4 w-4" />
          {t('campaigns.createCampaign')}
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
            <SelectItem value="all">{t('campaigns.allStatuses')}</SelectItem>
            {statuses.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={campaigns}
            onRowClick={(c) => router.push(`/campaigns/${c.id}`)}
            loading={isLoading}
            emptyMessage={t('campaigns.noCampaigns')}
          />
        </CardContent>
      </Card>
    </div>
  );
}
