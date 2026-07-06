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
import { useContracts } from '@/hooks/useApi';
import { Contract } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import CreateContractForm from '@/components/forms/create-contract-form';
import { Plus, Search } from 'lucide-react';

const statusVariants: Record<string, 'default' | 'secondary' | 'outline' | 'success' | 'destructive' | 'warning'> = {
  draft: 'secondary',
  sent: 'default',
  signed: 'success',
  active: 'success',
  completed: 'outline',
  terminated: 'destructive',
};

const statuses = ['draft', 'sent', 'signed', 'active', 'completed', 'terminated'];

export default function ContractsPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading } = useContracts({ search, status: statusFilter });
  const contracts = data?.data || [];

  const columns = [
    {
      key: 'contractNumber',
      label: t('contracts.contractTitle'),
      sortable: true,
      render: (c: Contract) => <span className="font-medium">{c.contractNumber}</span>,
    },
    {
      key: 'client',
      label: t('contracts.client'),
      render: (c: Contract) => c.client?.name || '-',
    },
    {
      key: 'status',
      label: t('contracts.filterByStatus'),
      render: (c: Contract) => (
        <Badge variant={statusVariants[c.status] || 'secondary'} className="capitalize">
          {c.status}
        </Badge>
      ),
    },
    {
      key: 'totalValue',
      label: t('contracts.value'),
      sortable: true,
      render: (c: Contract) => (c.totalValue ? `$${c.totalValue.toLocaleString()}` : '-'),
    },
    {
      key: 'startDate',
      label: t('contracts.startDate'),
      render: (c: Contract) => c.startDate ? new Date(c.startDate).toLocaleDateString() : '-',
    },
    {
      key: 'endDate',
      label: t('contracts.endDate'),
      render: (c: Contract) => c.endDate ? new Date(c.endDate).toLocaleDateString() : '-',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('contracts.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('contracts.createContract')}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('contracts.createContract')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{t('contracts.createContract')}</DialogTitle>
              <DialogDescription>{t('contracts.noContractsDesc')}</DialogDescription>
            </DialogHeader>
            <CreateContractForm onSuccess={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
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
            <SelectValue placeholder={t('contracts.filterByStatus')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('contracts.allStatuses')}</SelectItem>
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
            data={contracts}
            onRowClick={(c) => router.push(`/contracts/${c.id}`)}
            loading={isLoading}
            emptyMessage={t('contracts.noContracts')}
          />
        </CardContent>
      </Card>
    </div>
  );
}
