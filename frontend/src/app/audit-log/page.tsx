'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuditLogs } from '@/hooks/useApi';
import { AuditLog } from '@/types';
import { Search, ChevronDown, ChevronRight, History } from 'lucide-react';
import { cn } from '@/lib/utils';

const actionVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'success'> = {
  create: 'success',
  update: 'default',
  delete: 'destructive',
};

export default function AuditLogPage() {
  const [entityFilter, setEntityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [userId, setUserId] = useState('');
  const [page, setPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const { data, isLoading } = useAuditLogs({
    entity: entityFilter,
    action: actionFilter,
    startDate,
    endDate,
    userId,
    page,
    limit: 20,
  });

  const logs = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Audit Log</h1>
          <p className="text-sm text-muted-foreground">Track all changes made across the system</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={entityFilter} onValueChange={(v) => { setEntityFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Entity Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entities</SelectItem>
            <SelectItem value="lead">Lead</SelectItem>
            <SelectItem value="client">Client</SelectItem>
            <SelectItem value="project">Project</SelectItem>
            <SelectItem value="task">Task</SelectItem>
            <SelectItem value="proposal">Proposal</SelectItem>
            <SelectItem value="contract">Contract</SelectItem>
            <SelectItem value="invoice">Invoice</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
        <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="create">Create</SelectItem>
            <SelectItem value="update">Update</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={startDate}
          onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
          className="w-[160px]"
        />
        <Input
          type="date"
          value={endDate}
          onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
          className="w-[160px]"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No audit logs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Timestamp</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">User</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Action</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Entity</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Entity ID</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">Changes</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log: AuditLog) => {
                    const isExpanded = expandedRow === log.id;
                    const changes = log.oldValue && log.newValue ? Object.keys(log.newValue as object).filter(k => (log.newValue as any)[k] !== (log.oldValue as any)?.[k]).slice(0, 3) : [];
                    return (
                      <>
                        <tr
                          key={log.id}
                          className="border-b hover:bg-muted/50 cursor-pointer"
                          onClick={() => setExpandedRow(isExpanded ? null : log.id)}
                        >
                          <td className="py-3 px-4 text-sm whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-sm">{log.user?.name || '-'}</td>
                          <td className="py-3 px-4">
                            <Badge variant={actionVariants[log.action] || 'secondary'} className="capitalize">
                              {log.action}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm capitalize">{log.entity}</td>
                          <td className="py-3 px-4 text-xs font-mono text-muted-foreground">{log.entityId?.slice(0, 8) || '-'}...</td>
                          <td className="py-3 px-4 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">{changes.length} field{changes.length !== 1 ? 's' : ''} changed</span>
                              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${log.id}-diff`}>
                            <td colSpan={6} className="p-4 bg-muted/20">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {log.oldValue && (
                                  <div>
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Old Values</h4>
                                    <pre className="text-xs bg-background rounded p-3 overflow-auto max-h-48">
                                      {JSON.stringify(log.oldValue, null, 2)}
                                    </pre>
                                  </div>
                                )}
                                {log.newValue && (
                                  <div>
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">New Values</h4>
                                    <pre className="text-xs bg-background rounded p-3 overflow-auto max-h-48">
                                      {JSON.stringify(log.newValue, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing page {meta.page} of {meta.totalPages} ({meta.total} total)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= meta.totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
