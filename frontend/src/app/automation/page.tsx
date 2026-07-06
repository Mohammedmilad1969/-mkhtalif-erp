'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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
import { useAutomations, useToggleAutomation, useCreateAutomation, useUpdateAutomation, useDeleteAutomation } from '@/hooks/useApi';
import { AutomationRule } from '@/types';
import {
  Plus, Zap, Play, Square, Trash2, Sparkles, Pencil, Layers,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const TRIGGER_OPTIONS = [
  { value: 'lead_created', label: 'Lead Created' },
  { value: 'lead_scored', label: 'Lead Scored' },
  { value: 'lead_qualified', label: 'Lead Qualified' },
  { value: 'stage_changed', label: 'Stage Changed' },
  { value: 'task_completed', label: 'Lead Task Completed' },
  { value: 'meeting_completed', label: 'Meeting Completed' },
  { value: 'proposal_accepted', label: 'Proposal Accepted' },
  { value: 'contract_signed', label: 'Contract Signed' },
  { value: 'payment_received', label: 'Payment Received' },
];

const CONDITION_FIELDS = [
  { value: 'leadScore', label: 'Lead Score' },
  { value: 'leadTemperature', label: 'Temperature' },
  { value: 'source', label: 'Source' },
  { value: 'clientName', label: 'Client Name' },
  { value: 'company', label: 'Company' },
  { value: 'email', label: 'Email' },
];

const OPERATORS = [
  { value: 'eq', label: 'is' },
  { value: 'ne', label: 'is not' },
  { value: 'gte', label: '≥' },
  { value: 'gt', label: '>' },
  { value: 'lte', label: '≤' },
  { value: 'lt', label: '<' },
  { value: 'contains', label: 'contains' },
];

const TEMP_VALUES = [
  { value: 'hot', label: 'Hot' },
  { value: 'warm', label: 'Warm' },
  { value: 'cold', label: 'Cold' },
];

const TASK_TYPE_OPTIONS = [
  { value: 'call', label: '📞 Call' },
  { value: 'meeting', label: '📅 Meeting' },
  { value: 'proposal', label: '📄 Proposal' },
  { value: 'email', label: '✉️ Email' },
  { value: 'follow_up', label: '🔄 Follow Up' },
  { value: 'review', label: '👁️ Review' },
  { value: 'design', label: '🎨 Design' },
  { value: 'development', label: '💻 Development' },
  { value: 'feedback', label: '💬 Feedback' },
  { value: 'approval', label: '✅ Approval' },
  { value: 'research', label: '🔍 Research' },
  { value: 'quote', label: '💰 Quote' },
  { value: 'onboarding', label: '🚀 Onboarding' },
  { value: 'other', label: '📌 Other' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: '🟢 Low' },
  { value: 'medium', label: '🟡 Medium' },
  { value: 'high', label: '🔴 High' },
  { value: 'urgent', label: '🔴 Urgent' },
];

const STAGE_OPTIONS = [
  { value: 'new_lead', label: '🆕 New Lead' },
  { value: 'contacted', label: '📞 Contacted' },
  { value: 'qualification', label: '📋 Qualification' },
  { value: 'qualified', label: '✅ Qualified' },
  { value: 'meeting_scheduled', label: '📅 Meeting Scheduled' },
  { value: 'proposal_sent', label: '📄 Proposal Sent' },
  { value: 'negotiation', label: '🤝 Negotiation' },
  { value: 'won', label: '🏆 Won' },
  { value: 'lost', label: '❌ Lost' },
];

const ACTION_TYPES = [
  { value: 'create_task', label: '📝 Create Task' },
  { value: 'create_task_chain', label: '🔗 Task Chain (Multi-step)' },
  { value: 'change_stage', label: '🔄 Change Stage' },
  { value: 'assign_lead', label: '👤 Assign Lead' },
  { value: 'send_notification', label: '🔔 Send Notification' },
];

const PRESETS: { name: string; description: string; triggerType: string; conditions: ConditionRow[]; actions: { type: string; config: Record<string, any> }[] }[] = [
  {
    name: 'Hot Lead Follow-up',
    description: 'Auto-create a high-priority task when a lead scores 8+',
    triggerType: 'lead_scored',
    conditions: [{ field: 'leadScore', op: 'gte', value: '8' }],
    actions: [{ type: 'create_task', config: { title: 'Schedule discovery meeting with {{clientName}}', taskType: 'meeting', priority: 'high', dueDays: '2', assignToCreator: 'true' } }],
  },
  {
    name: 'Cold Lead Nurture',
    description: 'Create a low-priority follow-up task for cold leads',
    triggerType: 'lead_created',
    conditions: [{ field: 'leadTemperature', op: 'eq', value: 'cold' }],
    actions: [{ type: 'create_task', config: { title: 'Send intro email to {{clientName}}', taskType: 'email', priority: 'low', dueDays: '7', assignToCreator: 'true' } }],
  },
  {
    name: 'Qualified → Meeting',
    description: 'Move qualified leads to meeting stage and create a task',
    triggerType: 'lead_qualified',
    conditions: [],
    actions: [
      { type: 'change_stage', config: { stageCode: 'meeting_scheduled' } },
      { type: 'create_task', config: { title: 'Prepare proposal for {{clientName}}', taskType: 'proposal', priority: 'high', dueDays: '3', assignToCreator: 'true' } },
    ],
  },
  {
    name: 'Post-Meeting Follow-up',
    description: 'Create a task after a meeting is completed',
    triggerType: 'meeting_completed',
    conditions: [],
    actions: [{ type: 'create_task', config: { title: 'Send meeting summary to {{clientName}}', taskType: 'email', priority: 'medium', dueDays: '1', assignToCreator: 'true' } }],
  },
  {
    name: 'Contract Signed Kickoff',
    description: 'Notify the team when a contract is signed',
    triggerType: 'contract_signed',
    conditions: [],
    actions: [{ type: 'send_notification', config: { title: '{{clientName}} signed!', body: 'Contract signed. Start onboarding.' } }],
  },
  {
    name: 'New Lead Onboarding Chain',
    description: '3-step onboarding: intro email → call → proposal',
    triggerType: 'lead_created',
    conditions: [],
    actions: [{
      type: 'create_task_chain',
      config: {
        tasks: [
          { title: 'Send intro email to {{clientName}}', taskType: 'email', description: '', assignToCreator: 'true', checklist: [] },
          { title: 'Call {{clientName}} to discuss needs', taskType: 'call', description: '', assignToCreator: 'true', checklist: [] },
          { title: 'Prepare proposal for {{clientName}}', taskType: 'proposal', description: '', assignToCreator: 'true', checklist: [] },
        ],
      },
    }],
  },
];

interface ConditionRow {
  field: string;
  op: string;
  value: string;
}

interface ActionItem {
  type: string;
  config: Record<string, any>;
}

const emptyCondition = (): ConditionRow => ({ field: 'leadScore', op: 'gte', value: '' });
const emptyAction = (): ActionItem => ({ type: 'create_task', config: { taskType: 'follow_up', priority: 'medium', assignToCreator: 'true' } });

function combineChainActions(actions: ActionItem[]): ActionItem[] {
  const chainActions = actions.filter(a => a.type === 'create_task_chain');
  const otherActions = actions.filter(a => a.type !== 'create_task_chain');
  if (chainActions.length < 2) return actions;
  const allTasks = chainActions.flatMap(a => a.config.tasks || []);
  return [
    ...otherActions,
    { type: 'create_task_chain', config: { tasks: allTasks } },
  ];
}

function ConditionRowForm({ condition, onChange, onRemove }: {
  condition: ConditionRow;
  onChange: (c: ConditionRow) => void;
  onRemove: () => void;
}) {
  const needsCustomValue = !['leadTemperature'].includes(condition.field);
  const showTempValues = condition.field === 'leadTemperature';

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Select value={condition.field} onValueChange={(v) => onChange({ ...condition, field: v, value: '' })}>
        <SelectTrigger className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CONDITION_FIELDS.map((f) => (
            <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={condition.op} onValueChange={(v) => onChange({ ...condition, op: v })}>
        <SelectTrigger className="w-20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {OPERATORS.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showTempValues ? (
        <Select value={condition.value} onValueChange={(v) => onChange({ ...condition, value: v })}>
          <SelectTrigger className="w-28">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {TEMP_VALUES.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          className="w-28"
          type={needsCustomValue ? 'number' : 'text'}
          placeholder="value"
          value={condition.value}
          onChange={(e) => onChange({ ...condition, value: e.target.value })}
        />
      )}

      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onRemove}>
        <Trash2 className="h-3 w-3 text-destructive" />
      </Button>
    </div>
  );
}

