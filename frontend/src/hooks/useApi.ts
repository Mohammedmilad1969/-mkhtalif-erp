'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, patch, put, del } from '@/lib/api';
import {
  Lead, Client, Project, Task, Sprint, Deliverable,
  Meeting, Activity, Notification, User, PaginatedResponse,
  PipelineStageInfo, LeadScore, Proposal, Contract,
  Invoice, Payment, Campaign, KnowledgeArticle,
  AutomationRule, Kpi, KpiValue,
  TimeEntry, ResearchReport, StrategicBlueprint, CreativeBrief, AuditLog, ReportData,
  RoleOption, DepartmentOption,
  PermissionGroup, RolePermissionInfo,
  LeadQualification, LeadTask, LeadAttachment, CommunicationLog, DashboardWidget, CalendarEvent,
} from '@/types';

export function useLeads(params?: Record<string, unknown>) {
  return useQuery<PaginatedResponse<Lead>>({
    queryKey: ['leads', params],
    queryFn: () => get('/leads', params),
  });
}

export function useLead(id: string) {
  return useQuery<Lead>({
    queryKey: ['lead', id],
    queryFn: async () => {
      const data: any = await get(`/leads/${id}`);
      if (data.assignee) {
        data.assignee.name = `${data.assignee.firstName || ''} ${data.assignee.lastName || ''}`.trim();
      }
      if (data.activities) {
        data.activities = data.activities.map((a: any) => {
          if (a.user) {
            a.user.name = `${a.user.firstName || ''} ${a.user.lastName || ''}`.trim();
          }
          return a;
        });
      }
      if (data.leadScores) {
        data.leadScores = data.leadScores.map((s: any) => {
          if (s.scorer) {
            s.scorer.name = `${s.scorer.firstName || ''} ${s.scorer.lastName || ''}`.trim();
          }
          return s;
        });
      }
      return data;
    },
    enabled: !!id,
  });
}

export function useProjects(params?: Record<string, unknown>) {
  return useQuery<PaginatedResponse<Project>>({
    queryKey: ['projects', params],
    queryFn: () => get('/projects', params),
  });
}

export function useProject(id: string) {
  return useQuery<Project>({
    queryKey: ['project', id],
    queryFn: () => get(`/projects/${id}`),
    enabled: !!id,
  });
}

export function useTasks(params?: Record<string, unknown>) {
  return useQuery<PaginatedResponse<Task>>({
    queryKey: ['tasks', params],
    queryFn: () => get('/tasks', params),
  });
}

export function useClients(params?: Record<string, unknown>) {
  return useQuery<PaginatedResponse<Client>>({
    queryKey: ['clients', params],
    queryFn: () => get('/clients', params),
  });
}

export function useClient(id: string) {
  return useQuery<Client>({
    queryKey: ['client', id],
    queryFn: () => get(`/clients/${id}`),
    enabled: !!id,
  });
}

export function useUsers(params?: Record<string, unknown>) {
  return useQuery<PaginatedResponse<User>>({
    queryKey: ['users', params],
    queryFn: async () => {
      const res = await get<PaginatedResponse<Record<string, unknown>>>('/users', params);
      const data = (res.data || []).map((u: any) => ({
        id: u.id,
        email: u.email,
        name: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
        role: u.role?.code?.toUpperCase?.() || 'VIEWER',
        department: u.department?.name || u.departmentId || '',
        moduleAccess: u.moduleAccess || [],
        avatar: u.avatarUrl,
        isActive: u.isActive,
        lastLogin: u.lastLogin,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      }));
      return { data, meta: res.meta };
    },
  });
}

export function useRoles() {
  return useQuery<RoleOption[]>({
    queryKey: ['roles'],
    queryFn: () => get('/users/roles'),
  });
}

