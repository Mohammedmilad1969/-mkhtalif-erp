'use client';

import { ReactNode } from 'react';
import { useAuthStore } from '@/hooks/useAuth';

interface CanProps {
  permission: string;
  fallback?: ReactNode;
  children: ReactNode;
}

export function Can({ permission, fallback = null, children }: CanProps) {
  const permissions = useAuthStore((s) => s.user?.permissions || []);
  if (permissions.includes(permission)) return <>{children}</>;
  return <>{fallback}</>;
}
