'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import KanbanBoard from '@/components/kanban/kanban-board';
import DataTable from '@/components/tables/data-table';
import { useProject, useUpdateProject, useCreateTask, useCreateSprint, useCreateDeliverable, useUsers, useUpdateTaskStatus, useUpdateTask, useDeleteTask, useUpdateSprint, useDeleteSprint, useUpdateDeliverable, useDeleteDeliverable } from '@/hooks/useApi';
import { useToast } from '@/components/ui/use-toast';
import { ProjectStatus, TaskStatus, User } from '@/types';
import { ArrowLeft, Calendar, Users, CheckCircle, FileText, ClipboardCheck, Plus, Pencil, Save, Loader2, Trash2, PlayCircle, CheckSquare, X } from 'lucide-react';
import { getApiErrorMessage } from '@/lib/api';

const statusVariants: Record<string, 'default' | 'secondary' | 'outline' | 'info' | 'success' | 'warning'> = {
  onboarding: 'info',
  strategy: 'default',
  production: 'warning',
  active: 'success',
  on_hold: 'secondary',
  completed: 'outline',
};

const taskColumns = [
  { id: TaskStatus.TO_DO, title: 'To Do' },
  { id: TaskStatus.IN_PROGRESS, title: 'In Progress' },
  { id: TaskStatus.REVIEW, title: 'Review' },
  { id: TaskStatus.APPROVED, title: 'Approved' },
  { id: TaskStatus.DELIVERED, title: 'Delivered' },
];

