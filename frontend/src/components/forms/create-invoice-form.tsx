'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/hooks/useLanguage';
import { useCreateInvoice, useClients } from '@/hooks/useApi';
import { getApiErrorMessage } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const invoiceSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  totalAmount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  currency: z.string().default('LYD'),
  dueDate: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface CreateInvoiceFormProps {
  onSuccess?: () => void;
}

export default function CreateInvoiceForm({ onSuccess }: CreateInvoiceFormProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const createInvoice = useCreateInvoice();
  const { data: clientsData } = useClients({ limit: 200 });
  const clients = clientsData?.data || [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: { currency: 'LYD' },
  });

  const currency = watch('currency');

  const onSubmit = async (data: InvoiceFormData) => {
    try {
      await createInvoice.mutateAsync(data as any);
      toast({ title: t('invoices.invoiceCreated') });
      onSuccess?.();
    } catch (err) {
      toast({ title: t('common.error'), description: getApiErrorMessage(err, t('common.operationFailed')), variant: 'destructive' });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="clientId">{t('invoices.client')} *</Label>
        <Select onValueChange={(v) => setValue('clientId', v)}>
          <SelectTrigger>
            <SelectValue placeholder={t('invoices.client')} />
          </SelectTrigger>
          <SelectContent>
            {clients.map((c: any) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.clientId && <p className="text-sm text-destructive">{errors.clientId.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="totalAmount">{t('invoices.amount')} *</Label>
        <Input id="totalAmount" type="number" min={0.01} step="0.01" {...register('totalAmount')} placeholder="0.00" />
        {errors.totalAmount && <p className="text-sm text-destructive">{errors.totalAmount.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Select value={currency} onValueChange={(v) => setValue('currency', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LYD">LYD</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="dueDate">{t('invoices.dueDate')}</Label>
          <Input id="dueDate" type="date" {...register('dueDate')} />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting || createInvoice.isPending}>
        {isSubmitting || createInvoice.isPending ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('common.loading')}</>
        ) : (
          t('invoices.createInvoice')
        )}
      </Button>
    </form>
  );
}
