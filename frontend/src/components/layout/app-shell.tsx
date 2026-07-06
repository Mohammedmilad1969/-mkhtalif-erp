'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/sidebar';
import Topbar from '@/components/layout/topbar';
import HelpChat from '@/components/help-chat/help-chat';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth = pathname.startsWith('/auth');

  if (isAuth) {
    return <div className="min-h-screen flex items-center justify-center bg-background">{children}</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 bg-background">{children}</main>
      </div>
      <HelpChat />
    </div>
  );
}
