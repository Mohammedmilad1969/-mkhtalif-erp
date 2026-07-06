'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useInvoice, useSendInvoice } from '@/hooks/useApi';
import { ArrowLeft, Send, Clock, DollarSign } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import DataTable from '@/components/tables/data-table';

const statusVariants: Record<string, 'default' | 'secondary' | 'outline' | 'success' | 'destructive'> = {
  draft: 'secondary',
  sent: 'default',
  paid: 'success',
  overdue: 'destructive',
  cancelled: 'outline',
};

export default function InvoiceDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id;
  const { data: inv, isLoading, error } = useInvoice(id);
  const sendInvoice = useSendInvoice();

  const handleSend = async () => {
    try {
      await sendInvoice.mutateAsync(id);
      toast({ title: 'Invoice sent', description: 'Invoice has been sent to the client' });
    } catch {
      toast({ title: 'Error', description: 'Failed to send invoice', variant: 'destructive' });
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

  if (error || !inv) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load invoice</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/invoices')}>Back to Invoices</Button>
      </div>
    );
  }

  const canSend = inv.status === 'draft';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/invoices')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{inv.invoiceNumber}</h1>
            <Badge variant={statusVariants[inv.status] || 'secondary'} className="capitalize">
              {inv.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{inv.client?.name}</p>
        </div>
        {canSend && (
          <Button onClick={handleSend}>
            <Send className="mr-2 h-4 w-4" /> Send Invoice
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Amount</p>
              <p className="text-lg font-bold">{inv.currency} {inv.totalAmount.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-yellow-600 dark:text-yellow-300" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tax Amount</p>
              <p className="text-lg font-bold">{inv.currency} {inv.taxAmount.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center">
              <Clock className="h-5 w-5 text-red-600 dark:text-red-300" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Due Date</p>
              <p className="text-lg font-bold">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '-'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {inv.payments && inv.payments.length > 0 ? (
            <DataTable
              columns={[
                { key: 'amount', label: 'Amount', render: (p) => `${inv.currency} ${p.amount.toLocaleString()}` },
                { key: 'paymentDate', label: 'Date', render: (p) => new Date(p.paymentDate).toLocaleDateString() },
                { key: 'paymentMethod', label: 'Method', render: (p) => p.paymentMethod || '-' },
                { key: 'status', label: 'Status', render: (p) => (
                  <Badge variant={p.status === 'completed' ? 'success' : p.status === 'failed' ? 'destructive' : 'secondary'} className="capitalize">{p.status}</Badge>
                )},
              ]}
              data={inv.payments}
              emptyMessage="No payments recorded"
            />
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No payments recorded yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
