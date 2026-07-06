'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/hooks/useAuth';

interface PermissionGuardProps {
  permission: string;
  fallbackRoute?: string;
  children: ReactNode;
}

export function PermissionGuard({ permission, fallbackRoute = '/dashboard', children }: PermissionGuardProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const permissions = user?.permissions || [];

  useEffect(() => {
    if (user && !permissions.includes(permission)) {
      router.replace(fallbackRoute);
    }
  }, [user, permissions, permission, router, fallbackRoute]);

  if (!user) return null;
  if (!permissions.includes(permission)) return null;

  return <>{children}</>;
}
