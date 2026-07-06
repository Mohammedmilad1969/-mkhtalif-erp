'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Bell, ChevronDown, ArrowLeft, Home, Moon, Sun, Languages } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useLanguage } from '@/hooks/useLanguage';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const breadcrumbMap: Record<string, string> = {
  dashboard: 'Dashboard',
  crm: 'CRM Pipeline',
  clients: 'Clients',
  proposals: 'Proposals',
  contracts: 'Contracts',
  invoices: 'Invoices',
  projects: 'Projects',
  tasks: 'Tasks',
  campaigns: 'Campaigns',
  deliverables: 'Deliverables',
  strategy: 'Strategy Workspace',
  'time-tracking': 'Time Tracking',
  kpis: 'KPIs',
  analytics: 'Analytics',
  knowledge: 'Knowledge Base',
  automation: 'Automation',
  'audit-log': 'Audit Log',
  users: 'Users',
  portal: 'Client Portal',
};

export default function Topbar() {
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const { t, setLocale } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = 3;

  const segments = useMemo(() => {
    const parts = pathname.split('/').filter(Boolean);
    const breadcrumbs: { label: string; href: string }[] = [];
    let href = '';
    for (const part of parts) {
      href += `/${part}`;
      const label = breadcrumbMap[part] || part.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      breadcrumbs.push({ label, href });
    }
    return breadcrumbs;
  }, [pathname]);

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/analytics?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const switchLanguage = (lng: string) => {
    setLocale(lng);
  };

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6 sticky top-0 z-30 gap-4">
      <div className="flex items-center gap-3 min-w-0">
        {segments.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <nav className="flex items-center gap-1.5 text-sm min-w-0">
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground shrink-0">
            <Home className="h-4 w-4" />
          </Link>
          {segments.map((seg, i) => (
            <span key={seg.href} className="flex items-center gap-1.5 min-w-0">
              <span className="text-muted-foreground/40 mx-0.5">/</span>
              {i === segments.length - 1 ? (
                <span className="font-medium text-foreground truncate">{seg.label}</span>
              ) : (
                <Link href={seg.href} className="text-muted-foreground hover:text-foreground truncate">
                  {seg.label}
                </Link>
              )}
            </span>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="relative hidden sm:block w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('topbar.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="pl-9 h-9 bg-muted/50 border-none"
          />
        </div>

        <Link href="/notifications">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] font-mono">
                {unreadCount}
              </Badge>
            )}
          </Button>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 h-9 px-2">
              <Avatar className="h-7 w-7">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                  {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:inline">{user?.name}</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium">{user?.name}</span>
                <span className="text-xs text-muted-foreground font-normal">{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/users">{t('topbar.profile')}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/users">{t('topbar.settings')}</Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                {theme === 'dark' ? <Moon className="h-4 w-4 mr-2" /> : <Sun className="h-4 w-4 mr-2" />}
                {t('topbar.theme')}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => setTheme('light')}>
                  <Sun className="h-4 w-4 mr-2" />
                  {t('topbar.light')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                  <Moon className="h-4 w-4 mr-2" />
                  {t('topbar.dark')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>
                  <span className="h-4 w-4 mr-2 flex items-center justify-center text-xs font-bold">Aa</span>
                  {t('topbar.system')}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Languages className="h-4 w-4 mr-2" />
                {t('topbar.language')}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => switchLanguage('en')}>
                  <span className="mr-2">🇬🇧</span>
                  {t('topbar.english')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => switchLanguage('ar')}>
                  <span className="mr-2">🇸🇦</span>
                  {t('topbar.arabic')}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
              {t('topbar.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
