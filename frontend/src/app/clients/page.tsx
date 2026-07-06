'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/hooks/useLanguage';
import { getApiErrorMessage } from '@/lib/api';
import DataTable from '@/components/tables/data-table';
import { useClients, useCreateClient } from '@/hooks/useApi';
import { Client, ClientStatus } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Search } from 'lucide-react';

const statusVariants: Record<string, 'success' | 'destructive' | 'secondary' | 'outline'> = {
  active: 'success',
  at_risk: 'destructive',
  churned: 'secondary',
};

export default function ClientsPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', industry: '', status: 'active' });

  const { data, isLoading } = useClients({ search, status: statusFilter });
  const clients = data?.data || [];
  const createClient = useCreateClient();

  const handleSubmit = () => {
    if (!form.name) return;
    createClient.mutate(form as any, {
      onSuccess: () => {
        toast({ title: t('clients.clientCreated'), description: `${form.name} ${t('clients.clientCreated')}` });
        setDialogOpen(false);
        setForm({ name: '', company: '', email: '', phone: '', industry: '', status: 'active' });
      },
      onError: (err) => {
        toast({ title: t('common.error'), description: getApiErrorMessage(err, t('common.operationFailed')), variant: 'destructive' });
      },
    });
  };

  const columns = [
    {
      key: 'name',
      label: t('common.name'),
      sortable: true,
      render: (c: Client) => <span className="font-medium">{c.name}</span>,
    },
    {
      key: 'company',
      label: t('clients.clientName'),
      sortable: true,
      render: (c: Client) => c.company || '-',
    },
    {
      key: 'industry',
      label: t('clients.industry'),
      render: (c: Client) => c.industry || '-',
    },
    {
      key: 'accountManager',
      label: t('common.assignedTo'),
      render: (c: Client) => c.accountManager?.name || '-',
    },
    {
      key: 'status',
      label: t('clients.status'),
      render: (c: Client) => (
        <Badge variant={statusVariants[c.status] || 'secondary'} className="capitalize">
          {c.status.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'lifetimeValue',
      label: t('clients.totalRevenue'),
      sortable: true,
      render: (c: Client) => (c.lifetimeValue ? `$${c.lifetimeValue.toLocaleString()}` : '-'),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('clients.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('clients.noClientsDesc')}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('clients.addClient')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('clients.createClient')}</DialogTitle>
              <DialogDescription>{t('clients.addClient')}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('common.name')} *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t('clients.clientName')} />
              </div>
              <div className="space-y-2">
                <Label>{t('clients.clientName')}</Label>
                <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder={t('clients.clientName')} />
              </div>
              <div className="space-y-2">
                <Label>{t('clients.email')}</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@company.com" />
              </div>
              <div className="space-y-2">
                <Label>{t('clients.phone')}</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 (555) 000-0000" />
              </div>
              <div className="space-y-2">
                <Label>{t('clients.industry')}</Label>
                <Input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} placeholder={t('clients.industry')} />
              </div>
              <div className="space-y-2">
                <Label>{t('clients.status')}</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ClientStatus).map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSubmit} className="w-full" disabled={createClient.isPending || !form.name}>
                {createClient.isPending ? t('common.loading') : t('clients.createClient')}
              </Button>
            </div>
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
            <SelectValue placeholder={t('clients.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('clients.filterByStatus')}</SelectItem>
            {Object.values(ClientStatus).map((s) => (
              <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={clients}
            onRowClick={(c) => router.push(`/clients/${c.id}`)}
            loading={isLoading}
            emptyMessage={t('clients.noClients')}
          />
        </CardContent>
      </Card>
    </div>
  );
}
