'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useContract, useSignContract } from '@/hooks/useApi';
import { ArrowLeft, FileSignature } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const statusVariants: Record<string, 'default' | 'secondary' | 'outline' | 'success' | 'destructive'> = {
  draft: 'secondary',
  sent: 'default',
  signed: 'success',
  active: 'success',
  completed: 'outline',
  terminated: 'destructive',
};

export default function ContractDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id;
  const { data: contract, isLoading, error } = useContract(id);
  const signContract = useSignContract();

  const handleSign = async () => {
    try {
      await signContract.mutateAsync(id);
      toast({ title: 'Contract signed', description: 'The contract has been signed successfully' });
    } catch {
      toast({ title: 'Error', description: 'Failed to sign contract', variant: 'destructive' });
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

  if (error || !contract) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load contract</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/contracts')}>Back to Contracts</Button>
      </div>
    );
  }

  const canSign = contract.status === 'draft' || contract.status === 'sent';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/contracts')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{contract.contractNumber}</h1>
            <Badge variant={statusVariants[contract.status] || 'secondary'} className="capitalize">
              {contract.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{contract.client?.name}</p>
        </div>
        {canSign && (
          <Button onClick={handleSign}>
            <FileSignature className="mr-2 h-4 w-4" /> Sign Contract
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Contract Details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Client</span>
              <span className="font-medium">{contract.client?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Value</span>
              <span className="font-medium">${contract.totalValue?.toLocaleString() || '-'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment Terms</span>
              <span className="font-medium">{contract.paymentTerms || 'Standard'}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Start Date</span>
              <span>{contract.startDate ? new Date(contract.startDate).toLocaleDateString() : '-'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">End Date</span>
              <span>{contract.endDate ? new Date(contract.endDate).toLocaleDateString() : '-'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Signing Timeline</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Created</span>
              <span>{new Date(contract.createdAt).toLocaleString()}</span>
            </div>
            {contract.signedAt && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Signed (internal)</span>
                <span>{new Date(contract.signedAt).toLocaleString()}</span>
              </div>
            )}
            {contract.signedByClientAt && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Signed by Client</span>
                <span>{new Date(contract.signedByClientAt).toLocaleString()}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
