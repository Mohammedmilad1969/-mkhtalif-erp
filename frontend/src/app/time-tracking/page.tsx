'use client';

import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import DataTable from '@/components/tables/data-table';
import { useTimeEntries, useTimeTotals, useCreateTimeEntry, useTasks, useUsers } from '@/hooks/useApi';
import { TimeEntry, Task } from '@/types';
import { Plus, Clock, Timer, DollarSign, CalendarDays } from 'lucide-react';

export default function TimeTrackingPage() {
  const { t } = useLanguage();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [userId, setUserId] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading } = useTimeEntries({ startDate, endDate, userId });
  const { data: totals } = useTimeTotals({ startDate, endDate });
  const { data: tasksData } = useTasks({ limit: 200 });
  const { data: usersData } = useUsers({ limit: 200 });
  const createTimeEntry = useCreateTimeEntry();

  const entries = data?.data || [];
  const tasks = tasksData?.data || [];
  const users = usersData?.data || [];

  const [formTask, setFormTask] = useState('');
  const [formDuration, setFormDuration] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formDescription, setFormDescription] = useState('');
  const [formBillable, setFormBillable] = useState(true);

  const handleSubmit = () => {
    if (!formTask || !formDuration || !formDate) return;
    const [h, m] = formDuration.split(':').map(Number);
    const duration = (h || 0) * 3600 + (m || 0) * 60;
    createTimeEntry.mutate(
      { taskId: formTask, duration, date: formDate, description: formDescription, billable: formBillable },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setFormTask('');
          setFormDuration('');
          setFormDate(new Date().toISOString().split('T')[0]);
          setFormDescription('');
          setFormBillable(true);
        },
      }
    );
  };

  const columns = [
    {
      key: 'task',
      label: t('timeTracking.task'),
      render: (e: TimeEntry) => <span className="font-medium">{e.task?.title || e.taskId}</span>,
    },
    {
      key: 'project',
      label: t('timeTracking.project'),
      render: (e: TimeEntry) => e.task?.project?.name || '-',
    },
    {
      key: 'user',
      label: 'User',
      render: (e: TimeEntry) => e.user?.name || '-',
    },
    {
      key: 'duration',
      label: t('timeTracking.hours'),
      render: (e: TimeEntry) => {
        const h = Math.floor(e.duration / 3600);
        const m = Math.floor((e.duration % 3600) / 60);
        return `${h}h ${m}m`;
      },
    },
    {
      key: 'date',
      label: t('timeTracking.date'),
      render: (e: TimeEntry) => new Date(e.date).toLocaleDateString(),
    },
    {
      key: 'billable',
      label: 'Billable',
      render: (e: TimeEntry) => (
        <Badge variant={e.billable ? 'success' : 'secondary'}>
          {e.billable ? 'Billable' : 'Non-billable'}
        </Badge>
      ),
    },
    {
      key: 'description',
      label: t('timeTracking.description'),
      render: (e: TimeEntry) => <span className="text-muted-foreground text-xs">{e.description || '-'}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('timeTracking.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('timeTracking.noEntriesDesc')}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('timeTracking.logTime')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('timeTracking.logTime')}</DialogTitle>
              <DialogDescription>{t('timeTracking.noEntriesDesc')}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('timeTracking.task')}</Label>
                <Select value={formTask} onValueChange={setFormTask}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('timeTracking.task')} />
                  </SelectTrigger>
                  <SelectContent>
                    {tasks.map((t: Task) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.title} — {t.project?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('timeTracking.hours')} (hh:mm)</Label>
                <Input
                  placeholder="1:30"
                  value={formDuration}
                  onChange={(e) => setFormDuration(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('timeTracking.date')}</Label>
                <Input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('timeTracking.description')}</Label>
                <Input
                  placeholder={t('timeTracking.description')}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="billable"
                  checked={formBillable}
                  onChange={(e) => setFormBillable(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="billable">Billable</Label>
              </div>
              <Button onClick={handleSubmit} className="w-full" disabled={createTimeEntry.isPending}>
                {createTimeEntry.isPending ? t('common.saving') : t('common.save')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t('timeTracking.weekly')}</p>
                <p className="text-2xl font-bold">
                  {totals?.week ? `${Math.floor(totals.week / 3600)}h ${Math.floor((totals.week % 3600) / 60)}m` : '0h'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t('timeTracking.monthly')}</p>
                <p className="text-2xl font-bold">
                  {totals?.month ? `${Math.floor(totals.month / 3600)}h ${Math.floor((totals.month % 3600) / 60)}m` : '0h'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CalendarDays className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Billable %</p>
                <p className="text-2xl font-bold">{totals?.billablePercent ?? 0}%</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Active Timers</p>
                <p className="text-2xl font-bold">{totals?.activeTimers ?? 0}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Timer className="h-5 w-5 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-[180px]"
          placeholder={t('common.startDate')}
        />
        <Input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-[180px]"
          placeholder={t('common.endDate')}
        />
        <Select value={userId} onValueChange={setUserId}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('common.all')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            {users.map((u: any) => (
              <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={entries}
            loading={isLoading}
            emptyMessage={t('timeTracking.noEntries')}
          />
        </CardContent>
      </Card>
    </div>
  );
}
