import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { v4 as uuidv4 } from 'uuid';

interface TriggerEvent {
  triggerType: string;
  entityType: string;
  entityId: string;
  entity: Record<string, any>;
  userId?: string;
  changes?: Record<string, any>;
}

interface ActionDefinition {
  type: 'create_task' | 'create_task_chain' | 'change_stage' | 'assign_lead' | 'send_notification' | 'update_field';
  config: Record<string, any>;
}

@Injectable()
export class AutomationEngineService {
  private readonly logger = new Logger(AutomationEngineService.name);

  constructor(private prisma: PrismaService) {}

  private interpolate(template: string, data: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      const val = data[key];
      return val != null ? String(val) : `{{${key}}}`;
    });
  }

  private evaluateCondition(value: any, condition: any): boolean {
    if (condition == null) return true;
    if (typeof condition === 'object' && !Array.isArray(condition)) {
      for (const [op, target] of Object.entries(condition)) {
        const t = target as any;
        if (op === 'gte') { if (!(value >= t)) return false; }
        else if (op === 'gt') { if (!(value > t)) return false; }
        else if (op === 'lte') { if (!(value <= t)) return false; }
        else if (op === 'lt') { if (!(value < t)) return false; }
        else if (op === 'eq') { if (value != t) return false; }
        else if (op === 'ne') { if (value == t) return false; }
        else if (op === 'in') { if (!(Array.isArray(t) && t.includes(value))) return false; }
        else if (op === 'contains') { if (!String(value).toLowerCase().includes(String(t as string).toLowerCase())) return false; }
      }
      return true;
    }
    return value === condition;
  }

  private matchesConditions(conditions: Record<string, any>, entity: Record<string, any>): boolean {
    if (!conditions || Object.keys(conditions).length === 0) return true;
    for (const [field, condition] of Object.entries(conditions)) {
      const value = entity[field];
      if (!this.evaluateCondition(value, condition)) return false;
    }
    return true;
  }

  private async executeAction(action: ActionDefinition, event: TriggerEvent): Promise<void> {
    const { type, config } = action;
    const entity = { ...event.entity, entityId: event.entityId, entityType: event.entityType };
    const userId = event.userId;

    switch (type) {
      case 'create_task': {
        const title = this.interpolate(config.title || 'Task', entity);
        const description = config.description ? this.interpolate(config.description, entity) : undefined;
        const dueDays = config.dueDays ? parseInt(config.dueDays) : undefined;
        const dueDate = dueDays ? new Date(Date.now() + dueDays * 86400000) : undefined;
        const taskType = config.taskType || 'follow_up';
        const priority = config.priority || 'medium';
        await this.prisma.leadTask.create({
          data: {
            leadId: event.entityId,
            title,
            description,
            taskType,
            priority,
            assignedTo: config.assignToCreator === true || config.assignToCreator === 'true' ? userId : (config.assigneeId || undefined),
            dueDate,
            reminderAt: dueDate ? new Date(dueDate.getTime() - 86400000) : undefined,
          },
        });
        if (userId) {
          await this.prisma.activity.create({
            data: {
              leadId: event.entityId,
              userId,
              actionType: 'task_created',
              description: `Auto-generated task: ${title}`,
              metadata: { source: 'automation', triggerType: event.triggerType },
            },
          });
        }
        break;
      }

      case 'create_task_chain': {
        const tasks: any[] = config.tasks || [];
        if (tasks.length === 0) break;
        const chainId = uuidv4();
        const chainTotal = tasks.length;
        const chainBlueprint = JSON.stringify(tasks.map(t => ({
          title: this.interpolate(t.title || 'Task', entity),
          description: t.description ? this.interpolate(t.description, entity) : undefined,
          taskType: t.taskType || 'follow_up',
          assignToCreator: t.assignToCreator,
          checklist: Array.isArray(t.checklist) ? t.checklist.map((item: any) => ({
            text: item.text,
            checked: false,
          })) : [],
        })));
        const first = tasks[0];
        const firstChecklist = Array.isArray(first.checklist)
          ? first.checklist.map((item: any) => ({ text: item.text, checked: false }))
          : undefined;
        await this.prisma.leadTask.create({
          data: {
            leadId: event.entityId,
            title: this.interpolate(first.title || 'Task', entity),
            description: first.description ? this.interpolate(first.description, entity) : undefined,
            taskType: first.taskType || 'follow_up',
            priority: 'medium',
            assignedTo: first.assignToCreator === true || first.assignToCreator === 'true' ? userId : undefined,
            chainOrder: 1,
            chainTotal,
            chainId,
            chainBlueprint,
            checklist: firstChecklist,
          },
        });
        if (userId) {
          await this.prisma.activity.create({
            data: {
              leadId: event.entityId,
              userId,
              actionType: 'task_created',
              description: `Auto-generated chain task 1/${chainTotal}: ${this.interpolate(first.title || 'Task', entity)}`,
              metadata: { source: 'automation', triggerType: event.triggerType },
            },
          });
        }
        break;
      }

      case 'change_stage': {
        const stageCode = config.stageCode;
        if (stageCode) {
          const stage = await this.prisma.pipelineStage.findFirst({ where: { code: stageCode } });
          if (stage) {
            await this.prisma.lead.update({
              where: { id: event.entityId },
              data: { stageId: stage.id },
            });
          }
        }
        break;
      }

      case 'assign_lead': {
        const assigneeId = config.assignToCreator === true || config.assignToCreator === 'true' ? userId : config.assigneeId;
        if (assigneeId) {
          await this.prisma.lead.update({
            where: { id: event.entityId },
            data: { assignedTo: assigneeId },
          });
        }
        break;
      }

      case 'send_notification': {
        const targetUserId = config.userId || userId;
        if (targetUserId) {
          const title = this.interpolate(config.title || 'Notification', entity);
          const body = config.body ? this.interpolate(config.body, entity) : undefined;
          await this.prisma.notification.create({
            data: {
              userId: targetUserId,
              title,
              body,
              type: 'automation',
              referenceType: event.entityType,
              referenceId: event.entityId,
            },
          });
        }
        break;
      }

      case 'update_field': {
        const field = config.field;
        const value = config.value;
        if (field && value !== undefined) {
          await this.prisma.lead.update({
            where: { id: event.entityId },
            data: { [field]: value },
          });
        }
        break;
      }
    }
  }

  async evaluateAndExecute(event: TriggerEvent): Promise<void> {
    try {
      const rules = await this.prisma.automationRule.findMany({
        where: {
          triggerType: event.triggerType,
          isActive: true,
        },
      });

      for (const rule of rules) {
        try {
          const conditions = rule.conditions as Record<string, any> | null;
          if (!this.matchesConditions(conditions || {}, event.entity)) continue;

          const actions = (rule.actions as any[]) || [];
          for (const action of actions) {
            await this.executeAction(action as ActionDefinition, event);
          }

          await this.prisma.automationRule.update({
            where: { id: rule.id },
            data: {
              runCount: { increment: 1 },
              lastRunAt: new Date(),
            },
          });
        } catch (ruleError) {
          this.logger.error(`Automation rule ${rule.id} (${rule.name}) failed: ${ruleError.message}`);
        }
      }
    } catch (error) {
      this.logger.error(`Automation engine error for ${event.triggerType}: ${error.message}`);
    }
  }

  async continueChain(completedTask: { id: string; chainId: string | null; chainOrder: number | null; chainTotal: number | null; chainBlueprint: any; leadId: string }, userId?: string): Promise<void> {
    if (!completedTask.chainId || completedTask.chainOrder == null || completedTask.chainTotal == null) return;
    const nextOrder = completedTask.chainOrder + 1;
    if (nextOrder > completedTask.chainTotal) return;

    let blueprint: any[];
    try {
      blueprint = typeof completedTask.chainBlueprint === 'string'
        ? JSON.parse(completedTask.chainBlueprint)
        : (Array.isArray(completedTask.chainBlueprint) ? completedTask.chainBlueprint : []);
    } catch {
      this.logger.error(`Invalid chain blueprint for task ${completedTask.id}`);
      return;
    }

    const nextTaskConfig = blueprint[nextOrder - 1];
    if (!nextTaskConfig) return;

    const nextChecklist = Array.isArray(nextTaskConfig.checklist)
      ? nextTaskConfig.checklist.map((item: any) => ({ text: item.text, checked: false }))
      : undefined;

    const task = await this.prisma.leadTask.create({
      data: {
        leadId: completedTask.leadId,
        title: nextTaskConfig.title || 'Task',
        description: nextTaskConfig.description,
        taskType: nextTaskConfig.taskType || 'follow_up',
        priority: 'medium',
        assignedTo: nextTaskConfig.assignToCreator === true || nextTaskConfig.assignToCreator === 'true' ? userId : undefined,
        chainOrder: nextOrder,
        chainTotal: completedTask.chainTotal,
        chainId: completedTask.chainId,
        chainBlueprint: completedTask.chainBlueprint,
        checklist: nextChecklist,
      },
    });

    if (userId) {
      await this.prisma.activity.create({
        data: {
          leadId: completedTask.leadId,
          userId,
          actionType: 'task_created',
          description: `Chain task ${nextOrder}/${completedTask.chainTotal}: ${nextTaskConfig.title}`,
          metadata: { source: 'automation', chainId: completedTask.chainId, chainOrder: nextOrder },
        },
      });
    }

    this.logger.log(`Chain continued: task ${nextOrder}/${completedTask.chainTotal} created for lead ${completedTask.leadId}`);
  }

  async fire(event: TriggerEvent): Promise<void> {
    Promise.resolve().then(() =>
      this.evaluateAndExecute(event).catch((err) => {
        this.logger.error(`Automation fire failed for ${event.triggerType} on ${event.entityType}/${event.entityId}: ${err.message}`);
        this.logger.error(err.stack);
      }),
    );
  }
}
