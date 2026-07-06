'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import DataTable from '@/components/tables/data-table';
import { useClient, useProjects, useUpdateClient } from '@/hooks/useApi';
import { ClientStatus, Project } from '@/types';
import { ArrowLeft, Mail, Phone, Building2, Star, DollarSign, MessageSquareText, Calendar, Pencil, Check, X } from 'lucide-react';
import { CommunicationsTab } from '@/components/communications/communications-tab';
import { CreateEventDialog } from '@/components/calendar/create-event-dialog';
import { useToast } from '@/components/ui/use-toast';
import { getApiErrorMessage } from '@/lib/api';

const statusVariants: Record<string, 'success' | 'destructive' | 'secondary'> = {
  active: 'success',
  at_risk: 'destructive',
  churned: 'secondary',
};

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const { data: client, isLoading, error } = useClient(id);
  const { data: projectsData } = useProjects({ clientId: id });
  const updateClient = useUpdateClient();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', company: '', industry: '' });

  useEffect(() => {
    if (client) {
      setEditForm({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        company: client.company || '',
        industry: client.industry || '',
      });
    }
  }, [client]);

  const handleSave = () => {
    updateClient.mutate(
      { id, data: editForm },
      {
        onSuccess: () => { setEditing(false); toast({ title: 'Saved', description: 'Client info updated' }); },
        onError: (err) => toast({ title: 'Error', description: getApiErrorMessage(err, 'Failed to save'), variant: 'destructive' }),
      },
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load client</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/clients')}>Back to Clients</Button>
      </div>
    );
  }

  const projects = projectsData?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/clients')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{client.name}</h1>
            <Badge variant={statusVariants[client.status] || 'secondary'} className="capitalize">
              {client.status.replace('_', ' ')}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{client.company}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => editing ? handleSave() : setEditing(true)}>
          {editing ? <Check className="h-3.5 w-3.5 mr-1" /> : <Pencil className="h-3.5 w-3.5 mr-1" />}
          {editing ? 'Save' : 'Edit'}
        </Button>
        {editing && (
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setEditing(false)}>
            <X className="h-3.5 w-3.5 mr-1" /> Cancel
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Email</p>
              {editing ? (
                <Input className="h-7 text-xs mt-1" value={editForm.email} onChange={(e) => setEditForm(f => ({ ...f, email: e.target.value }))} />
              ) : (
                <p className="text-sm font-medium">{client.email || '-'}</p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Phone</p>
              {editing ? (
                <Input className="h-7 text-xs mt-1" value={editForm.phone} onChange={(e) => setEditForm(f => ({ ...f, phone: e.target.value }))} />
              ) : (
                <p className="text-sm font-medium">{client.phone || '-'}</p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Industry</p>
              {editing ? (
                <Input className="h-7 text-xs mt-1" value={editForm.industry} onChange={(e) => setEditForm(f => ({ ...f, industry: e.target.value }))} />
              ) : (
                <p className="text-sm font-medium">{client.industry || '-'}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Star className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-xs text-muted-foreground">Satisfaction Score</p>
              <p className="text-sm font-medium">{client.satisfactionScore != null ? `${client.satisfactionScore}/10` : 'N/A'}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-xs text-muted-foreground">Lifetime Value</p>
              <p className="text-sm font-medium">{client.lifetimeValue ? `$${client.lifetimeValue.toLocaleString()}` : 'N/A'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="communications"><MessageSquareText className="h-4 w-4 mr-1" />Communications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Client Information</CardTitle>
              <CreateEventDialog clientId={id}>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-1" /> Schedule Event
                </Button>
              </CreateEventDialog>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Client Name</span>
                {editing ? (
                  <Input className="h-7 text-xs" value={editForm.name} onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))} />
                ) : (
                  <p className="text-sm">{client.name}</p>
                )}
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Company</span>
                {editing ? (
                  <Input className="h-7 text-xs" value={editForm.company} onChange={(e) => setEditForm(f => ({ ...f, company: e.target.value }))} />
                ) : (
                  <p className="text-sm">{client.company || '-'}</p>
                )}
              </div>
              <div><span className="text-xs text-muted-foreground">Account Manager</span><p className="text-sm">{client.accountManager?.name || '-'}</p></div>
              <div><span className="text-xs text-muted-foreground">Created</span><p className="text-sm">{new Date(client.createdAt).toLocaleDateString()}</p></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <DataTable
                columns={[
                  { key: 'name', label: 'Name', render: (p) => <span className="font-medium">{p.name}</span> },
                  { key: 'status', label: 'Status', render: (p) => <Badge variant="secondary" className="capitalize">{p.status}</Badge> },
                ]}
                data={projects}
                onRowClick={(p) => router.push(`/projects/${p.id}`)}
                emptyMessage="No projects for this client"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="mt-6">
          <Card>
            <CardContent className="text-center py-8 text-muted-foreground">
              No invoices available
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contracts" className="mt-6">
          <Card>
            <CardContent className="text-center py-8 text-muted-foreground">
              No contracts available
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communications" className="mt-6">
          <CommunicationsTab clientId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
