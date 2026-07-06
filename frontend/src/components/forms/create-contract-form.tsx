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
import { useCreateContract, useClients } from '@/hooks/useApi';
import { getApiErrorMessage } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const contractSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  totalValue: z.coerce.number().min(0).optional(),
  paymentTerms: z.string().optional(),
});

type ContractFormData = z.infer<typeof contractSchema>;

interface CreateContractFormProps {
  onSuccess?: () => void;
}

export default function CreateContractForm({ onSuccess }: CreateContractFormProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const createContract = useCreateContract();
  const { data: clientsData } = useClients({ limit: 200 });
  const clients = clientsData?.data || [];

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
  });

  const onSubmit = async (data: ContractFormData) => {
    try {
      await createContract.mutateAsync(data as any);
      toast({ title: t('contracts.contractCreated') });
      onSuccess?.();
    } catch (err) {
      toast({ title: t('common.error'), description: getApiErrorMessage(err, t('common.operationFailed')), variant: 'destructive' });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="clientId">{t('contracts.client')} *</Label>
        <Select onValueChange={(v) => setValue('clientId', v)}>
          <SelectTrigger>
            <SelectValue placeholder={t('contracts.client')} />
          </SelectTrigger>
          <SelectContent>
            {clients.map((c: any) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.clientId && <p className="text-sm text-destructive">{errors.clientId.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">{t('contracts.startDate')}</Label>
          <Input id="startDate" type="date" {...register('startDate')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">{t('contracts.endDate')}</Label>
          <Input id="endDate" type="date" {...register('endDate')} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="totalValue">{t('contracts.value')}</Label>
        <Input id="totalValue" type="number" min={0} step="0.01" {...register('totalValue')} placeholder="0.00" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentTerms">{t('common.type')} Terms</Label>
        <Input id="paymentTerms" {...register('paymentTerms')} placeholder="Net 30, Installments, etc." />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting || createContract.isPending}>
        {isSubmitting || createContract.isPending ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('common.loading')}</>
        ) : (
          t('contracts.createContract')
        )}
      </Button>
    </form>
  );
}
