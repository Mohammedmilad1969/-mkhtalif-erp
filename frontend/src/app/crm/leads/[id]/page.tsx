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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/hooks/useLanguage';
import ScoreLeadForm from '@/components/forms/score-lead-form';
import LeadQualificationForm from '@/components/forms/lead-qualification-form';
import Celebration from '@/components/celebration';
import FileUpload from '@/components/forms/file-upload';
import { CommunicationsTab } from '@/components/communications/communications-tab';
import { CreateEventDialog } from '@/components/calendar/create-event-dialog';
import {
  useLead, useUpdateLead, useUpdateLeadStage, usePipelineStats,
  useLeadTasks, useCreateLeadTask, useUpdateLeadTask, useLeadAttachments, useLeadTimeline, useDeleteAttachment,
  useLeadFollowUps, useUpdateFollowUp,
} from '@/hooks/useApi';
import { useToast } from '@/components/ui/use-toast';
import { getApiErrorMessage, post } from '@/lib/api';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { LeadTemperature, ActivityType, LeadTask } from '@/types';
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  User,
  Star,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  FileText,
  ListChecks,
  Bot,
  ClipboardCheck,
  Pencil,
  Check,
  Activity,
  Paperclip,
  Plus,
  Trash2,
  MessageSquareText,
} from 'lucide-react';

const stageVariants: Record<string, 'default' | 'secondary' | 'outline' | 'info' | 'success' | 'warning' | 'destructive'> = {
  new_lead: 'secondary',
  qualification: 'info',
  qualified: 'warning',
  meeting_scheduled: 'default',
  proposal_sent: 'default',
  negotiation: 'default',
  won: 'success',
  lost: 'destructive',
  archive: 'secondary',
};

const tempVariants: Record<string, 'destructive' | 'warning' | 'secondary'> = {
  hot: 'destructive',
  warm: 'warning',
  cold: 'secondary',
};

const activityIcons: Record<string, React.ElementType> = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  note: MessageSquare,
  status_change: CheckCircle,
  stage_change: Star,
  score_change: Star,
  assignment: User,
  other: Clock,
};

