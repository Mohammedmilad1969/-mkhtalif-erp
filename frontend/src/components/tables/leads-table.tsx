'use client';

import DataTable from './data-table';
import { Badge } from '@/components/ui/badge';
import { Lead, LeadTemperature } from '@/types';

interface LeadsTableProps {
  data: Lead[];
  onRowClick?: (lead: Lead) => void;
  loading?: boolean;
}

const stageVariants: Record<string, 'default' | 'secondary' | 'outline' | 'info' | 'success' | 'warning' | 'destructive'> = {
  new_lead: 'secondary',
  qualification: 'info',
  qualified: 'warning',
  meeting_scheduled: 'default',
  proposal_sent: 'default',
  negotiation: 'default',
  won: 'success',
  lost: 'destructive',
  archive: 'secondary',
};

const tempVariants: Record<string, 'destructive' | 'warning' | 'secondary'> = {
  hot: 'destructive',
  warm: 'warning',
  cold: 'secondary',
};

export default function LeadsTable({ data, onRowClick, loading }: LeadsTableProps) {
  const columns = [
    {
      key: 'clientName',
      label: 'Client Name',
      sortable: true,
      render: (lead: Lead) => <span className="font-medium">{lead.clientName}</span>,
    },
    {
      key: 'company',
      label: 'Company',
      sortable: true,
      render: (lead: Lead) => lead.company || '-',
    },
    {
      key: 'score',
      label: 'Score',
      sortable: true,
      render: (lead: Lead) => (lead.leadScore != null ? <span>{lead.leadScore}</span> : '-'),
    },
    {
      key: 'temperature',
      label: 'Temperature',
      render: (lead: Lead) =>
        lead.leadTemperature ? (
          <Badge variant={tempVariants[lead.leadTemperature] || 'secondary'} className="capitalize">
            {lead.leadTemperature}
          </Badge>
        ) : (
          '-'
        ),
    },
    {
      key: 'source',
      label: 'Source',
      sortable: true,
      render: (lead: Lead) => (lead.source ? <span className="capitalize">{lead.source}</span> : '-'),
    },
    {
      key: 'stage',
      label: 'Stage',
      render: (lead: Lead) => (
        <Badge variant={stageVariants[(lead.stage as any)?.code] || 'secondary'} className="capitalize">
          {(lead.stage as any)?.code?.replace('_', ' ') || 'Unknown'}
        </Badge>
      ),
    },
    {
      key: 'assignedTo',
      label: 'Assigned To',
      render: (lead: Lead) => lead.assignee?.name || '-',
    },
    {
      key: 'createdAt',
      label: 'Created At',
      sortable: true,
      render: (lead: Lead) => new Date(lead.createdAt).toLocaleDateString(),
    },
    {
      key: 'nextAction',
      label: 'Next Action',
      render: (lead: Lead) => lead.nextAction || '-',
    },
  ];

  return <DataTable columns={columns} data={data} onRowClick={onRowClick} loading={loading} emptyMessage="No leads found" />;
}
