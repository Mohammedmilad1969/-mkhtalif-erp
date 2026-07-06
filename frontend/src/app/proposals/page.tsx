'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { useLanguage } from '@/hooks/useLanguage';
import DataTable from '@/components/tables/data-table';
import { Card, CardContent } from '@/components/ui/card';
import { useProposals } from '@/hooks/useApi';
import { Proposal } from '@/types';
import { Plus, Search } from 'lucide-react';

const statusVariants: Record<string, string> = {
  draft: 'secondary',
  internal_review: 'default',
  sent: 'default',
  presented: 'info',
  accepted: 'success',
  rejected: 'destructive',
  revision: 'warning',
};

const statuses = ['draft', 'internal_review', 'sent', 'presented', 'accepted', 'rejected', 'revision'];

export default function ProposalsPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useProposals({ search, status: statusFilter });
  const proposals = data?.data || [];

  const columns = [
    {
      key: 'title',
      label: t('proposals.proposalTitle'),
      sortable: true,
      render: (p: Proposal) => <span className="font-medium">{p.title}</span>,
    },
    {
      key: 'client',
      label: t('proposals.client'),
      render: (p: Proposal) => p.client?.name || '-',
    },
    {
      key: 'totalValue',
      label: t('proposals.totalAmount'),
      sortable: true,
      render: (p: Proposal) => (p.totalValue ? `${p.currency || '$'}${p.totalValue.toLocaleString()}` : '-'),
    },
    {
      key: 'status',
      label: t('common.status'),
      render: (p: Proposal) => (
        <Badge variant={statusVariants[p.status] || 'secondary'} className="capitalize">
          {p.status.replace(/_/g, ' ')}
        </Badge>
      ),
    },
    {
      key: 'owner',
      label: t('common.assignedTo'),
      render: (p: Proposal) => p.owner?.name || '-',
    },
    {
      key: 'createdAt',
      label: t('common.createdAt'),
      sortable: true,
      render: (p: Proposal) => new Date(p.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('proposals.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('proposals.createProposal')}</p>
        </div>
        <Button onClick={() => router.push('/proposals/create')}>
          <Plus className="mr-2 h-4 w-4" />
          {t('proposals.createProposal')}
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
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t('common.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('proposals.allStatuses')}</SelectItem>
            {statuses.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={proposals}
            onRowClick={(p) => router.push(`/proposals/${p.id}`)}
            loading={isLoading}
            emptyMessage={t('proposals.noProposals')}
          />
        </CardContent>
      </Card>
    </div>
  );
}
