'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, patch } from '@/lib/api';
import {
  Bell, CheckCheck, Info, AlertTriangle, AlertCircle, CheckCircle2,
  Clock, ArrowRight,
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

const typeIcons: Record<string, React.ElementType> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
  lead_assigned: Bell,
  lead_qualified: CheckCircle2,
  task_assigned: Info,
  stage_changed: ArrowRight,
};

const typeColors: Record<string, string> = {
  info: 'bg-blue-100 text-blue-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  error: 'bg-red-100 text-red-700',
  lead_assigned: 'bg-indigo-100 text-indigo-700',
  lead_qualified: 'bg-emerald-100 text-emerald-700',
  task_assigned: 'bg-purple-100 text-purple-700',
  stage_changed: 'bg-orange-100 text-orange-700',
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => get('/users/me/notifications'),
  });

  const markRead = useMutation({
    mutationFn: (id: string) => patch(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifs: any[] = (notifications as any) || [];

  const unread = notifs.filter((n: any) => !n.isRead);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            {unread.length > 0 ? `You have ${unread.length} unread notifications` : 'No unread notifications'}
          </p>
        </div>
        {unread.length > 0 && (
          <Button variant="outline" onClick={() => unread.forEach((n: any) => markRead.mutate(n.id))}>
            <CheckCheck className="h-4 w-4 mr-2" />Mark All Read
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5" />
            All Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : notifs.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No notifications yet</p>
              <p className="text-sm mt-1">Notifications will appear here as activity happens</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifs.map((n: any) => {
                const Icon = typeIcons[n.type] || Bell;
                return (
                  <div
                    key={n.id}
                    className={`p-4 flex items-start gap-3 transition-colors hover:bg-muted/50 ${!n.isRead ? 'bg-primary/5' : ''}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${typeColors[n.type] || 'bg-gray-100'}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium">{n.title}</p>
                        {!n.isRead && (
                          <Badge variant="default" className="h-1.5 w-1.5 rounded-full p-0" />
                        )}
                      </div>
                      {n.body && (
                        <p className="text-sm text-muted-foreground">{n.body}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{format(new Date(n.createdAt), 'MMM d, yyyy HH:mm')}</span>
                        {n.referenceType && (
                          <>
                            <span>|</span>
                            <span className="capitalize">{n.referenceType}</span>
                          </>
                        )}
                      </div>
                    </div>
                    {!n.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markRead.mutate(n.id)}
                        className="text-xs"
                      >
                        <CheckCheck className="h-3 w-3 mr-1" />Read
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