function ChecklistBuilder({ items, onChange }: {
  items: { text: string; checked: boolean }[];
  onChange: (items: { text: string; checked: boolean }[]) => void;
}) {
  const addItem = () => {
    onChange([...items, { text: '', checked: false }]);
  };
  const updateItem = (index: number, updates: Partial<{ text: string; checked: boolean }>) => {
    const next = [...items];
    next[index] = { ...next[index], ...updates };
    onChange(next);
  };
  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Label className="text-xs text-muted-foreground">Checklist (optional)</Label>
        <button type="button" onClick={addItem} className="text-xs text-primary hover:underline">+ Add item</button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={item.checked}
            onChange={(e) => updateItem(i, { checked: e.target.checked })}
            className="shrink-0"
          />
          <Input
            className="h-7 text-xs flex-1"
            value={item.text}
            onChange={(e) => updateItem(i, { text: e.target.value })}
            placeholder="Checklist item..."
          />
          <button type="button" onClick={() => removeItem(i)} className="text-destructive hover:text-destructive/80 shrink-0">
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
}

function TaskChainBuilder({ tasks, onChange }: {
  tasks: any[];
  onChange: (tasks: any[]) => void;
}) {
  const updateTask = (index: number, updates: any) => {
    const next = [...tasks];
    next[index] = { ...next[index], ...updates };
    onChange(next);
  };

  const addTask = () => {
    onChange([...tasks, { title: '', taskType: 'follow_up', description: '', assignToCreator: 'true', checklist: [] }]);
  };

  const removeTask = (index: number) => {
    onChange(tasks.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-muted-foreground uppercase">Chain Steps ({tasks.length})</Label>
        <Button variant="ghost" size="sm" onClick={addTask} className="h-7 text-xs">
          <Plus className="h-3 w-3 mr-1" /> Add Step
        </Button>
      </div>
      {tasks.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">No steps yet. Tasks will appear one after another as each is completed.</p>
      ) : (
        <div className="space-y-3">
          {tasks.map((task, i) => (
            <div key={i} className="p-3 border rounded-md bg-background space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {i === 0 ? 'First step' : i === tasks.length - 1 ? 'Final step' : `Step ${i + 1}`}
                  </span>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeTask(i)}>
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Title *</Label>
                <Input value={task.title} onChange={(e) => updateTask(i, { title: e.target.value })} placeholder="e.g. Call {{clientName}}" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Description (optional)</Label>
                <textarea
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                  value={task.description || ''}
                  onChange={(e) => updateTask(i, { description: e.target.value })}
                  placeholder="e.g. Discuss project requirements and timeline with {{clientName}}"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Type</Label>
                  <Select value={task.taskType} onValueChange={(v) => updateTask(i, { taskType: v })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TASK_TYPE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <input type="checkbox" checked={task.assignToCreator === 'true'} onChange={(e) => updateTask(i, { assignToCreator: e.target.checked ? 'true' : 'false' })} />
                    Assign to me
                  </label>
                </div>
              </div>
              <ChecklistBuilder
                items={task.checklist || []}
                onChange={(items) => updateTask(i, { checklist: items })}
              />
              <div className="flex justify-end">
                {i < tasks.length - 1 ? (
                  <span className="text-xs text-emerald-600 flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                    auto-creates next step when completed
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground italic">Last step — no follow-up</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {tasks.length > 1 && (
        <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-xs font-medium text-primary flex items-center gap-1">How chains work</p>
          <ul className="text-xs text-muted-foreground mt-1 space-y-0.5 list-disc list-inside">
            <li>Only <strong>Step 1</strong> is created immediately</li>
            <li>Marking a step <strong>completed</strong> in lead details auto-creates the next step</li>
            <li>Each step inherits the chain template (title, description, type, priority, due date)</li>
          </ul>
        </div>
      )}
    </div>
  );
}

function ActionForm({ action, onChange, onRemove }: {
  action: ActionItem;
  onChange: (a: ActionItem) => void;
  onRemove: () => void;
}) {
  const updateConfig = (key: string, value: string) => {
    onChange({ ...action, config: { ...action.config, [key]: value } });
  };

  return (
    <div className="p-4 border rounded-lg space-y-4 bg-muted/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select value={action.type} onValueChange={(v) => onChange({ type: v, config: {} })}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACTION_TYPES.map((at) => (
                <SelectItem key={at.value} value={at.value}>{at.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="ghost" size="icon" onClick={onRemove} className="h-8 w-8 text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {action.type === 'create_task' && (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Task title</Label>
            <Input value={action.config.title || ''} onChange={(e) => updateConfig('title', e.target.value)} placeholder="e.g. Follow up with {{clientName}}" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Type</Label>
              <Select value={action.config.taskType || 'follow_up'} onValueChange={(v) => updateConfig('taskType', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TASK_TYPE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Priority</Label>
              <Select value={action.config.priority || 'medium'} onValueChange={(v) => updateConfig('priority', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Due in (days)</Label>
              <Input type="number" min="0" value={action.config.dueDays || ''} onChange={(e) => updateConfig('dueDays', e.target.value)} placeholder="3" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={action.config.assignToCreator === 'true'} onChange={(e) => updateConfig('assignToCreator', e.target.checked ? 'true' : 'false')} />
            Assign to me
          </label>
        </div>
      )}

      {action.type === 'change_stage' && (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Move lead to stage</Label>
          <Select value={action.config.stageCode || ''} onValueChange={(v) => updateConfig('stageCode', v)}>
            <SelectTrigger><SelectValue placeholder="Choose stage..." /></SelectTrigger>
            <SelectContent>
              {STAGE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {action.type === 'assign_lead' && (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <input type="checkbox" id="assignCreator" checked={action.config.assignToCreator === 'true'} onChange={(e) => updateConfig('assignToCreator', e.target.checked ? 'true' : 'false')} />
            <Label htmlFor="assignCreator" className="text-sm">Assign this lead to me</Label>
          </div>
        </div>
      )}

      {action.type === 'send_notification' && (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Notification title</Label>
            <Input value={action.config.title || ''} onChange={(e) => updateConfig('title', e.target.value)} placeholder="e.g. New hot lead: {{clientName}}" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Message</Label>
            <textarea
              className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={action.config.body || ''}
              onChange={(e) => updateConfig('body', e.target.value)}
              placeholder="e.g. {{clientName}} from {{company}} scored {{leadScore}}/10"
            />
          </div>
          <p className="text-xs text-muted-foreground">Tip: Use {'{'}clientName{'}'}, {'{'}company{'}'}, {'{'}leadScore{'}'} to insert lead data.</p>
        </div>
      )}

      {action.type === 'create_task_chain' && (
        <TaskChainBuilder
          tasks={action.config.tasks || []}
          onChange={(tasks) => onChange({ ...action, config: { ...action.config, tasks } })}
        />
      )}
    </div>
  );
}

function PresetCard({ preset, onApply }: { preset: typeof PRESETS[0]; onApply: () => void }) {
  return (
    <Card className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all" onClick={onApply}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium text-sm">{preset.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{preset.description}</p>
            <div className="flex gap-1.5 mt-2">
              <Badge variant="secondary" className="text-[10px]">{TRIGGER_OPTIONS.find(t => t.value === preset.triggerType)?.label || preset.triggerType}</Badge>
              {preset.actions.map((a, i) => (
                <Badge key={i} variant="outline" className="text-[10px]">{ACTION_TYPES.find(at => at.value === a.type)?.label.replace(/^[^\s]+\s/, '') || a.type}</Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AutomationPage() {
  const { toast } = useToast();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showPresets, setShowPresets] = useState(true);
  const [form, setForm] = useState<{
    name: string;
    description: string;
    triggerType: string;
    conditions: ConditionRow[];
    actions: ActionItem[];
    isActive: boolean;
  }>({
    name: '',
    description: '',
    triggerType: 'lead_created',
    conditions: [],
    actions: [emptyAction()],
    isActive: true,
  });

  const { data, isLoading } = useAutomations();
  const toggleAutomation = useToggleAutomation();
  const createAutomation = useCreateAutomation();
  const updateAutomation = useUpdateAutomation();
  const deleteAutomation = useDeleteAutomation();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<{
    name: string;
    description: string;
    triggerType: string;
    conditions: ConditionRow[];
    actions: ActionItem[];
    isActive: boolean;
  }>({
    name: '',
    description: '',
    triggerType: 'lead_created',
    conditions: [],
    actions: [emptyAction()],
    isActive: true,
  });
  const automations = data?.data || [];

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setForm({
      name: preset.name,
      description: preset.description,
      triggerType: preset.triggerType,
      conditions: preset.conditions.map(c => ({ ...c })),
      actions: preset.actions.map(a => ({ type: a.type, config: { ...a.config } } as ActionItem)),
      isActive: true,
    });
    setShowPresets(false);
  };

  const handleSubmit = () => {
    if (!form.name) return;

    try {
      const parsedConditions: Record<string, any> = {};
      for (const row of form.conditions) {
        if (!row.field || !row.value) continue;
        if (row.op === 'eq') {
          parsedConditions[row.field] = isNaN(Number(row.value)) ? row.value : Number(row.value);
        } else {
          parsedConditions[row.field] = { [row.op]: isNaN(Number(row.value)) ? row.value : Number(row.value) };
        }
      }

      const actions = form.actions
        .filter((a) => {
          if (a.type === 'create_task') return a.config.title?.trim();
          if (a.type === 'create_task_chain') {
            const chainTasks = a.config.tasks || [];
            return chainTasks.length > 0 && chainTasks.some((t: any) => t.title?.trim());
          }
          return true;
        })
        .map((a) => ({ type: a.type, config: a.config }));

      const payload = {
        name: form.name,
        description: form.description,
        triggerType: form.triggerType,
        triggerConfig: undefined,
        conditions: Object.keys(parsedConditions).length > 0 ? parsedConditions : undefined,
        actions,
        isActive: form.isActive,
      };
      createAutomation.mutate(payload, {
        onSuccess: () => {
          toast({ title: 'Rule created', description: `${form.name} will now run automatically.` });
          setDialogOpen(false);
          setShowPresets(true);
          setForm({ name: '', description: '', triggerType: 'lead_created', conditions: [], actions: [emptyAction()], isActive: true });
        },
        onError: () => {
          toast({ title: 'Error', description: 'Failed to create automation rule', variant: 'destructive' });
        },
      });
    } catch {
      toast({ title: 'Error', description: 'Invalid configuration', variant: 'destructive' });
    }
  };

  const handleToggle = async (rule: AutomationRule) => {
    try {
      await toggleAutomation.mutateAsync({ id: rule.id, data: { isActive: !rule.isActive } });
      toast({ title: rule.isActive ? 'Rule deactivated' : 'Rule activated', description: `${rule.name} has been updated` });
    } catch {
      toast({ title: 'Error', description: 'Failed to toggle automation rule', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAutomation.mutateAsync(id);
      toast({ title: 'Rule deleted', description: 'Automation rule has been removed' });
      setDeleteConfirmId(null);
    } catch {
      toast({ title: 'Error', description: 'Failed to delete automation rule', variant: 'destructive' });
    }
  };

  const openEditRule = (rule: AutomationRule) => {
    const rawActions = rule.actions;
    const actions: any[] = Array.isArray(rawActions) ? rawActions : (rawActions ? [rawActions] : []);
    const rawConditions = rule.conditions as Record<string, any> | null;
    const conditions: ConditionRow[] = [];
    if (rawConditions) {
      for (const [field, cond] of Object.entries(rawConditions)) {
        if (typeof cond === 'object' && cond !== null) {
          const op = Object.keys(cond)[0];
          conditions.push({ field, op, value: String((cond as any)[op]) });
        } else {
          conditions.push({ field, op: 'eq', value: String(cond) });
        }
      }
    }
    setEditForm({
      name: rule.name,
      description: rule.description || '',
      triggerType: rule.triggerType,
      conditions,
      actions: actions.map((a: any) => ({ type: a.type, config: { ...a.config } } as ActionItem)),
      isActive: rule.isActive,
    });
    setEditingRule(rule);
    setEditDialogOpen(true);
  };

  const handleEditSubmit = () => {
    if (!editForm.name || !editingRule) return;
    try {
      const parsedConditions: Record<string, any> = {};
      for (const row of editForm.conditions) {
        if (!row.field || !row.value) continue;
        if (row.op === 'eq') {
          parsedConditions[row.field] = isNaN(Number(row.value)) ? row.value : Number(row.value);
        } else {
          parsedConditions[row.field] = { [row.op]: isNaN(Number(row.value)) ? row.value : Number(row.value) };
        }
      }
      const actions = editForm.actions
        .filter((a) => {
          if (a.type === 'create_task') return a.config.title?.trim();
          if (a.type === 'create_task_chain') {
            const chainTasks = a.config.tasks || [];
            return chainTasks.length > 0 && chainTasks.some((t: any) => t.title?.trim());
          }
          return true;
        })
        .map((a) => ({ type: a.type, config: a.config }));
      const payload = {
        name: editForm.name,
        description: editForm.description,
        triggerType: editForm.triggerType,
        triggerConfig: undefined,
        conditions: Object.keys(parsedConditions).length > 0 ? parsedConditions : undefined,
        actions,
        isActive: editForm.isActive,
      };
      updateAutomation.mutate({ id: editingRule.id, data: payload }, {
        onSuccess: () => {
          toast({ title: 'Rule updated', description: `${editForm.name} has been saved.` });
          setEditDialogOpen(false);
          setEditingRule(null);
        },
        onError: () => {
          toast({ title: 'Error', description: 'Failed to update automation rule', variant: 'destructive' });
        },
      });
    } catch {
      toast({ title: 'Error', description: 'Invalid configuration', variant: 'destructive' });
    }
  };

  const openNewRule = () => {
    setShowPresets(true);
    setForm({ name: '', description: '', triggerType: 'lead_created', conditions: [], actions: [emptyAction()], isActive: true });
    setDialogOpen(true);
  };

  const addCondition = () => setForm({ ...form, conditions: [...form.conditions, emptyCondition()] });

  const updateCondition = (index: number, condition: ConditionRow) => {
    const next = [...form.conditions];
    next[index] = condition;
    setForm({ ...form, conditions: next });
  };

  const removeCondition = (index: number) => {
    setForm({ ...form, conditions: form.conditions.filter((_, i) => i !== index) });
  };

  const addAction = () => setForm({ ...form, actions: [...form.actions, emptyAction()] });

  const updateAction = (index: number, action: ActionItem) => {
    const next = [...form.actions];
    next[index] = action;
    setForm({ ...form, actions: next });
  };

  const removeAction = (index: number) => {
    setForm({ ...form, actions: form.actions.filter((_, i) => i !== index) });
  };

  const isPresetSelected = useMemo(() =>
    PRESETS.some(p =>
      p.name === form.name &&
      p.triggerType === form.triggerType &&
      p.actions.length === form.actions.length &&
      p.actions.every((a, i) => a.type === form.actions[i]?.type)
    ),
    [form],
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <h1 className="page-title">Automation Rules</h1>
            <p className="text-sm text-muted-foreground">Auto-generate tasks and actions from lead events</p>
          </div>
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Automation Rules</h1>
          <p className="text-sm text-muted-foreground">Auto-generate tasks and actions from lead events</p>
        </div>
        <Button onClick={openNewRule}>
          <Plus className="mr-2 h-4 w-4" />
          New Rule
        </Button>
      </div>

      {/* Presets — shown in the dialog when opening */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {showPresets ? (
            <>
              <DialogHeader>
                <DialogTitle>Create Automation Rule</DialogTitle>
                <DialogDescription>
                  Pick a preset to get started, or build your own from scratch.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Start from a template</p>
                <div className="grid gap-3">
                  {PRESETS.map((preset, i) => (
                    <PresetCard key={i} preset={preset} onApply={() => applyPreset(preset)} />
                  ))}
                </div>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">or build custom</span></div>
                </div>
                <Button variant="outline" className="w-full" onClick={() => setShowPresets(false)}>
                  <Plus className="mr-2 h-4 w-4" /> Start from scratch
                </Button>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>{isPresetSelected ? 'Confirm Rule' : 'Create Automation Rule'}</DialogTitle>
                <DialogDescription>
                  {isPresetSelected ? 'Review and save the preset.' : 'Define when to trigger and what to do.'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-5">
                {isPresetSelected && (
                  <Button variant="ghost" size="sm" onClick={() => setShowPresets(true)} className="text-xs -mb-3">
                    ← Back to presets
                  </Button>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Rule name *</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Hot lead follow-up" />
                  </div>
                  <div className="space-y-2">
                    <Label>When this happens</Label>
                    <Select value={form.triggerType} onValueChange={(v) => setForm({ ...form, triggerType: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TRIGGER_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description (optional)</Label>
                  <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What this rule does" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Only run when</Label>
                    <Button variant="ghost" size="sm" onClick={addCondition} className="h-7 text-xs">
                      <Plus className="h-3 w-3 mr-1" /> Add condition
                    </Button>
                  </div>
                  {form.conditions.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">No conditions — runs on every {TRIGGER_OPTIONS.find(t => t.value === form.triggerType)?.label || 'event'}.</p>
                  ) : (
                    <div className="space-y-2">
                      {form.conditions.map((cond, i) => (
                        <ConditionRowForm
                          key={i}
                          condition={cond}
                          onChange={(c) => updateCondition(i, c)}
                          onRemove={() => removeCondition(i)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Do this</Label>
                    <div className="flex items-center gap-2">
                      {form.actions.filter(a => a.type === 'create_task_chain').length >= 2 && (
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setForm({ ...form, actions: combineChainActions(form.actions) })}>
                          <Layers className="h-3 w-3 mr-1" /> Combine chains
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={addAction} className="h-7 text-xs">
                        <Plus className="h-3 w-3 mr-1" /> Add action
                      </Button>
                    </div>
                  </div>
                  {form.actions.map((action, i) => (
                    <ActionForm
                      key={i}
                      action={action}
                      onChange={(a) => updateAction(i, a)}
                      onRemove={() => removeAction(i)}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded border-gray-300" />
                  <Label htmlFor="isActive">Turn on immediately</Label>
                </div>

                <Button onClick={handleSubmit} className="w-full" disabled={createAutomation.isPending || !form.name}>
                  {createAutomation.isPending ? 'Creating...' : isPresetSelected ? 'Save Preset Rule' : 'Create Rule'}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Automation Rule</DialogTitle>
            <DialogDescription>Update the rule configuration.</DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rule name *</Label>
                <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="e.g. Hot lead follow-up" />
              </div>
              <div className="space-y-2">
                <Label>When this happens</Label>
                <Select value={editForm.triggerType} onValueChange={(v) => setEditForm({ ...editForm, triggerType: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIGGER_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Input value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} placeholder="What this rule does" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Only run when</Label>
                <Button variant="ghost" size="sm" onClick={() => setEditForm({ ...editForm, conditions: [...editForm.conditions, emptyCondition()] })} className="h-7 text-xs">
                  <Plus className="h-3 w-3 mr-1" /> Add condition
                </Button>
              </div>
              {editForm.conditions.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No conditions — runs on every event.</p>
              ) : (
                <div className="space-y-2">
                  {editForm.conditions.map((cond, i) => (
                    <ConditionRowForm
                      key={i}
                      condition={cond}
                      onChange={(c) => {
                        const next = [...editForm.conditions];
                        next[i] = c;
                        setEditForm({ ...editForm, conditions: next });
                      }}
                      onRemove={() => setEditForm({ ...editForm, conditions: editForm.conditions.filter((_, j) => j !== i) })}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Do this</Label>
                <div className="flex items-center gap-2">
                  {editForm.actions.filter(a => a.type === 'create_task_chain').length >= 2 && (
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setEditForm({ ...editForm, actions: combineChainActions(editForm.actions) })}>
                      <Layers className="h-3 w-3 mr-1" /> Combine chains
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => setEditForm({ ...editForm, actions: [...editForm.actions, emptyAction()] })} className="h-7 text-xs">
                    <Plus className="h-3 w-3 mr-1" /> Add action
                  </Button>
                </div>
              </div>
              {editForm.actions.map((action, i) => (
                <ActionForm
                  key={i}
                  action={action}
                  onChange={(a) => {
                    const next = [...editForm.actions];
                    next[i] = a;
                    setEditForm({ ...editForm, actions: next });
                  }}
                  onRemove={() => setEditForm({ ...editForm, actions: editForm.actions.filter((_, j) => j !== i) })}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="editIsActive" checked={editForm.isActive} onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })} className="rounded border-gray-300" />
              <Label htmlFor="editIsActive">Active</Label>
            </div>

            <Button onClick={handleEditSubmit} className="w-full" disabled={updateAutomation.isPending || !editForm.name}>
              {updateAutomation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {automations.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Zap className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No automation rules yet</p>
          <p className="text-sm mt-1">Pick a preset or create a custom rule to auto-generate tasks.</p>
          <Button variant="outline" className="mt-4" onClick={openNewRule}>
            <Plus className="mr-2 h-4 w-4" /> Create your first rule
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {automations.map((rule) => {
            const rawActions = rule.actions;
            const actions: any[] = Array.isArray(rawActions) ? rawActions : (rawActions ? [rawActions] : []);
            const conditions = rule.conditions as Record<string, any> | null;
            return (
              <Card key={rule.id}>
                <CardContent className="p-0">
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setExpandedId(expandedId === rule.id ? null : rule.id)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-2 h-2 rounded-full ${rule.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{rule.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{rule.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <Badge variant="secondary" className="text-xs">{rule.triggerType?.replace(/_/g, ' ')}</Badge>
                      <span className="hidden sm:inline">{rule.lastRunAt ? new Date(rule.lastRunAt).toLocaleDateString() : 'Never'}</span>
                      <span className="hidden sm:inline">{rule.runCount} runs</span>
                      <Button
                        variant={rule.isActive ? 'default' : 'outline'}
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => { e.stopPropagation(); handleToggle(rule); }}
                      >
                        {rule.isActive ? <Square className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                  {expandedId === rule.id && (
                    <div className="px-4 pb-4 pt-0 border-t border-border mt-0">
                      <div className="pt-3 space-y-3 text-sm">
                        {conditions && Object.keys(conditions).length > 0 && (
                          <div>
                            <span className="text-muted-foreground font-medium">Conditions: </span>
                            <div className="mt-1 space-y-1">
                              {Object.entries(conditions).map(([field, cond]) => (
                                <div key={field} className="flex items-center gap-2 text-xs">
                                  <Badge variant="outline">{field}</Badge>
                                  <span>{JSON.stringify(cond)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div>
                          <span className="text-muted-foreground font-medium">Actions ({actions.length}):</span>
                          <div className="mt-1 space-y-2">
                            {actions.map((action: any, i: number) => (
                              <div key={i} className="flex items-start gap-2 text-xs p-2 bg-muted/30 rounded">
                                <Badge variant="secondary" className="shrink-0">{action.type?.replace(/_/g, ' ')}</Badge>
                                <span className="text-muted-foreground">{JSON.stringify(action.config)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Last run: {rule.lastRunAt ? new Date(rule.lastRunAt).toLocaleString() : 'Never'} &middot; Total: {rule.runCount} runs
                        </div>
                        <div className="pt-2 flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={(e) => { e.stopPropagation(); openEditRule(rule); }}
                          >
                            <Pencil className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          {deleteConfirmId === rule.id ? (
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-destructive font-medium">Delete this rule?</span>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="h-7 text-xs"
                                disabled={deleteAutomation.isPending}
                                onClick={(e) => { e.stopPropagation(); handleDelete(rule.id); }}
                              >
                                {deleteAutomation.isPending ? 'Deleting...' : 'Confirm'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(null); }}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-destructive hover:text-destructive"
                              onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(rule.id); }}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
