export interface ModuleGroup {
  group: string;
  label: string;
  modules: { key: string; label: string }[];
}

export const MODULE_GROUPS: ModuleGroup[] = [
  {
    group: 'OVERVIEW',
    label: 'Overview',
    modules: [
      { key: 'dashboard', label: 'Dashboard' },
      { key: 'analytics', label: 'Analytics' },
    ],
  },
  {
    group: 'SALES',
    label: 'Sales',
    modules: [
      { key: 'leads', label: 'CRM Pipeline' },
      { key: 'clients', label: 'Clients' },
      { key: 'proposals', label: 'Proposals' },
      { key: 'contracts', label: 'Contracts' },
      { key: 'invoices', label: 'Invoices' },
      { key: 'tasks', label: 'Tasks' },
    ],
  },
  {
    group: 'OPERATIONS',
    label: 'Operations',
    modules: [
      { key: 'projects', label: 'Projects' },
      { key: 'campaigns', label: 'Campaigns' },
      { key: 'deliverables', label: 'Deliverables' },
      { key: 'timeTracking', label: 'Time Tracking' },
    ],
  },
  {
    group: 'INTELLIGENCE',
    label: 'Intelligence',
    modules: [
      { key: 'strategy', label: 'Strategy Workspace' },
      { key: 'kpis', label: 'KPIs' },
      { key: 'knowledge', label: 'Knowledge Base' },
    ],
  },
  {
    group: 'SYSTEM',
    label: 'System',
    modules: [
      { key: 'automation', label: 'Automation' },
      { key: 'auditLog', label: 'Audit Log' },
      { key: 'users', label: 'Users' },
      { key: 'permissions', label: 'Permissions' },
      { key: 'portal', label: 'Client Portal' },
    ],
  },
];
