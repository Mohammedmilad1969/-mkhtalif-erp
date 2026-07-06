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
import { useInvoices } from '@/hooks/useApi';
import { Invoice } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import CreateInvoiceForm from '@/components/forms/create-invoice-form';
import { Plus, Search } from 'lucide-react';

const statusVariants: Record<string, 'default' | 'secondary' | 'outline' | 'success' | 'destructive'> = {
  draft: 'secondary',
  sent: 'default',
  paid: 'success',
  overdue: 'destructive',
  cancelled: 'outline',
};

const statuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];

export default function InvoicesPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading } = useInvoices({ search, status: statusFilter });
  const invoices = data?.data || [];

  const columns = [
    {
      key: 'invoiceNumber',
      label: t('invoices.invoiceNumber'),
      sortable: true,
      render: (inv: Invoice) => <span className="font-medium">{inv.invoiceNumber}</span>,
    },
    {
      key: 'client',
      label: t('invoices.client'),
      render: (inv: Invoice) => inv.client?.name || '-',
    },
    {
      key: 'totalAmount',
      label: t('invoices.amount'),
      sortable: true,
      render: (inv: Invoice) => (
        <span className="font-medium">{inv.currency} {inv.totalAmount.toLocaleString()}</span>
      ),
    },
    {
      key: 'status',
      label: t('invoices.filterByStatus'),
      render: (inv: Invoice) => (
        <Badge variant={statusVariants[inv.status] || 'secondary'} className="capitalize">
          {inv.status}
        </Badge>
      ),
    },
    {
      key: 'dueDate',
      label: t('invoices.dueDate'),
      sortable: true,
      render: (inv: Invoice) => inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '-',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('invoices.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('invoices.createInvoice')}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('invoices.createInvoice')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{t('invoices.createInvoice')}</DialogTitle>
              <DialogDescription>{t('invoices.noInvoicesDesc')}</DialogDescription>
            </DialogHeader>
            <CreateInvoiceForm onSuccess={() => setDialogOpen(false)} />
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
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder={t('invoices.filterByStatus')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('invoices.allStatuses')}</SelectItem>
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
            data={invoices}
            onRowClick={(inv) => router.push(`/invoices/${inv.id}`)}
            loading={isLoading}
            emptyMessage={t('invoices.noInvoices')}
          />
        </CardContent>
      </Card>
    </div>
  );
}