export function useDepartments() {
  return useQuery<DepartmentOption[]>({
    queryKey: ['departments'],
    queryFn: () => get('/users/departments'),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => post('/users', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => patch(`/users/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => del(`/users/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function usePermissionGroups() {
  return useQuery<PermissionGroup[]>({
    queryKey: ['permissions', 'grouped'],
    queryFn: () => get('/permissions/grouped'),
  });
}

export function useRolePermissions(roleId: string) {
  return useQuery<RolePermissionInfo>({
    queryKey: ['permissions', 'roles', roleId],
    queryFn: () => get(`/permissions/roles/${roleId}`),
    enabled: !!roleId,
  });
}

export function useUpdateRolePermissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, permissionIds }: { roleId: string; permissionIds: string[] }) =>
      patch(`/permissions/roles/${roleId}`, { permissionIds }),
    onSuccess: (_, { roleId }) => {
      queryClient.invalidateQueries({ queryKey: ['permissions', 'roles', roleId] });
      queryClient.invalidateQueries({ queryKey: ['permissions', 'grouped'] });
    },
  });
}

export function usePermissionRoles() {
  return useQuery<RoleOption[]>({
    queryKey: ['permissions', 'roles'],
    queryFn: () => get('/permissions/roles'),
  });
}

export function useMeetings(params?: Record<string, unknown>) {
  return useQuery<PaginatedResponse<Meeting>>({
    queryKey: ['meetings', params],
    queryFn: () => get('/meetings', params),
  });
}

export function useActivities(leadId?: string) {
  return useQuery<Activity[]>({
    queryKey: ['activities', leadId],
    queryFn: () => get(`/activities${leadId ? `?leadId=${leadId}` : ''}`),
  });
}

export function useDeliverables(params?: Record<string, unknown>) {
  return useQuery<PaginatedResponse<Deliverable>>({
    queryKey: ['deliverables', params],
    queryFn: () => get('/deliverables', params),
  });
}

export function useNotifications() {
  return useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: () => get('/users/me/notifications'),
  });
}

export function usePipelineStats() {
  return useQuery<PipelineStageInfo[]>({
    queryKey: ['pipeline-stats'],
    queryFn: () => get('/pipeline-stages'),
  });
}

export function useLeadStats() {
  return useQuery({
    queryKey: ['lead-stats'],
    queryFn: () => get('/leads/stats'),
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Lead>) => post('/leads', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => patch(`/leads/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id] });
    },
  });
}
export function useUpdateLeadStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stageId }: { id: string; stageId: string }) => patch(`/leads/${id}/stage`, { stageId }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['pipeline-stats'] });
    },
  });
}

export function useScoreLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LeadScore> }) => post(`/leads/${id}/score`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id] });
    },
  });
}

export function useSaveQualification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => post(`/leads/${id}/qualification`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['qualification', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['lead-tasks', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useQualification(id: string) {
  return useQuery<LeadQualification>({
    queryKey: ['qualification', id],
    queryFn: () => get(`/leads/${id}/qualification`),
    enabled: !!id,
  });
}

export function useLeadTasks(id: string) {
  return useQuery<LeadTask[]>({
    queryKey: ['lead-tasks', id],
    queryFn: () => get(`/leads/${id}/tasks`),
    enabled: !!id,
  });
}

export function useAllLeadTasks(params?: Record<string, unknown>) {
  return useQuery<{ data: LeadTask[] }>({
    queryKey: ['all-lead-tasks', params],
    queryFn: () => get('/leads/all-tasks', params),
  });
}

export function useCreateLeadTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => post(`/leads/${id}/tasks`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lead-tasks', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['all-lead-tasks'] });
    },
  });
}

export function useUpdateLeadTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: any; leadId?: string }) => patch(`/leads/tasks/${taskId}`, data),
    onSuccess: (_, { leadId }) => {
      queryClient.invalidateQueries({ queryKey: ['all-lead-tasks'] });
      if (leadId) {
        queryClient.invalidateQueries({ queryKey: ['lead-tasks', leadId] });
      }
    },
  });
}

export function useDeleteLeadTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => del(`/leads/tasks/${taskId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-lead-tasks'] });
    },
  });
}

export function useArchiveLeadTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => patch(`/leads/tasks/${taskId}/archive`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-lead-tasks'] });
    },
  });
}

export function useLeadAttachments(id: string) {
  return useQuery<LeadAttachment[]>({
    queryKey: ['lead-attachments', id],
    queryFn: () => get(`/leads/${id}/attachments`),
    enabled: !!id,
  });
}

