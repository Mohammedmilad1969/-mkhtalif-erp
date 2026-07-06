'use client';

import { useState, useCallback } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import KanbanBoard from '@/components/kanban/kanban-board';
import CreateLeadForm from '@/components/forms/create-lead-form';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useLeads, useUpdateLead, useUpdateLeadStage, usePipelineStats, useUsers,
  useBulkAssign, useBulkChangeStage, useBulkDelete, usePermanentDelete,
} from '@/hooks/useApi';
import Celebration from '@/components/celebration';
import { useToast } from '@/components/ui/use-toast';
import { getApiErrorMessage } from '@/lib/api';
import { Lead } from '@/types';
import {
  Plus, Search, Filter, Loader2, CheckSquare, X, User, ArrowRight, Archive, Calendar, Trash2,
} from 'lucide-react';

const pipelineColumns: { id: string; title: string }[] = [
  { id: 'new_lead', title: 'New Lead' },
  { id: 'qualification', title: 'Qualification' },
  { id: 'qualified', title: 'Qualified' },
  { id: 'meeting_scheduled', title: 'Meeting Scheduled' },
  { id: 'proposal_sent', title: 'Proposal Sent' },
  { id: 'negotiation', title: 'Negotiation' },
  { id: 'won', title: 'Won' },
  { id: 'lost', title: 'Lost' },
];

const tempVariants: Record<string, 'destructive' | 'warning' | 'secondary'> = {
  hot: 'destructive',
  warm: 'warning',
  cold: 'secondary',
};

