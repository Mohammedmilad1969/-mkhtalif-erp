export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  department?: string;
  moduleAccess?: string[];
  avatar?: string;
  permissions?: string[];
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export enum Role {
  SUPER_ADMIN = 'su',
  CEO = 'ceo',
  HEAD_OF_SALES = 'hos',
  SALES_TEAM_LEAD = 'stl',
  SALES_REP = 'sr',
  HEAD_OF_DEPARTMENT = 'hod',
  STRATEGY_TEAM_LEAD = 'strl',
  STRATEGIST = 'strat',
  ART_DIRECTOR = 'ad',
  ACCOUNT_MANAGER = 'am',
  PROJECT_MANAGER = 'pm',
  DESIGNER = 'des',
  VIDEO_EDITOR = 'vid',
  COPYWRITER = 'cw',
  MEDIA_BUYER = 'mb',
  OPS_MANAGER = 'om',
  FINANCE = 'fin',
  ADMIN = 'admin',
}

export interface BackendUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: { id: string; name: string; code: string; description?: string; level: number } | null;
  department: { id: string; name: string; code: string; description?: string } | null;
  moduleAccess?: string[];
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoleOption {
  id: string;
  name: string;
  code: string;
  description?: string;
  level: number;
}

export interface DepartmentOption {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface Lead {
  id: string;
  clientName: string;
  company?: string;
  email?: string;
  phone?: string;
  source?: LeadSource;
  city?: string;
  industry?: string;
  tags?: string[];
  priority?: string;
  serviceType?: string;
  clarityLevel?: string;
  budgetLevel?: string;
  opportunitySize?: string;
  leadScore?: number;
  leadTemperature?: LeadTemperature;
  stage: PipelineStage;
  stageId?: string;
  assignedTo?: string;
  assignee?: User;
  nextAction?: string;
  nextActionDate?: string;
  proposalSent?: boolean;
  dealValue?: number;
  probability?: number;
  status?: string;
  lostReason?: string;
  lostReasonCategory?: string;
  notes?: string;
  qualification?: LeadQualification;
  createdAt: string;
  updatedAt: string;
}

export enum LeadSource {
  INSTAGRAM = 'instagram',
  FACEBOOK = 'facebook',
  WEBSITE = 'website',
  WHATSAPP = 'whatsapp',
  REFERRAL = 'referral',
  CALL = 'call',
  OTHER = 'other',
}

export enum LeadTemperature {
  HOT = 'hot',
  WARM = 'warm',
  COLD = 'cold',
}

export enum PipelineStage {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  PROPOSAL = 'proposal',
  NEGOTIATION = 'negotiation',
  WON = 'won',
  LOST = 'lost',
}

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  industry?: string;
  status: ClientStatus;
  satisfactionScore?: number;
  lifetimeValue?: number;
  accountManager?: User;
  accountManagerId?: string;
  createdAt: string;
  updatedAt: string;
}

export enum ClientStatus {
  ACTIVE = 'active',
  AT_RISK = 'at_risk',
  CHURNED = 'churned',
}

export interface TeamMember {
  userId: string;
  teamId: string;
  roleInTeam?: string;
  user: User;
}

export interface Team {
  id: string;
  name: string;
  departmentId?: string;
  leadUserId?: string;
  leadUser?: User;
  members: TeamMember[];
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  client: Client;
  clientId: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  accountManager?: User;
  accountManagerId?: string;
  strategicLead?: User;
  strategicLeadId?: string;
  productionManager?: User;
  productionManagerId?: string;
  startDate?: string;
  targetEndDate?: string;
  actualEndDate?: string;
  budget?: number;
  hourlyRate?: number;
  estimatedHours?: number;
  teamId?: string;
  team?: Team;
  contractId?: string;
  contract?: Contract;
  tasks: Task[];
  sprints: Sprint[];
  deliverables: Deliverable[];
  createdAt: string;
  updatedAt: string;
}

export enum ProjectStatus {
  ONBOARDING = 'onboarding',
  STRATEGY = 'strategy',
  PRODUCTION = 'production',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
}

export enum ProjectPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: ProjectPriority;
  assignee?: User;
  assigneeId?: string;
  project: Project;
  projectId: string;
  sprint?: Sprint;
  sprintId?: string;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
}

export enum TaskStatus {
  TO_DO = 'todo',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  APPROVED = 'approved',
  DELIVERED = 'delivered',
}