export function useDeleteAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId, attachmentId }: { leadId: string; attachmentId: string }) =>
      del(`/leads/attachments/${attachmentId}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lead-attachments', variables.leadId] });
      queryClient.invalidateQueries({ queryKey: ['lead-timeline', variables.leadId] });
    },
  });
}

export function useLeadTimeline(id: string) {
  return useQuery<any>({
    queryKey: ['lead-timeline', id],
    queryFn: () => get(`/leads/${id}/timeline`),
    enabled: !!id,
  });
}

export function useCommunicationLogs(id: string, type: 'lead' | 'client' = 'lead') {
  return useQuery<CommunicationLog[]>({
    queryKey: ['communications', type, id],
    queryFn: () => get(`/communications/${type}/${id}`),
    enabled: !!id,
  });
}

export function useCreateCommunicationLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CommunicationLog>) => post('/communications', data),
    onSuccess: (_, variables) => {
      if (variables.leadId) queryClient.invalidateQueries({ queryKey: ['communications', 'lead', variables.leadId] });
      if (variables.clientId) queryClient.invalidateQueries({ queryKey: ['communications', 'client', variables.clientId] });
    },
  });
}

export function useBulkAssign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, userId }: { ids: string[]; userId: string }) => post('/leads/bulk/assign', { ids, userId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  });
}

export function useBulkChangeStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, stageId }: { ids: string[]; stageId: string }) => post('/leads/bulk/stage', { ids, stageId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  });
}

export function useBulkDelete() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ids }: { ids: string[] }) => post('/leads/bulk/delete', { ids }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  });
}

export function usePermanentDelete() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => del(`/leads/${id}/permanent`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['pipeline-stats'] });
    },
  });
}

export function useClientPortalDashboard(clientId: string) {
  return useQuery<any>({
    queryKey: ['portal-dashboard', clientId],
    queryFn: () => get(`/portal/client/${clientId}/dashboard`),
    enabled: !!clientId,
  });
}

export function useCalendarEvents(params?: Record<string, unknown>) {
  return useQuery<{ data: CalendarEvent[]; meta?: any }>({
    queryKey: ['calendar', params],
    queryFn: () => get('/calendar', params),
  });
}

export function useCreateCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CalendarEvent>) => post('/calendar', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['calendar'] }),
  });
}

export function useDashboardStats() {
  return useQuery<any>({
    queryKey: ['dashboard-stats'],
    queryFn: () => get('/dashboard/stats'),
  });
}

export function useFollowUpMatrix() {
  return useQuery<any>({
    queryKey: ['follow-up-matrix'],
    queryFn: () => get('/crm/follow-up-matrix'),
  });
}

export function useLeadFollowUps(leadId: string) {
  return useQuery<any[]>({
    queryKey: ['lead-follow-ups', leadId],
    queryFn: () => get(`/crm/follow-ups/${leadId}`),
    enabled: !!leadId,
  });
}

export function useUpdateFollowUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => patch(`/crm/follow-ups/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-follow-ups'] });
      queryClient.invalidateQueries({ queryKey: ['follow-up-matrix'] });
    },
  });
}

export function useManagerDashboard() {
  return useQuery<any>({
    queryKey: ['manager-dashboard'],
    queryFn: () => get('/dashboard/manager'),
  });
}

export function useDashboardWidgets() {
  return useQuery<DashboardWidget[]>({
    queryKey: ['dashboard-widgets'],
    queryFn: () => get('/dashboard/widgets'),
  });
}

export function useCheckLeadDuplicates(params: { email?: string; phone?: string; company?: string }, enabled = false) {
  return useQuery<{ duplicates: any[] }>({
    queryKey: ['lead-duplicates', params],
    queryFn: () => get('/leads/duplicates/check', params),
    enabled,
  });
}

export function useSaveDashboardWidgets() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (widgets: { widgetType: string; title: string; isVisible: boolean; sortOrder: number }[]) =>
      post('/dashboard/widgets', { widgets }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dashboard-widgets'] }),
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => patch(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Activity>) => post('/activities', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['activities'] }),
  });
}

