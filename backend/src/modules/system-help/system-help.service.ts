import { Injectable } from '@nestjs/common';

export interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  keywords: string[];
  relatedPages: string[];
}

const HELP_CONTENT: HelpArticle[] = [
  {
    id: 'getting-started',
    title: 'Getting Started with the System',
    content: `Welcome to the system! Here are the basics:

• Use the sidebar on the left to navigate between modules
• The top bar shows your current location and has quick actions
• Your profile and settings are accessible from the top-right user menu
• Use the search bar in the top bar to quickly find leads, projects, and more`,
    category: 'General',
    keywords: ['welcome', 'basics', 'navigate', 'sidebar', 'profile', 'start'],
    relatedPages: ['/dashboard'],
  },
  {
    id: 'crm-overview',
    title: 'CRM Pipeline — Managing Leads',
    content: `The CRM Pipeline is where you manage leads through the sales process.

Key features:
• Kanban view: Drag leads between stages (New Lead → Qualification → Won/Lost)
• Table view: Sort and filter leads by status, source, assignee
• Click a lead to view/edit its full details
• Use the floating action bar to bulk-assign, change stage, or archive leads
• Search leads by name, company, or email`,
    category: 'Sales',
    keywords: ['crm', 'pipeline', 'lead', 'stage', 'kanban', 'drag', 'bulk', 'archive'],
    relatedPages: ['/crm'],
  },
  {
    id: 'create-lead',
    title: 'Creating a New Lead',
    content: `To create a new lead:

1. Go to CRM Pipeline
2. Click the "Add Lead" button in the top-right
3. Fill in required fields: Client Name, Email, Phone
4. Optional fields: Company, Website, Source, Budget Range
5. The lead will appear in the "New Lead" stage
6. Automations may trigger additional actions (tasks, stage changes)

Pro tip: The more data you enter, the better the AI scoring will work.`,
    category: 'Sales',
    keywords: ['create', 'new', 'add', 'lead', 'contact', 'form'],
    relatedPages: ['/crm'],
  },
  {
    id: 'lead-scoring',
    title: 'Lead Scoring & AI Analysis',
    content: `The system supports two types of scoring:

Manual Scoring:
• Go to a lead's detail page → Qualification tab
• Rate Service Type, Clarity Level, Budget, Opportunity Size
• Total score is calculated out of 10

AI Scoring:
• Click "AI Score" on the lead detail page
• The AI analyzes 8 factors: Source Quality, Company Presence, Email Quality, Data Completeness, Industry Relevance, Online Presence, Budget Potential, Engagement Level
• Results include a score (0-10), temperature (Hot/Warm/Cold), and confidence level

The AI score is independent of the lead temperature badge.`,
    category: 'Sales',
    keywords: ['score', 'ai', 'analysis', 'qualification', 'rating', 'temperature', 'hot', 'warm', 'cold'],
    relatedPages: ['/crm'],
  },
  {
    id: 'tasks-overview',
    title: 'Tasks — Lead-Generated Work Items',
    content: `The Tasks page shows all tasks created from leads across the system.

Key features:
• Kanban view: Organize by Pending, In Progress, Completed, Cancelled
• List view: Table with sortable columns and bulk actions
• Click a task row to view full details (description, checklist, lead info)
• Toggle completion by clicking the circle icon
• Use the dropdown menu to archive or delete tasks
• Bulk select tasks with checkboxes for batch operations

Tasks are automatically created by automation rules when leads are created or conditions are met.`,
    category: 'Operations',
    keywords: ['task', 'todo', 'pending', 'complete', 'checklist', 'bulk', 'kanban'],
    relatedPages: ['/tasks'],
  },
  {
    id: 'automation-rules',
    title: 'Automation Rules — Automating Workflows',
    content: `Automation rules trigger actions when certain events happen.

Creating a rule:
1. Go to Automation in the sidebar
2. Click "Create Rule" or apply a preset
3. Choose a trigger: Lead Created, Lead Scored, Task Completed, etc.
4. Add optional conditions (e.g., score ≥ 8)
5. Add actions: Create Task, Change Stage, Assign Lead, Send Notification
6. For multi-step workflows, use "Task Chain" to create sequential tasks

Available triggers: lead_created, lead_scored, lead_qualified, stage_changed, task_completed, meeting_completed, proposal_accepted, contract_signed, payment_received`,
    category: 'System',
    keywords: ['automation', 'rule', 'trigger', 'action', 'workflow', 'chain', 'preset'],
    relatedPages: ['/automation'],
  },
  {
    id: 'task-chains',
    title: 'Task Chains — Multi-Step Workflows',
    content: `Task Chains create a sequence of tasks that appear one after another.

How chains work:
1. In an automation rule, use action type "Task Chain (Multi-step)"
2. Add steps with title, type, and optional checklist items
3. Only Step 1 is created immediately
4. When a step is marked complete, the next step auto-creates
5. Each step inherits its template from the chain blueprint
6. The lead detail page shows chain progress badges (e.g., "1/3")

Checklists: Each step can have a checklist with items that appear in the Check-list tab on the lead detail page.`,
    category: 'Sales',
    keywords: ['chain', 'multi-step', 'sequence', 'workflow', 'checklist', 'auto-create'],
    relatedPages: ['/automation', '/tasks'],
  },
  {
    id: 'checklists-tab',
    title: 'Checklists on Lead Details',
    content: `The Checklists tab on a lead's detail page shows all checklist items from active tasks.

• Checklist items are created when setting up Task Chains in automation rules
• Each task can have multiple checklist items
• Check items off by clicking the checkbox
• Progress is shown as a fraction (e.g., 2/5)
• The Tasks page also shows checklist progress for each task

Multiple tasks with checklists are grouped by task on the Checklists tab.`,
    category: 'Sales',
    keywords: ['checklist', 'check', 'item', 'task', 'progress', 'tab'],
    relatedPages: ['/crm', '/tasks'],
  },
  {
    id: 'projects-section',
    title: 'Projects & Deliverables',
    content: `The Projects module helps manage client work from start to finish.

• Create projects linked to clients
• Each project has tasks, sprints, deliverables, and time tracking
• Deliverables track file versions, revisions, and approvals
• Time tracking logs hours against tasks
• Projects are visible in the Operations section of the sidebar`,
    category: 'Operations',
    keywords: ['project', 'deliverable', 'sprint', 'time', 'tracking', 'hours'],
    relatedPages: ['/projects', '/deliverables', '/time-tracking'],
  },
  {
    id: 'communications-log',
    title: 'Communications Log',
    content: `The Communications Log tracks all interactions with leads and clients.

• Log emails, calls, WhatsApp messages, and internal notes
• Each communication is linked to a lead
• View the full history on the lead detail page → Communications tab
• Filter by channel, direction (inbound/outbound), or date`,
    category: 'Communications',
    keywords: ['communication', 'email', 'call', 'whatsapp', 'log', 'history', 'note'],
    relatedPages: ['/communications'],
  },
  {
    id: 'knowledge-base',
    title: 'Knowledge Base',
    content: `The Knowledge Base stores articles, guides, SOPs, and FAQs.

• Articles can be type: Guide, FAQ, Checklist, Template, or Case Study
• Filter by type or department
• Search across all articles
• Create new articles from the Knowledge Base page
• Articles can be published as drafts or published`,
    category: 'General',
    keywords: ['knowledge', 'article', 'guide', 'faq', 'sop', 'documentation'],
    relatedPages: ['/knowledge'],
  },
  {
    id: 'ai-scoring-detail',
    title: 'AI Scoring — Factor Details',
    content: `The AI Scoring engine evaluates leads on 8 factors (each 0-10):

1. Source Quality: Referral/Call = high, Website/LinkedIn = medium
2. Company Presence: Based on company name length and completeness
3. Email Quality: Corporate email = higher, free email (gmail) = lower
4. Data Completeness: How many fields are filled in
5. Industry Relevance: SaaS, Tech, Ecommerce, Healthcare = high value
6. Online Presence: Valid website with custom domain = higher score
7. Budget Potential: Higher budgets = higher score
8. Engagement Level: Activities, tasks, and completed work

The total is normalized to a 0-10 scale, then mapped to temperature: ≥8 = Hot, ≥5 = Warm, <5 = Cold.`,
    category: 'Sales',
    keywords: ['ai', 'score', 'factor', 'detail', 'algorithm', 'calculation'],
    relatedPages: ['/crm'],
  },
  {
    id: 'bulk-actions',
    title: 'Bulk Actions in CRM & Tasks',
    content: `Both the CRM Pipeline and Tasks page support bulk operations.

CRM Pipeline:
• Select leads using checkboxes
• Bulk Assign: Assign all selected leads to a team member
• Bulk Change Stage: Move leads to a different pipeline stage
• Bulk Archive: Archive multiple leads at once

Tasks page:
• Select tasks using checkboxes (or select all)
• Bulk Archive: Move tasks to cancelled status
• Bulk Delete: Permanently remove tasks
• The floating action bar shows the count of selected items`,
    category: 'General',
    keywords: ['bulk', 'mass', 'select', 'multiple', 'batch', 'archive', 'delete', 'assign'],
    relatedPages: ['/crm', '/tasks'],
  },
  {
    id: 'clients-section',
    title: 'Clients Management',
    content: `The Clients section manages your client relationships.

• View all clients in a searchable table
• Click a client to view their details, projects, and communications
• Create new clients from the Clients page
• Each client has an account manager`,
    category: 'Sales',
    keywords: ['client', 'customer', 'account', 'relationship'],
    relatedPages: ['/clients'],
  },
  {
    id: 'reports-analytics',
    title: 'Reports & Analytics',
    content: `The system provides reports and analytics for data-driven decisions.

Dashboard: High-level KPIs and charts
Analytics: Detailed metrics and trends
Reports: Generate custom reports for leads, sales, and operations

Access these from the Overview section in the sidebar.`,
    category: 'General',
    keywords: ['report', 'analytics', 'dashboard', 'kpi', 'chart', 'metrics', 'data'],
    relatedPages: ['/dashboard', '/analytics', '/reports'],
  },
  {
    id: 'calendar-events',
    title: 'Calendar & Events',
    content: `The Calendar helps you schedule and manage events.

• View events in daily, weekly, or monthly views
• Create events linked to leads, clients, or projects
• Events appear on the lead's timeline
• Access the Calendar from the Communications section`,
    category: 'Communications',
    keywords: ['calendar', 'event', 'meeting', 'schedule', 'appointment'],
    relatedPages: ['/calendar'],
  },
  {
    id: 'notifications',
    title: 'Notifications',
    content: `Notifications keep you updated on important activities.

• Get notified when tasks are assigned to you
• Receive alerts for lead updates and stage changes
• Notifications appear in the bell icon at the top bar
• View all notifications from the Communications → Notifications page`,
    category: 'Communications',
    keywords: ['notification', 'alert', 'bell', 'notify', 'reminder'],
    relatedPages: ['/notifications'],
  },
];

