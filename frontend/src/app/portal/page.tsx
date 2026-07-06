'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useClients, useClientPortalDashboard } from '@/hooks/useApi';
import {
  CheckCircle, Clock, FileText, AlertTriangle, Download, Eye,
  Briefcase, DollarSign, FileSignature, TrendingUp, Users,
} from 'lucide-react';

export default function ClientPortalPage() {
  const [selectedClientId, setSelectedClientId] = useState('');
  const { data: clientsData } = useClients({ limit: 200 });
  const { data: dashboard, isLoading } = useClientPortalDashboard(selectedClientId);

  const clients = clientsData?.data || [];
  const client = dashboard;

  const projects = client?.projects || [];
  const invoices = client?.invoices || [];
  const proposals = client?.proposals || [];
  const contracts = client?.contracts || [];

  const deliverables = projects.flatMap((p: any) =>
    (p.deliverables || []).map((d: any) => ({ ...d, projectName: p.name }))
  );

  const pendingApprovals = deliverables.filter(
    (d: any) => d.status === 'in_review' || d.status === 'pending'
  );

  const projectProgress = (p: any) => {
    const total = p.tasks?.length || 1;
    const done = p.tasks?.filter((t: any) => t.status === 'completed').length || 0;
    return Math.round((done / total) * 100);
  };

  const totalInvoiced = invoices.reduce((sum: number, inv: any) => sum + (inv.amount || 0), 0);
  const totalPaid = invoices.reduce(
    (sum: number, inv: any) => sum + (inv.payments || []).reduce((s: number, p: any) => s + (p.amount || 0), 0),
    0,
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6 border">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              {client ? `${client.name}'s Portal` : 'Client Portal'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {client
                ? 'Track projects, invoices, proposals, and contracts'
                : 'Select a client to view their portal dashboard'}
            </p>
          </div>
          <div className="w-64">
            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
              <SelectTrigger>
                <Users className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Select client..." />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {!selectedClientId ? (
        <div className="text-center py-16">
          <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
          <h2 className="text-lg font-semibold mb-2">Select a Client</h2>
          <p className="text-sm text-muted-foreground">
            Choose a client from the dropdown above to view their portal dashboard
          </p>
        </div>
      ) : isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1,2,3,4].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      ) : !client ? (
        <div className="text-center py-16">
          <AlertTriangle className="h-12 w-12 mx-auto text-destructive/60 mb-4" />
          <h2 className="text-lg font-semibold mb-2">Client Not Found</h2>
          <p className="text-sm text-muted-foreground">
            Could not load portal data for this client
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Briefcase className="h-8 w-8 text-primary/60" />
                <div>
                  <p className="text-2xl font-bold">{projects.length}</p>
                  <p className="text-xs text-muted-foreground">Active Projects</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-green-500/60" />
                <div>
                  <p className="text-2xl font-bold">${totalInvoiced.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Invoiced</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <FileSignature className="h-8 w-8 text-blue-500/60" />
                <div>
                  <p className="text-2xl font-bold">{proposals.length}</p>
                  <p className="text-xs text-muted-foreground">Active Proposals</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-emerald-500/60" />
                <div>
                  <p className="text-2xl font-bold">{contracts.length}</p>
                  <p className="text-xs text-muted-foreground">Contracts</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">Project Progress</h2>
            {projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((project: any) => {
                  const progress = projectProgress(project);
                  const statusText = progress >= 100 ? 'Complete' : progress >= 75 ? 'On Track' : progress >= 40 ? 'Review' : 'In Progress';
                  return (
                    <Card key={project.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium truncate">{project.name}</p>
                          <Badge
                            variant={progress >= 75 ? 'success' as any : progress >= 40 ? 'info' as any : 'secondary' as any}
                            className="text-[10px]"
                          >
                            {statusText}
                          </Badge>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{progress}% complete</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-sm text-muted-foreground">
                  No projects yet
                </CardContent>
              </Card>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-3">
                Deliverables
                {pendingApprovals.length > 0 && (
                  <Badge variant="destructive" className="ml-2 text-[10px]">{pendingApprovals.length} pending</Badge>
                )}
              </h2>
              {deliverables.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {deliverables.slice(0, 6).map((d: any) => (
                    <Card key={d.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-3">
                        <div className="aspect-video bg-muted rounded-md mb-2 flex items-center justify-center">
                          <FileText className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                        <p className="text-sm font-medium truncate">{d.name || d.fileName || 'Untitled'}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] text-muted-foreground truncate">{d.projectName}</span>
                          <Badge
                            variant={d.status === 'approved' ? 'success' as any : d.status === 'in_review' ? 'warning' as any : 'default' as any}
                            className="text-[10px] px-1 py-0 capitalize"
                          >
                            {d.status || 'draft'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center text-sm text-muted-foreground">
                    No deliverables yet
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-3">Proposals</h2>
                {proposals.length > 0 ? (
                  <div className="space-y-2">
                    {proposals.map((prop: any) => (
                      <Card key={prop.id}>
                        <CardContent className="p-3 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">{prop.title || `Proposal #${prop.id.slice(0, 8)}`}</p>
                            <p className="text-xs text-muted-foreground">
                              ${Number(prop.total || 0).toLocaleString()} &middot; {new Date(prop.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className="capitalize text-[10px]">{prop.status}</Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center text-sm text-muted-foreground">
                      <FileSignature className="h-6 w-6 mx-auto mb-2 text-muted-foreground/50" />
                      No proposals yet
                    </CardContent>
                  </Card>
                )}
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-3">Pending Approvals</h2>
                {pendingApprovals.length > 0 ? (
                  <div className="space-y-2">
                    {pendingApprovals.slice(0, 5).map((item: any) => (
                      <Card key={item.id}>
                        <CardContent className="p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-yellow-500 shrink-0" />
                            <div>
                              <p className="text-sm font-medium">{item.name || item.fileName || 'Untitled'}</p>
                              <p className="text-xs text-muted-foreground">{item.projectName}</p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" className="h-8 shrink-0">
                            <Eye className="mr-1 h-3 w-3" /> Review
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : deliverables.length > 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center text-sm text-muted-foreground">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      All deliverables reviewed
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center text-sm text-muted-foreground">
                      No items pending approval
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">Invoices</h2>
            {invoices.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {invoices.map((inv: any) => {
                      const paid = (inv.payments || []).reduce((s: number, p: any) => s + (p.amount || 0), 0);
                      const status = inv.status || (paid >= (inv.amount || 0) ? 'paid' : 'sent');
                      return (
                        <div key={inv.id} className="flex items-center justify-between p-4">
                          <div>
                            <p className="text-sm font-medium">{inv.invoiceNumber || `INV-${inv.id.slice(0, 8)}`}</p>
                            <p className="text-xs text-muted-foreground">Due: {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A'}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-medium">${Number(inv.amount || 0).toLocaleString()}</span>
                            <Badge
                              variant={status === 'paid' ? 'success' as any : status === 'overdue' ? 'destructive' as any : 'default' as any}
                              className="capitalize text-[10px]"
                            >
                              {status}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-sm text-muted-foreground">
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-muted-foreground/50" />
                  No invoices yet
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}