export function useCreateMeeting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Meeting>) => post('/meetings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Project>) => post('/projects', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) => patch(`/projects/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Task>) => post('/tasks', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => patch(`/tasks/${id}`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useCreateSprint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Sprint>) => post('/sprints', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project'] }),
  });
}

export function useCreateDeliverable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Deliverable>) => post('/deliverables', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deliverables'] }),
  });
}

export function useApproveDeliverable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => patch(`/deliverables/${id}/approve`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deliverables'] }),
  });
}

export function useRejectDeliverable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) => patch(`/deliverables/${id}/reject`, { comment }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deliverables'] }),
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) => patch(`/tasks/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => del(`/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
    },
  });
}

export function useUpdateSprint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Sprint> }) => patch(`/sprints/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
    },
  });
}

export function useDeleteSprint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => del(`/sprints/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
    },
  });
}

export function useUpdateDeliverable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Deliverable> }) => patch(`/deliverables/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliverables'] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
    },
  });
}

export function useDeleteDeliverable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => del(`/deliverables/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliverables'] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
    },
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Client>) => post('/clients', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => patch(`/clients/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', variables.id] });
    },
  });
}

export function useProposals(params?: Record<string, unknown>) {
  return useQuery<PaginatedResponse<Proposal>>({ queryKey: ['proposals', params], queryFn: () => get('/proposals', params) });
}
export function useProposal(id: string) {
  return useQuery<Proposal>({ queryKey: ['proposal', id], queryFn: () => get(`/proposals/${id}`), enabled: !!id });
}
export function useCreateProposal() {
  const qc = useQueryClient(); return useMutation({ mutationFn: (data: any) => post('/proposals', data), onSuccess: () => qc.invalidateQueries({ queryKey: ['proposals'] }) });
}
export function useUpdateProposal() {
  const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, data }: { id: string; data: any }) => patch(`/proposals/${id}`, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['proposals'] }); } });
}
export function useSendProposal() {
  const qc = useQueryClient(); return useMutation({ mutationFn: (id: string) => post(`/proposals/${id}/send`), onSuccess: () => qc.invalidateQueries({ queryKey: ['proposals'] }) });
}
export function useApproveProposal() {
  const qc = useQueryClient(); return useMutation({ mutationFn: (id: string) => post(`/proposals/${id}/approve`), onSuccess: () => qc.invalidateQueries({ queryKey: ['proposals'] }) });
}
export function useRejectProposal() {
  const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, reason }: { id: string; reason: string }) => post(`/proposals/${id}/reject`, { reason }), onSuccess: () => qc.invalidateQueries({ queryKey: ['proposals'] }) });
}

export function useContracts(params?: Record<string, unknown>) {
  return useQuery<PaginatedResponse<Contract>>({ queryKey: ['contracts', params], queryFn: () => get('/contracts', params) });
}
export function useContract(id: string) {
  return useQuery<Contract>({ queryKey: ['contract', id], queryFn: () => get(`/contracts/${id}`), enabled: !!id });
}
export function useCreateContract() {
  const qc = useQueryClient(); return useMutation({ mutationFn: (data: any) => post('/contracts', data), onSuccess: () => qc.invalidateQueries({ queryKey: ['contracts'] }) });
}
export function useSignContract() {
  const qc = useQueryClient(); return useMutation({ mutationFn: (id: string) => post(`/contracts/${id}/sign`), onSuccess: () => qc.invalidateQueries({ queryKey: ['contracts'] }) });
}

export function useInvoices(params?: Record<string, unknown>) {
  return useQuery<PaginatedResponse<Invoice>>({ queryKey: ['invoices', params], queryFn: () => get('/invoices', params) });
}
export function useInvoice(id: string) {
  return useQuery<Invoice>({ queryKey: ['invoice', id], queryFn: () => get(`/invoices/${id}`), enabled: !!id });
}
export function useCreateInvoice() {
  const qc = useQueryClient(); return useMutation({ mutationFn: (data: any) => post('/invoices', data), onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }) });
}
export function useSendInvoice() {
  const qc = useQueryClient(); return useMutation({ mutationFn: (id: string) => post(`/invoices/${id}/send`), onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }) });
}

export function useCampaigns(params?: Record<string, unknown>) {
  return useQuery<PaginatedResponse<Campaign>>({ queryKey: ['campaigns', params], queryFn: () => get('/campaigns', params) });
}
export function useCampaign(id: string) {
  return useQuery<Campaign>({ queryKey: ['campaign', id], queryFn: () => get(`/campaigns/${id}`), enabled: !!id });
}
export function useCreateCampaign() {
  const qc = useQueryClient(); return useMutation({ mutationFn: (data: any) => post('/campaigns', data), onSuccess: () => qc.invalidateQueries({ queryKey: ['campaigns'] }) });
}
export function useLaunchCampaign() {
  const qc = useQueryClient(); return useMutation({ mutationFn: (id: string) => patch(`/campaigns/${id}/launch`), onSuccess: () => qc.invalidateQueries({ queryKey: ['campaigns'] }) });
}

export function useKpis(params?: Record<string, unknown>) {
  return useQuery<PaginatedResponse<Kpi>>({ queryKey: ['kpis', params], queryFn: () => get('/kpis', params) });
}
export function useKpiValues(kpiId: string) {
  return useQuery<KpiValue[]>({ queryKey: ['kpi-values', kpiId], queryFn: () => get(`/kpis/${kpiId}/values`), enabled: !!kpiId });
}
export function useCreateKpi() {
  const qc = useQueryClient(); return useMutation({ mutationFn: (data: any) => post('/kpis', data), onSuccess: () => qc.invalidateQueries({ queryKey: ['kpis'] }) });
}
export function useAddKpiValue() {
  const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, data }: { id: string; data: any }) => post(`/kpis/${id}/values`, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['kpi-values'] }) });
}

export function useKnowledgeArticles(params?: Record<string, unknown>) {
  return useQuery<PaginatedResponse<KnowledgeArticle>>({ queryKey: ['knowledge', params], queryFn: () => get('/knowledge', params) });
}
export function useKnowledgeArticle(id: string) {
  return useQuery<KnowledgeArticle>({ queryKey: ['knowledge', id], queryFn: () => get(`/knowledge/${id}`), enabled: !!id });
}
export function useSearchKnowledge(query: string) {
  return useQuery<KnowledgeArticle[]>({ queryKey: ['knowledge-search', query], queryFn: () => get(`/knowledge/search?q=${query}`), enabled: query.length > 0 });
}
export function useCreateKnowledgeArticle() {
  const qc = useQueryClient(); return useMutation({ mutationFn: (data: any) => post('/knowledge', data), onSuccess: () => qc.invalidateQueries({ queryKey: ['knowledge'] }) });
}

export function useAutomations(params?: Record<string, unknown>) {
  return useQuery<PaginatedResponse<AutomationRule>>({ queryKey: ['automations', params], queryFn: () => get('/automations', params) });
}
export function useCreateAutomation() {
  const qc = useQueryClient(); return useMutation({ mutationFn: (data: any) => post('/automations', data), onSuccess: () => qc.invalidateQueries({ queryKey: ['automations'] }) });
}
export function useToggleAutomation() {
  const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, data }: { id: string; data: any }) => patch(`/automations/${id}`, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['automations'] }) });
}
export function useUpdateAutomation() {
  const qc = useQueryClient(); return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => patch(`/automations/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['automations'] }),
  });
}
export function useDeleteAutomation() {
  const qc = useQueryClient(); return useMutation({ mutationFn: (id: string) => del(`/automations/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['automations'] }) });
}
export function useMergeTaskChains() {
  const qc = useQueryClient(); return useMutation({
    mutationFn: (taskIds: string[]) => post('/leads/tasks/merge-chains', { taskIds }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['all-lead-tasks'] });
      qc.invalidateQueries({ queryKey: ['lead-tasks'] });
    },
  });
}

// Time Tracking
export const useTimeEntries = (params?: Record<string, unknown>) => useQuery<PaginatedResponse<TimeEntry>>({ queryKey: ['time-entries', params], queryFn: () => get('/time-entries', params) });
export const useCreateTimeEntry = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (data: any) => post('/time-entries', data), onSuccess: () => qc.invalidateQueries({ queryKey: ['time-entries'] }) }); };
export const useTimeTotals = (params?: Record<string, unknown>) => useQuery<any>({ queryKey: ['time-totals', params], queryFn: () => get('/time-entries/totals', params) });
export const useUserTimeSummary = (userId: string, params?: Record<string, unknown>) => useQuery<any>({ queryKey: ['time-summary', userId, params], queryFn: () => get(`/time-entries/user/${userId}/summary`, params), enabled: !!userId });

// Strategy
export const useResearchReports = (params?: Record<string, unknown>) => useQuery<PaginatedResponse<ResearchReport>>({ queryKey: ['reports', params], queryFn: () => get('/strategy/reports', params) });
export const useResearchReport = (id: string) => useQuery<ResearchReport>({ queryKey: ['report', id], queryFn: () => get(`/strategy/reports/${id}`), enabled: !!id });
export const useCreateResearchReport = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (data: any) => post('/strategy/reports', data), onSuccess: () => qc.invalidateQueries({ queryKey: ['reports'] }) }); };
export const useStrategicBlueprints = (params?: Record<string, unknown>) => useQuery<PaginatedResponse<StrategicBlueprint>>({ queryKey: ['blueprints', params], queryFn: () => get('/strategy/blueprints', params) });
export const useStrategicBlueprint = (id: string) => useQuery<StrategicBlueprint>({ queryKey: ['blueprint', id], queryFn: () => get(`/strategy/blueprints/${id}`), enabled: !!id });
export const useCreateStrategicBlueprint = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (data: any) => post('/strategy/blueprints', data), onSuccess: () => qc.invalidateQueries({ queryKey: ['blueprints'] }) }); };
export const useCreativeBriefs = (params?: Record<string, unknown>) => useQuery<PaginatedResponse<CreativeBrief>>({ queryKey: ['briefs', params], queryFn: () => get('/strategy/briefs', params) });
export const useCreativeBrief = (id: string) => useQuery<CreativeBrief>({ queryKey: ['brief', id], queryFn: () => get(`/strategy/briefs/${id}`), enabled: !!id });
export const useCreateCreativeBrief = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (data: any) => post('/strategy/briefs', data), onSuccess: () => qc.invalidateQueries({ queryKey: ['briefs'] }) }); };

// Search
export const useSearch = (query: string, types?: string) => useQuery<any>({ queryKey: ['search', query, types], queryFn: () => get('/search', { q: query, types }), enabled: query.length >= 2 });

// Reports
export const useSalesReport = (params?: Record<string, unknown>) => useQuery<any>({ queryKey: ['report-sales', params], queryFn: () => get('/reports/sales', params) });
export const useProductionReport = (params?: Record<string, unknown>) => useQuery<any>({ queryKey: ['report-production', params], queryFn: () => get('/reports/production', params) });
export const useFinanceReport = (params?: Record<string, unknown>) => useQuery<any>({ queryKey: ['report-finance', params], queryFn: () => get('/reports/finance', params) });
export const useExecutiveReport = (params?: Record<string, unknown>) => useQuery<any>({ queryKey: ['report-executive', params], queryFn: () => get('/reports/executive', params) });
export const useProfitabilityReport = (params?: Record<string, unknown>) => useQuery<any>({ queryKey: ['report-profitability', params], queryFn: () => get('/reports/profitability', params) });
export const useTimeReport = (params?: Record<string, unknown>) => useQuery<any>({ queryKey: ['report-time', params], queryFn: () => get('/reports/time', params) });

// Audit Log
export const useAuditLogs = (params?: Record<string, unknown>) => useQuery<PaginatedResponse<AuditLog>>({ queryKey: ['audit-logs', params], queryFn: () => get('/audit-logs', params) });

// System Help
export function useSystemHelpSearch(q: string) {
  return useQuery<any[]>({
    queryKey: ['system-help', q],
    queryFn: () => get('/system-help/search', { q }),
    enabled: q.length > 0,
  });
}
