'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/hooks/useLanguage';
import { useCreateLead, useUsers, useCheckLeadDuplicates } from '@/hooks/useApi';
import { getApiErrorMessage } from '@/lib/api';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const SERVICE_TYPES = [
  { value: 'sm_manager', label: 'SM Manager' },
  { value: 'sm_design', label: 'SM Design' },
  { value: 'reels', label: 'Reels' },
  { value: 'photo_session', label: 'Photo Session' },
  { value: 'ads_campaign', label: 'Ads Campaign' },
  { value: 'virtual_identity', label: 'Virtual Identity' },
  { value: 'website_development', label: 'Website Development' },
  { value: 'app_development', label: 'App Development' },
  { value: 'marketing_strategy', label: 'Marketing Strategy' },
  { value: 'branding', label: 'Branding' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'other', label: 'Other' },
];

const REQUEST_TYPES = [
  { value: '0', label: 'Unclear (0)' },
  { value: '1', label: 'Simple Service (1)' },
  { value: '2', label: 'Multiple Services (2)' },
  { value: '3', label: 'Full Campaign (3)' },
];

const SERIOUSNESS_LEVELS = [
  { value: '0', label: 'Just Curious (0)' },
  { value: '1', label: 'Initial Inquiry (1)' },
  { value: '2', label: 'Has Details (2)' },
];

const BUDGET_LEVELS = [
  { value: '0', label: 'Unknown (0)' },
  { value: '1', label: 'Limited (1)' },
  { value: '2', label: 'Suitable (2)' },
];

const OPPORTUNITY_SIZES = [
  { value: '0', label: 'Small (0)' },
  { value: '1', label: 'Medium (1)' },
  { value: '2', label: 'Large (2)' },
];

const LOST_REASONS = [
  { value: 'price', label: 'Price' },
  { value: 'no_response', label: 'No Response' },
  { value: 'bad_timing', label: 'Bad Timing' },
  { value: 'service_not_compatible', label: 'Service Not Compatible' },
  { value: 'choose_another_company', label: 'Choose Another Company' },
  { value: 'competitor', label: 'Competitor' },
  { value: 'budget', label: 'Budget' },
  { value: 'other', label: 'Other' },
];

