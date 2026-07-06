'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';
import { getApiErrorMessage } from '@/lib/api';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import KanbanBoard from '@/components/kanban/kanban-board';
import { useAllLeadTasks, useUpdateLeadTask, useDeleteLeadTask, useArchiveLeadTask, useMergeTaskChains } from '@/hooks/useApi';
import { LeadTask } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import {
  Search, Filter, CheckCircle, Loader2, ListChecks, ExternalLink,
  MoreHorizontal, Trash2, Archive, User, X, ChevronRight, Link2,
  ChevronDown, Building2,
} from 'lucide-react';

const statusColumns = [
  { id: 'pending', title: 'Pending' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'completed', title: 'Completed' },
  { id: 'cancelled', title: 'Cancelled' },
];

const statusStyles: Record<string, 'default' | 'secondary' | 'outline' | 'info' | 'success' | 'warning' | 'destructive'> = {
  pending: 'secondary',
  in_progress: 'info',
  completed: 'success',
  cancelled: 'outline',
  overdue: 'destructive',
};

const typeIcons: Record<string, string> = {
  call: '📞', meeting: '📅', proposal: '📄', email: '✉️',
  follow_up: '🔄', review: '👁️', design: '🎨', development: '💻',
  feedback: '💬', approval: '✅', research: '🔍', quote: '💰',
  onboarding: '🚀', other: '📌',
};