@Injectable()
export class SystemHelpService {
  search(query: string) {
    if (!query || query.trim().length === 0) {
      return HELP_CONTENT.map(({ id, title, category, keywords }) => ({
        id, title, category, keywords,
      }));
    }

    const q = query.toLowerCase().trim();

    const scored = HELP_CONTENT.map((article) => {
      let score = 0;

      const titleMatch = article.title.toLowerCase().includes(q);
      if (titleMatch) score += 10;

      const contentMatch = article.content.toLowerCase().includes(q);
      if (contentMatch) score += 5;

      const keywordMatches = article.keywords.filter((k) => k.includes(q) || q.includes(k));
      score += keywordMatches.length * 3;

      const categoryMatch = article.category.toLowerCase().includes(q);
      if (categoryMatch) score += 3;

      const wordMatches = q.split(/\s+/).filter((w) => w.length > 2);
      for (const word of wordMatches) {
        if (article.content.toLowerCase().includes(word)) score += 2;
        if (article.title.toLowerCase().includes(word)) score += 4;
        if (article.keywords.some((k) => k.includes(word))) score += 2;
      }

      return { article, score };
    });

    const results = scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((s) => ({
        id: s.article.id,
        title: s.article.title,
        content: s.article.content,
        category: s.article.category,
        keywords: s.article.keywords,
        relatedPages: s.article.relatedPages,
        matchScore: s.score,
      }));

    return results;
  }

  getArticle(id: string) {
    return HELP_CONTENT.find((a) => a.id === id) || null;
  }

  getAllCategories() {
    const cats = new Set(HELP_CONTENT.map((a) => a.category));
    return Array.from(cats);
  }

  getAll() {
    return HELP_CONTENT.map(({ id, title, category, keywords, content }) => ({
      id, title, category, keywords, content,
    }));
  }
}
