'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Briefcase,
  LineChart,
  Factory,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building2,
  FileText,
  FileSignature,
  Receipt,
  Megaphone,
  Target,
  BookMarked,
  Zap,
  Clock,
  Lightbulb,
  History,
  TrendingUp,
  MessageSquare,
  CalendarDays,
  Bell,
  Shield,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';

interface NavItemConfig {
  href: string;
  label: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  permission: string;
  moduleKey?: string;
}

interface NavGroup {
  label: string;
  items: NavItemConfig[];
}

const labelKeyMap: Record<string, string> = {
  'Overview': 'nav.overview',
  'Sales': 'nav.sales',
  'Operations': 'nav.operations',
  'Processes': 'nav.processes',
  'Intelligence': 'nav.intelligence',
  'System': 'nav.system',
  'Communications': 'nav.communications',
  'Dashboard': 'nav.dashboard',
  'Analytics': 'nav.analytics',
  'CRM Pipeline': 'nav.crm',
  'Clients': 'nav.clients',
  'Proposals': 'nav.proposals',
  'Contracts': 'nav.contracts',
  'Invoices': 'nav.invoices',
  'Projects': 'nav.projects',
  'Tasks': 'nav.tasks',
  'Campaigns': 'nav.campaigns',
  'Deliverables': 'nav.deliverables',
  'Time Tracking': 'nav.timeTracking',
  'Calendar': 'nav.calendar',
  'Notifications': 'nav.notifications',
  'Strategy': 'nav.strategy',
  'KPIs': 'nav.kpis',
  'Knowledge Base': 'nav.knowledge',
  'Automation': 'nav.automation',
  'Audit Log': 'nav.auditLog',
  'Users': 'nav.users',
  'Permissions': 'nav.permissions',
  'Client Portal': 'nav.portal',
};

const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard, permission: 'dashboard:view', moduleKey: 'dashboard' },
      { href: '/analytics', label: 'Analytics', labelKey: 'nav.analytics', icon: TrendingUp, permission: 'analytics:view', moduleKey: 'analytics' },
    ],
  },
  {
    label: 'Sales',
    items: [
      { href: '/crm', label: 'CRM Pipeline', labelKey: 'nav.crm', icon: Users, permission: 'leads:view', moduleKey: 'leads' },
      { href: '/clients', label: 'Clients', labelKey: 'nav.clients', icon: DollarSign, permission: 'clients:view', moduleKey: 'clients' },
      { href: '/proposals', label: 'Proposals', labelKey: 'nav.proposals', icon: FileText, permission: 'proposals:view', moduleKey: 'proposals' },
      { href: '/contracts', label: 'Contracts', labelKey: 'nav.contracts', icon: FileSignature, permission: 'contracts:view', moduleKey: 'contracts' },
      { href: '/invoices', label: 'Invoices', labelKey: 'nav.invoices', icon: Receipt, permission: 'invoices:view', moduleKey: 'invoices' },
      { href: '/tasks', label: 'Tasks', labelKey: 'nav.tasks', icon: LineChart, permission: 'tasks:view', moduleKey: 'tasks' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { href: '/projects', label: 'Projects', labelKey: 'nav.projects', icon: Briefcase, permission: 'projects:view', moduleKey: 'projects' },
      { href: '/campaigns', label: 'Campaigns', labelKey: 'nav.campaigns', icon: Megaphone, permission: 'campaigns:view', moduleKey: 'campaigns' },
      { href: '/deliverables', label: 'Deliverables', labelKey: 'nav.deliverables', icon: Factory, permission: 'deliverables:view', moduleKey: 'deliverables' },
      { href: '/time-tracking', label: 'Time Tracking', labelKey: 'nav.timeTracking', icon: Clock, permission: 'time:view', moduleKey: 'timeTracking' },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { href: '/strategy', label: 'Strategy', labelKey: 'nav.strategy', icon: Lightbulb, permission: 'strategy:view', moduleKey: 'strategy' },
      { href: '/kpis', label: 'KPIs', labelKey: 'nav.kpis', icon: Target, permission: 'kpis:view', moduleKey: 'kpis' },
      { href: '/knowledge', label: 'Knowledge Base', labelKey: 'nav.knowledge', icon: BookMarked, permission: 'knowledge:view', moduleKey: 'knowledge' },
    ],
  },
  {
    label: 'Communications',
    items: [
      { href: '/communications', label: 'Communications', labelKey: 'nav.communications', icon: MessageSquare, permission: 'communications:view' },
      { href: '/calendar', label: 'Calendar', labelKey: 'nav.calendar', icon: CalendarDays, permission: 'calendar:view' },
      { href: '/notifications', label: 'Notifications', labelKey: 'nav.notifications', icon: Bell, permission: 'notifications:view' },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/automation', label: 'Automation', labelKey: 'nav.automation', icon: Zap, permission: 'automation:view', moduleKey: 'automation' },
      { href: '/audit-log', label: 'Audit Log', labelKey: 'nav.auditLog', icon: History, permission: 'audit:view', moduleKey: 'auditLog' },
      { href: '/users', label: 'Users', labelKey: 'nav.users', icon: Building2, permission: 'users:view', moduleKey: 'users' },
      { href: '/permissions', label: 'Permissions', labelKey: 'nav.permissions', icon: Shield, permission: 'users:view', moduleKey: 'permissions' },
      { href: '/portal', label: 'Client Portal', labelKey: 'nav.portal', icon: Users, permission: 'portal:view', moduleKey: 'portal' },
    ],
  },
];