export interface Sprint {
  id: string;
  name: string;
  goal?: string;
  status: SprintStatus;
  project: Project;
  projectId: string;
  tasks: Task[];
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export enum SprintStatus {
  PLANNED = 'planned',
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

export interface Deliverable {
  id: string;
  name: string;
  type: DeliverableType;
  status: DeliverableStatus;
  version: number;
  revisionCount: number;
  project: Project;
  projectId: string;
  fileUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export enum DeliverableType {
  DESIGN = 'design',
  DOCUMENT = 'document',
  CODE = 'code',
  REPORT = 'report',
  PRESENTATION = 'presentation',
  OTHER = 'other',
}

export enum DeliverableStatus {
  PENDING = 'pending',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DELIVERED = 'delivered',
}

export interface Approval {
  id: string;
  deliverable: Deliverable;
  deliverableId: string;
  approvedBy: User;
  approvedById: string;
  status: 'approved' | 'rejected';
  comment?: string;
  createdAt: string;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  date: string;
  duration: number;
  meetingType: MeetingType;
  lead?: Lead;
  leadId?: string;
  project?: Project;
  projectId?: string;
  attendees: User[];
  createdBy: User;
  createdById: string;
  createdAt: string;
}

export enum MeetingType {
  INITIAL = 'initial',
  FOLLOW_UP = 'follow_up',
  REVIEW = 'review',
  STRATEGY = 'strategy',
  STANDUP = 'standup',
  OTHER = 'other',
}

export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  lead?: Lead;
  leadId?: string;
  project?: Project;
  projectId?: string;
  user: User;
  userId: string;
  createdAt: string;
}

export enum ActivityType {
  CALL = 'call',
  EMAIL = 'email',
  MEETING = 'meeting',
  NOTE = 'note',
  STATUS_CHANGE = 'status_change',
  STAGE_CHANGE = 'stage_change',
  SCORE_CHANGE = 'score_change',
  ASSIGNMENT = 'assignment',
  OTHER = 'other',
}

export interface Campaign {
  id: string;
  projectId: string;
  project?: Project;
  name: string;
  objective?: string;
  status: 'planning' | 'active' | 'paused' | 'completed' | 'archived';
  budget?: number;
  startDate?: string;
  endDate?: string;
  channels?: string[];
  metrics?: CampaignMetric[];
  createdAt: string;
}

export interface CampaignMetric {
  id: string;
  campaignId: string;
  date: string;
  impressions: number;
  reach: number;
  clicks: number;
  ctr?: number;
  cpm?: number;
  spend?: number;
  leads: number;
  conversions: number;
  conversionRate?: number;
  roas?: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  contractId?: string;
  clientId?: string;
  client?: Client;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  totalAmount: number;
  taxAmount: number;
  currency: string;
  dueDate?: string;
  paidAt?: string;
  paymentMethod?: string;
  payments?: Payment[];
  createdAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentDate: string;
  paymentMethod?: string;
  reference?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
}

export interface Kpi {
  id: string;
  name: string;
  code: string;
  description?: string;
  category: string;
  formula?: string;
  unit: string;
  targetValue?: number;
  targetComparison?: string;
  updateFrequency?: string;
  values?: KpiValue[];
}

export interface KpiValue {
  id: string;
  kpiId: string;
  value: number;
  periodStart: string;
  periodEnd: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  userId: string;
  link?: string;
  createdAt: string;
}

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}

export interface PipelineStageInfo {
  id: string;
  name: string;
  key: string;
  code: string;
  count: number;
  value: number;
}

export interface LeadScore {
  id: string;
  lead: Lead;
  leadId: string;
  serviceTypeScore: number;
  clarityScore: number;
  budgetScore: number;
  opportunityScore: number;
  totalScore: number;
  scoredBy: User;
  scoredById: string;
  createdAt: string;
}

export interface Opportunity {
  id: string;
  lead: Lead;
  leadId: string;
  estimatedValue: number;
  probability: number;
  expectedCloseDate: string;
  createdAt: string;
}

export interface Proposal {
  id: string;
  opportunityId?: string;
  clientId?: string;
  client?: Client;
  title: string;
  version: string;
  status: 'draft' | 'internal_review' | 'sent' | 'presented' | 'accepted' | 'rejected' | 'revision';
  technicalContent?: string;
  financialContent?: string;
  scopeOfWork?: any;
  totalValue?: number;
  currency: string;
  validityDays: number;
  sentAt?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  ownerId?: string;
  owner?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Contract {
  id: string;
  proposalId?: string;
  clientId?: string;
  client?: Client;
  contractNumber: string;
  status: 'draft' | 'sent' | 'signed' | 'active' | 'completed' | 'terminated';
  startDate?: string;
  endDate?: string;
  totalValue?: number;
  paymentTerms?: string;
  signedAt?: string;
  signedByClientAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadQualification {
  id: string;
  leadId: string;
  serviceRequested?: string;
  businessGoal?: string;
  budget?: string;
  urgency?: string;
  previousAgency?: string;
  expectedTimeline?: string;
  decisionMaker?: string;
  additionalNotes?: string;
  qualifiedById?: string;
  qualifiedBy?: User;
  qualifiedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadTask {
  id: string;
  leadId: string;
  title: string;
  description?: string;
  taskType?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  priority: string;
  assignee?: User;
  assignedTo?: string;
  dueDate?: string;
  completedAt?: string;
  reminderAt?: string;
  checklist?: { text: string; checked: boolean }[];
  chainOrder?: number;
  chainTotal?: number;
  chainId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadAttachment {
  id: string;
  leadId: string;
  fileName: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
  uploadedBy?: User;
  uploadedById?: string;
  createdAt: string;
}

export interface CommunicationLog {
  id: string;
  leadId?: string;
  lead?: Lead;
  clientId?: string;
  client?: Client;
  channel: 'email' | 'sms' | 'whatsapp' | 'call' | 'internal_note';
  direction: 'inbound' | 'outbound';
  subject?: string;
  body?: string;
  fromAddress?: string;
  toAddress?: string;
  ccAddresses?: string[];
  bccAddresses?: string[];
  attachments?: any;
  status: string;
  externalId?: string;
  metadata?: any;
  createdBy?: User;
  createdById?: string;
  createdAt: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  content?: string;
  articleType: 'sop' | 'checklist' | 'template' | 'guide' | 'faq' | 'case_study' | 'script' | 'filter_question';
  departmentId?: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  authorId?: string;
  author?: User;
  createdAt: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  description?: string;
  triggerType: string;
  triggerConfig?: any;
  conditions?: any;
  actions?: any;
  isActive: boolean;
  lastRunAt?: string;
  runCount: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  eventType?: string;
  startTime: string;
  endTime?: string;
  allDay: boolean;
  location?: string;
  meetingUrl?: string;
  leadId?: string;
  clientId?: string;
  projectId?: string;
  ownerId?: string;
  owner?: { id: string; name?: string; firstName?: string; lastName?: string };
  color?: string;
  isCompleted: boolean;
  recurrence?: any;
  reminders?: any;
  createdAt: string;
  updatedAt: string;
}

export interface ClientPortalAccess {
  id: string;
  clientId: string;
  token: string;
  email: string;
  lastAccessAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardWidget {
  id: string;
  userId: string;
  widgetType: string;
  title: string;
  config?: any;
  gridPosition?: any;
  isVisible: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
}

export interface TimeEntry {
  id: string;
  taskId: string;
  task?: Task;
  userId: string;
  user?: User;
  description?: string;
  duration: number;
  date: string;
  billable: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  user?: User;
  action: string;
  entity: string;
  entityId?: string;
  oldValue?: any;
  newValue?: any;
  metadata?: any;
  createdAt: string;
}

export interface ResearchReport {
  id: string;
  projectId: string;
  project?: Project;
  title: string;
  businessAnalysis?: string;
  socialAnalysis?: string;
  marketAnalysis?: string;
  competitorAnalysis?: string;
  audienceAnalysis?: string;
  swot?: any;
  keyFindings?: string;
  status: string;
  createdBy?: User;
  createdAt: string;
}

export interface StrategicBlueprint {
  id: string;
  projectId: string;
  project?: Project;
  reportId?: string;
  title: string;
  executiveSummary?: string;
  situationAnalysis?: string;
  objectives?: string;
  targetAudience?: string;
  positioning?: string;
  messaging?: string;
  channelStrategy?: string;
  creativeDirection?: string;
  budget?: string;
  timeline?: string;
  kpiFramework?: string;
  strategicRecommendations?: string;
  status: string;
  createdAt: string;
}

export interface CreativeBrief {
  id: string;
  projectId: string;
  project?: Project;
  blueprintId?: string;
  title: string;
  overview?: string;
  objectives?: string;
  targetAudience?: string;
  keyMessage?: string;
  tone?: string;
  deliverables?: any;
  brandGuidelines?: string;
  successMetrics?: string;
  status: string;
  createdAt: string;
}

export interface ReportData {
  sales?: { totalLeads: number; meetings: number; proposals: number; won: number; revenue: number; closeRate: number };
  production?: { tasksCompleted: number; onTimeRate: number; deliverablesCount: number; avgRevisions: number };
  finance?: { totalInvoiced: number; totalCollected: number; overdue: number; arAging: any };
  executive?: { revenue: number; newClients: number; activeProjects: number; utilization: number };
  profitability?: { clientId: string; clientName: string; revenue: number; cost: number; profit: number; margin: number }[];
  time?: { projectId: string; projectName: string; totalHours: number; billableHours: number }[];
}

export interface PermissionItem {
  id: string;
  action: string;
  description: string | null;
}

export interface PermissionGroup {
  resource: string;
  label: string;
  group: string;
  groupLabel: string;
  permissions: PermissionItem[];
}

export interface RolePermissionInfo {
  role: RoleOption;
  permissions: { id: string; resource: string; action: string }[];
  permissionIds: string[];
}