export default function CrmPage() {
  const router = useRouter();
  const { toast } = useToast();
  const updateStage = useUpdateLeadStage();
  const bulkAssign = useBulkAssign();
  const bulkStage = useBulkChangeStage();
  const bulkDelete = useBulkDelete();
  const permanentDelete = usePermanentDelete();
  const { data: usersData } = useUsers({ limit: 200 });
  const users = usersData?.data || [];

  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignUserId, setAssignUserId] = useState('');

  const [stageDialogOpen, setStageDialogOpen] = useState(false);
  const [moveStageId, setMoveStageId] = useState('');

  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);

  const [lostDialogOpen, setLostDialogOpen] = useState(false);
  const [lostLeadId, setLostLeadId] = useState<string | null>(null);
  const [lostReasonCategory, setLostReasonCategory] = useState('');
  const [lostReasonDetails, setLostReasonDetails] = useState('');
  const { mutateAsync: updateLeadLost, isPending: isLeadLostPending } = useUpdateLead();

  const LOST_REASONS = [
    { value: 'price', label: 'Price' },
    { value: 'no_response', label: 'No Response' },
    { value: 'bad_timing', label: 'Bad Timing' },
    { value: 'service_not_compatible', label: 'Service Not Compatible' },
    { value: 'choose_another_company', label: 'Choose Another Company' },
    { value: 'competitor', label: 'Competitor' },
    { value: 'budget', label: 'Budget' },
    { value: 'other', label: 'Other' },
  ];

  const { data, isLoading } = useLeads({
    search: search || undefined,
    source: sourceFilter || undefined,
    status: statusFilter !== 'active' ? statusFilter : undefined,
  });
  const { data: stages } = usePipelineStats();

  const leads = data?.data || [];

  const stageCodeToId = (code: string): string | undefined => {
    if (!stages) return undefined;
    const stage = stages.find((s: any) => s.code === code);
    return stage?.id;
  };

  const filteredLeads = leads.filter((lead: Lead) => {
    if (stageFilter && stageFilter !== 'all' && (lead.stage as any)?.code !== stageFilter) return false;
    return true;
  });

  const columns = pipelineColumns.map((col) => ({
    id: col.id,
    title: col.title,
    items: filteredLeads
      .filter((lead: Lead) => {
        if (statusFilter === 'archived') return lead.status === 'archived';
        return lead.status !== 'archived' && (lead.stage as any)?.code === col.id;
      })
      .map((lead: Lead) => ({
        id: lead.id,
        title: lead.clientName,
        subtitle: lead.company || lead.email || '',
        badge: lead.leadTemperature
          ? { label: lead.leadTemperature, variant: tempVariants[lead.leadTemperature] || 'secondary' }
          : undefined,
        metadata: [
          ...(lead.leadScore != null ? [{ label: 'score', value: `Score: ${lead.leadScore}/10` }] : []),
          ...(lead.source ? [{ label: 'source', value: lead.source }] : []),
            ...(lead.nextAction ? [{ label: 'action', value: lead.nextAction }] : []),
            ...(lead.lostReasonCategory ? [{ label: 'lost', value: `Lost: ${lead.lostReasonCategory.replace('_', ' ')}` }] : []),
            { label: 'time', value: timeSince(lead.createdAt) },
        ],
      })),
  }));

  const handleClearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === leads.length) {
      handleClearSelection();
    } else {
      setSelectedIds(new Set(leads.map((l: Lead) => l.id)));
    }
  }, [leads, selectedIds.size, handleClearSelection]);

  const handleSelectStage = useCallback((stageCode: string) => {
    const stageIds = leads
      .filter((l: Lead) => {
        if (statusFilter === 'archived') return l.status === 'archived';
        return (l.stage as any)?.code === stageCode;
      })
      .map((l: Lead) => l.id);
    if (stageIds.length > 0) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (const id of stageIds) next.add(id);
        return next;
      });
    }
  }, [leads, statusFilter]);

  const handleBulkAssign = async () => {
    if (!assignUserId || selectedIds.size === 0) return;
    try {
      await bulkAssign.mutateAsync({ ids: Array.from(selectedIds), userId: assignUserId });
      toast({ title: 'Success', description: `Assigned ${selectedIds.size} leads` });
      setAssignDialogOpen(false);
      handleClearSelection();
    } catch {
      toast({ title: 'Error', description: 'Failed to assign leads', variant: 'destructive' });
    }
  };

  const handleBulkStage = async () => {
    if (!moveStageId || selectedIds.size === 0) return;
    try {
      await bulkStage.mutateAsync({ ids: Array.from(selectedIds), stageId: moveStageId });
      toast({ title: 'Success', description: `Moved ${selectedIds.size} leads` });
      setStageDialogOpen(false);
      handleClearSelection();
    } catch {
      toast({ title: 'Error', description: 'Failed to move leads', variant: 'destructive' });
    }
  };

  const handleBulkArchive = async () => {
    if (selectedIds.size === 0) return;
    try {
      await bulkDelete.mutateAsync({ ids: Array.from(selectedIds) });
      toast({ title: 'Success', description: `Archived ${selectedIds.size} leads` });
      setArchiveDialogOpen(false);
      handleClearSelection();
    } catch {
      toast({ title: 'Error', description: 'Failed to archive leads', variant: 'destructive' });
    }
  };

  const [celebrationLead, setCelebrationLead] = useState(false);
  const anyBulkLoading = bulkAssign.isPending || bulkStage.isPending || bulkDelete.isPending;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Lead Pipeline</h1>
          <p className="text-sm text-muted-foreground">Manage and track your leads through the sales pipeline</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push('/crm/follow-up')}>
            <Calendar className="mr-2 h-4 w-4" />
            Follow-up Matrix
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
              <DialogHeader className="pb-1">
                <DialogTitle className="text-base">Create New Lead</DialogTitle>
                <DialogDescription className="text-xs">Fill in the details to add a new lead.</DialogDescription>
              </DialogHeader>
              <CreateLeadForm onSuccess={() => setDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-[140px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="facebook">Facebook</SelectItem>
            <SelectItem value="website">Website</SelectItem>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
            <SelectItem value="referral">Referral</SelectItem>
            <SelectItem value="call">Call</SelectItem>
          </SelectContent>
        </Select>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {pipelineColumns.map((col) => (
              <SelectItem key={col.id} value={col.id}>
                {col.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); if (v !== 'archived') setStageFilter(''); }}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleSelectAll}>
            <CheckSquare className="h-3.5 w-3.5 mr-1" />
            {selectedIds.size === leads.length && leads.length > 0 ? 'Deselect All' : 'Select All'}
          </Button>
          {stageFilter && stageFilter !== 'all' && (
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => handleSelectStage(stageFilter)}>
              <CheckSquare className="h-3.5 w-3.5 mr-1" />
              Select Stage
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-shrink-0 w-72">
              <Skeleton className="h-8 w-24 mb-3" />
              <div className="space-y-2">
                {[1, 2, 3].map((j) => (
                  <Skeleton key={j} className="h-24 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <KanbanBoard
          columns={columns}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onItemClick={(id) => router.push(`/crm/leads/${id}`)}
          onSelectStage={handleSelectStage}
          onItemMove={(itemId, newColumnId) => {
            if (newColumnId === 'lost') {
              setLostLeadId(itemId);
              setLostDialogOpen(true);
              return;
            }
            const stageId = stageCodeToId(newColumnId);
            if (stageId) {
              updateStage.mutate(
                { id: itemId, stageId },
                {
                  onSuccess: () => { if (newColumnId === 'won') setCelebrationLead(true); },
                  onError: (err) =>
                    toast({ title: 'Error', description: getApiErrorMessage(err, 'Failed to move lead'), variant: 'destructive' }),
                }
              );
            }
          }}
        />
      )}

      <Celebration show={celebrationLead} onClose={() => setCelebrationLead(false)} />
      {selectedIds.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm shadow-lg">
          <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckSquare className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">
                {selectedIds.size} selected
              </span>
              <Button variant="ghost" size="sm" onClick={handleClearSelection}>
                <X className="h-4 w-4 mr-1" /> Clear
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" disabled={anyBulkLoading}>
                    <User className="h-4 w-4 mr-1" /> Assign
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Assign Leads</DialogTitle>
                    <DialogDescription>Select a user to assign {selectedIds.size} lead{selectedIds.size > 1 ? 's' : ''} to.</DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Select value={assignUserId} onValueChange={setAssignUserId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user: any) => (
                          <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleBulkAssign} disabled={!assignUserId || bulkAssign.isPending}>
                      {bulkAssign.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Assign
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={stageDialogOpen} onOpenChange={setStageDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" disabled={anyBulkLoading}>
                    <ArrowRight className="h-4 w-4 mr-1" /> Stage
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Move Leads</DialogTitle>
                    <DialogDescription>Select a stage to move {selectedIds.size} lead{selectedIds.size > 1 ? 's' : ''} to.</DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Select value={moveStageId} onValueChange={setMoveStageId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                      <SelectContent>
                        {stages?.filter((s: any) => s.id).map((s: any) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setStageDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleBulkStage} disabled={!moveStageId || bulkStage.isPending}>
                      {bulkStage.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Move
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {statusFilter !== 'archived' && (
                <Dialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" disabled={anyBulkLoading}>
                      <Archive className="h-4 w-4 mr-1" /> Archive
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                      <DialogTitle>Archive Leads</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to archive {selectedIds.size} lead{selectedIds.size > 1 ? 's' : ''}? This action can be reversed.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                      <Button variant="outline" onClick={() => setArchiveDialogOpen(false)}>Cancel</Button>
                      <Button variant="destructive" onClick={handleBulkArchive} disabled={bulkDelete.isPending}>
                        {bulkDelete.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Archive
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
              {statusFilter === 'archived' && (
                <Button variant="destructive" size="sm" disabled={permanentDelete.isPending} onClick={async () => {
                  try {
                    for (const id of Array.from(selectedIds)) {
                      await permanentDelete.mutateAsync(id);
                    }
                    toast({ title: 'Deleted', description: `Permanently deleted ${selectedIds.size} leads` });
                    handleClearSelection();
                  } catch {
                    toast({ title: 'Error', description: 'Failed to delete leads', variant: 'destructive' });
                  }
                }}>
                  <Trash2 className="h-4 w-4 mr-1" /> Delete Permanently
                </Button>
              )}

              <Dialog open={lostDialogOpen} onOpenChange={setLostDialogOpen}>
                <DialogContent className="sm:max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Mark Lead as Lost</DialogTitle>
                    <DialogDescription>Select the reason for losing this lead.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 py-2">
                    <Select value={lostReasonCategory} onValueChange={setLostReasonCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select lost reason" />
                      </SelectTrigger>
                      <SelectContent>
                        {LOST_REASONS.map((lr) => (
                          <SelectItem key={lr.value} value={lr.value}>{lr.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Additional details (optional)"
                      value={lostReasonDetails}
                      onChange={(e) => setLostReasonDetails(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => { setLostDialogOpen(false); setLostLeadId(null); setLostReasonCategory(''); setLostReasonDetails(''); }}>Cancel</Button>
                    <Button variant="destructive" disabled={!lostReasonCategory || isLeadLostPending} onClick={async () => {
                      if (!lostLeadId) return;
                      const stageId = stageCodeToId('lost');
                      if (!stageId) return;
                      try {
                        await updateLeadLost({ id: lostLeadId, data: { lostReasonCategory, lostReason: lostReasonDetails, status: 'lost' } });
                        await updateStage.mutateAsync({ id: lostLeadId, stageId });
                        toast({ title: 'Lead marked as lost', description: `Reason: ${lostReasonCategory}` });
                      } catch (err) {
                        toast({ title: 'Error', description: getApiErrorMessage(err, 'Failed to mark lead as lost'), variant: 'destructive' });
                      }
                      setLostDialogOpen(false);
                      setLostLeadId(null);
                      setLostReasonCategory('');
                      setLostReasonDetails('');
                    }}>
                      {isLeadLostPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Mark as Lost
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function timeSince(date: string): string {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