function NavItem({
  href,
  label,
  labelKey,
  icon: Icon,
  collapsed,
  isActive,
  t,
}: {
  href: string;
  label: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  collapsed: boolean;
  isActive: boolean;
  t: (key: string) => string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'sidebar-item group',
        isActive
          ? 'sidebar-item-active'
          : 'sidebar-item-inactive',
        collapsed && 'justify-center px-2'
      )}
      title={collapsed ? t(labelKey) : undefined}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      {!collapsed && <span>{t(labelKey)}</span>}
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { t } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);
  const moduleAccess = user?.moduleAccess || [];
  const hasModuleRestrictions = moduleAccess.length > 0;

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        'flex flex-col bg-sidebar text-sidebar-foreground h-screen transition-all duration-300 relative',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex items-center gap-3 p-4 h-16 border-b border-sidebar-muted/50">
        <Link href="/dashboard" className={cn('flex items-center gap-2', collapsed && 'mx-auto')}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sidebar-active to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            M
          </div>
          {!collapsed && (
            <span className="font-semibold text-base tracking-tight">Mkhtalif</span>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-muted/30',
            collapsed && 'absolute -right-3 top-4 z-10 bg-sidebar border border-sidebar-muted/50 rounded-full h-6 w-6 shadow-sm'
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-thin">
        {navGroups.map((group) => {
          const visible = group.items.filter((item) => {
            if (!hasModuleRestrictions) return true;
            if (!item.moduleKey) return true;
            return moduleAccess.includes(item.moduleKey);
          });
          if (visible.length === 0) return null;
          return (
            <div key={group.label}>
              {!collapsed && (
                <p className="text-[11px] font-semibold uppercase tracking-widest text-sidebar-foreground/40 px-3 mb-1.5">
                  {t(labelKeyMap[group.label] || group.label)}
                </p>
              )}
              <div className="space-y-0.5">
                {visible.map((item) => (
                  <NavItem
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    labelKey={item.labelKey}
                    icon={item.icon}
                    collapsed={collapsed}
                    isActive={isActive(item.href)}
                    t={t}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      <Separator className="bg-sidebar-muted/50" />

      {user && (
        <div className={cn('p-3', collapsed && 'flex flex-col items-center')}>
          {collapsed ? (
            <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-sidebar-muted/30" onClick={logout}>
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="bg-sidebar-muted/50 text-sidebar-foreground text-xs font-medium">
                {user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="flex items-center gap-3 px-1">
              <Avatar className="h-9 w-9 ring-2 ring-sidebar-muted/30">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-sidebar-muted/50 text-sidebar-foreground text-xs font-medium">
                  {user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-[11px] text-sidebar-foreground/40 truncate capitalize">{user.role?.replace(/_/g, ' ')}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={logout} className="text-sidebar-foreground/40 hover:text-destructive hover:bg-destructive/10 h-8 w-8 shrink-0">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