export default function LeadDetailPage() {
  const { t } = useLanguage();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const { data: lead, isLoading, error } = useLead(id);
  const { data: pipelineStats, error: pipelineError } = usePipelineStats();
  const updateLead = useUpdateLead();
  const updateStage = useUpdateLeadStage();
  const createLeadTask = useCreateLeadTask();

  const [scoreDialogOpen, setScoreDialogOpen] = useState(false);
  const [lostDialogOpen, setLostDialogOpen] = useState(false);
  const [lostReasonCategory, setLostReasonCategory] = useState('');
  const [celebrationWon, setCelebrationWon] = useState(false);
  const [lostReasonDetails, setLostReasonDetails] = useState('');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ clientName: '', email: '', phone: '', company: '', source: '' });
  const [aiScoreData, setAiScoreData] = useState<any>(null);
  const [aiScoreLoading, setAiScoreLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (lead) {
      setEditForm({
        clientName: lead.clientName || '',
        email: lead.email || '',
        phone: lead.phone || '',
        company: lead.company || '',
        source: lead.source || '',
      });
    }
  }, [lead]);

  const { data: followUps } = useLeadFollowUps(id);
  const updateFollowUp = useUpdateFollowUp();
  const stages = pipelineStats || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-60 w-full" />
          </div>
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{t('common.operationFailed')}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/crm')}>
          {t('common.back')} {t('crm.title')}
        </Button>
      </div>
    );
  }



  const handleStageChange = (stageId: string) => {
    const stage = stages.find((s: any) => s.id === stageId);
    if (stage?.code === 'lost') {
      setLostDialogOpen(true);
      return;
    }
    if (stageId) {
      updateStage.mutate(
        { id, stageId },
        {
          onSuccess: () => { if (stage?.code === 'won') setCelebrationWon(true); },
          onError: (err) => toast({ title: t('common.error'), description: getApiErrorMessage(err, t('common.operationFailed')), variant: 'destructive' }),
        },
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/crm')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{lead.clientName}</h1>
            {lead.leadTemperature && (
              <Badge variant={tempVariants[lead.leadTemperature] || 'secondary'} className="capitalize">
                {lead.leadTemperature}
              </Badge>
            )}
            <Badge variant={stageVariants[(lead.stage as any)?.code] || 'secondary'} className="capitalize">
              {(lead.stage as any)?.code?.replace('_', ' ') || t('crm.new')}
            </Badge>
          </div>
          {lead.company && <p className="text-sm text-muted-foreground">{lead.company}</p>}
        </div>
      </div>

      <Celebration show={celebrationWon} onClose={() => setCelebrationWon(false)} />
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">{t('crm.leadDetails')}</TabsTrigger>
          <TabsTrigger value="qualification"><ClipboardCheck className="h-4 w-4 mr-1" />{t('crm.qualification')}</TabsTrigger>
          <TabsTrigger value="tasks"><ListChecks className="h-4 w-4 mr-1" />{t('common.tasks')}</TabsTrigger>
          <TabsTrigger value="timeline"><Activity className="h-4 w-4 mr-1" />{t('common.timeline')}</TabsTrigger>
          <TabsTrigger value="checklist">{t('common.checklist')}</TabsTrigger>
          <TabsTrigger value="attachments"><Paperclip className="h-4 w-4 mr-1" />{t('common.attachments')}</TabsTrigger>
          <TabsTrigger value="communications"><MessageSquareText className="h-4 w-4 mr-1" />{t('common.communications') || 'Communications'}</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">{t('crm.contactInfo')}</CardTitle>
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => {
                    if (editing) {
                      updateLead.mutate(
                        { id, data: editForm },
                        {
                          onSuccess: () => { setEditing(false); toast({ title: 'Saved' }); },
                          onError: (err) => toast({ title: 'Error', description: getApiErrorMessage(err, 'Failed to save'), variant: 'destructive' }),
                        },
                      );
                    } else {
                      setEditing(true);
                    }
                  }}>
                    {editing ? <Check className="h-3.5 w-3.5 mr-1" /> : <Pencil className="h-3.5 w-3.5 mr-1" />}
                    {editing ? 'Save' : 'Edit'}
                  </Button>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  {editing ? (
                    <>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Client Name</Label>
                        <Input className="h-8 text-xs" value={editForm.clientName} onChange={(e) => setEditForm(f => ({ ...f, clientName: e.target.value }))} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">{t('crm.email')}</Label>
                        <Input className="h-8 text-xs" value={editForm.email} onChange={(e) => setEditForm(f => ({ ...f, email: e.target.value }))} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">{t('crm.phone')}</Label>
                        <Input className="h-8 text-xs" value={editForm.phone} onChange={(e) => setEditForm(f => ({ ...f, phone: e.target.value }))} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">{t('crm.company')}</Label>
                        <Input className="h-8 text-xs" value={editForm.company} onChange={(e) => setEditForm(f => ({ ...f, company: e.target.value }))} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">{t('crm.source')}</Label>
                        <Select value={editForm.source} onValueChange={(v) => setEditForm(f => ({ ...f, source: v }))}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="instagram">Instagram</SelectItem>
                            <SelectItem value="facebook">Facebook</SelectItem>
                            <SelectItem value="website">{t('crm.website')}</SelectItem>
                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
                            <SelectItem value="referral">Referral</SelectItem>
                            <SelectItem value="call">{t('crm.call')}</SelectItem>
                            <SelectItem value="other">{t('common.type')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <Label className="text-xs text-muted-foreground">{t('crm.clientName')}</Label>
                        <p className="text-sm">{lead.clientName || '-'}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">{t('crm.email')}</Label>
                        <p className="text-sm">{lead.email || '-'}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">{t('crm.phone')}</Label>
                        <p className="text-sm">{lead.phone || '-'}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">{t('crm.company')}</Label>
                        <p className="text-sm">{lead.company || '-'}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">{t('crm.source')}</Label>
                        <p className="text-sm capitalize">{lead.source || '-'}</p>
                      </div>
                      {lead.status === 'lost' && (
                        <>
                          <div>
                            <Label className="text-xs text-muted-foreground">Lost Reason</Label>
                            <p className="text-sm capitalize text-destructive">{lead.lostReasonCategory?.replace('_', ' ') || '-'}</p>
                          </div>
                          {lead.lostReason && (
                            <div className="col-span-2">
                              <Label className="text-xs text-muted-foreground">Lost Reason Details</Label>
                              <p className="text-sm">{lead.lostReason}</p>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('crm.leadScore')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    <ScoreItem label="Request Type" value={lead.serviceType} max={3} />
                    <ScoreItem label="Seriousness" value={lead.clarityLevel} max={2} />
                    <ScoreItem label="Budget" value={lead.budgetLevel} max={2} />
                    <ScoreItem label="Opportunity Size" value={lead.opportunitySize} max={2} />
                  </div>
                  <div className="mt-4 p-3 bg-muted rounded-lg text-center">
                    <span className="text-sm text-muted-foreground">{t('crm.totalScore')}: </span>
                    <span className="text-2xl font-bold">{lead.leadScore != null ? lead.leadScore : '-'}</span>
                    <span className="text-sm text-muted-foreground"> /10</span>
                  </div>

                  <div className="mt-4 p-3 border border-primary/20 bg-primary/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">AI Score</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        disabled={aiScoreLoading}
                        onClick={async () => {
                          setAiScoreLoading(true);
                          try {
                            const result = await post(`/leads/${id}/ai-score`);
                            setAiScoreData(result);
                          } catch (err) {
                            toast({ title: 'Error', description: 'AI scoring failed', variant: 'destructive' });
                          }
                          setAiScoreLoading(false);
                        }}
                      >
                        {aiScoreLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                        {aiScoreData ? 'Re-run' : 'Run AI Analysis'}
                      </Button>
                    </div>

                    {aiScoreData && (
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">AI Score</span>
                          <span className="font-bold text-lg">{aiScoreData.aiScore}/10</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Temperature</span>
                          <Badge
                            variant={aiScoreData.temperature === 'hot' ? 'destructive' : aiScoreData.temperature === 'warm' ? 'warning' : 'secondary'}
                            className="capitalize text-[10px]"
                          >
                            {aiScoreData.temperature}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Confidence</span>
                          <span className="capitalize">{aiScoreData.confidence}</span>
                        </div>
                        <div className="pt-2 space-y-1">
                          {aiScoreData.factors?.map((f: any) => (
                            <div key={f.name} className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground truncate mr-2">{f.name}</span>
                              <span className="font-medium">{f.score}/{f.max}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {(followUps && followUps.length > 0) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Follow-ups</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {followUps.map((fu: any) => (
                      <div key={fu.id} className="flex items-center justify-between p-2 rounded border text-xs">
                        <div>
                          <p className="font-medium">{fu.title}</p>
                          <p className="text-muted-foreground">{new Date(fu.dueDate).toLocaleDateString()} {new Date(fu.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge className={`text-[10px] capitalize ${fu.status === 'done' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : fu.status === 'no_response' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : ''}`}>
                            {fu.status === 'active' ? 'Active' : fu.status === 'no_response' ? 'No Response' : fu.status === 'done' ? 'Done' : fu.status}
                          </Badge>
                          {fu.status !== 'done' && (
                            <Select value={fu.status} onValueChange={(v) => updateFollowUp.mutate({ id: fu.id, status: v })}>
                              <SelectTrigger className="h-6 w-16 text-[10px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="no_response">No Response</SelectItem>
                                <SelectItem value="done">Done</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('common.actions')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Dialog open={scoreDialogOpen} onOpenChange={setScoreDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <Star className="mr-2 h-4 w-4" />
                        {t('crm.scoreLead')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t('crm.scoreLead')}</DialogTitle>
                        <DialogDescription>{t('crm.leadScore')}</DialogDescription>
                      </DialogHeader>
                      <ScoreLeadForm leadId={id} onSuccess={() => setScoreDialogOpen(false)} />
                    </DialogContent>
                  </Dialog>

                  <div className="space-y-2">
                    <Label className="text-xs">{t('crm.stage')}</Label>
                    <Select value={(lead.stage as any)?.id || ''} onValueChange={handleStageChange} disabled={updateStage.isPending}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('crm.selectStage')} />
                      </SelectTrigger>
                      <SelectContent>
                        {stages.map((s: any) => (
                          <SelectItem key={s.id} value={s.id} className="capitalize">{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">{t('common.assignedTo')}</Label>
                    <p className="text-sm flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {lead.assignee?.name || t('common.noData')}
                    </p>
                  </div>

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
                            {['price','no_response','bad_timing','service_not_compatible','choose_another_company','competitor','budget','other'].map((lr) => (
                              <SelectItem key={lr} value={lr}>{lr.replace(/_/g, ' ')}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input placeholder="Additional details (optional)" value={lostReasonDetails} onChange={(e) => setLostReasonDetails(e.target.value)} />
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setLostDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" disabled={!lostReasonCategory} onClick={async () => {
                          const stage = stages.find((s: any) => s.code === 'lost');
                          if (!stage) return;
                          try {
                            await updateLead.mutateAsync({ id, data: { lostReasonCategory, lostReason: lostReasonDetails, status: 'lost' } });
                            await updateStage.mutateAsync({ id, stageId: stage.id });
                            toast({ title: 'Lead marked as lost', description: `Reason: ${lostReasonCategory}` });
                            setLostDialogOpen(false);
                          } catch (err) {
                            toast({ title: 'Error', description: getApiErrorMessage(err, 'Failed to mark as lost'), variant: 'destructive' });
                          }
                        }}>
                          Mark as Lost
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <CreateEventDialog leadId={id}>
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule Event
                    </Button>
                  </CreateEventDialog>
                  {lead.email && (
                    <a href={`mailto:${lead.email}`} className="w-full">
                      <Button variant="outline" className="w-full justify-start">
                        <Mail className="mr-2 h-4 w-4" />
                        {t('crm.email')}
                      </Button>
                    </a>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="qualification" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('crm.qualification')}</CardTitle>
            </CardHeader>
            <CardContent>
              <LeadQualificationForm leadId={id} persistedScore={lead?.leadScore} persistedSubScores={{ serviceType: lead?.serviceType, clarityLevel: lead?.clarityLevel, budgetLevel: lead?.budgetLevel, opportunitySize: lead?.opportunitySize }} />
            </CardContent>
          </Card>
        </TabsContent>



        <TabsContent value="tasks" className="mt-6">
          <TaskTab leadId={id} />
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <TimelineTab leadId={id} />
        </TabsContent>

        <TabsContent value="checklist" className="mt-6">
          <ChecklistTab leadId={id} />
        </TabsContent>

        <TabsContent value="attachments" className="mt-6">
          <AttachmentsTab leadId={id} />
        </TabsContent>

        <TabsContent value="communications" className="mt-6">
          <CommunicationsTab leadId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ScoreItem({ label, value, max }: { label: string; value?: string | number | null; max: number }) {
  const num = typeof value === 'string' ? parseInt(value) : value;
  return (
    <div className="text-center">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-lg font-bold">{num != null && !isNaN(num) ? num : '-'}</p>
      <p className="text-xs text-muted-foreground">/ {max}</p>
    </div>
  );
}

function TaskTab({ leadId }: { leadId: string }) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { data: tasks, isLoading, error: taskError } = useLeadTasks(leadId);
  const createTask = useCreateLeadTask();
  const updateTask = useUpdateLeadTask();
  const [newTask, setNewTask] = useState('');
  const [lastCompletedId, setLastCompletedId] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!newTask.trim()) return;
    try {
      await createTask.mutateAsync({ id: leadId, data: { title: newTask.trim() } });
      setNewTask('');
      toast({ title: t('common.success'), description: t('crm.taskCreated') });
    } catch (err) {
      toast({ title: t('common.error'), description: getApiErrorMessage(err, t('common.operationFailed')), variant: 'destructive' });
    }
  };

  const handleToggle = async (task: LeadTask) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await updateTask.mutateAsync({ taskId: task.id, data: { status: nextStatus }, leadId });
      if (nextStatus === 'completed' && (task as any).chainId && (task as any).chainOrder && (task as any).chainTotal) {
        setLastCompletedId(task.id);
        if ((task as any).chainOrder < (task as any).chainTotal) {
          toast({
            title: '✅ Task completed!',
            description: `Step ${(task as any).chainOrder}/${(task as any).chainTotal} done. Next task will appear shortly.`,
          });
        } else {
          toast({
            title: '🎉 All chain tasks completed!',
            description: `Finished ${(task as any).chainTotal} step workflow.`,
          });
        }
      }
    } catch (err) {
      toast({ title: t('common.error'), description: getApiErrorMessage(err, t('common.operationFailed')), variant: 'destructive' });
    }
  };

  if (isLoading) return <div className="space-y-3">{[1,2,3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>;

  if (taskError) return <p className="text-center text-destructive py-8">{t('common.operationFailed')}</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('common.tasks')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder={t('crm.addTask')}
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !createTask.isPending && handleAdd()}
          />
          <Button onClick={handleAdd} disabled={createTask.isPending}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {tasks && tasks.length > 0 ? (
          <div className="space-y-1">
            {tasks.map((task) => {
              const chainOrder = (task as any).chainOrder;
              const chainTotal = (task as any).chainTotal;
              const isChained = chainOrder != null && chainTotal != null;
              const hasChecklist = Array.isArray(task.checklist) && task.checklist.length > 0;
              return (
                <div key={task.id} className={`flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 ${lastCompletedId === task.id ? 'animate-in slide-in-from-right-4 duration-300' : ''}`}>
                  <button type="button" onClick={() => handleToggle(task)}>
                    {task.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                    )}
                  </button>
                  <span className={`flex-1 text-sm ${task.status === 'completed' ? 'line-through opacity-60' : ''}`}>
                    {task.title}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {hasChecklist && (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">
                        {task.checklist!.filter((c: any) => c.checked).length}/{task.checklist!.length}
                      </Badge>
                    )}
                    {isChained && (
                      <Badge variant={task.status === 'completed' ? 'secondary' : 'outline'} className="text-[10px]">
                        {chainOrder}/{chainTotal}
                      </Badge>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs">{task.status}</Badge>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">{t('common.noData')}</p>
        )}
      </CardContent>
    </Card>
  );
}

function TimelineTab({ leadId }: { leadId: string }) {
  const { t } = useLanguage();
  const { data: timelineData, isLoading, error: tlError } = useLeadTimeline(leadId);
  const { data: attachments } = useLeadAttachments(leadId);

  const all: any[] = [];
  if (timelineData) {
    const { activities = [], leadScores = [], tasks = [], meetings = [] } = timelineData as any;
    activities.forEach((e: any) => all.push({ ...e, _type: 'activity', label: e.description || 'Activity' }));
    leadScores.forEach((e: any) => all.push({ ...e, _type: 'score', label: `Score: ${e.totalScore || e.leadScore}` }));
    tasks.forEach((e: any) => all.push({ ...e, _type: 'task', label: `Task: ${e.title}` }));
    meetings.forEach((e: any) => all.push({ ...e, _type: 'meeting', label: `Meeting: ${e.title || e.type}` }));
  }
  if (attachments) {
    attachments.forEach((a: any) => all.push({ ...a, _type: 'attachment', label: a.fileName }));
  }
  all.sort((a, b) => {
    const ta = new Date(a.createdAt || a.uploadedAt || 0).getTime();
    const tb = new Date(b.createdAt || b.uploadedAt || 0).getTime();
    return tb - ta;
  });

  if (isLoading) return <div className="space-y-3">{[1,2,3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>;

  if (tlError) return <p className="text-center text-destructive py-8">{t('common.operationFailed')}</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('common.timeline')}</CardTitle>
      </CardHeader>
      <CardContent>
        {all.length > 0 ? (
          <div className="space-y-4">
            {all.map((item, idx) => (
              <div key={`${item._type}-${item.id || idx}`} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  {item._type === 'attachment' ? (
                    <Paperclip className="h-4 w-4 text-primary" />
                  ) : item._type === 'score' ? (
                    <Star className="h-4 w-4 text-primary" />
                  ) : item._type === 'task' ? (
                    <CheckCircle className="h-4 w-4 text-primary" />
                  ) : (
                    <Activity className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div>
                  <p className="text-sm">{item.label || item.description || item.fileName || item.fileUrl}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.user?.name || item.uploadedBy?.name || item.scorer?.name || t('common.system')} - {new Date(item.createdAt || item.uploadedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">{t('common.noData')}</p>
        )}
      </CardContent>
    </Card>
  );
}

function ChecklistTab({ leadId }: { leadId: string }) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { data: tasks, isLoading, error: taskError } = useLeadTasks(leadId);
  const updateTask = useUpdateLeadTask();
  const queryClient = useQueryClient();

  const updateChecklistItem = async (task: LeadTask, itemIndex: number, checked: boolean) => {
    const checklist = (task.checklist || []).map((item, i) =>
      i === itemIndex ? { ...item, checked } : item
    );
    try {
      await updateTask.mutateAsync({ taskId: task.id, data: { checklist } as any, leadId });
    } catch (err) {
      toast({ title: t('common.error'), description: getApiErrorMessage(err, t('common.operationFailed')), variant: 'destructive' });
    }
  };

  const tasksWithChecklists = (tasks || []).filter((t: LeadTask) => Array.isArray(t.checklist) && t.checklist.length > 0);

  if (isLoading) return <div className="space-y-3">{[1,2].map((i) => <Skeleton key={i} className="h-24 w-full" />)}</div>;

  if (taskError) return <p className="text-center text-destructive py-8">{t('common.operationFailed')}</p>;

  if (tasksWithChecklists.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('common.checklist')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">{t('common.noData')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('common.checklist')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {tasksWithChecklists.map((task: LeadTask) => {
          const totalItems = task.checklist!.length;
          const doneItems = task.checklist!.filter((c: any) => c.checked).length;
          return (
            <div key={task.id} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${task.status === 'completed' ? 'line-through opacity-60' : ''}`}>
                  {task.title}
                </span>
                <Badge variant="outline" className="text-[10px]">{doneItems}/{totalItems}</Badge>
                <Badge variant="secondary" className="text-[10px]">{task.taskType}</Badge>
              </div>
              {task.description && <p className="text-xs text-muted-foreground">{task.description}</p>}
              <div className="space-y-1 pl-2">
                {task.checklist!.map((item: any, i: number) => (
                  <label key={i} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={(e) => updateChecklistItem(task, i, e.target.checked)}
                      className="shrink-0"
                    />
                    <span className={item.checked ? 'line-through opacity-50' : ''}>{item.text}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function AttachmentsTab({ leadId }: { leadId: string }) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { data: attachments, isLoading, error: attError } = useLeadAttachments(leadId);
  const deleteAttachment = useDeleteAttachment();
  const [showUpload, setShowUpload] = useState(false);

  const handleDelete = async (attachmentId: string) => {
    try {
      await deleteAttachment.mutateAsync({ leadId, attachmentId });
      toast({ title: t('common.success'), description: t('crm.fileDeleted') });
    } catch (err) {
      toast({ title: t('common.error'), description: getApiErrorMessage(err, t('common.operationFailed')), variant: 'destructive' });
    }
  };

  if (isLoading) return <div className="space-y-3">{[1,2,3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>;

  if (attError) return <p className="text-center text-destructive py-8">{t('common.operationFailed')}</p>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{t('common.attachments')}</CardTitle>
        <Button variant="outline" size="sm" onClick={() => setShowUpload(!showUpload)}>
          <Plus className="h-4 w-4 mr-1" /> {t('common.upload')}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {showUpload && <FileUpload leadId={leadId} onSuccess={() => setShowUpload(false)} />}

        {attachments && attachments.length > 0 ? (
          <div className="space-y-2">
            {attachments.map((att) => (
              <div key={att.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 group">
                <Paperclip className="h-4 w-4 text-muted-foreground shrink-0" />
                <a href={att.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex-1 truncate">
                  {att.fileName}
                </a>
                <span className="text-xs text-muted-foreground shrink-0">{new Date(att.createdAt).toLocaleDateString()}</span>
                <button
                  type="button"
                  onClick={() => handleDelete(att.id)}
                  className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          !showUpload && <p className="text-center text-muted-foreground py-8">{t('common.noData')}</p>
        )}
      </CardContent>
    </Card>
  );
}