const leadSchema = z.object({
  clientName: z.string().optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  source: z.string().optional(),
  serviceType: z.string().min(1, 'Service type is required'),
  requestType: z.string().min(1, 'Request type is required'),
  seriousnessLevel: z.string().optional(),
  budgetLevel: z.string().optional(),
  opportunitySize: z.string().optional(),
  assignedTo: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface CreateLeadFormProps {
  onSuccess?: () => void;
}

export default function CreateLeadForm({ onSuccess }: CreateLeadFormProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const createLead = useCreateLead();
  const { data: usersData } = useUsers({ limit: 200 });
  const users = usersData?.data || [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
  });

  const watchedPhone = watch('phone');
  const watchedCompany = watch('company');
  const requestType = watch('requestType');
  const seriousnessLevel = watch('seriousnessLevel');
  const watchedBudgetLevel = watch('budgetLevel');
  const opportunitySize = watch('opportunitySize');

  const requestTypeScore = parseInt(requestType || '0');
  const seriousnessScore = parseInt(seriousnessLevel || '0');
  const budgetScore = parseInt(watchedBudgetLevel || '0');
  const opportunityScore = parseInt(opportunitySize || '0');
  const totalScore = requestTypeScore + seriousnessScore + budgetScore + opportunityScore;

  let classification = '';
  if (totalScore >= 8) classification = 'Hot Lead';
  else if (totalScore >= 5) classification = 'Warm Lead';
  else if (totalScore > 0) classification = 'Cold Lead';

  const [debouncedPhone, setDebouncedPhone] = useState('');
  const [debouncedCompany, setDebouncedCompany] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPhone(watchedPhone || '');
      setDebouncedCompany(watchedCompany || '');
    }, 800);
    return () => clearTimeout(timer);
  }, [watchedPhone, watchedCompany]);

  const hasSearchFields = debouncedPhone.length > 0 || debouncedCompany.length > 0;
  const { data: duplicatesData } = useCheckLeadDuplicates(
    { phone: debouncedPhone || undefined, company: debouncedCompany || undefined },
    hasSearchFields,
  );
  const duplicates = duplicatesData?.duplicates || [];

  const onSubmit = async (data: LeadFormData) => {
    try {
      const payload: any = {
        clientName: data.clientName || undefined,
        company: data.company || undefined,
        phone: data.phone || undefined,
        email: data.email || undefined,
        source: data.source || undefined,
        serviceType: data.serviceType,
        requestType: data.requestType,
        clarityLevel: data.seriousnessLevel || undefined,
        budgetLevel: data.budgetLevel || undefined,
        opportunitySize: data.opportunitySize || undefined,
        assignedTo: data.assignedTo || undefined,
      };
      await createLead.mutateAsync(payload as any);
      onSuccess?.();
    } catch (err) {
      toast({ title: t('common.error'), description: getApiErrorMessage(err, t('common.operationFailed')), variant: 'destructive' });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
      {duplicates.length > 0 && (
        <div className="p-2 border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 rounded-lg text-xs">
          <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
            {duplicates.length} potential duplicate{duplicates.length > 1 ? 's' : ''} found
          </p>
          {duplicates.map((dup: any) => (
            <div key={dup.id} className="flex items-center gap-1 text-amber-700 dark:text-amber-400">
              <span className="font-medium">{dup.clientName}</span>
              {dup.company && <span>({dup.company})</span>}
            </div>
          ))}
          <p className="text-xs text-amber-600 dark:text-amber-500">You can still create this lead if it is different.</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">{t('crm.clientName')}</Label>
          <Input className="h-8 text-xs" id="clientName" {...register('clientName')} placeholder={t('crm.clientName')} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">{t('crm.company')}</Label>
          <Input className="h-8 text-xs" id="company" {...register('company')} placeholder={t('crm.company')} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">{t('crm.phone')}</Label>
          <Input className="h-8 text-xs" id="phone" {...register('phone')} placeholder="+20 100 000 0000" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Email</Label>
          <Input className="h-8 text-xs" id="email" {...register('email')} placeholder="email@example.com" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">{t('crm.source')}</Label>
          <Select onValueChange={(v) => setValue('source', v)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder={t('crm.selectSource')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="website">{t('crm.website')}</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
              <SelectItem value="call">{t('crm.call')}</SelectItem>
              <SelectItem value="other">{t('common.type')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Service Type *</Label>
          <Select onValueChange={(v) => { setValue('serviceType', v, { shouldValidate: true }); }}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select service type" />
            </SelectTrigger>
            <SelectContent>
              {SERVICE_TYPES.map((st) => (
                <SelectItem key={st.value} value={st.value}>{st.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.serviceType && <p className="text-xs text-destructive">{errors.serviceType.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">{t('common.assignedTo')}</Label>
          <Select onValueChange={(v) => setValue('assignedTo', v)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder={t('common.assignedTo')} />
            </SelectTrigger>
            <SelectContent>
              {users.map((user: any) => (
                <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-lg p-2 space-y-1.5">
        <h3 className="font-semibold text-xs">Lead Scoring</h3>
        <div className="grid grid-cols-2 gap-1.5">
          <div>
            <Select onValueChange={(v) => { setValue('requestType', v, { shouldValidate: true }); }}>
              <SelectTrigger className="h-7 text-xs">
                <SelectValue placeholder="1. Request Type *" />
              </SelectTrigger>
              <SelectContent>
                {REQUEST_TYPES.map((rt) => (
                  <SelectItem key={rt.value} value={rt.value}>{rt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.requestType && <p className="text-xs text-destructive">{errors.requestType.message}</p>}
          </div>
          <div>
            <Select onValueChange={(v) => setValue('seriousnessLevel', v)}>
              <SelectTrigger className="h-7 text-xs">
                <SelectValue placeholder="2. Seriousness" />
              </SelectTrigger>
              <SelectContent>
                {SERIOUSNESS_LEVELS.map((sl) => (
                  <SelectItem key={sl.value} value={sl.value}>{sl.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select onValueChange={(v) => setValue('budgetLevel', v)}>
              <SelectTrigger className="h-7 text-xs">
                <SelectValue placeholder="3. Budget" />
              </SelectTrigger>
              <SelectContent>
                {BUDGET_LEVELS.map((bl) => (
                  <SelectItem key={bl.value} value={bl.value}>{bl.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select onValueChange={(v) => setValue('opportunitySize', v)}>
              <SelectTrigger className="h-7 text-xs">
                <SelectValue placeholder="4. Opportunity Size" />
              </SelectTrigger>
              <SelectContent>
                {OPPORTUNITY_SIZES.map((os) => (
                  <SelectItem key={os.value} value={os.value}>{os.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {totalScore > 0 && (
          <div className="flex items-center justify-between bg-muted rounded px-2 py-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">Score: {totalScore}/10</span>
              {classification && (
                <Badge className="text-[10px] h-4" variant={
                  classification === 'Hot Lead' ? 'destructive' :
                  classification === 'Warm Lead' ? 'default' : 'secondary'
                }>{classification}</Badge>
              )}
            </div>
          </div>
        )}
      </div>

      <Button type="submit" className="w-full h-8 text-xs" disabled={isSubmitting || createLead.isPending}>
        {isSubmitting || createLead.isPending ? (
          <><Loader2 className="mr-2 h-3 w-3 animate-spin" /> {t('common.loading')}</>
        ) : (
          t('crm.createLead')
        )}
      </Button>
    </form>
  );
}
