'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useFollowUpMatrix, useUpdateFollowUp } from '@/hooks/useApi';
import { ArrowLeft, Calendar, Clock, AlertTriangle, User } from 'lucide-react';

const statusColors: Record<string, 'default' | 'secondary' | 'outline' | 'destructive' | 'warning' | 'success'> = {
  active: 'success',
  pending: 'default',
  no_response: 'destructive',
  negotiation: 'warning',
  objection: 'secondary',
  done: 'default',
};

export default function FollowUpMatrixPage() {
  const router = useRouter();
  const updateFollowUp = useUpdateFollowUp();

  const { data, isLoading } = useFollowUpMatrix();

  const matrix = data || { late: [], today: [], tomorrow: [], thisWeek: [] };

  const sections = [
    { key: 'late', title: 'Late', icon: AlertTriangle, color: 'text-red-500', border: 'border-red-200 dark:border-red-900' },
    { key: 'today', title: 'Today', icon: Clock, color: 'text-orange-500', border: 'border-orange-200 dark:border-orange-900' },
    { key: 'tomorrow', title: 'Tomorrow', icon: Calendar, color: 'text-blue-500', border: 'border-blue-200 dark:border-blue-900' },
    { key: 'thisWeek', title: 'This Week', icon: Calendar, color: 'text-green-500', border: 'border-green-200 dark:border-green-900' },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/crm')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="page-title">Follow-up Matrix</h1>
            <p className="text-sm text-muted-foreground">Track and manage follow-ups across your leads</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-6 w-24" /></CardHeader>
              <CardContent className="space-y-3">
                {[1, 2, 3].map((j) => <Skeleton key={j} className="h-20 w-full" />)}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {sections.map(({ key, title, icon: Icon, color, border }) => {
            const items = matrix[key] || [];
            return (
              <Card key={key} className={`border-t-4 ${border}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${color}`} />
                    {title}
                    <Badge variant="secondary" className="ml-auto">{items.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {items.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No follow-ups</p>
                  ) : (
                    items.map((item: any) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => router.push(`/crm/leads/${item.leadId || item.id}`)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm truncate">{item.clientName}</span>
                          <Badge variant={statusColors[item.followUpStatus] || 'default'} className="text-[10px] capitalize">
                            {item.followUpStatus.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        {item.company && (
                          <p className="text-xs text-muted-foreground truncate">{item.company}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          {item.assignedTo && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {item.assignedTo}
                            </span>
                          )}
                          {item.nextAction && (
                            <span className="truncate flex-1">{item.nextAction}</span>
                          )}
                        </div>
                        {item.followUpDate && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Follow-up: {new Date(item.followUpDate).toLocaleDateString()} {new Date(item.followUpDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                        {item.followUpId && item.followUpStatus !== 'done' && (
                          <div className="mt-1" onClick={(e) => e.stopPropagation()}>
                            <Select
                              value={item.followUpStatus || 'active'}
                              onValueChange={(v) => updateFollowUp.mutate({ id: item.followUpId, status: v })}
                            >
                              <SelectTrigger className="h-6 text-[10px] w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="no_response">No Response</SelectItem>
                                <SelectItem value="done">Done</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