function getUserName(u: any): string {
  if (!u) return '';
  if (u.name) return u.name;
  return [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || u.email || '';
}

function getUserInitial(u: any): string {
  return getUserName(u).charAt(0).toUpperCase();
}

function getUserRole(u: any): string {
  if (!u) return '';
  if (typeof u.role === 'string') return u.role;
  if (u.role?.code) return u.role.code;
  if (u.role?.name) return u.role.name;
  return '';
}

export default function ProjectDetailPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const { data: project, isLoading, error } = useProject(id);
  const { data: usersData } = useUsers();
  const users: User[] = usersData?.data || [];

  const updateProject = useUpdateProject();
  const createTask = useCreateTask();
  const createSprint = useCreateSprint();
  const createDeliverable = useCreateDeliverable();
  const updateTaskStatus = useUpdateTaskStatus();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const updateSprint = useUpdateSprint();
  const deleteSprint = useDeleteSprint();
  const updateDeliverable = useUpdateDeliverable();
  const deleteDeliverable = useDeleteDeliverable();

  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editBudget, setEditBudget] = useState('');

  const [taskCreateOpen, setTaskCreateOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskDeadline, setTaskDeadline] = useState('');

  const [taskEditOpen, setTaskEditOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskDesc, setEditTaskDesc] = useState('');
  const [editTaskPriority, setEditTaskPriority] = useState('');
  const [editTaskStatus, setEditTaskStatus] = useState('');
  const [editTaskAssignee, setEditTaskAssignee] = useState('');
  const [editTaskDeadline, setEditTaskDeadline] = useState('');

  const [sprintCreateOpen, setSprintCreateOpen] = useState(false);
  const [sprintName, setSprintName] = useState('');
  const [sprintGoal, setSprintGoal] = useState('');

  const [sprintEditOpen, setSprintEditOpen] = useState(false);
  const [editingSprint, setEditingSprint] = useState<any>(null);
  const [editSprintName, setEditSprintName] = useState('');
  const [editSprintGoal, setEditSprintGoal] = useState('');
  const [editSprintStatus, setEditSprintStatus] = useState('');

  const [deliverableCreateOpen, setDeliverableCreateOpen] = useState(false);
  const [deliverableName, setDeliverableName] = useState('');
  const [deliverableType, setDeliverableType] = useState('');

  const [deliverableEditOpen, setDeliverableEditOpen] = useState(false);
  const [editingDeliverable, setEditingDeliverable] = useState<any>(null);
  const [editDeliverableName, setEditDeliverableName] = useState('');
  const [editDeliverableType, setEditDeliverableType] = useState('');
  const [editDeliverableStatus, setEditDeliverableStatus] = useState('');

  const [confirmDelete, setConfirmDelete] = useState<{ type: string; id: string; name: string } | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{t('common.error')}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/projects')}>{t('common.back')}</Button>
      </div>
    );
  }

  const teamMembers = project.team?.members?.map((m) => m.user) || [];
  const uniqueMembers = new Map();
  if (project.accountManager) uniqueMembers.set(project.accountManager.id, project.accountManager);
  if (project.strategicLead) uniqueMembers.set(project.strategicLead.id, project.strategicLead);
  if (project.productionManager) uniqueMembers.set(project.productionManager.id, project.productionManager);
  teamMembers.forEach((u) => uniqueMembers.set(u.id, u));
  const allMembers = Array.from(uniqueMembers.values());

  const openEdit = () => {
    setEditName(project.name);
    setEditDesc(project.description || '');
    setEditPriority(project.priority);
    setEditStatus(project.status);
    setEditBudget(project.budget ? String(project.budget) : '');
    setEditOpen(true);
  };

  const handleEdit = async () => {
    try {
      await updateProject.mutateAsync({
        id,
        data: { name: editName, description: editDesc, priority: editPriority as any, status: editStatus as any, budget: editBudget ? parseFloat(editBudget) : undefined } as any,
      });
      toast({ title: t('common.success'), description: t('projects.projectUpdated') });
      setEditOpen(false);
    } catch (err) {
      toast({ title: t('common.error'), description: getApiErrorMessage(err, t('common.operationFailed')), variant: 'destructive' });
    }
  };

  const handleCreateTask = async () => {
    if (!taskTitle) return;
    try {
      await createTask.mutateAsync({ title: taskTitle, projectId: id, assignedTo: taskAssignee || undefined, priority: taskPriority, deadline: taskDeadline || undefined } as any);
      toast({ title: t('common.success'), description: t('tasks.taskCreated') });
      setTaskCreateOpen(false);
      setTaskTitle('');
      setTaskAssignee('');
      setTaskPriority('medium');
      setTaskDeadline('');
    } catch (err) {
      toast({ title: t('common.error'), description: getApiErrorMessage(err, t('common.operationFailed')), variant: 'destructive' });
    }
  };

  const openTaskEdit = (taskId: string) => {
    const task = (project.tasks || []).find((t: any) => t.id === taskId);
    if (!task) return;
    setEditingTask(task);
    setEditTaskTitle(task.title);
    setEditTaskDesc(task.description || '');
    setEditTaskPriority(task.priority);
    setEditTaskStatus(task.status);
    setEditTaskAssignee((task as any).assignedTo || '');
    setEditTaskDeadline(task.deadline ? task.deadline.split('T')[0] : '');
    setTaskEditOpen(true);
  };

  const handleUpdateTask = async () => {
    if (!editTaskTitle || !editingTask) return;
    try {
      await updateTask.mutateAsync({
        id: editingTask.id,
        data: { title: editTaskTitle, description: editTaskDesc, priority: editTaskPriority, status: editTaskStatus, assignedTo: editTaskAssignee || undefined, deadline: editTaskDeadline || undefined } as any,
      });
      toast({ title: t('common.success'), description: t('tasks.taskUpdated') });
      setTaskEditOpen(false);
      setEditingTask(null);
    } catch (err) {
      toast({ title: t('common.error'), description: getApiErrorMessage(err, t('common.operationFailed')), variant: 'destructive' });
    }
  };

  const handleTaskMove = async (itemId: string, newColumnId: string) => {
    try {
      await updateTaskStatus.mutateAsync({ id: itemId, status: newColumnId });
    } catch (err) {
      toast({ title: t('common.error'), description: getApiErrorMessage(err, t('common.operationFailed')), variant: 'destructive' });
    }
  };

  const handleDeleteTask = async () => {
    if (!confirmDelete || confirmDelete.type !== 'task') return;
    try {
      await deleteTask.mutateAsync(confirmDelete.id);
      toast({ title: t('common.success'), description: t('tasks.taskDeleted') });
      setConfirmDelete(null);
      setTaskEditOpen(false);
    } catch (err) {
      toast({ title: t('common.error'), description: getApiErrorMessage(err, t('common.operationFailed')), variant: 'destructive' });
    }
  };

  const handleCreateSprint = async () => {
    if (!sprintName) return;
    try {
      await createSprint.mutateAsync({ name: sprintName, goals: sprintGoal || undefined, projectId: id } as any);
      toast({ title: t('common.success'), description: 'Sprint created' });
      setSprintCreateOpen(false);
      setSprintName('');
      setSprintGoal('');
    } catch (err) {
      toast({ title: t('common.error'), description: getApiErrorMessage(err, t('common.operationFailed')), variant: 'destructive' });
    }
  };

  const openSprintEdit = (sprint: any) => {
    setEditingSprint(sprint);
    setEditSprintName(sprint.name);
    setEditSprintGoal(sprint.goals || '');
    setEditSprintStatus(sprint.status);
    setSprintEditOpen(true);
  };

  const handleUpdateSprint = async () => {
    if (!editSprintName || !editingSprint) return;
    try {
      await updateSprint.mutateAsync({
        id: editingSprint.id,
        data: { name: editSprintName, goals: editSprintGoal || undefined, status: editSprintStatus } as any,
      });
      toast({ title: t('common.success'), description: 'Sprint updated' });
      setSprintEditOpen(false);
      setEditingSprint(null);
    } catch (err) {
      toast({ title: t('common.error'), description: getApiErrorMessage(err, t('common.operationFailed')), variant: 'destructive' });
    }
  };

  const handleDeleteSprint = async () => {
    if (!confirmDelete || confirmDelete.type !== 'sprint') return;
    try {
      await deleteSprint.mutateAsync(confirmDelete.id);
      toast({ title: t('common.success'), description: 'Sprint deleted' });
      setConfirmDelete(null);
      setSprintEditOpen(false);
    } catch (err) {
      toast({ title: t('common.error'), description: getApiErrorMessage(err, t('common.operationFailed')), variant: 'destructive' });
    }
  };

  const handleCreateDeliverable = async () => {
    if (!deliverableName || !deliverableType) return;
    try {
      await createDeliverable.mutateAsync({ name: deliverableName, type: deliverableType, projectId: id } as any);
      toast({ title: t('common.success'), description: 'Deliverable created' });
      setDeliverableCreateOpen(false);
      setDeliverableName('');
      setDeliverableType('');
    } catch (err) {
      toast({ title: t('common.error'), description: getApiErrorMessage(err, t('common.operationFailed')), variant: 'destructive' });
    }
  };

  const openDeliverableEdit = (d: any) => {
    setEditingDeliverable(d);
    setEditDeliverableName(d.name);
    setEditDeliverableType(d.type);
    setEditDeliverableStatus(d.status);
    setDeliverableEditOpen(true);
  };

  const handleUpdateDeliverable = async () => {
    if (!editDeliverableName || !editingDeliverable) return;
    try {
      await updateDeliverable.mutateAsync({
        id: editingDeliverable.id,
        data: { name: editDeliverableName, type: editDeliverableType, status: editDeliverableStatus } as any,
      });
      toast({ title: t('common.success'), description: 'Deliverable updated' });
      setDeliverableEditOpen(false);
      setEditingDeliverable(null);
    } catch (err) {
      toast({ title: t('common.error'), description: getApiErrorMessage(err, t('common.operationFailed')), variant: 'destructive' });
    }
  };

  const handleDeleteDeliverable = async () => {
    if (!confirmDelete || confirmDelete.type !== 'deliverable') return;
    try {
      await deleteDeliverable.mutateAsync(confirmDelete.id);
      toast({ title: t('common.success'), description: 'Deliverable deleted' });
      setConfirmDelete(null);
      setDeliverableEditOpen(false);
    } catch (err) {
      toast({ title: t('common.error'), description: getApiErrorMessage(err, t('common.operationFailed')), variant: 'destructive' });
    }
  };

  const taskKanbanColumns = taskColumns.map((col) => ({
    id: col.id,
    title: col.title,
    items: (project.tasks || [])
      .filter((t: any) => t.status === col.id)
      .map((t: any) => ({
        id: t.id,
        title: t.title,
        subtitle: getUserName(t.assignee),
        badge: t.priority ? { label: t.priority, variant: (t.priority === 'urgent' ? 'destructive' : t.priority === 'high' ? 'warning' : 'default') as any } : undefined,
        metadata: [
          ...(t.deadline ? [{ label: 'Deadline', value: new Date(t.deadline).toLocaleDateString() }] : []),
          ...(t.assignee ? [{ label: 'Assignee', value: getUserName(t.assignee) }] : []),
        ],
      })),
  }));

  const completedTasks = (project.tasks || []).filter((t) => (t as any).status === 'delivered').length;
  const totalTasks = (project.tasks || []).length;
  const approvedDeliverables = (project.deliverables || []).filter((d) => d.status === 'approved').length;
  const totalDeliverables = (project.deliverables || []).length;
  const deadlineDisplay = project.targetEndDate ? new Date(project.targetEndDate).toLocaleDateString() : '-';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/projects')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <Badge variant={statusVariants[project.status] || 'secondary'} className="capitalize">
              {project.status.replace('_', ' ')}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{project.client?.name} • {project.description}</p>
        </div>
        <Button variant="outline" size="sm" onClick={openEdit}>
          <Pencil className="h-4 w-4 mr-1" /> {t('common.edit')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard icon={CheckCircle} label={t('tasks.title')} value={`${completedTasks}/${totalTasks}`} />
        <SummaryCard icon={FileText} label={t('deliverables.title')} value={`${approvedDeliverables}/${totalDeliverables}`} />
        <SummaryCard icon={Users} label={t('projects.teamMembers')} value={`${allMembers.length}`} />
        <SummaryCard icon={Calendar} label={t('projects.deadline')} value={deadlineDisplay} />
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">{t('common.overview')}</TabsTrigger>
          <TabsTrigger value="tasks">{t('tasks.title')}</TabsTrigger>
          <TabsTrigger value="sprints">Sprints</TabsTrigger>
          <TabsTrigger value="deliverables">{t('deliverables.title')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-lg">{t('projects.projectDetails')}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div><span className="text-sm text-muted-foreground">{t('projects.client')}: </span><span className="text-sm font-medium">{project.client?.name}</span></div>
                <div><span className="text-sm text-muted-foreground">{t('common.priority')}: </span><Badge variant={project.priority === 'urgent' ? 'destructive' : 'default'}>{project.priority}</Badge></div>
                <div><span className="text-sm text-muted-foreground">{t('common.startDate')}: </span><span className="text-sm">{project.startDate ? new Date(project.startDate).toLocaleDateString() : '-'}</span></div>
                <div><span className="text-sm text-muted-foreground">{t('projects.deadline')}: </span><span className="text-sm">{deadlineDisplay}</span></div>
                {project.budget != null && <div><span className="text-sm text-muted-foreground">{t('projects.budget')}: </span><span className="text-sm">${Number(project.budget).toLocaleString()}</span></div>}
                {project.contract && <div><span className="text-sm text-muted-foreground">{t('common.contract')}: </span><span className="text-sm font-medium">{project.contract.contractNumber}</span></div>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg">{t('projects.teamMembers')} ({allMembers.length})</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {allMembers.length === 0 && <p className="text-sm text-muted-foreground">{t('common.noData')}</p>}
                {allMembers.map((u: any) => (
                  <div key={u.id} className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">{getUserInitial(u)}</div>
                    <div>
                      <p className="text-sm font-medium">{getUserName(u)}</p>
                      <p className="text-xs text-muted-foreground">
                        {project.accountManager?.id === u.id ? t('projects.accountManager') : getUserRole(u) || t('projects.members')}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="mt-6">
          <div className="flex justify-end mb-4">
            <Dialog open={taskCreateOpen} onOpenChange={setTaskCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="h-4 w-4 mr-1" />{t('tasks.createTask')}</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{t('tasks.createTask')}</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t('tasks.taskTitle')}</Label>
                    <Input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder={t('tasks.taskTitle')} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('common.priority')}</Label>
                    <Select value={taskPriority} onValueChange={setTaskPriority}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('common.assignee')}</Label>
                    <Select value={taskAssignee} onValueChange={setTaskAssignee}>
                      <SelectTrigger><SelectValue placeholder={t('common.assignee')} /></SelectTrigger>
                      <SelectContent>
                        {users.map((u: any) => (
                          <SelectItem key={u.id} value={u.id}>{getUserName(u)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('tasks.dueDate')}</Label>
                    <Input type="date" value={taskDeadline} onChange={(e) => setTaskDeadline(e.target.value)} />
                  </div>
                  <Button className="w-full" onClick={handleCreateTask} disabled={createTask.isPending || !taskTitle}>
                    {createTask.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : t('common.create')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <KanbanBoard columns={taskKanbanColumns} onItemClick={openTaskEdit} onItemMove={handleTaskMove} />
        </TabsContent>

        <TabsContent value="sprints" className="mt-6">
          <div className="flex justify-end mb-4">
            <Dialog open={sprintCreateOpen} onOpenChange={setSprintCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="h-4 w-4 mr-1" />Create Sprint</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Sprint</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Sprint Name</Label>
                    <Input value={sprintName} onChange={(e) => setSprintName(e.target.value)} placeholder="Sprint name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Goal</Label>
                    <Textarea value={sprintGoal} onChange={(e) => setSprintGoal(e.target.value)} placeholder="Sprint goal" rows={3} />
                  </div>
                  <Button className="w-full" onClick={handleCreateSprint} disabled={createSprint.isPending || !sprintName}>
                    {createSprint.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : t('common.create')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {(project.sprints || []).length > 0 ? (
            <div className="space-y-3">
              {(project.sprints || []).map((sprint: any) => (
                <Card key={sprint.id} className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => openSprintEdit(sprint)}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{sprint.name}</p>
                      <p className="text-sm text-muted-foreground">{sprint.goals}</p>
                      <p className="text-xs text-muted-foreground mt-1">{sprint._count?.tasks || 0} tasks</p>
                    </div>
                    <Badge variant={sprint.status === 'active' ? 'success' : sprint.status === 'completed' ? 'outline' : 'secondary'} className="capitalize">
                      {sprint.status}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">{t('common.noData')}</div>
          )}
        </TabsContent>

        <TabsContent value="deliverables" className="mt-6">
          <div className="flex justify-end mb-4">
            <Dialog open={deliverableCreateOpen} onOpenChange={setDeliverableCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="h-4 w-4 mr-1" />{t('deliverables.createDeliverable')}</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{t('deliverables.createDeliverable')}</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t('deliverables.deliverableName')}</Label>
                    <Input value={deliverableName} onChange={(e) => setDeliverableName(e.target.value)} placeholder={t('deliverables.deliverableName')} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('common.type')}</Label>
                    <Select value={deliverableType} onValueChange={setDeliverableType}>
                      <SelectTrigger><SelectValue placeholder={t('common.type')} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="document">Document</SelectItem>
                        <SelectItem value="code">Code</SelectItem>
                        <SelectItem value="report">Report</SelectItem>
                        <SelectItem value="presentation">Presentation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full" onClick={handleCreateDeliverable} disabled={createDeliverable.isPending || !deliverableName || !deliverableType}>
                    {createDeliverable.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : t('common.create')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <DataTable
            columns={[
              { key: 'name', label: t('deliverables.deliverableName'), render: (d: any) => <span className="font-medium">{d.name}</span> },
              { key: 'type', label: t('common.type'), render: (d: any) => <Badge variant="secondary" className="capitalize">{d.type}</Badge> },
              { key: 'status', label: t('common.status'), render: (d: any) => (
                <Badge variant={d.status === 'approved' ? 'success' : d.status === 'rejected' ? 'destructive' : d.status === 'internal_review' ? 'warning' : 'secondary'} className="capitalize">
                  {d.status.replace('_', ' ')}
                </Badge>
              )},
              { key: 'version', label: 'Version', render: (d: any) => `v${d.version}` },
              { key: 'revisionCount', label: 'Revisions', render: (d: any) => d.revisionCount },
            ]}
            data={project.deliverables || []}
            onRowClick={openDeliverableEdit}
            emptyMessage={t('deliverables.noDeliverables')}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{t('projects.editProject')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('projects.projectName')}</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t('common.description')}</Label>
              <Textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('common.priority')}</Label>
                <Select value={editPriority} onValueChange={setEditPriority}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('common.status')}</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.values(ProjectStatus).map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('projects.budget')}</Label>
              <Input type="number" step="0.01" value={editBudget} onChange={(e) => setEditBudget(e.target.value)} />
            </div>
            <Button className="w-full" onClick={handleEdit} disabled={updateProject.isPending || !editName}>
              {updateProject.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-1" />{t('common.save')}</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={taskEditOpen} onOpenChange={setTaskEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('tasks.editTask')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('tasks.taskTitle')}</Label>
              <Input value={editTaskTitle} onChange={(e) => setEditTaskTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t('common.description')}</Label>
              <Textarea value={editTaskDesc} onChange={(e) => setEditTaskDesc(e.target.value)} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('common.priority')}</Label>
                <Select value={editTaskPriority} onValueChange={setEditTaskPriority}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('common.status')}</Label>
                <Select value={editTaskStatus} onValueChange={setEditTaskStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.values(TaskStatus).map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('common.assignee')}</Label>
              <Select value={editTaskAssignee} onValueChange={setEditTaskAssignee}>
                <SelectTrigger><SelectValue placeholder={t('common.assignee')} /></SelectTrigger>
                <SelectContent>
                  {users.map((u: any) => (
                    <SelectItem key={u.id} value={u.id}>{getUserName(u)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('tasks.dueDate')}</Label>
              <Input type="date" value={editTaskDeadline} onChange={(e) => setEditTaskDeadline(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleUpdateTask} disabled={updateTask.isPending || !editTaskTitle}>
                {updateTask.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-1" />{t('common.save')}</>}
              </Button>
              <Button variant="destructive" size="icon" onClick={() => setConfirmDelete({ type: 'task', id: editingTask?.id, name: editingTask?.title })}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={sprintEditOpen} onOpenChange={setSprintEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Edit Sprint</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Sprint Name</Label>
              <Input value={editSprintName} onChange={(e) => setEditSprintName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Goal</Label>
              <Textarea value={editSprintGoal} onChange={(e) => setEditSprintGoal(e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={editSprintStatus} onValueChange={setEditSprintStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleUpdateSprint} disabled={updateSprint.isPending || !editSprintName}>
                {updateSprint.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-1" />Save</>}
              </Button>
              <Button variant="destructive" size="icon" onClick={() => setConfirmDelete({ type: 'sprint', id: editingSprint?.id, name: editingSprint?.name })}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deliverableEditOpen} onOpenChange={setDeliverableEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{t('deliverables.editDeliverable')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('deliverables.deliverableName')}</Label>
              <Input value={editDeliverableName} onChange={(e) => setEditDeliverableName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('common.type')}</Label>
                <Select value={editDeliverableType} onValueChange={setEditDeliverableType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="code">Code</SelectItem>
                    <SelectItem value="report">Report</SelectItem>
                    <SelectItem value="presentation">Presentation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('common.status')}</Label>
                <Select value={editDeliverableStatus} onValueChange={setEditDeliverableStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="internal_review">Internal Review</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleUpdateDeliverable} disabled={updateDeliverable.isPending || !editDeliverableName}>
                {updateDeliverable.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-1" />{t('common.save')}</>}
              </Button>
              <Button variant="destructive" size="icon" onClick={() => setConfirmDelete({ type: 'deliverable', id: editingDeliverable?.id, name: editingDeliverable?.name })}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmDelete} onOpenChange={(open) => { if (!open) setConfirmDelete(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{confirmDelete?.name}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>{t('common.cancel')}</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirmDelete?.type === 'task') handleDeleteTask();
                else if (confirmDelete?.type === 'sprint') handleDeleteSprint();
                else if (confirmDelete?.type === 'deliverable') handleDeleteDeliverable();
              }}
              disabled={deleteTask.isPending || deleteSprint.isPending || deleteDeliverable.isPending}
            >
              {(deleteTask.isPending || deleteSprint.isPending || deleteDeliverable.isPending) ? <Loader2 className="h-4 w-4 animate-spin" /> : t('common.delete')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