function TaskDetailDialog({ task, open, onOpenChange }: {
  task: LeadTask | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  if (!task) return null;
  const checklist = task.checklist || [];
  const doneItems = checklist.filter((c: any) => c.checked).length;
  const isChained = task.chainOrder != null && task.chainTotal != null;
  const leadName = (task as any).lead?.clientName || 'Unknown Lead';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg flex items-center gap-2">
            {task.title}
            {isChained && (
              <Badge variant="secondary" className="text-[10px]">
                {task.chainOrder}/{task.chainTotal}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <Label className="text-xs text-muted-foreground">Lead</Label>
              <button
                type="button"
                onClick={() => { onOpenChange(false); router.push(`/crm/leads/${task.leadId}`); }}
                className="text-primary hover:underline flex items-center gap-1 mt-0.5"
              >
                {leadName} <ExternalLink className="h-3 w-3" />
              </button>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Status</Label>
              <p className="mt-0.5">
                <Badge variant={statusStyles[task.status] || 'outline'} className="capitalize text-[10px]">
                  {task.status.replace('_', ' ')}
                </Badge>
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Type</Label>
              <p className="mt-0.5">{typeIcons[task.taskType || ''] || ''} {task.taskType?.replace('_', ' ') || '-'}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Priority</Label>
              <p className="mt-0.5 capitalize">{task.priority}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Assignee</Label>
              <p className="mt-0.5">{(task.assignee as any)?.name || <span className="italic text-muted-foreground">Unassigned</span>}</p>
            </div>
            {task.dueDate && (
              <div>
                <Label className="text-xs text-muted-foreground">Due Date</Label>
                <p className="mt-0.5">{new Date(task.dueDate).toLocaleDateString()}</p>
              </div>
            )}
            {task.completedAt && (
              <div>
                <Label className="text-xs text-muted-foreground">Completed</Label>
                <p className="mt-0.5">{new Date(task.completedAt).toLocaleDateString()}</p>
              </div>
            )}
          </div>

          {task.description && (
            <div>
              <Label className="text-xs text-muted-foreground">Description</Label>
              <p className="text-sm mt-0.5 whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          {checklist.length > 0 && (
            <div>
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                Checklist <Badge variant="outline" className="text-[10px]">{doneItems}/{checklist.length}</Badge>
              </Label>
              <div className="space-y-1 mt-1">
                {checklist.map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={item.checked} readOnly className="shrink-0" />
                    <span className={item.checked ? 'line-through opacity-50' : ''}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2 border-t">
            <Button variant="outline" size="sm" onClick={() => { onOpenChange(false); router.push(`/crm/leads/${task.leadId}`); }}>
              <ExternalLink className="h-3.5 w-3.5 mr-1" /> Open Lead
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function TasksPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailTask, setDetailTask] = useState<LeadTask | null>(null);

  const { data, isLoading } = useAllLeadTasks({ search: search || undefined, status: statusFilter || undefined });
  const updateTask = useUpdateLeadTask();
  const deleteTask = useDeleteLeadTask();
  const archiveTask = useArchiveLeadTask();
  const mergeTaskChains = useMergeTaskChains();

  const tasks: LeadTask[] = data?.data || [];

  const [expandedLeads, setExpandedLeads] = useState<Set<string>>(new Set());

  const tasksByLead = useMemo(() => {
    const map = new Map<string, { leadName: string; company?: string; tasks: LeadTask[] }>();
    for (const task of tasks) {
      const leadId = task.leadId;
      const leadName = (task as any).lead?.clientName || 'Unknown Lead';
      const company = (task as any).lead?.company;
      if (!map.has(leadId)) {
        map.set(leadId, { leadName, company, tasks: [] });
      }
      map.get(leadId)!.tasks.push(task);
    }
    return Array.from(map.entries()).sort((a, b) => a[1].leadName.localeCompare(b[1].leadName));
  }, [tasks]);

  const toggleLead = (leadId: string) => {
    setExpandedLeads((prev) => {
      const next = new Set(prev);
      if (next.has(leadId)) next.delete(leadId);
      else next.add(leadId);
      return next;
    });
  };

  const handleMergeLeadChains = async (leadId: string) => {
    const group = tasksByLead.find(([id]) => id === leadId);
    if (!group) return;
    const ids = group[1].tasks.map(t => t.id);
    if (ids.length < 2) {
      toast({ title: 'Not enough tasks', description: 'Need at least 2 tasks to merge', variant: 'destructive' });
      return;
    }
    try {
      await mergeTaskChains.mutateAsync(ids);
      toast({ title: 'Chains merged', description: `${ids.length} tasks for ${group[1].leadName} merged into one chain.` });
    } catch (err) {
      toast({ title: 'Error', description: getApiErrorMessage(err, 'Failed to merge chains'), variant: 'destructive' });
    }
  };

  const handleToggle = async (task: LeadTask) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await updateTask.mutateAsync({ taskId: task.id, data: { status: nextStatus }, leadId: task.leadId });
    } catch (err) {
      toast({ title: 'Error', description: getApiErrorMessage(err, 'Failed to update task'), variant: 'destructive' });
    }
  };

  const handleDelete = async (task: LeadTask) => {
    try {
      await deleteTask.mutateAsync(task.id);
      toast({ title: 'Deleted', description: 'Task permanently deleted' });
    } catch (err) {
      toast({ title: 'Error', description: getApiErrorMessage(err, 'Failed to delete task'), variant: 'destructive' });
    }
  };

  const handleArchive = async (task: LeadTask) => {
    try {
      await archiveTask.mutateAsync(task.id);
      toast({ title: 'Archived', description: 'Task moved to cancelled' });
    } catch (err) {
      toast({ title: 'Error', description: getApiErrorMessage(err, 'Failed to archive task'), variant: 'destructive' });
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    try {
      await Promise.all(ids.map((id) => deleteTask.mutateAsync(id)));
      toast({ title: 'Deleted', description: `${ids.length} tasks deleted` });
      setSelectedIds(new Set());
    } catch (err) {
      toast({ title: 'Error', description: getApiErrorMessage(err, 'Failed to delete tasks'), variant: 'destructive' });
    }
  };

  const handleBulkArchive = async () => {
    const ids = Array.from(selectedIds);
    try {
      await Promise.all(ids.map((id) => archiveTask.mutateAsync(id)));
      toast({ title: 'Archived', description: `${ids.length} tasks archived` });
      setSelectedIds(new Set());
    } catch (err) {
      toast({ title: 'Error', description: getApiErrorMessage(err, 'Failed to archive tasks'), variant: 'destructive' });
    }
  };

  const handleMergeChains = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length < 2) {
      toast({ title: 'Select at least 2 tasks', description: 'You need to select multiple tasks to merge them into one chain.', variant: 'destructive' });
      return;
    }
    try {
      await mergeTaskChains.mutateAsync(ids);
      toast({ title: 'Chains merged', description: `${ids.length} tasks merged into a single chain.` });
      setSelectedIds(new Set());
    } catch (err) {
      toast({ title: 'Error', description: getApiErrorMessage(err, 'Failed to merge chains'), variant: 'destructive' });
    }
  };

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === tasks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(tasks.map((t) => t.id)));
    }
  }, [tasks, selectedIds.size]);

  const columns = statusColumns.map((col) => ({
    id: col.id,
    title: col.title,
    items: tasks
      .filter((t: LeadTask) => t.status === col.id)
      .map((t: LeadTask) => {
        const checklist = t.checklist || [];
        const doneItems = checklist.filter((c: any) => c.checked).length;
        const isChained = t.chainOrder != null && t.chainTotal != null;
        return {
          id: t.id,
          title: t.title,
          subtitle: (t as any).lead?.clientName || '',
          badge: t.priority ? {
            label: t.priority,
            variant: t.priority === 'urgent' ? 'destructive' : t.priority === 'high' ? 'warning' : 'default',
          } : undefined,
          metadata: [
            ...(t.taskType ? [{ label: 'type', value: t.taskType }] : []),
            ...(checklist.length > 0 ? [{ label: 'checklist', value: `${doneItems}/${checklist.length}` }] : []),
            ...(isChained ? [{ label: 'chain', value: `${t.chainOrder}/${t.chainTotal}` }] : []),
            ...(t.assignee ? [{ label: 'assignee', value: (t.assignee as any).name }] : []),
          ],
          onClick: () => router.push(`/crm/leads/${t.leadId}`),
        };
      }),
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TaskDetailDialog task={detailTask} open={detailTask !== null} onOpenChange={(v) => { if (!v) setDetailTask(null); }} />

      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="text-sm text-muted-foreground">All lead-generated tasks across the system</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks or lead name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[160px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2 bg-primary/5 border border-primary/20 rounded-lg">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <div className="flex-1" />
          <Button variant="outline" size="sm" onClick={handleMergeChains} disabled={mergeTaskChains.isPending}>
            <Link2 className="h-3.5 w-3.5 mr-1" /> {mergeTaskChains.isPending ? 'Merging...' : 'Merge Chains'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleBulkArchive}>
            <Archive className="h-3.5 w-3.5 mr-1" /> Archive All
          </Button>
          <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete All
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
            <X className="h-3.5 w-3.5 mr-1" /> Clear
          </Button>
        </div>
      )}

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="by-lead">By Lead</TabsTrigger>
        </TabsList>
        <TabsContent value="kanban" className="mt-4">
          <KanbanBoard columns={columns} />
        </TabsContent>
        <TabsContent value="by-lead" className="mt-4">
          <div className="space-y-3">
            {tasksByLead.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ListChecks className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                <p className="text-sm">No tasks found</p>
              </div>
            ) : (
              tasksByLead.map(([leadId, group]) => {
                const isExpanded = expandedLeads.has(leadId);
                const totalChainCount = new Set(group.tasks.filter(t => t.chainId).map(t => t.chainId)).size;
                return (
                  <Card key={leadId}>
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => toggleLead(leadId)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform shrink-0 ${isExpanded ? '' : '-rotate-90'}`} />
                        <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium truncate">{group.leadName}</p>
                          {group.company && <p className="text-xs text-muted-foreground truncate">{group.company}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Badge variant="secondary" className="text-[10px]">{group.tasks.length} tasks</Badge>
                        {totalChainCount > 0 && (
                          <Badge variant="outline" className="text-[10px]">{totalChainCount} chain{totalChainCount > 1 ? 's' : ''}</Badge>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={(e) => { e.stopPropagation(); handleMergeLeadChains(leadId); }}
                          disabled={mergeTaskChains.isPending}
                        >
                          <Link2 className="h-3 w-3 mr-1" /> Merge all
                        </Button>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="border-t">
                        {group.tasks.map((task) => {
                          const checklist = task.checklist || [];
                          const doneItems = checklist.filter((c: any) => c.checked).length;
                          const isChained = task.chainOrder != null && task.chainTotal != null;
                          return (
                            <div
                              key={task.id}
                              className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 transition-colors cursor-pointer border-b last:border-0"
                              onClick={() => setDetailTask(task)}
                            >
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleToggle(task); }}
                                className="flex items-center shrink-0"
                              >
                                {task.status === 'completed' ? (
                                  <CheckCircle className="h-4 w-4 text-primary" />
                                ) : (
                                  <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 hover:border-primary/50 transition-colors" />
                                )}
                              </button>
                              <div className="flex-1 min-w-0 flex items-center gap-2">
                                <span className={`text-sm truncate ${task.status === 'completed' ? 'line-through opacity-60' : ''}`}>
                                  {task.title}
                                </span>
                                {isChained && (
                                  <Badge variant="secondary" className="text-[10px] shrink-0">{task.chainOrder}/{task.chainTotal}</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                                {typeIcons[task.taskType || ''] && <span>{typeIcons[task.taskType || '']}</span>}
                                <Badge variant={statusStyles[task.status] || 'outline'} className="capitalize text-[10px]">{task.status.replace('_', ' ')}</Badge>
                                {(task.assignee as any)?.name && <span className="hidden sm:inline">{(task.assignee as any).name}</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
        <TabsContent value="list" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="w-10 py-3 px-4">
                      <input
                        type="checkbox"
                        checked={tasks.length > 0 && selectedIds.size === tasks.length}
                        onChange={toggleSelectAll}
                        className="shrink-0"
                      />
                    </th>
                    <th className="w-10 py-3 px-4" />
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Task</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Lead</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Type</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Priority</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Assignee</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Checklist</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Status</th>
                    <th className="w-10 py-3 px-4" />
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task: LeadTask) => {
                    const checklist = task.checklist || [];
                    const doneItems = checklist.filter((c: any) => c.checked).length;
                    const isChained = task.chainOrder != null && task.chainTotal != null;
                    const leadName = (task as any).lead?.clientName || 'Unknown Lead';
                    const isSelected = selectedIds.has(task.id);
                    return (
                      <tr
                        key={task.id}
                        className={`border-b last:border-0 group cursor-pointer transition-colors ${isSelected ? 'bg-primary/5' : 'hover:bg-muted/50'}`}
                      >
                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(task.id)}
                            className="shrink-0"
                          />
                        </td>
                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleToggle(task)}
                            className="flex items-center"
                          >
                            {task.status === 'completed' ? (
                              <CheckCircle className="h-5 w-5 text-primary" />
                            ) : (
                              <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 hover:border-primary/50 transition-colors" />
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-4" onClick={() => setDetailTask(task)}>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-medium ${task.status === 'completed' ? 'line-through opacity-60' : ''}`}>
                                {task.title}
                              </span>
                              {isChained && (
                                <Badge variant="secondary" className="text-[10px] shrink-0">
                                  {task.chainOrder}/{task.chainTotal}
                                </Badge>
                              )}
                            </div>
                            {task.description && (
                              <span className="text-xs text-muted-foreground truncate max-w-[250px] mt-0.5">
                                {task.description}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); router.push(`/crm/leads/${task.leadId}`); }}
                            className="text-sm text-primary hover:underline flex items-center gap-1.5"
                          >
                            <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="truncate max-w-[120px]">{leadName}</span>
                            <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
                          </button>
                        </td>
                        <td className="py-3 px-4 text-sm whitespace-nowrap">
                          {typeIcons[task.taskType || ''] || ''} {task.taskType ? task.taskType.replace('_', ' ') : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={task.priority === 'urgent' ? 'destructive' : task.priority === 'high' ? 'warning' : 'secondary'}
                            className="capitalize text-[10px]"
                          >
                            {task.priority}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {(task.assignee as any)?.name || <span className="italic">Unassigned</span>}
                        </td>
                        <td className="py-3 px-4">
                          {checklist.length > 0 ? (
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <ListChecks className="h-3.5 w-3.5 shrink-0" />
                              {doneItems}/{checklist.length}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground/50">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={statusStyles[task.status] || 'outline'} className="capitalize text-[10px]">
                            {task.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setDetailTask(task)}>
                                <ChevronRight className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleArchive(task)}>
                                <Archive className="h-4 w-4 mr-2" />
                                Archive
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(task)} className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                  {tasks.length === 0 && (
                    <tr>
                      <td colSpan={10} className="text-center py-12 text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <ListChecks className="h-8 w-8 text-muted-foreground/40" />
                          <p className="text-sm">No tasks found</p>
                          <p className="text-xs">Tasks appear here when created from lead automation or manually added to a lead.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
