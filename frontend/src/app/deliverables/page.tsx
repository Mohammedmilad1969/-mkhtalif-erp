'use client';

import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { getApiErrorMessage } from '@/lib/api';
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
import DataTable from '@/components/tables/data-table';
import { useDeliverables, useCreateDeliverable, useProjects } from '@/hooks/useApi';
import { Deliverable, DeliverableStatus, DeliverableType } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Upload } from 'lucide-react';

const statusVariants: Record<string, 'default' | 'secondary' | 'success' | 'destructive' | 'warning' | 'outline'> = {
  pending: 'secondary',
  in_review: 'warning',
  approved: 'success',
  rejected: 'destructive',
  delivered: 'default',
};

export default function DeliverablesPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', projectId: '', type: 'document', fileUrl: '' });

  const { data, isLoading } = useDeliverables({ type: typeFilter, status: statusFilter });
  const deliverables = data?.data || [];
  const createDeliverable = useCreateDeliverable();
  const { data: projectsData } = useProjects({ limit: '100' });
  const projects = projectsData?.data || [];

  const handleSubmit = () => {
    if (!form.name) return;
    createDeliverable.mutate(form as any, {
      onSuccess: () => {
        toast({ title: t('deliverables.deliverableCreated'), description: t('deliverables.deliverableCreated') });
        setDialogOpen(false);
        setForm({ name: '', projectId: '', type: 'document', fileUrl: '' });
      },
      onError: (err) => {
        toast({ title: t('common.error'), description: getApiErrorMessage(err, t('common.operationFailed')), variant: 'destructive' });
      },
    });
  };

  const columns = [
    {
      key: 'name',
      label: t('deliverables.deliverableName'),
      sortable: true,
      render: (d: Deliverable) => <span className="font-medium">{d.name}</span>,
    },
    {
      key: 'project',
      label: t('deliverables.project'),
      render: (d: Deliverable) => d.project?.name || '-',
    },
    {
      key: 'type',
      label: t('common.type'),
      render: (d: Deliverable) => (
        <Badge variant="secondary" className="capitalize">{d.type}</Badge>
      ),
    },
    {
      key: 'status',
      label: t('common.status'),
      render: (d: Deliverable) => (
        <Badge variant={statusVariants[d.status] || 'secondary'} className="capitalize">
          {d.status.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'version',
      label: 'Version',
      sortable: true,
      render: (d: Deliverable) => <span>v{d.version}</span>,
    },
    {
      key: 'revisionCount',
      label: 'Revisions',
      sortable: true,
      render: (d: Deliverable) => d.revisionCount,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('deliverables.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('deliverables.noDeliverablesDesc')}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              {t('deliverables.createDeliverable')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('deliverables.createDeliverable')}</DialogTitle>
              <DialogDescription>{t('deliverables.noDeliverablesDesc')}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('deliverables.deliverableName')} *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t('deliverables.deliverableName')} />
              </div>
              <div className="space-y-2">
                <Label>{t('deliverables.project')}</Label>
                <Select value={form.projectId} onValueChange={(v) => setForm({ ...form, projectId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('deliverables.project')} />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('common.type')}</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(DeliverableType).map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>File URL</Label>
                <Input value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} placeholder="https://..." />
              </div>
              <Button onClick={handleSubmit} className="w-full" disabled={createDeliverable.isPending || !form.name}>
                {createDeliverable.isPending ? t('common.saving') : t('deliverables.createDeliverable')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder={t('common.type')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            {Object.values(DeliverableType).map((t) => (
              <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder={t('common.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('deliverables.allStatuses')}</SelectItem>
            {Object.values(DeliverableStatus).map((s) => (
              <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={deliverables}
            loading={isLoading}
            emptyMessage={t('deliverables.noDeliverables')}
          />
        </CardContent>
      </Card>
    </div>
  );
}
