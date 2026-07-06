'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useProposal, useSendProposal, useApproveProposal, useRejectProposal } from '@/hooks/useApi';
import { ArrowLeft, Send, CheckCircle, XCircle, FileText } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const statusVariants: Record<string, string> = {
  draft: 'secondary',
  internal_review: 'default',
  sent: 'default',
  presented: 'info',
  accepted: 'success',
  rejected: 'destructive',
  revision: 'warning',
};

export default function ProposalDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id;
  const { data: proposal, isLoading, error } = useProposal(id);
  const sendProposal = useSendProposal();
  const approveProposal = useApproveProposal();
  const rejectProposal = useRejectProposal();

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleSend = async () => {
    try {
      await sendProposal.mutateAsync(id);
      toast({ title: 'Proposal sent', description: 'Proposal has been sent to the client' });
    } catch {
      toast({ title: 'Error', description: 'Failed to send proposal', variant: 'destructive' });
    }
  };

  const handleApprove = async () => {
    try {
      await approveProposal.mutateAsync(id);
      toast({ title: 'Proposal approved', description: 'Proposal has been approved' });
    } catch {
      toast({ title: 'Error', description: 'Failed to approve proposal', variant: 'destructive' });
    }
  };

  const handleReject = async () => {
    try {
      await rejectProposal.mutateAsync({ id, reason: rejectReason });
      toast({ title: 'Proposal rejected', description: 'Proposal has been rejected' });
      setRejectDialogOpen(false);
    } catch {
      toast({ title: 'Error', description: 'Failed to reject proposal', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load proposal</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/proposals')}>Back to Proposals</Button>
      </div>
    );
  }

  const canSend = proposal.status === 'draft' || proposal.status === 'internal_review';
  const canApprove = proposal.status === 'sent' || proposal.status === 'presented';
  const canReject = proposal.status === 'sent' || proposal.status === 'presented';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/proposals')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{proposal.title}</h1>
            <Badge variant={statusVariants[proposal.status] || 'secondary'} className="capitalize">
              {proposal.status.replace('_', ' ')}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {proposal.client?.name} • v{proposal.version} • {proposal.currency} {proposal.totalValue?.toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          {canSend && (
            <Button onClick={handleSend}>
              <Send className="mr-2 h-4 w-4" /> Send
            </Button>
          )}
          {canApprove && (
            <Button variant="outline" className="text-green-600 border-green-600" onClick={handleApprove}>
              <CheckCircle className="mr-2 h-4 w-4" /> Approve
            </Button>
          )}
          {canReject && (
            <Button variant="outline" className="text-destructive border-destructive" onClick={() => setRejectDialogOpen(true)}>
              <XCircle className="mr-2 h-4 w-4" /> Reject
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Technical Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{proposal.technicalContent || 'No technical content provided'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Financial Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{proposal.financialContent || 'No financial content provided'}</p>
            <Separator className="my-3" />
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Value</span>
              <span className="text-lg font-bold">{proposal.currency} {proposal.totalValue?.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Scope of Work</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap">
            {typeof proposal.scopeOfWork === 'string'
              ? proposal.scopeOfWork
              : proposal.scopeOfWork?.description || 'No scope of work defined'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Created</span>
              <span>{new Date(proposal.createdAt).toLocaleString()}</span>
            </div>
            {proposal.sentAt && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sent</span>
                <span>{new Date(proposal.sentAt).toLocaleString()}</span>
              </div>
            )}
            {proposal.acceptedAt && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Accepted</span>
                <span>{new Date(proposal.acceptedAt).toLocaleString()}</span>
              </div>
            )}
            {proposal.rejectedAt && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Rejected</span>
                <span>{new Date(proposal.rejectedAt).toLocaleString()}</span>
              </div>
            )}
            {proposal.rejectionReason && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Reason</span>
                <span>{proposal.rejectionReason}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Validity</span>
              <span>{proposal.validityDays} days</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Proposal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Reason for rejection</Label>
              <textarea
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Provide a reason..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject}>Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
