'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useClients, useUsers, useCreateProject } from '@/hooks/useApi';
import { getApiErrorMessage } from '@/lib/api';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function CreateProjectPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();
  const { data: clientsData, isLoading: clientsLoading } = useClients();
  const { data: usersData, isLoading: usersLoading } = useUsers();
  const createProject = useCreateProject();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState('');
  const [accountManagerId, setAccountManagerId] = useState('');
  const [priority, setPriority] = useState('medium');
  const [startDate, setStartDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [budget, setBudget] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const clients = clientsData?.data || [];
  const users = usersData?.data || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !clientId) return;
    setSubmitting(true);
    try {
      await createProject.mutateAsync({
        name,
        description,
        clientId,
        accountManagerId: accountManagerId || undefined,
        priority: priority as any,
        startDate: startDate || undefined,
        targetEndDate: deadline || undefined,
        budget: budget ? parseFloat(budget) : undefined,
      });
      toast({ title: t('projects.projectCreated'), description: t('projects.projectCreated') });
      router.push('/projects');
    } catch (err) {
      toast({ title: t('common.error'), description: getApiErrorMessage(err, t('common.operationFailed')), variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (clientsLoading || usersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('projects.createProject')}</h1>
          <p className="text-sm text-muted-foreground">{t('projects.projectDetails')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>{t('projects.projectDetails')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t('projects.projectName')} *</Label>
              <Input
                placeholder={t('projects.projectName')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>{t('common.description')}</Label>
              <textarea
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder={t('common.description')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('projects.client')} *</Label>
              <Select value={clientId} onValueChange={setClientId} required>
                <SelectTrigger>
                  <SelectValue placeholder={t('projects.client')} />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name} - {c.company}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('projects.accountManager')}</Label>
              <Select value={accountManagerId} onValueChange={setAccountManagerId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('projects.accountManager')} />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('common.priority')}</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low" className="capitalize">{t('tasks.low')}</SelectItem>
                  <SelectItem value="medium" className="capitalize">{t('tasks.medium')}</SelectItem>
                  <SelectItem value="high" className="capitalize">{t('tasks.high')}</SelectItem>
                  <SelectItem value="urgent" className="capitalize">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('common.startDate')}</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('projects.deadline')}</Label>
                <Input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('projects.budget')}</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between mt-6">
          <Button type="button" variant="outline" onClick={() => router.push('/projects')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={submitting || !name || !clientId}>
            {submitting ? (
              <>{t('common.saving')}</>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {t('projects.createProject')}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
